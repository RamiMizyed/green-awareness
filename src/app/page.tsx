"use client";

import dynamic from "next/dynamic";
import { useT } from "@/lib/i18n";

const Calculator = dynamic(() => import("@/components/calculator/Calculator"), {
	ssr: false,
	loading: () => (
		<div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6" aria-busy="true">
			<div className="h-12 w-full max-w-2xl animate-pulse rounded-xl bg-muted" />
			<div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
				<div className="h-96 animate-pulse rounded-3xl bg-muted" />
				<div className="h-96 animate-pulse rounded-3xl bg-muted" />
			</div>
		</div>
	),
});

export default function Home() {
	const t = useT();
	return (
		<>
			<Calculator />
			<footer className="border-t pb-28 pt-10 text-base text-muted-foreground lg:pb-10">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
					<p>
						&copy; {new Date().getFullYear()} Green Awareness. {t.footer.note}
					</p>
					<div className="flex gap-5">
						<a
							href="https://github.com/RamiMizyed/green-awareness"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground">
							{t.footer.contribute}
						</a>
						<a
							href="https://ramimizyed.dev/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground">
							{t.footer.madeBy}
						</a>
					</div>
				</div>
			</footer>
		</>
	);
}
