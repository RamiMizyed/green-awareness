import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json(); // Expect payload: { emission_factor: string, parameters: { energy: number, energy_unit: string } }
		const apiKey = process.env.CLIMATIQ_API_KEY;

		if (!apiKey) {
			return NextResponse.json({ error: "API key not set" }, { status: 500 });
		}

		// Validate required fields
		if (
			!body ||
			typeof body.emission_factor !== "string" ||
			!body.parameters?.energy ||
			!body.parameters?.energy_unit
		) {
			return NextResponse.json(
				{ error: "Invalid request payload" },
				{ status: 400 }
			);
		}

		const res = await fetch("https://api.climatiq.io/data/v1/estimate", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const data = await res.json();

		if (!res.ok) {
			return NextResponse.json(
				{ error: data.detail || "Error from Climatiq" },
				{ status: res.status }
			);
		}

		// data.co2e should be a number
		if (typeof data.co2e !== "number") {
			return NextResponse.json(
				{ error: "Unexpected response from Climatiq" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ co2e: data.co2e });
	} catch (err) {
		console.error("Emissions API error:", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
