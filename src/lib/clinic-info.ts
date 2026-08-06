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

export const WEEKLY_HOURS: DayHours[] = [
  { day: "月・火・金", am: "9:00〜12:00", pm: "14:00〜18:00" },
  { day: "水", am: "9:00〜12:00", pm: "15:00〜19:00" },
  { day: "木", am: "9:00〜12:00", pm: null },
  { day: "土", am: "9:00〜13:00", pm: null },
  { day: "日・祝", am: null, pm: null },
];

export const RECEPTION_HOURS = {
  newPatient: [
    { day: "月・火・木・金", am: "〜11:00", pm: "〜17:00" },
    { day: "水", am: "〜11:00", pm: "〜18:00" },
    { day: "土", am: "〜12:00", pm: null },
  ],
  returningPatient: [
    { day: "月・火・木・金", am: "〜11:30", pm: "〜17:30" },
    { day: "水", am: "〜11:30", pm: "〜18:30" },
    { day: "土", am: "〜12:00", pm: null },
  ],
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
