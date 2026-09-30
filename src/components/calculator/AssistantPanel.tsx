"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Lock, Sparkles, Undo2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { applianceVisual, getSpec } from "@/lib/data/appliances";
import type { ApplianceItem } from "@/lib/calc";
import { matchLocally } from "@/lib/assistant/local";
import { itemName, specName, useLang, useT } from "@/lib/i18n";
import type { AssistantResponse } from "@/app/api/assistant/route";
import { cn } from "@/lib/utils";
import { IconTile } from "./ui";

interface Message {
	id: number;
	role: "user" | "assistant";
	text: string;
	/** Ids of the list items this reply added, for showing and undoing them. */
	added?: string[];
	undone?: boolean;
}

type NewItem = Omit<ApplianceItem, "id">;

function fromSpec(specId: string, qty: number, name = ""): NewItem | null {
	const s = getSpec(specId);
	if (!s) return null;
	return {
		specId: s.id,
		name,
		mode: s.mode,
		watts: s.watts,
		hoursPerDay: s.hoursPerDay,
		daysPerWeek: s.daysPerWeek,
		kwhPerCycle: s.kwhPerCycle,
		cyclesPerWeek: s.cyclesPerWeek,
		monthsPerYear: s.monthsPerYear,
		standbyWatts: s.standbyWatts,
		qty,
	};
}

export function AssistantPanel() {
	const t = useT();
	const lang = useLang();
	const items = useAppStore((s) => s.items);
	const regionId = useAppStore((s) => s.settings.regionId);
	const addItems = useAppStore((s) => s.addItems);
	const removeItems = useAppStore((s) => s.removeItems);

	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [pending, setPending] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const idRef = useRef(0);
	const nextId = () => ++idRef.current;

	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [messages, pending]);

	const say = (text: string, added?: string[]) => {
		const msg: Message = { id: nextId(), role: "assistant", text, added };
		setMessages((m) => [...m, msg]);
	};

	/** Keyword matching in the browser, used when the AI can't be reached. */
	const addLocally = (text: string, note: string) => {
		const found = matchLocally(text)
			.map((m) => {
				if (!m.brand) return fromSpec(m.specId, m.qty);
				// "TV (50-inch LED)" + LG -> "LG TV" ("تلفاز LG" in Arabic).
				const base = specName(t, m.specId, m.specId).replace(/\s*\(.*?\)/g, "");
				return fromSpec(m.specId, m.qty, lang === "ar" ? `${base} ${m.brand}` : `${m.brand} ${base}`);
			})
			.filter((x): x is NewItem => x !== null);
		if (found.length === 0) return say(`${note} ${t.assistant.nothing}`);
		const ids = addItems(found);
		say(`${note} ${t.assistant.added(found.length)}.`, ids);
	};

	const send = async (raw: string) => {
		const text = raw.trim().slice(0, 600);
		if (!text || pending) return;
		setInput("");
		const history = [...messages, { id: nextId(), role: "user" as const, text }];
		setMessages(history);
		setPending(true);

		try {
			const res = await fetch("/api/assistant", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					lang,
					regionId,
					current: items.slice(0, 80).map((it) => itemName(t, it).slice(0, 80)),
					messages: history.slice(-10).map((m) => ({ role: m.role, text: m.text.slice(0, 600) })),
				}),
			});

			if (res.status === 429) return addLocally(text, t.assistant.limit);
			if (!res.ok) return addLocally(text, t.assistant.offline);

			const data = (await res.json()) as AssistantResponse;
			const newItems: NewItem[] = data.items.filter((it) => it.qty > 0);
			const ids = newItems.length ? addItems(newItems) : undefined;
			say(
				data.reply || (ids ? `${t.assistant.added(ids.length)}.` : t.assistant.nothing),
				ids
			);
		} catch {
			addLocally(text, t.assistant.offline);
		} finally {
			setPending(false);
		}
	};

	const undo = (msg: Message) => {
		if (!msg.added) return;
		removeItems(msg.added);
		setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, undone: true } : x)));
	};

	return (
		<div className="rounded-2xl border-2 border-primary/25 bg-primary/5 p-4 sm:p-5">
			<div className="flex items-center gap-3">
				<IconTile icon={Sparkles} tone="bg-primary text-primary-foreground" size="sm" />
				<div>
					<h3 className="text-lg font-bold leading-tight">{t.assistant.title}</h3>
					<p className="text-sm text-muted-foreground">{t.assistant.text}</p>
				</div>
			</div>

			{(messages.length > 0 || pending) && (
				<div
					ref={listRef}
					aria-live="polite"
					className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto pe-1">
					{messages.map((m) =>
						m.role === "user" ? (
							<p
								key={m.id}
								className="max-w-[85%] self-end rounded-2xl rounded-ee-md bg-primary px-4 py-2.5 text-base text-primary-foreground">
								<span className="sr-only">{t.assistant.you}: </span>
								{m.text}
							</p>
						) : (
							<AssistantBubble key={m.id} message={m} onUndo={() => undo(m)} />
						)
					)}
					{pending && (
						<p className="flex items-center gap-2 self-start rounded-2xl bg-card px-4 py-2.5 text-base text-muted-foreground shadow-sm">
							<Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
							{t.assistant.thinking}
						</p>
					)}
				</div>
			)}

			<form
				className="mt-4 flex gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					send(input);
				}}>
				<label htmlFor="assistant-input" className="sr-only">
					{t.assistant.label}
				</label>
				<input
					id="assistant-input"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder={t.assistant.placeholder}
					maxLength={600}
					autoComplete="off"
					className="h-13 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
				/>
				<button
					type="submit"
					disabled={!input.trim() || pending}
					className="inline-flex h-13 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">
					<ArrowUp className="size-5" aria-hidden />
					<span className="max-sm:sr-only">{t.assistant.send}</span>
				</button>
			</form>

			{messages.length === 0 && (
				<div className="mt-3 flex flex-wrap gap-2">
					{t.assistant.examples.map((ex) => (
						<button
							key={ex}
							type="button"
							onClick={() => send(ex)}
							disabled={pending}
							className="rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5">
							{ex}
						</button>
					))}
				</div>
			)}

			<p className="mt-3 flex gap-1.5 text-xs text-muted-foreground">
				<Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
				{t.assistant.privacy}
			</p>
		</div>
	);
}

