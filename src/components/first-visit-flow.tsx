import { ClipboardList, MessageCircleQuestion, Stethoscope, Wallet, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "① 受付",
    desc: "保険証をご提示ください。初診の方は問診票にご記入いただきます。",
  },
  {
    icon: MessageCircleQuestion,
    title: "② 問診",
    desc: "症状やお困りごとについて、スタッフが詳しくお伺いします。",
  },
  {
    icon: Stethoscope,
    title: "③ 診察",
    desc: "医師が診察・検査を行い、治療方針をご説明します。必要に応じてリハビリをご案内します。",
  },
  {
    icon: Wallet,
    title: "④ 会計",
    desc: "お会計をして終了です。次回の受診が必要な場合はご案内いたします。",
  },
] as const;

export function FirstVisitFlow() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex">
          <div className="flex w-full flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm">
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
              <step.icon className="size-8" aria-hidden />
            </span>
            <p className="text-lg font-bold text-primary">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.desc}</p>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight
              className="absolute top-1/2 -right-3 hidden size-6 -translate-y-1/2 text-primary/60 sm:hidden lg:block"
              aria-hidden
            />
          )}
        </li>
      ))}
    </ol>
  );
}
