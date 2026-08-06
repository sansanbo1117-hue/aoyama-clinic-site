import Link from "next/link";
import { Phone, CalendarCheck, MapPin, Clock, type LucideIcon } from "lucide-react";

import { CLINIC } from "@/lib/clinic-info";

type QuickAction = {
  href: string;
  icon: LucideIcon;
  label: string;
  sub: string;
  external?: boolean;
  primary?: boolean;
};

const actions: QuickAction[] = [
  {
    href: CLINIC.telHref,
    icon: Phone,
    label: "電話する",
    sub: CLINIC.tel,
    external: true,
    primary: true,
  },
  {
    href: "/reserve",
    icon: CalendarCheck,
    label: "Web予約",
    sub: "初診・再診・変更",
    primary: true,
  },
  {
    href: "/access",
    icon: MapPin,
    label: "アクセス",
    sub: "地図・駐車場",
  },
  {
    href: "/hours",
    icon: Clock,
    label: "診療時間",
    sub: "休診日を見る",
  },
];

export function QuickActions() {
  return (
    <section aria-label="よく使う操作" className="relative z-10 -mt-8 px-4">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 rounded-2xl border bg-card p-3 shadow-lg sm:grid-cols-4 sm:gap-4 sm:p-4">
        {actions.map(({ href, icon: Icon, label, sub, primary, external }) => {
          const Comp = external ? "a" : Link;
          return (
            <Comp
              key={label}
              href={href}
              className={
                primary
                  ? "flex flex-col items-center gap-1.5 rounded-xl bg-primary px-3 py-4 text-center text-primary-foreground transition-transform hover:scale-[1.02]"
                  : "flex flex-col items-center gap-1.5 rounded-xl bg-secondary px-3 py-4 text-center text-secondary-foreground transition-transform hover:scale-[1.02]"
              }
            >
              <Icon className="size-7" aria-hidden />
              <span className="text-base leading-tight font-bold">{label}</span>
              <span className="text-xs opacity-90">{sub}</span>
            </Comp>
          );
        })}
      </div>
    </section>
  );
}
