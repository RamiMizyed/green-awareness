import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A small rounded flag, served from /public/flags (copied from
 * country-flag-icons) so only the flags on screen are downloaded.
 * The world average gets a globe.
 */
export function Flag({ regionId, className }: { regionId: string; className?: string }) {
	const box = cn(
		"inline-block h-[1em] w-[1.5em] shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
		className
	);
	if (regionId === "world") {
		return (
			<span
				className={cn(box, "flex items-center justify-center bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300")}
				aria-hidden>
				<Globe2 className="size-[0.8em]" />
			</span>
		);
	}
	return (
		// eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs, no optimisation needed
		<img src={`/flags/${regionId}.svg`} alt="" loading="lazy" decoding="async" className={cn(box, "object-cover")} />
	);
}
