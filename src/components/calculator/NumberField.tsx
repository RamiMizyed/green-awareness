"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
	unit?: string;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
}

const toText = (n: number) => (Number.isFinite(n) ? String(+n.toFixed(4)) : "");

/**
 * A forgiving number input: accepts "1,5" or "1.5", lets the field be empty
 * while typing, commits valid values immediately and tidies up on blur.
 * Arrow keys step the value.
 */
export function NumberField({
	label,
	value,
	onChange,
	unit,
	min = 0,
	max = Number.MAX_SAFE_INTEGER,
	step = 1,
	className,
}: NumberFieldProps) {
	const id = useId();
	const [text, setText] = useState(toText(value));
	const focused = useRef(false);

	useEffect(() => {
		if (!focused.current) setText(toText(value));
	}, [value]);

	const clamp = (n: number) => Math.min(max, Math.max(min, n));

	const commit = (raw: string) => {
		const n = parseFloat(raw.replace(",", "."));
		if (Number.isFinite(n)) onChange(clamp(n));
	};

	return (
		<div className={cn("flex flex-col gap-1 min-w-0", className)}>
			<label
				htmlFor={id}
				className="text-xs font-medium text-muted-foreground truncate">
				{label}
			</label>
			<div className="relative">
				<input
					id={id}
					type="text"
					inputMode="decimal"
					autoComplete="off"
					value={text}
					onFocus={(e) => {
						focused.current = true;
						e.currentTarget.select();
					}}
					onChange={(e) => {
						const raw = e.target.value;
						if (!/^\d*[.,]?\d*$/.test(raw)) return;
						setText(raw);
						commit(raw);
					}}
					onBlur={() => {
						focused.current = false;
						const n = parseFloat(text.replace(",", "."));
						const final = Number.isFinite(n) ? clamp(n) : min;
						onChange(final);
						setText(toText(final));
					}}
					onKeyDown={(e) => {
						if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
						e.preventDefault();
						const dir = e.key === "ArrowUp" ? 1 : -1;
						const next = clamp(+(value + dir * step).toFixed(4));
						onChange(next);
						setText(toText(next));
					}}
					className={cn(
						"h-10 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums shadow-xs outline-none transition-[color,box-shadow]",
						"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
						unit && "pr-12"
					)}
				/>
				{unit && (
					<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
						{unit}
					</span>
				)}
			</div>
		</div>
	);
}
