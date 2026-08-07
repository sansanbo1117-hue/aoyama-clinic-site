import { isDemoMode, DEMO_NOTICE } from "@/lib/demo";

export function DemoBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-950 sm:text-sm" role="status">
      {DEMO_NOTICE}
    </div>
  );
}
