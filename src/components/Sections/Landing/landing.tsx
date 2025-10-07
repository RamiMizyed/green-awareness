"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";

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

export default function LandingPage() {
	return (
		<div className="font-sans h-full relative min-h-[85svh] overflow-clip  min-w-full flex items-center justify-center py-[150px]  transition-colors duration-300">
			<video
				loop
				muted
				autoPlay
				playsInline
				src="https://www.pexels.com/download/video/854635/"
				className="fixed inset-0 w-full object-cover -z-50"></video>
			<main className="container mx-auto px-6 text-center">
				{/* Hero Section */}
				<motion.div
					className="flex flex-col items-center justify-center gap-6 mb-10"
					variants={containerVariants}
					initial="hidden"
					animate="visible">
					<motion.h1
						className="text-4xl lg:text-6xl font-extrabold text-green-100 "
						variants={itemVariants}>
						Green Awareness
					</motion.h1>
					<motion.p
						className="text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto"
						variants={itemVariants}>
						Empower yourself to make sustainable choices. Track your appliances,
						calculate energy costs, and measure carbon emissions <br /> with our
						easy-to-use calculator.
					</motion.p>
					<motion.div variants={itemVariants}>
						<Button
							variant="default"
							className=""
							onClick={() => {
								const element = document.getElementById("Calc");
								element?.scrollIntoView({ behavior: "smooth" });
							}}>
							Start Calculating <ArrowRight className="w-5 h-5 ml-2" />
						</Button>
					</motion.div>
				</motion.div>

				{/* Features Section */}
			</main>
		</div>
	);
}
