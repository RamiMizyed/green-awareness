"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// The theme is only known on the client; render neutral until mounted.
	const dark = mounted && resolvedTheme === "dark";
	return (
		<button
			type="button"
			onClick={() => setTheme(dark ? "light" : "dark")}
			aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
			className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
			{mounted ? (
				dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />
			) : (
				<span className="size-5" />
			)}
		</button>
	);
}
