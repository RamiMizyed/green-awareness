"use client";

import { Github, Leaf } from "lucide-react";
import { useT } from "@/lib/i18n";
import ThemeToggle from "./themeToggle";
import LanguageSwitcher from "./languageSwitcher";

export default function NavBar() {
	const t = useT();
	const links = [
		{ href: "#calculator", label: t.nav.calculator },
		{ href: "#save", label: t.nav.save },
		{ href: "#how-it-works", label: t.nav.how },
	];

	return (
		<header className="fixed inset-x-0 top-0 z-40 border-b bg-background/90 backdrop-blur-lg">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
				<a href="#" className="flex items-center gap-2.5 text-lg font-bold" dir="ltr">
					<span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
						<Leaf className="size-5" aria-hidden />
					</span>
					<span className="hidden min-[420px]:inline">Green Awareness</span>
				</a>
				<nav aria-label="Main" className="flex items-center gap-1">
					{links.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:block">
							{l.label}
						</a>
					))}
					<LanguageSwitcher />
					<a
						href="https://github.com/RamiMizyed/green-awareness"
						target="_blank"
						rel="noopener noreferrer"
						aria-label={t.nav.github}
						className="hidden size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex">
						<Github className="size-5" aria-hidden />
					</a>
					<ThemeToggle />
				</nav>
			</div>
		</header>
	);
}
