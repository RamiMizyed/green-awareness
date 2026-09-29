import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import NavBar from "@/components/ui/navBar";
import { Analytics } from "@vercel/analytics/next";
import { LANG_BOOT_SCRIPT } from "@/lib/i18n/boot";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

// Geist has no Arabic glyphs; the browser falls back to this for Arabic text.
const plexArabic = IBM_Plex_Sans_Arabic({
	variable: "--font-arabic",
	subsets: ["arabic"],
	weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://green-awareness.org"), // <-- replace with your domain
	title: "Green Awareness | Home Energy & Carbon Footprint Calculator",
	description:
		"Find out what your home appliances cost you and how much CO₂ they're responsible for, with local prices and grid data for 29 regions. Get a personal plan to cut your bill and your footprint.",
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
		title: "Green Awareness | Home Energy & Carbon Footprint Calculator",
		description:
			"See where your electricity goes, what it costs, and the changes that save you the most money and CO₂.",
		url: "https://green-awareness.org",
		siteName: "Green Awareness",
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary",
		title: "Green Awareness | Home Energy & Carbon Footprint Calculator",
		description:
			"See where your electricity goes, what it costs, and the changes that save you the most money and CO₂.",
		creator: "@RamiMizyed", // or a Green Awareness handle if you make one
	},
	icons: {
		icon: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	colorScheme: "light dark",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#18181b" },
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<head>
				<script dangerouslySetInnerHTML={{ __html: LANG_BOOT_SCRIPT }} />
			</head>
			<body
				className={`${geistSans.variable} ${plexArabic.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<Analytics />
					<NavBar />
					<main className="min-h-screen">{children}</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
