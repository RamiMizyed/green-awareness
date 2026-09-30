import { getSpec } from "@/lib/data/appliances";
import type { ApplianceItem } from "@/lib/calc";

/**
 * The quick-add helper's understanding, run entirely in the browser: free,
 * instant and private. Handles English, Turkish and Arabic appliance words,
 * counts ("2 fridges", "iki klima", "مكيفان"), brands, sizes ("65-inch"),
 * usage ("5 hours a day", "3 times a week", "at weekends"), condition ("old"),
 * common typos, and removals ("remove the dryer").
 */

// --- Vocabulary -------------------------------------------------------------------

// Longer phrases are tried first, so "hair dryer" wins over "dryer" and
// "water heater" over "heater".
const KEYWORDS: Record<string, string[]> = {
	fridge: ["fridge", "refrigerator", "fridge freezer", "buzdolabı", "buzdolabi", "ثلاجة", "ثلاجات", "ثلاجتان", "براد"],
	freezer: ["freezer", "chest freezer", "deep freezer", "dondurucu", "derin dondurucu", "فريزر"],
	oven: ["oven", "fırın", "firin", "فرن"],
	hob: ["stove", "hob", "cooktop", "cooker", "ocak", "موقد", "طباخ"],
	microwave: ["microwave", "mikrodalga", "ميكروويف", "مايكرويف"],
	kettle: ["kettle", "su ısıtıcı", "su isitici", "kettle", "غلاية"],
	coffee: ["coffee maker", "coffee machine", "espresso", "coffee", "kahve makinesi", "kahve", "قهوة"],
	airfryer: ["air fryer", "airfryer", "قلاية"],
	dishwasher: ["dishwasher", "bulaşık makinesi", "bulasik makinesi", "bulaşık", "غسالة صحون", "جلاية"],
	ac_window: ["air conditioner", "air conditioning", "aircon", "air con", "a/c", "ac", "split ac", "klima", "مكيف", "مكيّف", "مكيفات", "مكيّفان", "مكيفان"],
	ac_central: ["central air", "central ac", "central air conditioning", "merkezi klima", "تكييف مركزي"],
	space_heater: ["space heater", "electric heater", "heater", "radiator", "ısıtıcı", "isitici", "elektrikli soba", "soba", "مدفأة", "دفاية"],
	heat_pump: ["heat pump", "ısı pompası", "isi pompasi", "مضخة حرارية"],
	water_heater: ["water heater", "boiler", "geyser", "immersion heater", "termosifon", "şofben", "sofben", "سخان"],
	fan: ["ceiling fan", "fan", "vantilatör", "vantilator", "pervane", "مروحة", "مراوح", "مروحتان"],
	dehumidifier: ["dehumidifier", "nem alma", "مزيل رطوبة"],
	washer: ["washing machine", "washer", "çamaşır makinesi", "camasir makinesi", "غسالة ملابس", "غسالة"],
	dryer: ["tumble dryer", "clothes dryer", "dryer", "drier", "kurutma makinesi", "kurutma", "مجفف ملابس", "نشافة"],
	iron: ["iron", "ütü", "utu", "مكواة"],
	tv: ["television", "tv", "telly", "smart tv", "televizyon", "tivi", "تلفاز", "تلفزيون", "تلفزيونات"],
	console: ["playstation", "ps5", "ps4", "xbox", "nintendo", "switch", "game console", "games console", "console", "konsol", "بلايستيشن", "جهاز ألعاب"],
	router: ["router", "wifi", "wi-fi", "modem", "راوتر"],
	laptop: ["laptop", "notebook", "macbook", "dizüstü", "dizustu", "لابتوب", "حاسوب محمول"],
	gaming_pc: ["gaming pc", "gaming computer", "gaming rig", "oyun bilgisayarı", "حاسوب ألعاب"],
	desktop: ["desktop", "pc", "computer", "imac", "bilgisayar", "كمبيوتر", "حاسوب"],
	monitor: ["monitor", "screen", "ekran", "monitör", "شاشة كمبيوتر"],
	phone: ["phone charger", "phone", "charger", "iphone", "telefon", "şarj", "شاحن", "هاتف"],
	incandescent: ["incandescent", "halogen", "akkor", "halojen", "متوهجة"],
	cfl: ["cfl", "energy saving bulb", "tasarruf ampul"],
	led: ["led", "bulb", "lamp", "light", "lighting", "ampul", "lamba", "aydınlatma", "لمبة", "لمبات", "مصباح", "مصابيح", "إضاءة"],
	ev: ["electric car", "electric vehicle", "tesla", "ev", "elektrikli araç", "elektrikli arac", "elektrikli araba", "سيارة كهربائية"],
	pool_pump: ["pool pump", "pool", "havuz", "مسبح"],
	hair_dryer: ["hair dryer", "hairdryer", "blow dryer", "saç kurutma", "sac kurutma", "fön", "سشوار", "مجفف شعر"],
	vacuum: ["vacuum cleaner", "vacuum", "hoover", "süpürge", "supurge", "مكنسة"],
};

