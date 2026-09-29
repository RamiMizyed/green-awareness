"use client";

import { Check, Languages } from "lucide-react";
import { DICTS, LANGS, setLang, useLang, useT } from "@/lib/i18n";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";

export default function LanguageSwitcher() {
	const lang = useLang();
	const t = useT();
	return (
		<Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
			<SelectTrigger
				aria-label={t.nav.language}
				className="!h-10 gap-2 rounded-lg border-0 bg-transparent px-2.5 text-base font-medium text-muted-foreground shadow-none hover:bg-muted hover:text-foreground dark:bg-transparent dark:hover:bg-muted [&>svg:last-child]:hidden">
				<Languages className="size-5" aria-hidden />
				<span className="uppercase">{lang}</span>
			</SelectTrigger>
			<SelectContent align="end" className="min-w-40">
				{LANGS.map((l) => (
					<SelectItem
						key={l}
						value={l}
						lang={l}
						dir={DICTS[l].meta.dir}
						className="py-2.5 text-base [&>span:first-child]:hidden">
						<span className="flex w-full items-center justify-between gap-3">
							{DICTS[l].meta.name}
							{l === lang && <Check className="size-4 text-primary" aria-hidden />}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
