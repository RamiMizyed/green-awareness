import { Globe2 } from "lucide-react";
// Individual imports keep the bundle to the flags we actually use.
import AE from "country-flag-icons/react/3x2/AE";
import AU from "country-flag-icons/react/3x2/AU";
import BR from "country-flag-icons/react/3x2/BR";
import CA from "country-flag-icons/react/3x2/CA";
import CN from "country-flag-icons/react/3x2/CN";
import DE from "country-flag-icons/react/3x2/DE";
import EG from "country-flag-icons/react/3x2/EG";
import ES from "country-flag-icons/react/3x2/ES";
import EU from "country-flag-icons/react/3x2/EU";
import FR from "country-flag-icons/react/3x2/FR";
import GB from "country-flag-icons/react/3x2/GB";
import ID from "country-flag-icons/react/3x2/ID";
import IE from "country-flag-icons/react/3x2/IE";
import IN from "country-flag-icons/react/3x2/IN";
import IT from "country-flag-icons/react/3x2/IT";
import JP from "country-flag-icons/react/3x2/JP";
import KR from "country-flag-icons/react/3x2/KR";
import MX from "country-flag-icons/react/3x2/MX";
import NG from "country-flag-icons/react/3x2/NG";
import NL from "country-flag-icons/react/3x2/NL";
import NO from "country-flag-icons/react/3x2/NO";
import NZ from "country-flag-icons/react/3x2/NZ";
import PL from "country-flag-icons/react/3x2/PL";
import SA from "country-flag-icons/react/3x2/SA";
import SE from "country-flag-icons/react/3x2/SE";
import TR from "country-flag-icons/react/3x2/TR";
import US from "country-flag-icons/react/3x2/US";
import ZA from "country-flag-icons/react/3x2/ZA";
import { cn } from "@/lib/utils";

type FlagSvg = typeof US;

const FLAGS: Record<string, FlagSvg> = {
	ae: AE, au: AU, br: BR, ca: CA, cn: CN, de: DE, eg: EG, es: ES, eu: EU, fr: FR,
	gb: GB, id: ID, ie: IE, in: IN, it: IT, jp: JP, kr: KR, mx: MX, ng: NG, nl: NL,
	no: NO, nz: NZ, pl: PL, sa: SA, se: SE, tr: TR, us: US, za: ZA,
};

/** A small rounded flag; the world average gets a globe. */
export function Flag({ regionId, className }: { regionId: string; className?: string }) {
	const Svg = FLAGS[regionId];
	const box = cn(
		"inline-block h-[1em] w-[1.5em] shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
		className
	);
	if (!Svg) {
		return (
			<span className={cn(box, "flex items-center justify-center bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300")} aria-hidden>
				<Globe2 className="size-[0.8em]" />
			</span>
		);
	}
	return <Svg className={box} aria-hidden />;
}
