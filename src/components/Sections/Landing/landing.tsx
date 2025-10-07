"use client";
import React from "react";
import { ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.3,
			delayChildren: 0.2,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

const featureVariants: Variants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.6, ease: "easeOut" },
	},
};

const sectionVariants: Variants = {
	hidden: { opacity: 0, y: 50 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.8, ease: "easeOut" },
	},
};

export default function LandingPage() {
	return (
		<div className="font-sans relative overflow-hidden min-h-[70svh] min-w-full transition-colors duration-300">
			{/* Video Background */}
			<video
				loop
				muted
				autoPlay
				playsInline
				src="https://www.pexels.com/download/video/854635/"
				className="fixed inset-0 w-full h-full object-cover -z-10 filter brightness-75"
			/>
			<div className="absolute inset-0 bg-black/40 -z-5" />{" "}
			{/* Overlay for better text visibility */}
			<main className="container mx-auto px-6 py-[150px] min-h-[400px] text-center relative z-10">
				{/* Hero Section */}
				<motion.div
					className="flex flex-col items-center justify-center gap-6 mb-16"
					variants={containerVariants}
					initial="hidden"
					animate="visible">
					<motion.h1
						className="text-4xl lg:text-6xl font-extrabold text-green-100 drop-shadow-lg"
						variants={itemVariants}>
						Green Awareness
					</motion.h1>

					<motion.p
						className="text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md"
						variants={itemVariants}>
						Empower yourself to make sustainable choices. Track your appliances,
						calculate energy costs, and measure carbon emissions <br /> with our
						easy-to-use calculator.
					</motion.p>

					<motion.div
						className="flex gap-3 flex-col lg:flex-row"
						variants={itemVariants}>
						<Button
							variant="default"
							className="bg-green-600 hover:bg-green-700 text-white font-semibold py-6 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
							onClick={() => {
								const element = document.getElementById("Calc");
								element?.scrollIntoView({ behavior: "smooth" });
							}}>
							Start Calculating <ArrowRight className="w-5 h-5 ml-2" />
						</Button>
					</motion.div>
				</motion.div>

				{/* Open Source Section */}
			</main>
			{/* Footer */}
		</div>
	);
}
