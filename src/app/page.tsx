"use client";

import GreenAwarenessPage from "@/components/Sections/GACalculationPage";
import Landing from "@/components/Sections/Landing";
import Loading from "@/components/ui/loader";

export default function Home() {
	return (
		<main className="w-full min-h-screen">
			<Loading />
			{/* <Landing /> */}
			<div className="w-full min-h-screen">
				<GreenAwarenessPage />
			</div>
		</main>
	);
}
