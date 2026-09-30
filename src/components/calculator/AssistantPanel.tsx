"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Lock, Sparkles, Undo2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { applianceVisual } from "@/lib/data/appliances";
import type { ApplianceItem } from "@/lib/calc";
import { understand } from "@/lib/assistant/local";
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
	/** Items this reply removed, so Undo can put them back. */
	removed?: ApplianceItem[];
	undone?: boolean;
}

type NewItem = Omit<ApplianceItem, "id">;

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
	// Whether the optional AI is switched on; until we know, work locally.
	const [aiEnabled, setAiEnabled] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const idRef = useRef(0);
	const nextId = () => ++idRef.current;

	useEffect(() => {
		fetch("/api/assistant")
			.then((r) => (r.ok ? r.json() : { enabled: false }))
			.then((d: { enabled?: boolean }) => setAiEnabled(Boolean(d.enabled)))
			.catch(() => setAiEnabled(false));
	}, []);

	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [messages, pending]);

	const say = (text: string, extra?: Pick<Message, "added" | "removed">) => {
		const msg: Message = { id: nextId(), role: "assistant", text, ...extra };
		setMessages((m) => [...m, msg]);
	};

	/** The free, in-browser helper. `note` prefixes the reply when the AI failed. */
	const handleLocally = (text: string, note = "") => {
		const { add, remove } = understand(text);
		const prefix = note ? `${note} ` : "";

		if (remove.length) {
			const gone = items.filter((it) => remove.includes(it.specId));
			if (!gone.length) return say(prefix + t.assistant.notFound);
			removeItems(gone.map((it) => it.id));
			return say(prefix + t.assistant.removed(gone.length), { removed: gone });
		}

		if (!add.length) return say(prefix + t.assistant.nothing);
		const newItems: NewItem[] = add.map(({ brand, ...it }) => {
			if (!brand) return { ...it, name: "" };
			// "TV (50-inch LED)" + LG -> "LG TV" ("تلفاز LG" in Arabic).
			const base = specName(t, it.specId, it.specId).replace(/\s*\(.*?\)/g, "");
			return { ...it, name: lang === "ar" ? `${base} ${brand}` : `${brand} ${base}` };
		});
		const ids = addItems(newItems);
		say(`${prefix}${t.assistant.added(ids.length)}.`, { added: ids });
	};

	const send = async (raw: string) => {
		const text = raw.trim().slice(0, 600);
		if (!text || pending) return;
		setInput("");
		const history = [...messages, { id: nextId(), role: "user" as const, text }];
		setMessages(history);

		if (!aiEnabled) return handleLocally(text);

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

			if (res.status === 429) return handleLocally(text, t.assistant.limit);
			if (!res.ok) return handleLocally(text, t.assistant.offline);

			const data = (await res.json()) as AssistantResponse;
			const newItems: NewItem[] = data.items.filter((it) => it.qty > 0);
			const ids = newItems.length ? addItems(newItems) : undefined;
			say(
				data.reply || (ids ? `${t.assistant.added(ids.length)}.` : t.assistant.nothing),
				{ added: ids }
			);
		} catch {
			handleLocally(text, t.assistant.offline);
		} finally {
			setPending(false);
		}
	};

	const undo = (msg: Message) => {
		if (msg.added) removeItems(msg.added);
		// addItems gives the restored items fresh ids.
		if (msg.removed) addItems(msg.removed);
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
				{aiEnabled ? t.assistant.privacy : t.assistant.localPrivacy}
			</p>
		</div>
	);
}

function AssistantBubble({ message, onUndo }: { message: Message; onUndo: () => void }) {
	const t = useT();
	const items = useAppStore((s) => s.items);
	// Added items are read live, so edits and removals in the list show here too.
	const added = message.added ? items.filter((it) => message.added!.includes(it.id)) : [];
	const removed = message.removed ?? [];
	const chips = added.length ? added : removed;

	return (
		<div className="max-w-[90%] self-start rounded-2xl rounded-es-md bg-card px-4 py-3 shadow-sm">
			<p className="text-base">
				<span className="sr-only">{t.assistant.ai}: </span>
				{message.undone
					? message.removed
						? t.assistant.restored
						: t.assistant.undone
					: message.text}
			</p>
			{!message.undone && chips.length > 0 && (
				<>
					<ul className="mt-3 flex flex-wrap gap-2">
						{chips.map((it) => {
							const v = applianceVisual(it.specId);
							return (
								<li
									key={it.id}
									className={cn(
										"flex items-center gap-2 rounded-xl bg-muted/70 py-1 pe-3 ps-1 text-sm font-medium",
										!added.length && "text-muted-foreground line-through"
									)}>
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
						className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
						<Undo2 className="size-4" aria-hidden />
						{t.assistant.undo}
					</button>
				</>
			)}
		</div>
	);
}
