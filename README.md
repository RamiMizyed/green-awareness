# Green Awareness

**See what your home's electricity costs you, and the planet.**

Green Awareness is a free household energy and carbon calculator. People add the appliances in their home, pick their country, and instantly see their electricity cost, energy use and CO₂ footprint, followed by a personal plan of the changes that would save them the most.

**Live site:** [greenawareness.org](https://www.greenawareness.org)

## Features

- **Three simple steps:** pick your country, add your appliances, see your results.
- **Quick add in plain words.** Type "65-inch LG TV 4 hours a day, 2 fridges, washing machine 3 times a week" and the appliances are added for you. It understands counts, sizes, power ratings, usage, seasons, typos and removals, and it runs entirely in the browser. Nothing you type is sent anywhere.
- **142 countries** with real household electricity prices in local currency and grid carbon intensity, shown on a zoomable, colour-coded world map.
- **34 appliance presets** with realistic defaults, plus custom appliances, big +/− controls, standby power and seasonal use.
- **Results per day, month or year** with everyday comparisons (car distance, trees, phone charges) and a breakdown of where the money goes.
- **A personal savings plan:** tips worked out from your own appliances, with the money and CO₂ each one saves. Tick the ones you'll do.
- **English, Turkish and Arabic**, including a full right-to-left layout for Arabic.
- **Private by design:** your list is stored in your browser's local storage and never uploaded.
- Light and dark mode, works on phones, and exports your results to CSV.

## Getting started

You need [Node.js](https://nodejs.org) 18.18 or newer.

```bash
git clone https://github.com/RamiMizyed/green-awareness.git
cd green-awareness
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the production site |
| `npm start` | Serves the production build |
| `npm run lint` | Runs ESLint |
| `npm run update-regions` | Downloads the latest prices, carbon data and exchange rates and rebuilds the country list (see [Data](#data)) |

### Optional: AI helper

Quick add works without any setup or API key. If you'd also like hard-to-parse messages to go to Claude (Anthropic's AI), add an API key to `.env.local` (or to your Vercel project's environment variables):

```bash
ANTHROPIC_API_KEY=your-key-here
```

With a key set, messages go to Claude first and fall back to the built-in matcher if the call fails. The on-page privacy note switches automatically to say that typed text is sent to the AI. This costs money per request, so set a spending limit in the Anthropic console if you enable it.

## How the numbers are calculated

- **Appliances used by the hour:** power (W) × hours a day × days a week, averaged over the year and scaled by the months it's used.
- **Appliances counted per load or charge** (washing machine, dishwasher, electric car): energy per use × uses a week.
- **Standby power** is added for every hour a device isn't in use.
- **Cost** = energy × your price per kWh. **CO₂** = energy × your grid's carbon intensity.

Only electricity is counted. Gas heating, transport, food and shopping aren't included. The same explanation appears in the "How it works" section of the site.

## Data

| What | Source |
| --- | --- |
| Grid carbon intensity (kg CO₂e per kWh) | [Ember](https://ember-energy.org) via [Our World in Data](https://ourworldindata.org/grapher/carbon-intensity-electricity), latest year per country |
| Household electricity prices | [GlobalPetrolPrices.com](https://www.globalpetrolprices.com/electricity_prices/) |
| Exchange rates | [ExchangeRate-API](https://www.exchangerate-api.com) open endpoint |
| World map | [Natural Earth](https://www.naturalearthdata.com) via [world-atlas](https://github.com/topojson/world-atlas) |
| Flags | [country-flag-icons](https://gitlab.com/catamphetamine/country-flag-icons) |
| Everyday comparisons | US EPA figures for car emissions and phone charging |

Prices and carbon data change over time. To refresh them:

```bash
npm run update-regions
```

This rewrites `src/lib/data/regions.ts` and `public/flags/`. Review the diff before committing, as the sources occasionally rename countries.

## Project structure

```
src/
  app/
    page.tsx                  The page: calculator and footer
    layout.tsx                Fonts, metadata, theme and nav
    api/assistant/route.ts    Optional Claude-powered quick add
  components/
    calculator/               Steps, map, appliance list, results, savings plan
    ui/                       Shared UI (buttons, dialogs, nav, switchers)
  lib/
    calc.ts                   Energy, cost and CO₂ calculations
    tips.ts                   Savings recommendations
    store.ts                  App state, saved in local storage
    assistant/local.ts        In-browser quick-add parser
    data/appliances.ts        Appliance presets and categories
    data/regions.ts           Country data (generated)
    i18n/                     Translations (en, tr, ar)
scripts/
  update-regions.mjs          Rebuilds the country data
```

## Adding a language

1. Copy `src/lib/i18n/en.ts` to a new file, for example `de.ts`, and translate the strings. TypeScript will fail the build if any key is missing.
2. Register it in `src/lib/i18n/index.tsx` (the `Lang` type, `DICTS` and `LANGS`), in the language map in `src/lib/i18n/boot.ts`, and in the `lang` list and `LANGUAGE_NAME` in `src/app/api/assistant/route.ts`.
3. For a right-to-left language, set `meta.dir` to `"rtl"`.

## Tech stack

[Next.js](https://nextjs.org) 15, [React](https://react.dev) 19, TypeScript, [Tailwind CSS](https://tailwindcss.com) 4, [Radix UI](https://www.radix-ui.com), [Zustand](https://zustand-demo.pmnd.rs), [d3-geo](https://github.com/d3/d3-geo) and [Lucide](https://lucide.dev) icons. Deployed on [Vercel](https://vercel.com): every push to `master` goes live.

## Contributing

Issues and pull requests are welcome, especially:

- Corrections to translations from native speakers
- Better appliance defaults, with a source
- New languages

Please run `npm run lint` and `npm run build` before opening a pull request.

## Author

Made by [Rami Mizyed](https://ramimizyed.dev).
