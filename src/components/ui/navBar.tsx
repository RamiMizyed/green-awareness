"use client";

import { Github, Leaf } from "lucide-react";
import ThemeToggle from "./themeToggle";

const LINKS = [
	{ href: "#calculator", label: "Calculator" },
	{ href: "#save", label: "Save money" },
	{ href: "#how-it-works", label: "How it works" },
];

export default function NavBar() {
	return (
		<header className="fixed inset-x-0 top-0 z-40 border-b bg-background/90 backdrop-blur-lg">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
				<a href="#" className="flex items-center gap-2.5 text-lg font-bold">
					<span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
						<Leaf className="size-5" aria-hidden />
					</span>
					<span className="hidden min-[420px]:inline">Green Awareness</span>
				</a>
				<nav aria-label="Main" className="flex items-center gap-1">
					{LINKS.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className="hidden rounded-lg px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:block">
							{l.label}
						</a>
					))}
					<a
						href="https://github.com/RamiMizyed/green-awareness"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub repository"
						className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
						<Github className="size-5" aria-hidden />
					</a>
					<ThemeToggle />
				</nav>
			</div>
		</header>
	);
}
