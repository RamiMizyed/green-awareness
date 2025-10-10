"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Trash2, Plus, Power, Clock, Hash } from "lucide-react";
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
	<div className="hidden md:grid md:grid-cols-12 gap-4 items-center px-4 py-2 text-sm font-semibold text-muted-foreground">
		<div className="md:col-span-1"></div> {/* Icon Spacer */}
		<div className="md:col-span-4">Appliance</div>
		<div className="md:col-span-2 text-center">Wattage</div>
		<div className="md:col-span-2 text-center">Usage</div>
		<div className="md:col-span-2 text-center">Quantity</div>
		<div className="md:col-span-1"></div> {/* Action Spacer */}
	</div>
);

type InputWithLabelProps = React.ComponentProps<typeof Input> & {
	label: string;
	icon?: React.ReactNode;
};
const InputWithLabel = ({ label, icon, ...props }: InputWithLabelProps) => (
	<div className="relative">
		<Input
			className="bg-white dark:bg-transparent shadow-md border text-center pr-10"
			{...props}
		/>
		<span className="absolute right-3 text-xs text-muted-foreground top-1/2 -translate-y-1/2 pointer-events-none">
			{label}
		</span>
		{icon && (
			<span className="absolute left-3 text-muted-foreground top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline">
				{icon}
			</span>
		)}
	</div>
);

function UsageInput({ item }: { item: CartItem }) {
	const { updateCartItem } = useAppStore();
	const isWeekly = item.usageFrequency === "weekly";

	return (
		<div className="flex items-center gap-0">
			<InputWithLabel
				label={isWeekly ? "uses" : "hrs"}
				type="number"
				min={0}
				step={0.1}
				value={item.usageValue}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					updateCartItem(item.id, { usageValue: Number(e.target.value) })
				}
				className="rounded-r-none"
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

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
			className="grid grid-cols-12 gap-x-2 md:gap-x-4 items-center p-2 rounded-lg border bg-secondary/50 mb-3">
			<div className="col-span-1 hidden lg:flex items-center justify-start">
				<div className="w-9 h-9 flex items-center justify-center bg-white/80 rounded-full text-muted-foreground">
					{APPLIANCE_DATA[item.key as ApplianceKey]?.icon || (
						<Leaf className="w-5 h-5 text-yellow-500" />
					)}
				</div>
			</div>

			{/* --- MODIFIED: Appliance Name and Preset Selector --- */}
			<div className="col-span-11 lg:col-span-5 flex items-center gap-1">
				<Input
					value={item.name}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						updateCartItem(item.id, {
							name: e.target.value,
							key: "custom", // Typing a name makes it a custom item
						})
					}
					placeholder="Appliance Name"
					className="bg-white dark:bg-transparent shadow-md"
				/>
				<Select onValueChange={handlePresetChange}>
					<SelectTrigger className="w-auto bg-white dark:bg-transparent shadow-md h-10 px-3">
						<SelectValue className="" placeholder="Presets Item" />
					</SelectTrigger>
					<SelectContent className="">
						{Object.entries(APPLIANCE_DATA).map(([key, appliance]) => (
							<SelectItem key={key} value={key}>
								{appliance.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="col-span-4 md:col-span-2 mt-2 md:mt-0">
				<InputWithLabel
					label="W"
					icon={<Power size={14} />}
					type="number"
					min={0}
					value={item.wattage}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						updateCartItem(item.id, { wattage: Number(e.target.value) })
					}
				/>
			</div>
			<div className="col-span-8 md:col-span-2 mt-2 md:mt-0">
				<UsageInput item={item} />
			</div>
			<div className="col-span-4 md:col-span-1 mt-2 md:mt-0">
				<InputWithLabel
					label="qty"
					type="number"
					min={1}
					step={1}
					value={item.qty}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						updateCartItem(item.id, { qty: Math.floor(Number(e.target.value)) })
					}
				/>
			</div>

			<div className="col-span-12 md:col-span-1 flex items-center justify-end">
				<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
						onClick={() => removeCartItem(item.id)}>
						<Trash2 className="w-4 h-4" />
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
}

// --- NEW: Component for action buttons ---
function ActionButtons() {
	const { cart, addItemToCart, clearCart, error } = useAppStore();

	return (
		<div className="my-4 pt-4 border-t">
			<div className="flex flex-col sm:flex-row gap-2">
				<motion.div
					className="w-full sm:w-auto"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}>
					<Button onClick={() => addItemToCart("custom")} className="w-full">
						<Plus className="w-4 h-4 mr-2" /> Add Appliance
					</Button>
				</motion.div>

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
			</div>
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
	const { addItemToCart } = useAppStore();
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className="text-center flex flex-col items-center justify-center text-sm py-10">
			<LottieAnimator
				src="/animationAssets/empty ghost.json"
				className="w-40 h-40"
				loop
				autoplay
			/>
			<p className="my-4 text-muted-foreground">
				Your appliance list is empty.
			</p>
			<motion.div
				className="w-full sm:w-auto"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}>
				<Button onClick={() => addItemToCart("custom")} className="w-full">
					<Plus className="w-4 h-4 mr-2" /> Add Appliance
				</Button>
			</motion.div>
		</motion.div>
	);
};

export function ApplianceList() {
	const { cart, getTotals, settings } = useAppStore();
	const totals = useMemo(() => getTotals(), [getTotals, cart, settings]);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-2xl font-semibold">
					Your Appliances & Settings
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ActionButtons />
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

				<div className="flex items-center justify-between mt-4  pt-4">
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
