"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Trash2, Plus, Power } from "lucide-react";
import { useAppStore, CartItem } from "@/lib/store";
import { APPLIANCE_DATA } from "@/lib/appliances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalculationSettings } from "./CalculationSettings";
import LottieAnimator from "@/components/ui/lottieAnimator";

type ApplianceKey = keyof typeof APPLIANCE_DATA;

const ListHeader = () => (
	<div className="hidden md:flex gap-4 items-center px-4 py-2 text-sm font-semibold text-muted-foreground">
		<div className="flex-1">Appliance / Preset</div>
		<div className="flex gap-4">
			<div className="w-24 text-center">Wattage</div>
			<div className="w-32 text-center">Usage</div>
			<div className="w-20 text-center">Qty</div>
		</div>
		<div className="w-10"></div> {/* Action Spacer */}
	</div>
);

type InputWithLabelProps = React.ComponentProps<typeof Input> & {
	label: string;
};

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
	({ label, ...props }, ref) => (
		<div className="relative">
			<Input
				className="bg-white dark:bg-transparent shadow-md border text-center pr-10"
				ref={ref}
				{...props}
			/>
			<span className="absolute right-3 text-xs text-muted-foreground top-1/2 -translate-y-1/2 pointer-events-none">
				{label}
			</span>
		</div>
	)
);
InputWithLabel.displayName = "InputWithLabel";

