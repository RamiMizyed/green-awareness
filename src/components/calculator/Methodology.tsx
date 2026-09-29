const ITEMS = [
	{
		q: "How is energy use calculated?",
		a: "For things you use by the hour: power (W) × hours a day × days a week, averaged over the year and scaled by the months you use it. For things counted per load or charge, like a washing machine or an electric car: energy per use × uses a week. Standby power is added for every hour a device isn't in use.",
	},
	{
		q: "Where do the carbon figures come from?",
		a: "Each country's grid carbon intensity is the average lifecycle emissions per kWh of electricity generated in 2023, rounded from Ember and Our World in Data. Your real footprint depends on your supplier and the time of day. If you're on a certified renewable tariff, enter a lower figure.",
	},
	{
		q: "How accurate are the appliance defaults?",
		a: "They're typical figures for common models, meant as a sensible starting point. Your appliance may differ a lot, especially older fridges, heaters and anything with a big motor. The label on the device, or a plug-in energy meter, gives you the real number.",
	},
	{
		q: "What isn't included?",
		a: "Only electricity is counted. Gas or oil heating, gas cooking, transport fuel, food and shopping aren't included, and together they usually make up most of a household's footprint.",
	},
	{
		q: "What about the equivalents?",
		a: "Car distance uses the US EPA figure of about 0.25 kg CO₂ per km (0.4 kg per mile) for an average petrol car. A growing tree is taken to absorb about 21 kg of CO₂ a year, and a full phone charge to use about 0.019 kWh. They're there to give a sense of scale, not as exact conversions.",
	},
	{
		q: "Is my data stored anywhere?",
		a: "No. Everything stays in your browser's local storage on this device. Nothing is sent to a server, and you can clear it at any time.",
	},
];

export function Methodology() {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
			{ITEMS.map((it) => (
				<details
					key={it.q}
					className="group rounded-2xl border bg-card p-5 open:bg-card [&_summary::-webkit-details-marker]:hidden">
					<summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
						{it.q}
						<span
							className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45"
							aria-hidden>
							+
						</span>
					</summary>
					<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
						{it.a}
					</p>
				</details>
			))}
		</div>
	);
}
