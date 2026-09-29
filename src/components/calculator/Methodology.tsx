"use client";

import { useT } from "@/lib/i18n";

export function Methodology() {
	const t = useT();
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
			{t.how.items.map((it) => (
				<details
					key={it.q}
					className="group rounded-3xl border bg-card p-5 shadow-sm sm:p-6 [&_summary::-webkit-details-marker]:hidden">
					<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
						{it.q}
						<span
							className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-2xl leading-none text-muted-foreground transition-transform group-open:rotate-45"
							aria-hidden>
							+
						</span>
					</summary>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">{it.a}</p>
				</details>
			))}
		</div>
	);
}
