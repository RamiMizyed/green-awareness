import type { Dict } from "./en";

// Turkish keeps nouns singular after numbers ("3 cihaz"), so counts need no
// plural forms. Avoid attaching suffixes to placeholders like {pct}: the
// right suffix depends on how the number is read ("%9'u", "%12'si").
const tr: Dict = {
	meta: {
		dir: "ltr",
		name: "Türkçe",
		title: "Green Awareness | Ev Enerjisi ve Karbon Ayak İzi Hesaplayıcı",
	},

	nav: {
		calculator: "Hesaplayıcı",
		save: "Tasarruf et",
		how: "Nasıl çalışır",
		github: "GitHub deposu",
		toLight: "Açık temaya geç",
		toDark: "Koyu temaya geç",
		language: "Dil",
	},

	intro: {
		title: "Elektriğiniz size ve gezegene kaça mal oluyor?",
		points: ["Yaklaşık 2 dakika", "140+ ülke", "Listeniz cihazınızda kalır"],
		download: "Sonuçlarımı indir",
	},

	period: {
		label: "Sonuçları göster",
		name: { day: "Gün", month: "Ay", year: "Yıl" },
		per: { day: "günde", month: "ayda", year: "yılda" },
		inSentence: { day: "günlük", month: "aylık", year: "yıllık" },
	},

	units: {
		hours: "sa",
		km: "km",
		miles: "mil",
		kg: "kg",
	},

	step1: {
		title: "Nerede yaşıyorsunuz?",
		text: "Bu, elektrik fiyatınızı ve elektriğinizin ne kadar temiz olduğunu belirler.",
		country: "Ülke veya bölge",
		price: "kWh başına fiyat",
		co2: "kWh başına şebeke CO₂",
		tip: "Buradaki fiyatlar tipik değerlerdir. En doğru sonuç için elektrik faturanızdaki kWh birim fiyatını girin.",
		useDefaults: "{name} varsayılanlarını kullan",
		world: "Dünya ortalaması",
		eu: "Avrupa Birliği ortalaması",
	},

	map: {
		hint: "Haritada ülkenize dokunun veya listeden seçin.",
		mapLabel: "Her ülkenin elektriğinin ne kadar CO₂ ürettiğini gösteren dünya haritası",
		cleaner: "Daha temiz şebeke",
		dirtier: "Daha fazla CO₂",
		price: "Elektrik fiyatı",
		co2: "kWh başına CO₂",
		perKwh: "kWh başına",
		rank: "Listedeki {total} ülkenin {n} tanesinden daha temiz",
	},

	assistant: {
		title: "Neleriniz olduğunu yazmanız yeterli",
		text: "Cihazlarınızı kendi kelimelerinizle yazın, biz sizin için ekleyelim.",
		label: "Cihazlarınızı anlatın",
		placeholder: "ör. LG televizyon, çamaşır makinesi, 2 buzdolabı",
		send: "Ekle",
		examples: [
			"65 inç LG televizyon, günde 4 saat",
			"2 buzdolabı ve eski bir dondurucu",
			"Çamaşır makinesi haftada 3 kez",
			"Yazın klima, bütün gün",
		],
		thinking: "Düşünüyorum…",
		added: (n) => `${n} cihaz eklendi`,
		removed: (n) => `${n} cihaz kaldırıldı.`,
		notFound: "Bu, listenizde yok.",
		undo: "Geri al",
		undone: "Geri alındı.",
		restored: "Listenize geri eklendi.",
		nothing: "Mesajınızda bir cihaz göremedim. “buzdolabı, TV, 2 vantilatör” gibi bir şey deneyin.",
		offline: "Yapay zekâ yardımcımız şu anda çevrimdışı, bu yüzden bulabildiklerimi kendim eşleştirdim.",
		limit: "Çok sayıda mesaj gönderdiniz. Lütfen birkaç dakika bekleyip tekrar deneyin.",
		error: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
		privacy: "Buraya yazdıklarınız, anlaşılabilmesi için yapay zekâ yardımcımıza (Anthropic'in Claude'u) gönderilir. Listenizin kendisi cihazınızda kalır.",
		localPrivacy: "Doğrudan tarayıcınızda çalışır. Yazdığınız hiçbir şey bir yere gönderilmez.",
		you: "Siz",
		ai: "Yardımcı",
		manual: "Ya da kendiniz ekleyin",
	},

	step2: {
		title: "Neler kullanıyorsunuz?",
		emptyText: "Başlamak için sizinkine benzeyen bir ev seçin, sonra düzenleyin.",
		count: (n) => `Evinizde ${n} cihaz var.`,
		add: "Ekle",
		addAnother: "Başka bir cihaz ekle",
		startWith: "Bununla başla →",
		orPick: "Her şeyi kendiniz mi seçmek istersiniz?",
		choose: "Cihazları seç",
		clearAll: "Tümünü temizle",
		clearTitle: (n) => `${n} cihazın tümü kaldırılsın mı?`,
		clearText: "Tasarruf planınız da temizlenir. Ülkeniz ve fiyatınız aynı kalır.",
		keep: "Vazgeç",
		confirmClear: "Tümünü kaldır",
		removed: "{name} kaldırıldı",
		undo: "Geri al",
		unnamed: "Adsız cihaz",
		templates: {
			studio: { label: "Stüdyo daire", description: "1 kişi, temel ihtiyaçlar" },
			family: { label: "Aile evi", description: "4 kişi, tipik cihazlar" },
			all_electric: {
				label: "Tamamen elektrikli ev",
				description: "Elektrikli ısıtma, sıcak su ve araç",
			},
		},
	},

	row: {
		biggest: "En çok tüketen",
		nameLabel: "Cihaz adı",
		namePlaceholder: "Bu cihaza bir ad verin",
		power: "Güç",
		hoursPerDay: "Günde saat",
		daysPerWeek: "Haftada gün",
		energyPerUse: "Kullanım başına enerji",
		usesPerWeek: "Haftada kullanım",
		howMany: "Adet",
		monthsPerYear: "Yılda ay",
		standby: "Bekleme gücü",
		countBy: "Kullanımı şuna göre say",
		byHours: "Kullanım saati",
		byLoads: "Yıkama veya şarj",
		more: "Daha fazla ayar",
		fewer: "Daha az ayar",
		copy: "Kopyala",
		remove: "Kaldır",
		removeLabel: "Kaldır: {name}",
		less: "Azalt: {label}",
		moreOf: "Artır: {label}",
		shareOfUse: "Kullanımdaki payı {pct}",
		shareLabel: "Elektrik kullanımınızdaki payı {pct}",
		help: "Gücünden emin değil misiniz? Cihazın arkasındaki veya altındaki etikette yazar. Bekleme gücü, cihaz kapalıyken ama prize takılıyken çektiği güçtür.",
		standbyCost: "Burada yalnızca bekleme modu yılda {money} tutuyor.",
		custom: "Özel",
	},

	picker: {
		title: "Cihaz ekle",
		text: "Sahip olduğunuz her şeye dokunun. Bir tane daha eklemek için tekrar dokunun.",
		search: "Ara: buzdolabı, ısıtıcı, TV…",
		searchLabel: "Cihaz ara",
		categories: "Kategoriler",
		everything: "Tümü",
		noMatch: "“{query}” için sonuç bulunamadı.",
		addAsOwn: "“{query}” adıyla kendiniz ekleyin",
		somethingElse: "Başka bir şey",
		other: "Diğer",
		done: "Tamam",
		inHome: (n) => `· evinizde ${n} cihaz`,
		typical: "Ayda ~{kwh} kWh",
		addLabel: "Ekle: {name}",
		added: (n) => `${n} eklendi`,
	},

	categories: {
		kitchen: "Mutfak",
		climate: "Isıtma ve soğutma",
		laundry: "Çamaşır",
		entertainment: "Eğlence",
		office: "İş ve cihazlar",
		lighting: "Aydınlatma",
		other: "Diğer",
	},

	results: {
		heading: "Sonuçlarınız",
		costs: "Elektriğinizin maliyeti",
		energy: "Kullanılan enerji",
		carbon: "Karbon (CO₂e)",
		empty: "2. adımda cihazlarınızı ekleyin, sonuçlarınız hemen burada görünsün.",
		sameAs: "Karbon ayak iziniz {period} bazda yaklaşık şuna eşit",
		driven: "Benzinli bir arabayla {value} yol",
		phones: "{value} telefon şarjı (enerji olarak)",
		trees: (_n, formatted) => `${formatted} ağaç`,
		treesText: "Bir yıllık salımı emmek için {value} gerekir",
		standby: "Bekleme modundaki cihazlar hiçbir şey yapmadan size yılda {money} maliyet çıkarıyor.",
		planSaves: "Planınız {period} {money} tasarruf sağlıyor ({pct} daha az). Planınızı görün",
		cutTitle: "Bunu nasıl azaltacağınızı görün",
		cutText: "Eviniz için seçilmiş öneriler",
		mobileButton: "Sonuçlar",
	},

	breakdown: {
		heading: "Paranız nereye gidiyor",
		biggest: "En çok tüketenler",
		top3: "İlk 3 cihazınızın faturanızdaki payı {pct}. En büyük farkı buradaki değişiklikler yaratır.",
		shownPer: "Tutarlar {period} bazda gösterilir.",
	},

	save: {
		title: "Tasarruf planınız",
		text: "Evinizde en büyük farkı yaratacak değişiklikler. Yapacaklarınızı işaretleyin ve tasarrufunuzun nasıl biriktiğini görün.",
		empty: "Yukarıda cihazlarınızı ekleyin, size en çok tasarruf sağlayacak değişiklikleri gösterelim.",
		noTips: "Harika, listenizde bariz bir kolay kazanım yok. Aşağıdaki fikirler daha ileri gitmenize yardımcı olabilir.",
		couldSave: "Tasarruf potansiyeliniz",
		couldSaveSub: "yılda · kullanımınızın {pct} kadarı",
		planSaves: "Planınızın tasarrufu",
		planHint: "Aşağıdaki değişiklikleri işaretleyin",
		planCount: (n) => `yılda · ${n} değişiklik`,
		avoided: "Önlediğiniz karbon",
		avoidedSub: "yılda CO₂e",
		perYear: "yılda",
		willDo: "Bunu yapacağım",
		inPlan: "Planımda",
		further: "Daha ileri gitmek için",
		effort: { Free: "Ücretsiz", "Low cost": "Düşük maliyet", Investment: "Yatırım" },
		beyond: [
			{
				title: "Yenilenebilir tarifeye geçin",
				detail:
					"Rüzgar ve güneş enerjisiyle desteklenen bir tedarikçi veya tarife seçin. Yaşam tarzınızı değiştirmeden elektriğinizden kaynaklanan CO₂'yi azaltır.",
			},
			{
				title: "Güneş enerjisini araştırın",
				detail:
					"Çatınız size aitse paneller gündüz kullanımınızın büyük kısmını karşılayabilir. Kiracılar çoğu zaman topluluk güneş projelerine katılabilir.",
			},
			{
				title: "Elektriği ucuzken kullanın",
				detail:
					"Tarifenizde daha ucuz gece veya hafta sonu saatleri varsa bulaşık makinesini, çamaşırı ve araç şarjını o saatlerde çalıştırın.",
			},
		],
	},

	tips: {
		bulbs_to_led: {
			title: "Akkor ampulleri LED ile değiştirin",
			detail:
				"LED aynı ışığı yaklaşık %15 güçle verir ve 15 ila 25 kat daha uzun ömürlüdür. En çok kullandığınız lambalardan başlayın.",
		},
		cfl_to_led: {
			title: "Tasarruf ampulleri bozuldukça LED'e geçin",
			detail: "LED'ler tasarruf ampullerinden yaklaşık üçte bir daha az enerji kullanır ve cıva içermez.",
		},
		line_dry: {
			title: "Çamaşırlarınızın yarısını havada kurutun",
			detail:
				"Kurutma makinesi evdeki en çok enerji tüketen cihazlardan biridir. Yüklerin yalnızca yarısı için bile bir kurutmalık büyük fark yaratır.",
		},
		cold_wash: {
			title: "30°C'de veya soğuk yıkayın",
			detail:
				"Çamaşır makinesinin enerjisinin çoğu suyu ısıtmaya gider. Modern deterjanlar düşük sıcaklıkta da iyi temizler.",
		},
		heater_to_heat_pump: {
			title: "Rezistanslı ısıtıcılar yerine ısı pompası kullanın",
			detail:
				"Isı pompası ısıyı üretmek yerine taşır ve her birim elektrikle yaklaşık 3 birim ısı sağlar.",
		},
		ac_setpoint: {
			title: "Klimayı 2°C daha yükseğe ayarlayın ve vantilatör kullanın",
			detail:
				"Her derece yükseltme soğutma enerjisinin yaklaşık %6'sını tasarruf ettirir. Vantilatör, odayı çok daha az güçle yaklaşık 3°C daha serin hissettirir.",
		},
		water_heater: {
			title: "Isı pompalı su ısıtıcısına geçin",
			detail:
				"Standart bir termosifondan yaklaşık %60 daha az elektrik kullanır. Bu arada termosifonu 50 ila 55°C'ye ayarlayın ve damlatan sıcak su musluklarını tamir edin.",
		},
		dishwasher_eco: {
			title: "Bulaşık makinesini dolu ve eko modda çalıştırın",
			detail: "Eko programlar daha uzun sürer ama daha az su ısıtır. Bulaşıkları sıcak suyla ön yıkamaya gerek yok.",
		},
		kettle: {
			title: "Yalnızca ihtiyacınız kadar su kaynatın",
			detail: "Çoğu insan kullandığının yaklaşık iki katını kaynatır.",
		},
		oven_to_airfryer: {
			title: "Küçük yemekler için mikrodalga veya airfryer kullanın",
			detail:
				"Tek bir tepsi için koca fırını ısıtmak enerjinin çoğunu boşa harcar. Küçük cihazlar fırının içini değil yemeği ısıtır.",
		},
		pc_sleep: {
			title: "Bilgisayarınızda uyku modunu açın",
			detail: "Bilgisayarı 10 ila 15 dakika boşta kaldıktan sonra, ekranı ise 5 dakika sonra uykuya alın.",
		},
		pool_timer: {
			title: "Havuz pompasını daha az çalıştırın veya değişken hızlıya geçin",
			detail:
				"Çoğu havuzun günde yalnızca birkaç saat filtrelemeye ihtiyacı vardır. Değişken hızlı pompa düşük hızda çok daha az güç kullanır.",
		},
		standby: {
			title: "Bekleme gücünü azaltın",
			detail:
				"Kullanmadığınız cihazlar da güç çeker. Onları prizden kapatın, akıllı bir grup priz kullanın ve konsol ile TV'lerde \"anında açılma\" özelliğini kapatın.",
		},
	},

	how: {
		title: "Nasıl çalışır",
		text: "Hesaplamalar, verilerin kaynağı ve rakamların neyi anlatıp neyi anlatamadığı.",
		items: [
			{
				q: "Enerji kullanımı nasıl hesaplanır?",
				a: "Saat bazında kullandığınız cihazlar için: güç (W) × günlük saat × haftalık gün; yıl boyunca ortalaması alınır ve kullandığınız ay sayısına göre ölçeklenir. Çamaşır makinesi veya elektrikli araç gibi yıkama ya da şarj başına sayılan cihazlar için: kullanım başına enerji × haftalık kullanım. Cihazın kullanılmadığı her saat için bekleme gücü eklenir.",
			},
			{
				q: "Karbon rakamları nereden geliyor?",
				a: "Her ülkenin şebeke karbon yoğunluğu, 2023'te üretilen elektriğin kWh başına ortalama yaşam döngüsü emisyonudur ve Ember ile Our World in Data verilerinden yuvarlanmıştır. Gerçek ayak iziniz tedarikçinize ve günün saatine bağlıdır. Sertifikalı yenilenebilir bir tarifedeyseniz daha düşük bir değer girin.",
			},
			{
				q: "Cihaz varsayılanları ne kadar doğru?",
				a: "Yaygın modeller için tipik değerlerdir ve mantıklı bir başlangıç noktası olarak düşünülmüştür. Sizin cihazınız, özellikle eski buzdolapları, ısıtıcılar ve büyük motorlu cihazlar, oldukça farklı olabilir. Gerçek değeri cihazın etiketi veya prize takılan bir enerji ölçer verir.",
			},
			{
				q: "Neler dahil değil?",
				a: "Yalnızca elektrik hesaba katılır. Doğalgaz veya fuel-oil ile ısınma, gazlı ocak, ulaşım yakıtı, gıda ve alışveriş dahil değildir. Bunlar genellikle bir hanenin ayak izinin büyük kısmını oluşturur.",
			},
			{
				q: "Karşılaştırmalar ne anlama geliyor?",
				a: "Araç mesafesi, ortalama bir benzinli araç için ABD Çevre Koruma Ajansı'nın (EPA) km başına yaklaşık 0,25 kg CO₂ (mil başına 0,4 kg) değerini kullanır. Büyüyen bir ağacın yılda yaklaşık 21 kg CO₂ emdiği, bir telefonun tam şarjının ise yaklaşık 0,019 kWh kullandığı varsayılır. Bunlar kesin dönüşümler değil, ölçek hissi vermek içindir.",
			},
			{
				q: "Verilerim bir yerde saklanıyor mu?",
				a: "Cihaz listeniz bu cihazdaki tarayıcınızın yerel depolamasında kalır ve hiçbir yere yüklenmez. Yapay zekâ yardımcısını kullanırsanız, yalnızca oraya yazdığınız kelimeler hangi cihazları kastettiğinizi anlamak için Claude'a (Anthropic) gönderilir. Listenizi istediğiniz zaman silebilirsiniz.",
			},
		],
	},

	footer: {
		note: "Yalnızca tahmindir; kesin rakamlar için faturanızı kontrol edin.",
		contribute: "GitHub'da katkıda bulunun",
		madeBy: "Geliştiren: Rami Mizyed",
	},

	appliances: {
		fridge: {
			name: "Buzdolabı",
			hint: "Ortalama tüketim. Kompresör açılıp kapandığı için etiketteki değerden çok daha az enerji kullanır.",
		},
		freezer: { name: "Sandık tipi dondurucu", hint: "Gün boyunca ortalama tüketim." },
		oven: { name: "Elektrikli fırın" },
		hob: { name: "Elektrikli ocak" },
		microwave: { name: "Mikrodalga fırın" },
		kettle: { name: "Su ısıtıcısı (kettle)", hint: "Her kaynatma yaklaşık 3 dakika, günde üç kez." },
		coffee: { name: "Kahve makinesi" },
		airfryer: { name: "Airfryer" },
		dishwasher: { name: "Bulaşık makinesi" },
		ac_window: { name: "Klima (oda tipi)" },
		ac_central: { name: "Merkezi klima" },
		space_heater: { name: "Elektrikli ısıtıcı" },
		heat_pump: {
			name: "Isı pompası (split)",
			hint: "Isıtma sırasında ortalama tüketim. Her kWh elektrikle yaklaşık 3 kWh ısı sağlar.",
		},
		water_heater: {
			name: "Elektrikli termosifon",
			hint: "Rezistansın gerçekten ısıttığı süre; sıcak su kullandığınız süre değil.",
		},
		fan: { name: "Tavan veya ayaklı vantilatör" },
		dehumidifier: { name: "Nem alma cihazı" },
		washer: {
			name: "Çamaşır makinesi",
			hint: "40°C yıkama için yaklaşık 0,8 kWh, soğuk yıkama için 0,3 kWh.",
		},
		dryer: {
			name: "Kurutma makinesi",
			hint: "Tahliyeli veya yoğuşmalı kurutucuda yük başına yaklaşık 3 kWh.",
		},
		iron: { name: "Ütü" },
		tv: { name: "Televizyon (50 inç LED)" },
		console: { name: "Oyun konsolu", hint: "\"Anında açılma\" bekleme modu gün boyu yaklaşık 10 W çeker." },
		router: { name: "Wi-Fi modem" },
		laptop: { name: "Dizüstü bilgisayar" },
		desktop: { name: "Masaüstü bilgisayar" },
		gaming_pc: { name: "Oyun bilgisayarı" },
		monitor: { name: "Bilgisayar monitörü" },
		phone: { name: "Telefon şarj cihazı" },
		led: { name: "LED ampuller" },
		cfl: { name: "Tasarruf ampulleri (CFL)" },
		incandescent: { name: "Akkor / halojen ampuller" },
		ev: { name: "Elektrikli araç (evde şarj)", hint: "12 kWh yaklaşık 70 km menzil ekler." },
		pool_pump: { name: "Havuz pompası" },
		hair_dryer: { name: "Saç kurutma makinesi" },
		vacuum: { name: "Elektrikli süpürge" },
	},
};

export default tr;
