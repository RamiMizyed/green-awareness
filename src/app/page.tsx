"use client";
import GreenAwarenessPage from "@/app/GACalculationPage";
import Loading from "@/components/ui/loader";
export default function Home() {
	return (
		<main
			className="w-full min-h-screen flex items-center justify-center 
  bg-gradient-to-b from-neutral-50 via-emerald-100/40 to-neutral-100 
  dark:from-zinc-950 dark:via-emerald-900/20 dark:to-neutral-950">
			<Loading />
			<GreenAwarenessPage />
		</main>
	);
}
