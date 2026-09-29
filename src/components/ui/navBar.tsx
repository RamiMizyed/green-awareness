"use client";

import { useEffect, useState } from "react";
import { Github, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./themeToggle";

const LINKS = [
	{ href: "#calculator", label: "Calculator" },
	{ href: "#save", label: "Save" },
	{ href: "#how-it-works", label: "How it works" },
];

export default function NavBar() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300",
				scrolled
					? "border-border bg-background/85 text-foreground backdrop-blur-lg"
					: "border-transparent bg-transparent text-white"
			)}>
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
				<a href="#" className="flex items-center gap-2 font-semibold">
					<span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
						<Leaf className="size-4" aria-hidden />
					</span>
					<span className="hidden sm:inline">Green Awareness</span>
				</a>
				<nav aria-label="Main" className="flex items-center gap-1">
					{LINKS.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className={cn(
								"rounded-md px-2.5 py-1.5 text-sm transition-colors sm:px-3",
								scrolled
									? "text-muted-foreground hover:bg-muted hover:text-foreground"
									: "text-white/80 hover:bg-white/10 hover:text-white"
							)}>
							{l.label}
						</a>
					))}
					<a
						href="https://github.com/RamiMizyed/green-awareness"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub repository"
						className={cn(
							"ml-1 hidden size-9 items-center justify-center rounded-md transition-colors sm:flex",
							scrolled ? "hover:bg-muted" : "hover:bg-white/10"
						)}>
						<Github className="size-4" aria-hidden />
					</a>
					<ThemeToggle />
				</nav>
			</div>
		</header>
	);
}
