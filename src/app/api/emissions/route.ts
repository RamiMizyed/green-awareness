// app/api/emissions/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const apiKey = process.env.CLIMATIQ_API_KEY;
		if (!apiKey) {
			return NextResponse.json({ error: "API key not set" }, { status: 500 });
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

		return NextResponse.json({ co2e: data.co2e });
	} catch (err) {
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
