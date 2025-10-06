"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Load Lottie dynamically (no SSR)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieAnimationProps {
	src: string; // e.g. "/animationAssets/renewable-energy.json"
	className?: string;
	loop?: boolean;
	autoplay?: boolean;
}

/**
 * A reusable Lottie animation component that lazily fetches JSON files
 * from /public to keep bundle size small.
 */
const LottieAnimator: React.FC<LottieAnimationProps> = ({
	src,
	className = "",
	loop = true,
	autoplay = true,
}) => {
	const [animationData, setAnimationData] = useState<Record<
		string,
		unknown
	> | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadAnimation = async () => {
			try {
				const res = await fetch(src);
				if (!res.ok) throw new Error(`Failed to fetch animation: ${src}`);
				const json = await res.json();
				if (isMounted) setAnimationData(json);
			} catch (err) {
				console.error("Lottie load error:", err);
			}
		};

		loadAnimation();

		return () => {
			isMounted = false;
		};
	}, [src]);

	if (!animationData) {
		return (
			<div
				className={`flex items-center justify-center ${className}`}
				aria-busy="true">
				{/* Small loading spinner */}
				<div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<Lottie
				animationData={animationData}
				loop={loop}
				autoplay={autoplay}
				className="w-48 h-48"
			/>
		</div>
	);
};

export default LottieAnimator;
