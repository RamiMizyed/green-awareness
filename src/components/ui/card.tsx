import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
// No need for useMouse import anymore

function Card({ className, ...props }: React.ComponentProps<"div">) {
	const cardRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const targetPosition = useRef({ x: -100, y: -100 });
	const currentPosition = useRef({ x: -100, y: -100 });

	useEffect(() => {
		const handleMove = (e: MouseEvent) => {
			if (cardRef.current) {
				const rect = cardRef.current.getBoundingClientRect();
				targetPosition.current = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
				};
			}
		};

		window.addEventListener("mousemove", handleMove);
		return () => window.removeEventListener("mousemove", handleMove);
	}, []);

	useEffect(() => {
		let rafId: number;

		const animate = () => {
			const dx = targetPosition.current.x - currentPosition.current.x;
			const dy = targetPosition.current.y - currentPosition.current.y;

			// Lerp factor: adjust 0.1 for more/less smoothness (smaller = smoother/slower)
			currentPosition.current.x += dx * 0.1;
			currentPosition.current.y += dy * 0.1;

			if (overlayRef.current) {
				overlayRef.current.style.setProperty(
					"--mouse-x",
					`${currentPosition.current.x}px`
				);
				overlayRef.current.style.setProperty(
					"--mouse-y",
					`${currentPosition.current.y}px`
				);
			}

			rafId = requestAnimationFrame(animate);
		};

		rafId = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(rafId);
	}, []);

	return (
		<div
			ref={cardRef}
			data-slot="card"
			className={cn(
				"dark:bg-white/5 bg-card backdrop-blur-2xl text-card-foreground flex flex-col gap-6 rounded-xl border px-2 py-6 shadow-sm relative overflow-hidden",
				className
			)}
			{...props}>
			{props.children}
			<div
				ref={overlayRef}
				className="absolute inset-0 rounded-xl pointer-events-none"
				style={{
					border: "2px solid rgb(100, 255, 0)", // Adjust color as needed
					WebkitMaskImage: `radial-gradient(circle 950px at var(--mouse-x) var(--mouse-y), black 10%, transparent 50%)`,
					maskImage: `radial-gradient(circle 950px at var(--mouse-x) var(--mouse-y), black 10%, transparent 50%)`, // For cross-browser support
				}}
			/>
		</div>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
				className
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn("leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className
			)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-6", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
};
