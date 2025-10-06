"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Trash2, Plus, Power, Clock, Hash, Minus } from "lucide-react";
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
import { CalculationSettings } from "./CalculationSettings";
import LottieAnimator from "@/components/ui/lottieAnimator";

type ApplianceKey = keyof typeof APPLIANCE_DATA;

// --- 1. List Header Component (Desktop Only) ---
// Provides clear labels for the columns, enhancing usability.
const ListHeader = () => (
	<div className="hidden md:grid md:grid-cols-12 gap-4 items-center px-4 py-2 text-sm font-semibold text-muted-foreground">
		<div className="md:col-span-1"></div> {/* Icon Spacer */}
		<div className="md:col-span-4">Appliance</div>
		<div className="md:col-span-2 text-center">Wattage</div>
		<div className="md:col-span-2 text-center">Hours/Day</div>
		<div className="md:col-span-2 text-center">Quantity</div>
		<div className="md:col-span-1"></div> {/* Action Spacer */}
	</div>
);

// --- 2. Refactored Appliance Item ---
// Uses a responsive CSS Grid for a stable and clean layout.
function ApplianceItem({ item }: { item: CartItem }) {
	const { updateCartItem, removeCartItem } = useAppStore();

	const handleApplianceChange = (newKey: ApplianceKey) => {
		const newApplianceData = APPLIANCE_DATA[newKey];
		if (newApplianceData) {
			updateCartItem(item.id, {
				key: newKey,
				name: newApplianceData.name,
				wattage: newApplianceData.wattage,
			});
		}
	};

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
			className="grid grid-cols-6 md:grid-cols-12 gap-x-2 md:gap-x-4 items-center  justify-center  p-2 rounded-lg border bg-secondary/50 mb-2">
			{/* Column 1: Icon */}
			<div className="col-span-1 flex items-center justify-start">
				<div className="w-9 h-9 flex items-center justify-center bg-white/80 rounded-full text-muted-foreground">
					{APPLIANCE_DATA[item.key as ApplianceKey]?.icon || (
						<Leaf className="w-5 h-5 text-yellow-500" />
					)}
				</div>
			</div>

			{/* Column 2: Name (Select or Input) */}
			<div className="col-span-5 md:col-span-4">
				{item.key === "custom" ? (
					<Input
						className="bg-transparent border-0 font-medium px-1"
						value={item.name}
						onChange={(e) => updateCartItem(item.id, { name: e.target.value })}
						placeholder="Custom Appliance"
					/>
				) : (
					<Select value={item.key} onValueChange={handleApplianceChange}>
						<SelectTrigger className="bg-transparent border-0 font-medium shadow-none focus:ring-0">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(APPLIANCE_DATA).map(([key, appliance]) => (
								<SelectItem key={key} value={key}>
									{appliance.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>

			{/* Column 3, 4, 5: Inputs (Stacked on mobile, row on desktop) */}
			<div className="col-span-2 md:col-span-2">
				<InputWithLabel
					label="W"
					icon={<Power size={14} />}
					type="number"
					min={0}
					value={item.wattage}
					onChange={(e) =>
						updateCartItem(item.id, { wattage: Number(e.target.value) })
					}
				/>
			</div>
			<div className="col-span-2 md:col-span-2">
				<InputWithLabel
					label="hrs"
					icon={<Clock size={14} />}
					type="number"
					min={0}
					step={0.1}
					value={item.hoursPerDay}
					onChange={(e) =>
						updateCartItem(item.id, { hoursPerDay: Number(e.target.value) })
					}
				/>
			</div>
			<div className="col-span-2 md:col-span-2">
				<InputWithLabel
					label="qty"
					icon={<Hash size={14} />}
					type="number"
					min={1}
					step={1}
					value={item.qty}
					onChange={(e) =>
						updateCartItem(item.id, { qty: Math.floor(Number(e.target.value)) })
					}
				/>
			</div>

			{/* Column 6: Delete Button */}
			<div className="col-span-6 md:col-span-1 flex items-center justify-end">
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
type InputWithLabelProps = InputProps & {
	label: string;
	icon: React.ReactNode;
};
type InputProps = React.ComponentProps<"input">;

// --- Helper Component for Cleaner Inputs ---
const InputWithLabel = ({ label, icon, ...props }: InputWithLabelProps) => (
	<div className="relative">
		<Input className="bg-transparent border-0 text-center pr-8" {...props} />
		<span className="absolute right-3 text-xs text-muted-foreground top-1/2 -translate-y-1/2 pointer-events-none">
			{label}
		</span>
		<span className="absolute left-3 text-muted-foreground top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline">
			{icon}
		</span>
	</div>
);

// --- 3. Add Appliance Form Component ---
// A dedicated, reusable form for adding new items.
function AddApplianceForm({ cart }: { cart: CartItem[] }) {
	const { addItemToCart, error } = useAppStore();
	const [selectedKey, setSelectedKey] = useState<string>("");

	const handleAdd = () => {
		if (selectedKey) {
			addItemToCart(selectedKey);
			setSelectedKey("");
		}
	};
	const clearCart = useAppStore((state) => state.clearCart);

	return (
		<div className="my-4 pt-4 border-t">
			<div className="flex flex-col sm:flex-row gap-2">
				<Select value={selectedKey} onValueChange={setSelectedKey}>
					<SelectTrigger>
						<SelectValue
							className="placeholder:text-for"
							placeholder="Choose an appliance to add..."
						/>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="custom">Custom / Other</SelectItem>
						{Object.entries(APPLIANCE_DATA).map(([k, v]) => (
							<SelectItem
								key={k}
								value={k}>{`${v.name} — ${v.wattage}W`}</SelectItem>
						))}
					</SelectContent>
				</Select>
				<motion.div
					className="w-full sm:w-auto"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}>
					<Button
						onClick={handleAdd}
						className="w-full"
						disabled={!selectedKey}>
						<Plus className="w-4 h-4 mr-2" /> Add to list
					</Button>
				</motion.div>
				<motion.div
					className="w-full sm:w-auto"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}>
					<Button
						onClick={clearCart}
						className="w-full"
						disabled={cart.length === 0}>
						<Minus className="w-4 h-4 mr-2" /> Clear List
					</Button>
				</motion.div>
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

// --- 4. Empty State Component ---
// An engaging view when the list is empty.
const EmptyState = () => (
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
		<p className="mt-4 text-muted-foreground">Your appliance list is empty.</p>
		<p>Add one below to get started.</p>
	</motion.div>
);

// --- 5. Main Component ---
// Cleaned up to act as a controller, orchestrating all the sub-components.
export function ApplianceList() {
	const { cart, clearCart, getTotals } = useAppStore();
	const totals = useMemo(() => getTotals(), [getTotals, cart]);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Your Appliances & Settings</CardTitle>
			</CardHeader>
			<CardContent>
				<AnimatePresence mode="wait">
					{cart.length === 0 ? (
						<EmptyState key="empty" />
					) : (
						<motion.div key="list">
							<ListHeader />
							<div className="overflow-y-auto max-h-[320px] pr-1 -mr-3">
								<AnimatePresence>
									{cart.map((it) => (
										<ApplianceItem key={it.id} item={it} />
									))}
								</AnimatePresence>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<AddApplianceForm cart={cart} />

				<div className="flex items-center justify-between mt-4 border-t pt-4">
					<div className="text-sm flex items-center text-muted-foreground">
						{cart.length} item(s) — Daily total:
						<strong className="mx-2 text-yellow-500">
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
