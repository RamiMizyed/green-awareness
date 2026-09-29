"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Icon tile -------------------------------------------------------------

const TILE_SIZE = {
	sm: "size-10 rounded-xl [&>svg]:size-5",
	md: "size-14 rounded-2xl [&>svg]:size-7",
	lg: "size-16 rounded-2xl [&>svg]:size-8",
} as const;

/** A big, colour-coded square holding an icon. */
export function IconTile({
	icon: Icon,
	tone,
	size = "md",
	className,
}: {
	icon: LucideIcon;
	tone: string;
	size?: keyof typeof TILE_SIZE;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"flex shrink-0 items-center justify-center",
				TILE_SIZE[size],
				tone,
				className
			)}
			aria-hidden>
			<Icon strokeWidth={2} />
		</span>
	);
}

// --- Step header -----------------------------------------------------------

export function StepHeader({
	step,
	title,
	text,
	action,
	id,
}: {
	step: number;
	title: string;
	text?: string;
	action?: React.ReactNode;
	id?: string;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<div className="flex items-center gap-4">
				<span
					className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
					aria-hidden>
					{step}
				</span>
				<div>
					<h2 id={id} className="text-xl font-bold tracking-tight sm:text-2xl">
						<span className="sr-only">Step {step}: </span>
						{title}
					</h2>
					{text && <p className="mt-0.5 text-base text-muted-foreground">{text}</p>}
				</div>
			</div>
			{action}
		</div>
	);
}

// --- Numeric input helpers -------------------------------------------------

const toText = (n: number) => (Number.isFinite(n) ? String(+n.toFixed(4)) : "");

/**
 * Local text state for a numeric input: accepts "1,5" or "1.5", allows an
 * empty field while typing, commits valid numbers straight away and tidies
 * up on blur.
 */
function useNumericText(
	value: number,
	onChange: (n: number) => void,
	min: number,
	max: number
) {
	const [text, setText] = useState(toText(value));
	const focused = useRef(false);
	useEffect(() => {
		if (!focused.current) setText(toText(value));
	}, [value]);

	const clamp = (n: number) => Math.min(max, Math.max(min, n));

	return {
		text,
		clamp,
		setExact: (n: number) => {
			const c = clamp(+n.toFixed(4));
			onChange(c);
			setText(toText(c));
		},
		inputProps: {
			type: "text",
			inputMode: "decimal" as const,
			autoComplete: "off",
			value: text,
			onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
				focused.current = true;
				e.currentTarget.select();
			},
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
				const raw = e.target.value;
				if (!/^\d*[.,]?\d*$/.test(raw)) return;
				setText(raw);
				const n = parseFloat(raw.replace(",", "."));
				if (Number.isFinite(n)) onChange(clamp(n));
			},
			onBlur: () => {
				focused.current = false;
				const n = parseFloat(text.replace(",", "."));
				const final = Number.isFinite(n) ? clamp(n) : min;
				onChange(final);
				setText(toText(final));
			},
		},
	};
}

interface NumberProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
	unit?: string;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
}

// --- Stepper ---------------------------------------------------------------

/** Big − value + control. Typing works too; the arrow keys step. */
export function Stepper({
	label,
	value,
	onChange,
	unit,
	min = 0,
	max = Number.MAX_SAFE_INTEGER,
	step = 1,
	className,
}: NumberProps) {
	const id = useId();
	const { text, setExact, inputProps } = useNumericText(value, onChange, min, max);
	// Snap to the step grid so 4.3 + 0.5 lands on 4.5, not 4.8.
	const bump = (dir: 1 | -1) => {
		const snapped =
			dir > 0
				? Math.floor(value / step + 1e-9) * step + step
				: Math.ceil(value / step - 1e-9) * step - step;
		setExact(snapped);
	};

	return (
		<div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
			<label htmlFor={id} className="text-sm font-medium text-muted-foreground">
				{label}
			</label>
			<div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-input bg-card focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30">
				<StepButton
					label={`Less ${label.toLowerCase()}`}
					disabled={value <= min}
					onClick={() => bump(-1)}>
					<Minus className="size-5" strokeWidth={2.5} />
				</StepButton>
				<div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1">
					<input
						id={id}
						{...inputProps}
						onKeyDown={(e) => {
							if (e.key === "ArrowUp" || e.key === "ArrowDown") {
								e.preventDefault();
								bump(e.key === "ArrowUp" ? 1 : -1);
							}
						}}
						style={{ width: `${Math.max(text.length, 1) + 0.6}ch` }}
						className="min-w-0 bg-transparent text-center text-lg font-semibold tabular-nums outline-none"
					/>
					{unit && (
						<span className="shrink-0 text-sm text-muted-foreground">{unit}</span>
					)}
				</div>
				<StepButton
					label={`More ${label.toLowerCase()}`}
					disabled={value >= max}
					onClick={() => bump(1)}>
					<Plus className="size-5" strokeWidth={2.5} />
				</StepButton>
			</div>
		</div>
	);
}

function StepButton({
	label,
	...props
}: React.ComponentProps<"button"> & { label: string }) {
	return (
		<button
			type="button"
			aria-label={label}
			tabIndex={-1}
			className="flex w-12 shrink-0 items-center justify-center text-foreground/80 transition-colors hover:bg-accent active:bg-accent/70 disabled:opacity-30 disabled:hover:bg-transparent"
			{...props}
		/>
	);
}

// --- Plain number field ----------------------------------------------------

/** A large text box for values like prices where +/- steps don't make sense. */
export function NumberField({
	label,
	value,
	onChange,
	unit,
	min = 0,
	max = Number.MAX_SAFE_INTEGER,
	className,
}: NumberProps) {
	const id = useId();
	const { inputProps } = useNumericText(value, onChange, min, max);
	return (
		<div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
			<label htmlFor={id} className="text-sm font-medium text-muted-foreground">
				{label}
			</label>
			<div className="relative">
				<input
					id={id}
					{...inputProps}
					className={cn(
						"h-12 w-full rounded-xl border border-input bg-card px-4 text-lg font-semibold tabular-nums outline-none transition-[box-shadow]",
						"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
						unit && "pr-20"
					)}
				/>
				{unit && (
					<span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
						{unit}
					</span>
				)}
			</div>
		</div>
	);
}

// --- Segmented control -----------------------------------------------------

export function Segmented<T extends string>({
	options,
	value,
	onChange,
	label,
	inverse,
	className,
}: {
	/** For use on the solid primary colour. */
	inverse?: boolean;
	options: { id: T; label: string }[];
	value: T;
	onChange: (v: T) => void;
	label: string;
	className?: string;
}) {
	return (
		<div
			role="group"
			aria-label={label}
			className={cn(
				"inline-grid rounded-xl p-1",
				inverse ? "bg-primary-foreground/15" : "bg-muted",
				className
			)}
			style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
			{options.map((o) => (
				<button
					key={o.id}
					type="button"
					aria-pressed={value === o.id}
					onClick={() => onChange(o.id)}
					className={cn(
						"h-10 rounded-lg px-4 text-sm font-semibold transition-colors",
						value === o.id
							? "bg-card text-foreground shadow-sm"
							: inverse
								? "text-primary-foreground/85 hover:text-primary-foreground"
								: "text-muted-foreground hover:text-foreground"
					)}>
					{o.label}
				</button>
			))}
		</div>
	);
}
