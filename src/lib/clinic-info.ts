export const CLINIC = {
  name: "青山整形外科クリニック",
  legalName: "医療法人　青山整形外科クリニック",
  postalCode: "874-0828",
  address: "大分県別府市山の手町17-1",
  fullAddress: "〒874-0828　大分県別府市山の手町17-1",
  tel: "0977-25-3611",
  telHref: "tel:0977253611",
  fax: "0977-26-4010",
  email: "aoyama0@bronze.ocn.ne.jp",
  lat: 33.28324377837192,
  lng: 131.4828666021154,
} as const;

export const MAP_EMBED_URL = `https://www.google.com/maps?q=${CLINIC.lat},${CLINIC.lng}&z=17&output=embed`;
export const MAP_LINK_URL = `https://www.google.com/maps/search/?api=1&query=${CLINIC.lat},${CLINIC.lng}`;

export type DayHours = {
  day: string;
  am: string | null;
  pm: string | null;
};

/**
 * 診療時間・受付終了時刻のただ一つの情報源。
 * ここ以外のファイルに時刻の数値リテラルを置かない
 * （WEEKLY_HOURS・RECEPTION_HOURS・Web予約枠・トップページの案内は、すべてこの値から導出する）。
 */
export type PeriodSchedule = {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  newPatientUntil: string; // 新患・受付終了
  followupUntil: string; // 再診・受付終了
};

export type DaySchedule = {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  am: PeriodSchedule | null;
  pm: PeriodSchedule | null;
};

const MON_TUE_FRI: PeriodSchedule = { start: "09:00", end: "12:00", newPatientUntil: "11:00", followupUntil: "11:30" };
const MON_TUE_FRI_PM: PeriodSchedule = { start: "14:00", end: "18:00", newPatientUntil: "17:00", followupUntil: "17:30" };
const WED_PM: PeriodSchedule = { start: "15:00", end: "19:00", newPatientUntil: "18:00", followupUntil: "18:30" };
const SAT_AM: PeriodSchedule = { start: "09:00", end: "13:00", newPatientUntil: "12:00", followupUntil: "12:00" };

export const SCHEDULE: DaySchedule[] = [
  { weekday: 0, label: "日", am: null, pm: null },
  { weekday: 1, label: "月", am: MON_TUE_FRI, pm: MON_TUE_FRI_PM },
  { weekday: 2, label: "火", am: MON_TUE_FRI, pm: MON_TUE_FRI_PM },
  { weekday: 3, label: "水", am: MON_TUE_FRI, pm: WED_PM },
  { weekday: 4, label: "木", am: MON_TUE_FRI, pm: null },
  { weekday: 5, label: "金", am: MON_TUE_FRI, pm: MON_TUE_FRI_PM },
  { weekday: 6, label: "土", am: SAT_AM, pm: null },
];

export function scheduleFor(weekday: number): DaySchedule {
  return SCHEDULE.find((d) => d.weekday === weekday) ?? SCHEDULE[0];
}

export function formatTime(time: string): string {
  return time.replace(/^0/, "");
}

export function formatRange(period: PeriodSchedule | null): string | null {
  return period ? `${formatTime(period.start)}〜${formatTime(period.end)}` : null;
}

const [SUN, MON, , WED, THU, , SAT] = SCHEDULE;

export const WEEKLY_HOURS: DayHours[] = [
  { day: "月・火・金", am: formatRange(MON.am), pm: formatRange(MON.pm) },
  { day: "水", am: formatRange(WED.am), pm: formatRange(WED.pm) },
  { day: "木", am: formatRange(THU.am), pm: formatRange(THU.pm) },
  { day: "土", am: formatRange(SAT.am), pm: formatRange(SAT.pm) },
  { day: "日・祝", am: formatRange(SUN.am), pm: formatRange(SUN.pm) },
];

function untilLabel(period: PeriodSchedule | null, key: "newPatientUntil" | "followupUntil"): string | null {
  return period ? `〜${formatTime(period[key])}` : null;
}

export const RECEPTION_HOURS = {
  newPatient: [
    { day: "月・火・木・金", am: untilLabel(MON.am, "newPatientUntil"), pm: untilLabel(MON.pm, "newPatientUntil") },
    { day: "水", am: untilLabel(WED.am, "newPatientUntil"), pm: untilLabel(WED.pm, "newPatientUntil") },
    { day: "土", am: untilLabel(SAT.am, "newPatientUntil"), pm: null },
  ],
  returningPatient: [
    { day: "月・火・木・金", am: untilLabel(MON.am, "followupUntil"), pm: untilLabel(MON.pm, "followupUntil") },
    { day: "水", am: untilLabel(WED.am, "followupUntil"), pm: untilLabel(WED.pm, "followupUntil") },
    { day: "土", am: untilLabel(SAT.am, "followupUntil"), pm: null },
  ],
};

/** トップページの受付時間パネル用（新患基準・安全側）。 */
export const HOME_RECEPTION_SUMMARY = {
  am: { hours: formatRange(MON.am)!, receptionUntil: formatTime(MON.am!.newPatientUntil) },
  pm: { hours: formatRange(MON.pm)!, receptionUntil: formatTime(MON.pm!.newPatientUntil) },
  wedPm: formatRange(WED.pm)!,
  satAm: formatRange(SAT.am)!,
};

export const NAV_LINKS = [
  { href: "/", label: "トップ" },
  { href: "/about", label: "医院紹介" },
  { href: "/doctor", label: "院長紹介" },
  { href: "/medical", label: "診療案内" },
  { href: "/hours", label: "診療時間" },
  { href: "/access", label: "アクセス" },
  { href: "/facility", label: "院内紹介" },
  { href: "/news", label: "お知らせ" },
  { href: "/faq", label: "よくある質問" },
  { href: "/recruit", label: "採用情報" },
  { href: "/contact", label: "お問い合わせ" },
] as const;

export const FOOTER_LINKS = [
  ...NAV_LINKS,
  { href: "/downloads", label: "ダウンロード" },
  { href: "/links", label: "LINKS" },
  { href: "/column", label: "院長・スタッフだより" },
  { href: "/privacy", label: "プライバシーポリシー" },
] as const;
