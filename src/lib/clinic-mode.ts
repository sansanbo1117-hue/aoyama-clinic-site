export type IntakeMode = "open" | "phone_only" | "maintenance";

export function getIntakeMode(): IntakeMode {
  const mode = process.env.INTAKE_MODE;
  if (mode === "phone_only" || mode === "maintenance") return mode;
  return "open";
}
