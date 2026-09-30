import { getSpec } from "@/lib/data/appliances";

/**
 * Offline fallback for the AI helper: finds appliance words in English,
 * Turkish and Arabic, plus quantities ("2 fridges", "x3") and known brands.
 * Much less clever than the model, but free and instant.
 */

// Longer phrases are tried first, so "hair dryer" wins over "dryer" and
// "water heater" over "heater".
const KEYWORDS: Record<string, string[]> = {
	fridge: ["fridge", "refrigerator", "buzdolabı", "buzdolabi", "ثلاجة", "ثلاجات", "ثلاجتان", "براد"],
	freezer: ["freezer", "chest freezer", "dondurucu", "derin dondurucu", "فريزر"],
	oven: ["oven", "fırın", "firin", "فرن"],
	hob: ["stove", "hob", "cooktop", "ocak", "موقد", "طباخ"],
	microwave: ["microwave", "mikrodalga", "ميكروويف", "مايكرويف"],
	kettle: ["kettle", "su ısıtıcı", "su isitici", "غلاية"],
	coffee: ["coffee", "kahve", "قهوة"],
	airfryer: ["air fryer", "airfryer", "قلاية"],
	dishwasher: ["dishwasher", "bulaşık", "bulasik", "غسالة صحون", "جلاية"],
	ac_window: ["air conditioner", "air conditioning", "aircon", "air con", "a/c", "ac", "klima", "مكيف", "مكيّف", "مكيفات", "مكيّفان", "مكيفان"],
	ac_central: ["central air", "central ac", "merkezi klima", "تكييف مركزي"],
	space_heater: ["space heater", "heater", "ısıtıcı", "isitici", "soba", "مدفأة", "دفاية"],
	heat_pump: ["heat pump", "ısı pompası", "isi pompasi", "مضخة حرارية"],
	water_heater: ["water heater", "boiler", "termosifon", "şofben", "sofben", "سخان"],
	fan: ["fan", "vantilatör", "vantilator", "pervane", "مروحة", "مراوح", "مروحتان"],
	dehumidifier: ["dehumidifier", "nem alma", "مزيل رطوبة"],
	washer: ["washing machine", "washer", "çamaşır makinesi", "camasir makinesi", "غسالة ملابس", "غسالة"],
	dryer: ["tumble dryer", "dryer", "kurutma", "مجفف ملابس", "نشافة"],
	iron: ["iron", "ütü", "utu", "مكواة"],
	tv: ["television", "tv", "televizyon", "تلفاز", "تلفزيون", "تلفزيونات"],
	console: ["playstation", "ps5", "ps4", "xbox", "nintendo", "game console", "console", "konsol", "بلايستيشن", "جهاز ألعاب"],
	router: ["router", "wifi", "wi-fi", "modem", "راوتر"],
	laptop: ["laptop", "notebook", "macbook", "dizüstü", "dizustu", "لابتوب", "حاسوب محمول"],
	gaming_pc: ["gaming pc", "gaming computer", "oyun bilgisayarı", "حاسوب ألعاب"],
	desktop: ["desktop", "pc", "computer", "bilgisayar", "كمبيوتر", "حاسوب"],
	monitor: ["monitor", "ekran", "شاشة كمبيوتر"],
	phone: ["phone", "charger", "telefon", "شاحن", "هاتف"],
	incandescent: ["incandescent", "halogen", "akkor", "halojen", "متوهجة"],
	cfl: ["cfl", "tasarruf ampul"],
	led: ["led", "bulb", "bulbs", "lamp", "lights", "light", "ampul", "lamba", "لمبة", "لمبات", "مصباح", "مصابيح", "إضاءة"],
	ev: ["electric car", "electric vehicle", "tesla", "ev", "elektrikli araç", "elektrikli arac", "سيارة كهربائية"],
	pool_pump: ["pool pump", "pool", "havuz", "مسبح"],
	hair_dryer: ["hair dryer", "hairdryer", "saç kurutma", "sac kurutma", "سشوار", "مجفف شعر"],
	vacuum: ["vacuum", "hoover", "süpürge", "supurge", "مكنسة"],
};

const BRANDS = [
	"LG", "Samsung", "Sony", "Philips", "Panasonic", "Toshiba", "Sharp", "Hisense", "TCL",
	"Bosch", "Siemens", "Beko", "Arçelik", "Vestel", "Whirlpool", "Electrolux", "AEG",
	"Miele", "Haier", "Dyson", "Xiaomi", "Apple", "Dell", "HP", "Lenovo", "Asus", "Acer",
	"Daikin", "Mitsubishi", "Tesla",
];

const WORD_NUMBERS: Record<string, number> = {
	one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
	// Turkish "on" (10) is left out: it clashes with the English word.
	bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9,
};

// Arabic dual forms already mean two.
const ARABIC_DUALS = ["ثلاجتان", "مكيّفان", "مكيفان", "مروحتان"];

const isLatin = (s: string) => /^[\x20-\x7e]+$/.test(s);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

const ENTRIES = Object.entries(KEYWORDS)
	.flatMap(([id, words]) => words.map((w) => ({ id, word: w.toLocaleLowerCase() })))
	.sort((a, b) => b.word.length - a.word.length);

export interface LocalMatch {
	specId: string;
	qty: number;
	brand?: string;
}

/** Splits on commas, "and"/"ve"/"و", and newlines, then matches each part. */
export function matchLocally(text: string): LocalMatch[] {
	const parts = text
		.split(/[,;\n،]+|\s+(?:and|&|ve|ile|with)\s+|\s+و/iu)
		.map((p) => p.trim())
		.filter(Boolean);

	const found = new Map<string, LocalMatch>();

	for (const part of parts) {
		let rest = part.toLocaleLowerCase();
		// "3 LED lamps" names one appliance twice; count it once per phrase.
		const seen = new Set<string>();
		for (const { id, word } of ENTRIES) {
			const re = isLatin(word)
				? new RegExp(`(^|[^\\p{L}])${escape(word)}(e?s)?(?=$|[^\\p{L}])`, "iu")
				: new RegExp(escape(word), "u");
			const m = re.exec(rest);
			if (!m) continue;
			rest = rest.slice(0, m.index) + " ".repeat(m[0].length) + rest.slice(m.index + m[0].length);
			if (seen.has(id)) continue;
			seen.add(id);

			const qty = quantity(part, word);
			const brand = BRANDS.find((b) => new RegExp(`(^|\\s)${escape(b)}(\\s|$)`, "i").test(part));
			const prev = found.get(id);
			found.set(id, { specId: id, qty: (prev?.qty ?? 0) + qty, brand: brand ?? prev?.brand });
		}
	}
	return [...found.values()].filter((m) => getSpec(m.specId));
}

function quantity(part: string, word: string) {
	if (ARABIC_DUALS.includes(word)) return 2;
	// A bare number is a count; "55-inch", "2000W" or "8kg" are specs, not counts.
	for (const m of part.matchAll(/(\d{1,4})(?![\d.,])\s*(-?\s*(inch|in\b|"|w\b|watt|kw|kg|l\b|lt|litre|liter|hp|btu|inç|lik))?/giu)) {
		if (!m[2]) return Math.max(1, Math.min(100, Number(m[1])));
	}
	for (const token of part.toLocaleLowerCase().split(/\s+/)) {
		if (WORD_NUMBERS[token]) return WORD_NUMBERS[token];
	}
	return 1;
}
