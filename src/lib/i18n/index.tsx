"use client";

import { Fragment, useSyncExternalStore, type ReactNode } from "react";
import en, { type Dict } from "./en";
import tr from "./tr";
import ar from "./ar";
import type { ApplianceItem } from "@/lib/calc";
import { getSpec } from "@/lib/data/appliances";
import { STORAGE_KEY } from "./boot";

export type Lang = "en" | "tr" | "ar";

export const DICTS: Record<Lang, Dict> = { en, tr, ar };
export const LANGS: Lang[] = ["en", "tr", "ar"];

const isLang = (v: unknown): v is Lang => typeof v === "string" && v in DICTS;

function detect(): Lang {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (isLang(saved)) return saved;
	} catch {}
	for (const tag of navigator.languages ?? [navigator.language]) {
		const base = tag.slice(0, 2).toLowerCase();
		if (isLang(base)) return base;
	}
	return "en";
}

// A tiny external store, so server HTML (English) hydrates cleanly and the
// saved language is applied right after.
let current: Lang = typeof window === "undefined" ? "en" : detect();
const listeners = new Set<() => void>();

function apply(lang: Lang) {
	const root = document.documentElement;
	root.lang = lang;
	root.dir = DICTS[lang].meta.dir;
	document.title = DICTS[lang].meta.title;
}

if (typeof window !== "undefined") apply(current);

export function setLang(lang: Lang) {
	current = lang;
	try {
		localStorage.setItem(STORAGE_KEY, lang);
	} catch {}
	apply(lang);
	listeners.forEach((l) => l());
}

export function useLang(): Lang {
	return useSyncExternalStore(
		(cb) => {
			listeners.add(cb);
			return () => listeners.delete(cb);
		},
		() => current,
		() => "en"
	);
}

export const useT = () => DICTS[useLang()];

// --- Placeholders -----------------------------------------------------------

/** Fills {key} placeholders with plain strings. */
export function fill(template: string, values: Record<string, string | number>) {
	return template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
}

/** Fills {key} placeholders with React nodes, e.g. a bold amount. */
export function rich(template: string, values: Record<string, ReactNode>): ReactNode {
	return template.split(/(\{\w+\})/g).map((part, i) => {
		const key = /^\{(\w+)\}$/.exec(part)?.[1];
		return <Fragment key={i}>{key && key in values ? values[key] : part}</Fragment>;
	});
}

// --- Names ------------------------------------------------------------------

type ApplianceText = { name: string; hint?: string };
const applianceText = (t: Dict, id: string): ApplianceText | undefined =>
	(t.appliances as Record<string, ApplianceText>)[id];

/** Every language's name for a preset, to tell untouched names from edited ones. */
const presetNames = new Map<string, Set<string>>();
function knownNames(specId: string) {
	let set = presetNames.get(specId);
	if (!set) {
		set = new Set(LANGS.map((l) => applianceText(DICTS[l], specId)?.name ?? ""));
		const spec = getSpec(specId);
		if (spec) set.add(spec.name);
		presetNames.set(specId, set);
	}
	return set;
}

/**
 * The name to show for a list item. Preset names follow the current language;
 * anything the user typed themselves is shown as they wrote it.
 */
export function itemName(t: Dict, item: Pick<ApplianceItem, "specId" | "name">) {
	const preset = applianceText(t, item.specId)?.name;
	if (preset && (item.name === "" || knownNames(item.specId).has(item.name))) {
		return preset;
	}
	return item.name;
}

export const specName = (t: Dict, specId: string, fallback: string) =>
	applianceText(t, specId)?.name ?? fallback;

export const specHint = (t: Dict, specId: string) => applianceText(t, specId)?.hint;

export const templateText = (t: Dict, id: string) =>
	(t.step2.templates as Record<string, { label: string; description: string }>)[id];

export const tipText = (t: Dict, id: string) =>
	(t.tips as Record<string, { title: string; detail: string }>)[id];

/** Country names come from the browser's own translations. */
export function regionName(t: Dict, lang: Lang, regionId: string, fallback: string) {
	if (regionId === "world") return t.step1.world;
	if (regionId === "eu") return t.step1.eu;
	try {
		return (
			new Intl.DisplayNames([lang], { type: "region" }).of(regionId.toUpperCase()) ??
			fallback
		);
	} catch {
		return fallback;
	}
}

/** "9%" in English, "%9" in Turkish, "9٪" in Arabic (with Western digits). */
export function formatPercent(lang: Lang, fraction: number) {
	const locale = lang === "ar" ? "ar-u-nu-latn" : lang;
	return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(
		Number.isFinite(fraction) ? fraction : 0
	);
}