const BRANDS = [
	"LG", "Samsung", "Sony", "Philips", "Panasonic", "Toshiba", "Sharp", "Hisense", "TCL",
	"Bosch", "Siemens", "Beko", "Arçelik", "Vestel", "Whirlpool", "Electrolux", "AEG",
	"Miele", "Haier", "Dyson", "Xiaomi", "Apple", "Dell", "HP", "Lenovo", "Asus", "Acer",
	"Daikin", "Mitsubishi", "Gree", "Tesla", "Tefal", "DeLonghi", "Nespresso", "Grundig",
];

const WORD_NUMBERS: Record<string, number> = {
	one: 1, two: 2, couple: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
	eight: 8, nine: 9, ten: 10, twelve: 12,
	// Turkish "on" (10) is left out: it clashes with the English word.
	bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9,
	واحد: 1, اثنين: 2, ثلاث: 3, ثلاثة: 3, أربع: 4, أربعة: 4, خمس: 5, خمسة: 5,
};

// Arabic dual forms already mean two.
const ARABIC_DUALS = new Set(["ثلاجتان", "مكيّفان", "مكيفان", "مروحتان"]);

const REMOVE_WORDS = /^(?:please\s+)?(?:remove|delete|drop|take out|get rid of|no|without|sil|çıkar|cikar|kaldır|kaldir|احذف|أزل|ازل|بدون|شيل)(?!\p{L})|(?<!\p{L})(?:sil|çıkar|kaldır)$/iu;

// --- Helpers ---------------------------------------------------------------------

const isLatin = (s: string) => /^[\x20-\x7e]+$/.test(s);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const num = (s: string) => Number(s.replace(",", "."));

const ENTRIES = Object.entries(KEYWORDS)
	.flatMap(([id, words]) => [...new Set(words)].map((w) => ({ id, word: w.toLocaleLowerCase() })))
	.sort((a, b) => b.word.length - a.word.length);

// Single Latin words long enough to fuzzy-match safely ("refrigirator").
const FUZZY = ENTRIES.filter((e) => isLatin(e.word) && !e.word.includes(" ") && e.word.length >= 5);

function editDistance(a: string, b: string, max: number) {
	if (Math.abs(a.length - b.length) > max) return max + 1;
	let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		const cur = [i];
		let best = i;
		for (let j = 1; j <= b.length; j++) {
			cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
			best = Math.min(best, cur[j]);
		}
		if (best > max) return max + 1;
		prev = cur;
	}
	return prev[b.length];
}

type Overrides = Partial<Pick<ApplianceItem, "watts" | "hoursPerDay" | "daysPerWeek" | "cyclesPerWeek" | "monthsPerYear">> & {
	/** Multiplier on power for "old" or "inverter". */
	factor?: number;
	inches?: number;
};

/**
 * Pulls usage details out of a phrase and returns them with the phrase minus
 * those details, so "4 hours" isn't later read as "4 TVs".
 */
