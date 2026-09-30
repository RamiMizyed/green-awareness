import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import { APPLIANCES } from "@/lib/data/appliances";
import { REGIONS } from "@/lib/data/regions";

/**
 * Turns a free-text description ("LG TV, 2 fridges") into appliance rows.
 * Returns 503 when no API key is configured; the client then falls back to
 * its own keyword matcher, so the site works without one.
 */

// --- Request / response shapes ---------------------------------------------

const RequestSchema = z.object({
	lang: z.enum(["en", "tr", "ar"]),
	regionId: z.string().max(8),
	current: z.array(z.string().max(80)).max(80),
	messages: z
		.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().min(1).max(600) }))
		.min(1)
		.max(12),
});

const SPEC_IDS = APPLIANCES.map((a) => a.id) as [string, ...string[]];

const ItemSchema = z.object({
	specId: z.enum([...SPEC_IDS, "custom"]),
	name: z.string(),
	qty: z.number().int(),
	mode: z.enum(["hours", "cycles"]),
	watts: z.number(),
	hoursPerDay: z.number(),
	daysPerWeek: z.number(),
	kwhPerCycle: z.number(),
	cyclesPerWeek: z.number(),
	monthsPerYear: z.number(),
	standbyWatts: z.number(),
});

const ReplySchema = z.object({
	reply: z.string(),
	items: z.array(ItemSchema),
});

export type AssistantItem = z.infer<typeof ItemSchema>;
export type AssistantResponse = { reply: string; items: AssistantItem[] };

// --- Prompt -------------------------------------------------------------------

const LANGUAGE_NAME = { en: "English", tr: "Turkish", ar: "Arabic" } as const;

const CATALOG = APPLIANCES.map((a) =>
	a.mode === "hours"
		? `${a.id}: ${a.name} | hours | ${a.watts} W, ${a.hoursPerDay} h/day, ${a.daysPerWeek} days/week, ${a.monthsPerYear} months/year, standby ${a.standbyWatts} W, qty ${a.qty}`
		: `${a.id}: ${a.name} | cycles | ${a.kwhPerCycle} kWh per use, ${a.cyclesPerWeek} uses/week, ${a.monthsPerYear} months/year, standby ${a.standbyWatts} W, qty ${a.qty}`
).join("\n");

// Kept byte-for-byte stable so it can be cached; everything per-request goes
// in the messages.
const SYSTEM = `You help people list the electrical appliances in their home for a household electricity and carbon calculator. Read what the person wrote and return the appliances to add.

Catalog (id: name | usage mode | typical settings):
${CATALOG}

How to fill each item:
- specId: the closest catalog id. Use "custom" only when nothing in the catalog fits.
- Start from the catalog's typical settings, then adjust when the person gives details: brand, model, size, age, or how they use it. For example a 65-inch OLED TV draws more than the default TV, an old fridge uses more than a new one, and "we run the AC all summer" means more hours and months. For "custom" items, estimate every number yourself.
- mode "hours": fill watts, hoursPerDay (0-24), daysPerWeek (0-7). Set kwhPerCycle and cyclesPerWeek to 0.
- mode "cycles": fill kwhPerCycle and cyclesPerWeek. Set watts, hoursPerDay and daysPerWeek to 0.
- monthsPerYear 1-12, standbyWatts 0 or more, qty 1 or more (merge duplicates into one item with a higher qty).
- name: a short display name in the person's language. Include the brand or size when they gave one, for example "LG TV (55-inch)". Otherwise use the plain appliance name.

Other rules:
- Don't add things that are already in their current list unless they clearly ask for more.
- If the message isn't about appliances, or it's too vague to act on, return no items and ask one short question.
- You may briefly answer simple questions about home electricity use.
- reply: one or two short, friendly sentences in the person's language saying what you added or what you need to know. Plain text, no lists or markdown.`;

// --- Rate limiting --------------------------------------------------------------

// Per-instance and best-effort, which is enough to stop casual abuse of a
// paid endpoint. Use a shared store (e.g. Upstash) for a hard limit.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
	const now = Date.now();
	const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	recent.push(now);
	hits.set(ip, recent);
	if (hits.size > 5000) hits.clear();
	return recent.length > MAX_REQUESTS;
}

// --- Sanitising model output -------------------------------------------------

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

function tidy(item: AssistantItem): AssistantItem {
	return {
		...item,
		name: item.name.trim().slice(0, 80),
		qty: Math.round(clamp(item.qty, 1, 100)),
		watts: clamp(item.watts, 0, 50_000),
		hoursPerDay: clamp(item.hoursPerDay, 0, 24),
		daysPerWeek: clamp(item.daysPerWeek, 0, 7),
		kwhPerCycle: clamp(item.kwhPerCycle, 0, 200),
		cyclesPerWeek: clamp(item.cyclesPerWeek, 0, 100),
		monthsPerYear: clamp(item.monthsPerYear, 0, 12),
		standbyWatts: clamp(item.standbyWatts, 0, 200),
	};
}

// --- Handler -------------------------------------------------------------------

let client: Anthropic | null = null;

export async function POST(req: Request) {
	if (!process.env.ANTHROPIC_API_KEY) {
		return NextResponse.json({ error: "unavailable" }, { status: 503 });
	}

	const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
	if (rateLimited(ip)) {
		return NextResponse.json({ error: "rate_limited" }, { status: 429 });
	}

	const parsed = RequestSchema.safeParse(await req.json().catch(() => null));
	if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") {
		return NextResponse.json({ error: "bad_request" }, { status: 400 });
	}
	const { lang, regionId, current } = parsed.data;
	// The conversation has to open with a user turn.
	const messages = parsed.data.messages.slice(
		parsed.data.messages.findIndex((m) => m.role === "user")
	);
	const region = REGIONS.find((r) => r.id === regionId)?.name ?? "unknown";

	const context = `Language: ${LANGUAGE_NAME[lang]}. Country: ${region}.
Current list: ${current.length ? current.join("; ") : "(empty)"}`;

	client ??= new Anthropic();

	try {
		const response = await client.beta.messages.parse({
			model: "claude-opus-5-5",
			max_tokens: 8000,
			system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
			// The chat so far (the API is stateless). The latest message carries
			// the current list, so the model sees it as it is now.
			messages: messages.map((m, i) => ({
				role: m.role,
				content: i === messages.length - 1 ? `${context}\n\nMessage: ${m.text}` : m.text,
			})),
			// A quick extraction task: low effort keeps it fast and cheap.
			output_config: { effort: "low", format: betaZodOutputFormat(ReplySchema) },
			// If the model declines, retry on Anthropic's recommended fallback.
			betas: ["server-side-fallback-2026-07-01"],
			fallbacks: "default",
		});

		if (response.stop_reason === "refusal" || !response.parsed_output) {
			return NextResponse.json({ reply: "", items: [] } satisfies AssistantResponse);
		}

		const out = response.parsed_output;
		return NextResponse.json({
			reply: out.reply.slice(0, 600),
			items: out.items.slice(0, 25).map(tidy),
		} satisfies AssistantResponse);
	} catch (err) {
		if (err instanceof Anthropic.RateLimitError) {
			return NextResponse.json({ error: "busy" }, { status: 503 });
		}
		if (err instanceof Anthropic.APIError) {
			console.error("Assistant API error", err.status, err.message);
			return NextResponse.json({ error: "upstream" }, { status: 502 });
		}
		console.error("Assistant error", err);
		return NextResponse.json({ error: "server" }, { status: 500 });
	}
}