function AssistantBubble({ message, onUndo }: { message: Message; onUndo: () => void }) {
	const t = useT();
	const items = useAppStore((s) => s.items);
	const added = message.added
		? items.filter((it) => message.added!.includes(it.id))
		: [];

	return (
		<div className="max-w-[90%] self-start rounded-2xl rounded-es-md bg-card px-4 py-3 shadow-sm">
			<p className="text-base">
				<span className="sr-only">{t.assistant.ai}: </span>
				{message.undone ? t.assistant.undone : message.text}
			</p>
			{!message.undone && added.length > 0 && (
				<>
					<ul className="mt-3 flex flex-wrap gap-2">
						{added.map((it) => {
							const v = applianceVisual(it.specId);
							return (
								<li
									key={it.id}
									className="flex items-center gap-2 rounded-xl bg-muted/70 py-1 pe-3 ps-1 text-sm font-medium">
									<IconTile icon={v.icon} tone={v.tone} size="sm" className="size-8 rounded-lg [&>svg]:size-4" />
									{itemName(t, it) || t.step2.unnamed}
									{it.qty > 1 && <span className="text-muted-foreground">×{it.qty}</span>}
								</li>
							);
						})}
					</ul>
					<button
						type="button"
						onClick={onUndo}
						className={cn(
							"mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						)}>
						<Undo2 className="size-4" aria-hidden />
						{t.assistant.undo}
					</button>
				</>
			)}
		</div>
	);
}
