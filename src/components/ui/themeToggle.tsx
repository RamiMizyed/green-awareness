"use client";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const LANGUAGES = [
	{ code: "en", label: "English", flag: "🇺🇸" },
	{ code: "tr", label: "Turkish", flag: "🇹🇷" },
	{ code: "ar", label: "Arabic", flag: "🇸🇦" },
];

export default function SettingsToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	const [isTransitioning, setIsTransitioning] = useState(false);
	const [nextTheme, setNextTheme] = useState<string>(theme ?? "dark");
	const [showChildren, setShowChildren] = useState(false);

	// ✅ Ref to ensure mask animation triggers only once per transition
	const maskAnimated = useRef(false);
	const transitionLock = useRef(false);

	useEffect(() => setMounted(true), []);
	if (!mounted || !resolvedTheme) return null;

	const toggleTheme = () => {
		if (isTransitioning || transitionLock.current) return;

		transitionLock.current = true;
		setNextTheme(resolvedTheme === "dark" ? "light" : "dark");
		setShowChildren(false);
		setIsTransitioning(true);
		maskAnimated.current = false; // reset for new toggle
	};

	const containerVariants: Variants = {
		hidden: {},
		show: {
			transition: {
				staggerChildren: 0.12,
				delayChildren: 0.06,
			},
		},
	};

	const itemVariants: Variants = {
		hidden: { y: 10, opacity: 0 },
		show: { y: 0, opacity: 1, transition: { duration: 0.38, ease: "easeOut" } },
	};

	return (
		<div className="flex items-center gap-3 relative">
			{/* ---------- Overlay ---------- */}
			<AnimatePresence>
				{isTransitioning && (
					<div className="fixed inset-0 w-full h-[120svh] z-[999997] pointer-events-none">
						<motion.div
							className="fixed inset-0 w-full h-[120svh] z-[999998]"
							style={{ background: "rgba(0,0,0,0.65)" }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.46 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5 }}
						/>
						<motion.div
							className="fixed inset-0 h-[120svh] z-[999999] bg-zinc-900 flex items-center justify-center overflow-hidden"
							initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
							animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
							exit={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
							transition={{ duration: 0.69 }}
							onAnimationComplete={() => {
								if (!maskAnimated.current) {
									maskAnimated.current = true;
									setShowChildren(true);

									// Apply theme after overlay opens
									if (nextTheme !== resolvedTheme) {
										setTheme(nextTheme);
									}

									// close overlay after a short delay
									setTimeout(() => {
										setIsTransitioning(false);
										setShowChildren(false);
										transitionLock.current = false;
									}, 700);
								}
							}}>
							<div className="w-full max-w-xl px-6">
								<motion.div
									variants={containerVariants}
									initial="hidden"
									animate={showChildren ? "show" : "hidden"}
									className="flex flex-col items-center gap-3">
									<motion.div
										variants={itemVariants}
										className="rounded-full bg-zinc-800/60 border border-zinc-700 p-3 text-2xl"
										aria-hidden>
										{resolvedTheme === "dark" ? "🌙" : "☀️"}
									</motion.div>
									<motion.div
										variants={itemVariants}
										className="text-center text-sm text-zinc-200/90 font-medium">
										Switching ...
									</motion.div>
									<motion.div
										variants={itemVariants}
										className="flex items-center gap-2 mt-2"
										aria-hidden>
										<span className="h-1 w-16 rounded-full bg-zinc-700/60 block" />
										<span className="h-1 w-10 rounded-full bg-zinc-700/40 block" />
										<span className="h-1 w-6 rounded-full bg-zinc-700/30 block" />
									</motion.div>
								</motion.div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* ---------- Toggle Button ---------- */}
			<button
				onClick={toggleTheme}
				className="relative flex hover:cursor-pointer transition-all duration-300 group h-10 w-10 items-center justify-center hover:bg-primary rounded-full bg-secondary text-secondary-foreground overflow-hidden">
				<motion.span
					key={resolvedTheme}
					initial={{ rotate: -180, opacity: 0 }}
					animate={{ rotate: 0, opacity: 1 }}
					exit={{ rotate: 180, opacity: 0 }}
					transition={{ duration: 0.45, ease: "easeInOut" }}
					className="text-lg relative z-10">
					{resolvedTheme === "dark" ? "🌙" : "☀️"}
				</motion.span>
			</button>
		</div>
	);
}
