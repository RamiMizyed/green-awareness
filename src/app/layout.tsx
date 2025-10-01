import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/lang";
import SmoothScroll from "@/lib/SmoothScroll";
import { ThemeProvider } from "next-themes";
import NavBar from "@/components/ui/navBar";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// ✅ Updated for Green Awareness
export const metadata: Metadata = {
	metadataBase: new URL("https://green-awareness.org"), // <-- replace with your domain
	title:
		"Green Awareness - Go Green, Reduce Carbon Footprint, Renewable Energy",
	description:
		"Green Awareness is dedicated to promoting sustainability, reducing carbon footprints, and advancing renewable energy. Stay informed with the latest green energy news, tips, and blogs to help create a cleaner and greener future.",
	applicationName: "Green Awareness",
	keywords: [
		"Green Awareness",
		"sustainability",
		"renewable energy",
		"carbon footprint",
		"climate change",
		"eco-friendly",
		"green energy",
		"environment",
		"sustainable living",
		"clean energy",
	],
	authors: [
		{ name: "Green Awareness Team", url: "https://green-awareness.org" },
	],
	creator: "Rami Mizyed",
	publisher: "Green Awareness",
	robots: { index: true, follow: true },
	openGraph: {
		title: "Green Awareness — Go Green, Renewable Energy & Sustainability",
		description:
			"Join Green Awareness in creating a sustainable future. Explore renewable energy, eco-friendly living, and the fight against climate change.",
		url: "https://green-awareness.org",
		siteName: "Green Awareness",
		images: [
			{
				url: "/assets/green-awareness-main.png", // <-- add your image in public/assets
				width: 1200,
				height: 630,
				alt: "Green Awareness Sustainability Banner",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Green Awareness — Go Green, Renewable Energy & Sustainability",
		description:
			"Promoting sustainability, reducing carbon footprints, and advancing renewable energy for a cleaner and greener future.",
		creator: "@RamiMizyed", // or a Green Awareness handle if you make one
		images: ["/assets/green-awareness-main.png"],
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
};

// ✅ Viewport stays as is
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	colorScheme: "light dark",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0f172a" },
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<Analytics />
					<LangProvider>
						<SmoothScroll>
							<NavBar />
							<main className="min-h-screen">{children}</main>
						</SmoothScroll>
					</LangProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