function extractDetails(part: string): { rest: string; o: Overrides; weekly: boolean } {
	const o: Overrides = {};
	let rest = part;
	let weekly = false;
	const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
		const m = rest.match(re);
		if (m) {
			fn(m);
			rest = rest.replace(m[0], " ");
		}
	};

	// "3 times a week", "4 loads per week", "haftada 3 kez", "3 مرات في الأسبوع"
	take(/(\d+)\s*(?:times|x|loads?|washes|cycles?|kez|defa|kere|مرات|مرة)\s*(?:a|per|\/|in a|every)?\s*(?:week|wk)/iu, (m) => {
		o.cyclesPerWeek = num(m[1]);
		weekly = true;
	});
	take(/\b(once|twice)\s*(?:a|per|every)\s*week\b/iu, (m) => {
		o.cyclesPerWeek = m[1].toLowerCase() === "once" ? 1 : 2;
		weekly = true;
	});
	take(/haftada\s*(\d+)\s*(?:kez|defa|kere|gün)?/iu, (m) => {
		o.cyclesPerWeek = num(m[1]);
		weekly = true;
	});
	take(/(\d+)\s*(?:مرات|مرة)\s*(?:في\s*)?(?:الأسبوع|أسبوعيا|أسبوعيًا)/u, (m) => {
		o.cyclesPerWeek = num(m[1]);
		weekly = true;
	});

	// "5 hours a day", "2h", "günde 3 saat", "4 ساعات"
	take(/(\d+(?:[.,]\d+)?)\s*(?:h|hr|hrs|hours?|saat|ساعات|ساعة)(?!\p{L})(?:\s*(?:a|per|\/|each|every)?\s*(day|night|week))?/iu, (m) => {
		const h = num(m[1]);
		if (m[2]?.toLowerCase() === "week") {
			o.hoursPerDay = Math.min(24, h);
			o.daysPerWeek = 1;
		} else o.hoursPerDay = Math.min(24, h);
	});
	take(/günde\s*(\d+(?:[.,]\d+)?)\s*saat/iu, (m) => (o.hoursPerDay = Math.min(24, num(m[1]))));
	take(/\b(?:all day|all the time|24\/7|always on|constantly|non-?stop)\b|sürekli|tüm gün|bütün gün|طوال اليوم|دائما|دائمًا/iu, () => (o.hoursPerDay = 24));

	// How many days
	take(/\b(?:at |on )?weekends?\b|hafta\s*sonu|عطلة نهاية الأسبوع|الويكند/iu, () => (o.daysPerWeek = 2));
	take(/\b(?:every ?day|daily|each day)\b|her gün|يوميا|يوميًا|كل يوم/iu, () => (o.daysPerWeek = 7));
	take(/(\d)\s*days?\s*(?:a|per|\/)?\s*week/iu, (m) => (o.daysPerWeek = Math.min(7, num(m[1]))));

	// Seasons
	take(/\b(?:in |during |only in )?summer\b|yazın|yaz aylarında|في الصيف|صيفا|صيفًا/iu, () => (o.monthsPerYear = 4));
	take(/\b(?:in |during |only in )?winter\b|kışın|kış aylarında|في الشتاء|شتاء/iu, () => (o.monthsPerYear = 4));

	// Specs: size and power
	take(/(\d{2,3})\s*(?:-?\s*(?:inch(?:es)?|in\b|"|”|inç|ekran|بوصة))/iu, (m) => (o.inches = num(m[1])));
	take(/(\d+(?:[.,]\d+)?)\s*(kw|kilowatts?)\b/iu, (m) => (o.watts = num(m[1]) * 1000));
	take(/(\d+(?:[.,]\d+)?)\s*(w|watts?|vat|واط)(?!\p{L})/iu, (m) => (o.watts = num(m[1])));

	// Condition
	take(/\b(?:old|older|ancient)\b|eski|قديم|قديمة/iu, () => (o.factor = (o.factor ?? 1) * 1.5));
	take(/\binverter\b|invertörlü|إنفرتر|انفرتر/iu, () => (o.factor = (o.factor ?? 1) * 0.7));
	take(/\b(?:new|efficient|a\+{1,3})\b|yeni|جديد|جديدة/iu, () => (o.factor = (o.factor ?? 1) * 0.85));

	return { rest, o, weekly };
}

function quantity(text: string, word: string) {
	if (ARABIC_DUALS.has(word)) return 2;
	// A standalone number: not part of a name like "PS5".
	const digits = text.match(/(?:^|[^\p{L}\d.,])(\d{1,3})(?![\p{L}\d.,])/u);
	if (digits) return Math.max(1, Math.min(100, Number(digits[1])));
	for (const token of text.toLocaleLowerCase().split(/[\s,]+/)) {
		if (WORD_NUMBERS[token]) return WORD_NUMBERS[token];
	}
	return 1;
}

// --- Public API -------------------------------------------------------------------

export interface LocalItem extends Omit<ApplianceItem, "id" | "name"> {
	brand?: string;
}

export interface LocalResult {
	add: LocalItem[];
	/** Catalog ids the person asked to remove. */
	remove: string[];
}

/** Reads a free-text message into items to add and appliance types to remove. */
export function understand(text: string): LocalResult {
	const parts = text
		.split(/[,;\n،]+|\s+(?:and|&|plus|also|ve|ile|with|ayrıca)\s+|\s+و(?=\S)/iu)
		.map((p) => p.trim())
		.filter(Boolean);

	const add = new Map<string, LocalItem>();
	const remove = new Set<string>();

	for (const part of parts) {
		const removing = REMOVE_WORDS.test(part);
		const { rest: plain, o, weekly } = extractDetails(part);
		let rest = plain.toLocaleLowerCase();
		const brand = BRANDS.find((b) => new RegExp(`(^|[^\\p{L}])${escape(b)}($|[^\\p{L}])`, "iu").test(part));
		const found: { id: string; word: string }[] = [];

		// Exact words and phrases.
		for (const { id, word } of ENTRIES) {
			const re = isLatin(word)
				? new RegExp(`(^|[^\\p{L}])${escape(word)}(e?s)?(?=$|[^\\p{L}])`, "iu")
				: new RegExp(escape(word), "u");
			const m = re.exec(rest);
			if (!m) continue;
			rest = rest.slice(0, m.index) + " ".repeat(m[0].length) + rest.slice(m.index + m[0].length);
			if (!found.some((f) => f.id === id)) found.push({ id, word });
		}

		// Typos in whatever is left ("refrigirator", "dishwaser").
		// Verb forms like "charged" or "washing" are left alone: too close to nouns.
		const tokens = rest.split(/[^\p{L}]+/u).filter((w) => w.length >= 5 && !/(?:ed|ing)$/.test(w));
		for (const token of tokens) {
			const max = token.length >= 8 ? 2 : 1;
			const hit = FUZZY.find((e) => editDistance(token, e.word, max) <= max);
			if (hit && !found.some((f) => f.id === hit.id)) found.push({ id: hit.id, word: hit.word });
		}

		for (const { id, word } of found) {
			if (removing) {
				remove.add(id);
				continue;
			}
			const spec = getSpec(id);
			if (!spec) continue;
			const qty = quantity(plain, word);
			const prev = add.get(id);
			if (prev) {
				prev.qty += qty;
				continue;
			}

			const item: LocalItem = {
				specId: id,
				mode: spec.mode,
				watts: spec.watts,
				hoursPerDay: spec.hoursPerDay,
				daysPerWeek: spec.daysPerWeek,
				kwhPerCycle: spec.kwhPerCycle,
				cyclesPerWeek: spec.cyclesPerWeek,
				monthsPerYear: spec.monthsPerYear,
				standbyWatts: spec.standbyWatts,
				qty,
				brand,
			};

			// Screens scale with size: roughly 1.8 W per inch for TVs, 0.9 for monitors.
			if (o.inches && (id === "tv" || id === "monitor")) {
				item.watts = Math.round(o.inches * (id === "tv" ? 1.8 : 0.9));
			}
			if (o.watts) {
				if (spec.mode === "hours") item.watts = o.watts;
			}
			if (o.factor) {
				if (spec.mode === "hours") item.watts = Math.round(item.watts * o.factor);
				else item.kwhPerCycle = Math.round(item.kwhPerCycle * o.factor * 100) / 100;
			}
			if (o.hoursPerDay != null && spec.mode === "hours") item.hoursPerDay = o.hoursPerDay;
			if (o.daysPerWeek != null && spec.mode === "hours") item.daysPerWeek = o.daysPerWeek;
			if (weekly && o.cyclesPerWeek != null) {
				if (spec.mode === "cycles") item.cyclesPerWeek = o.cyclesPerWeek;
				else item.daysPerWeek = Math.min(7, o.cyclesPerWeek);
			}
			// "dishwasher every day" means a load a day.
			if (!weekly && o.daysPerWeek != null && spec.mode === "cycles") item.cyclesPerWeek = o.daysPerWeek;
			if (o.monthsPerYear != null) item.monthsPerYear = o.monthsPerYear;

			add.set(id, item);
		}
	}

	return { add: [...add.values()], remove: [...remove] };
}
