"use client";
import GreenAwarenessPage from "@/app/GACalculationPage";
import LandingPage from "@/components/Sections/Landing/landing";
import Loading from "@/components/ui/loader";
export default function Home() {
	return (
		<main
			className="w-full min-h-screen  
  bg-gradient-to-b 
  from-zinc-950 via-emerald-900/20 to-neutral-950">
			<Loading />
			<LandingPage />
			<GreenAwarenessPage />
		</main>
	);
}
