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
			className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-foreground/10">
			{mounted ? (
				dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />
			) : (
				<span className="size-4" />
			)}
		</button>
	);
}
