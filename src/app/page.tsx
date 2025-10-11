"use client";
import dynamic from "next/dynamic";
import LandingPage from "@/components/Sections/Landing/landing";
import Loading from "@/components/ui/loader";

// Lazy load GreenAwarenessPage
const GreenAwarenessPage = dynamic(() => import("@/app/GACalculationPage"), {
	loading: () => <p className="text-center text-gray-400 py-10">Loading...</p>,
	ssr: false, // Prevents it from being rendered on the server
});

export default function Home() {
	return (
		<main
			className="w-full min-h-screen  
  bg-gradient-to-b 
  from-zinc-950 via-emerald-900/20 to-neutral-950">
			<Loading />
			<LandingPage />
			<GreenAwarenessPage />
			<footer className="relative z-10 bg-black/30 py-6 text-center text-gray-300">
				<p>
					&copy; {new Date().getFullYear()} Green Awareness. All rights
					reserved.
				</p>
				<a
					href="https://github.com/RamiMizyed/green-awareness"
					target="_blank"
					rel="noopener noreferrer"
					className="text-green-200 hover:underline">
					Contribute on GitHub
				</a>
			</footer>
		</main>
	);
}