// --- ✅ FIXED: UsageInput component with local state ---
function UsageInput({ item }: { item: CartItem }) {
	const { updateCartItem } = useAppStore();
	// Local state to hold the string value of the input for a better UX
	const [localValue, setLocalValue] = useState(String(item.usageValue));

	// Effect to sync local state if the prop from the global store changes
	useEffect(() => {
		// This check prevents overwriting user input unless the store value truly differs
		if (Number(localValue) !== item.usageValue) {
			setLocalValue(String(item.usageValue));
		}
	}, [item.usageValue]);

	const handleChange = (value: string) => {
		// Regex to allow numbers and a single decimal point
		const decimalRegex = /^\d*\.?\d*$/;
		if (decimalRegex.test(value)) {
			setLocalValue(value);
		}
	};

	const handleBlur = () => {
		const numericValue = parseFloat(localValue);
		// Final value is a valid number, defaulting to 0 if input is invalid
		const finalValue = isNaN(numericValue) ? 0 : numericValue;

		// Update the global store with the final number
		if (finalValue !== item.usageValue) {
			updateCartItem(item.id, { usageValue: finalValue });
		}
		// Sync local state to the cleaned-up value (e.g., "5." becomes "5")
		setLocalValue(String(finalValue));
	};

	return (
		<div className="flex items-center">
			<InputWithLabel
				label={item.usageFrequency === "weekly" ? "uses" : "hrs"}
				type="text"
				inputMode="decimal"
				value={localValue}
				onChange={(e) => handleChange(e.target.value)}
				onBlur={handleBlur}
				className="rounded-r-none bg-white dark:bg-transparent"
			/>
			<Select
				value={item.usageFrequency}
				onValueChange={(value: "daily" | "weekly") =>
					updateCartItem(item.id, { usageFrequency: value })
				}>
				<SelectTrigger className="w-auto bg-white dark:bg-transparent shadow-md h-10 border-l-0 rounded-l-none pl-2 pr-3">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="daily">/day</SelectItem>
					<SelectItem value="weekly">/week</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

function ApplianceItem({ item }: { item: CartItem }) {
	const { updateCartItem, removeCartItem } = useAppStore();

	const handlePresetChange = (presetKey: ApplianceKey) => {
		if (!presetKey) return;
		const presetData = APPLIANCE_DATA[presetKey];
		if (presetData) {
			updateCartItem(item.id, {
				key: presetKey,
				name: presetData.name,
				wattage: presetData.wattage,
			});
		}
	};

	const handleNumericChange = (field: "wattage" | "qty", value: string) => {
		const integerRegex = /^\d*$/;
		if (integerRegex.test(value)) {
			updateCartItem(item.id, { [field]: value === "" ? 0 : Number(value) });
		}
	};

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
			className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-2 rounded-lg border bg-secondary/50 mb-3">
			<div className="flex-1 flex items-center gap-2">
				<div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-white/10 rounded-full text-muted-foreground">
					{APPLIANCE_DATA[item.key as ApplianceKey]?.icon || (
						<Leaf className="w-5 h-5 text-yellow-500" />
					)}
				</div>
				<Input
					value={item.name}
					onChange={(e) =>
						updateCartItem(item.id, {
							name: e.target.value,
							key: "custom",
						})
					}
					placeholder="Appliance Name"
					className="bg-white dark:bg-transparent shadow-md flex-grow"
				/>
				<Select onValueChange={handlePresetChange} value={item.key}>
					<SelectTrigger
						// --- FIXED: Removed text-white and placeholder:text-white ---
						className="w-[150px] flex-shrink-0 bg-white dark:bg-transparent shadow-md h-10 px-3">
						<SelectValue placeholder="Preset" />
					</SelectTrigger>
					<SelectContent>
						{/* We should add an item for the "custom" key so it displays correctly */}
						<SelectItem value="custom" disabled>
							Custom Appliance
						</SelectItem>

						{Object.entries(APPLIANCE_DATA).map(([key, appliance]) => (
							<SelectItem key={key} value={key}>
								{appliance.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center justify-between gap-3">
				<div className="w-24">
					<InputWithLabel
						label="W"
						type="text"
						inputMode="numeric"
						value={item.wattage}
						onChange={(e) => handleNumericChange("wattage", e.target.value)}
					/>
				</div>
				<div className="w-32">
					<UsageInput item={item} />
				</div>
				<div className="w-20">
					<InputWithLabel
						label="qty"
						type="text"
						inputMode="numeric"
						value={item.qty}
						onChange={(e) => handleNumericChange("qty", e.target.value)}
					/>
				</div>
			</div>

			<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
				<Button
					variant="ghost"
					size="icon"
					className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-10 h-10"
					onClick={() => removeCartItem(item.id)}>
					<Trash2 className="w-4 h-4" />
				</Button>
			</motion.div>
		</motion.div>
	);
}

// --- No changes to the components below ---

function ActionButtons() {
	const { addItemToCart, error } = useAppStore();
	const { cart, getTotals, clearCart, settings } = useAppStore();
	return (
		<div className="my-4 flex gap-6 items-center justify-center pt-4 border-t">
			<div className="flex flex-col sm:flex-row gap-2">
				<motion.div
					className="w-full sm:w-auto"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}>
					<Button onClick={() => addItemToCart("custom")} className="w-full">
						<Plus className="w-4 h-4 mr-2" /> Add Appliance
					</Button>
				</motion.div>
			</div>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<motion.div
						className="w-full sm:w-auto"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}>
						<Button
							variant="destructive"
							className="w-full"
							disabled={cart.length === 0}>
							<Trash2 className="w-4 h-4 mr-2" /> Clear List
						</Button>
					</motion.div>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete all {cart.length} items from your
							list.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={clearCart}>
							Yes, clear list
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AnimatePresence>
				{error && (
					<motion.p
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="text-sm text-red-500 mt-2">
						{error}
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	);
}

const EmptyState = () => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className="text-center flex flex-col  items-center justify-center text-sm ">
			<LottieAnimator
				src="/animationAssets/empty ghost.json"
				className="w-40 h-40"
				loop
				autoplay
			/>
			<p className=" text-muted-foreground">Your appliance list is empty.</p>
			<div className="w-20 h-20 absolute right-[40%] md:right-[30%] lg:right-[20%] ">
				<LottieAnimator
					src="/animationAssets/Arrow down.json"
					className="w-10"
					loop
					autoplay
				/>
			</div>
		</motion.div>
	);
};

export function ApplianceList() {
	const { cart, getTotals, clearCart, settings } = useAppStore();
	const totals = useMemo(() => getTotals(), [getTotals, cart, settings]);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-2xl font-semibold">
					Your Appliances & Settings
				</CardTitle>
			</CardHeader>
			<CardContent>
				<AnimatePresence mode="wait">
					{cart.length === 0 ? (
						<EmptyState key="empty" />
					) : (
						<motion.div key="list">
							<ListHeader />
							<div className="overflow-y-auto min-h-[120px] max-h-[420px] pr-1 -mr-3">
								<AnimatePresence>
									{cart.map((it) => (
										<ApplianceItem key={it.id} item={it} />
									))}
								</AnimatePresence>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				<div className="flex items-center justify-end mt-4">
					<ActionButtons />
				</div>

				<div className="flex items-center justify-between mt-4 border-t pt-4">
					<div className="text-sm flex items-center text-muted-foreground">
						{cart.length} item(s) — Daily total:
						<strong className="mx-2 dark:text-yellow-500 text-orange-600">
							{totals.kwh.day.toFixed(3)} kWh/day
						</strong>
						<LottieAnimator
							src="/animationAssets/renewable-energy.json"
							className="w-10 h-10"
							loop
							autoplay
						/>
					</div>
				</div>
				<div className="mt-4 border-t pt-4">
					<CalculationSettings />
				</div>
			</CardContent>
		</Card>
	);
}
