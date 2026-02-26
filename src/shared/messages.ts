import type { Person } from "./storage.js";

export interface FillFormMessage {
  action: "FILL_FORM";
  person: Person;
}

export function isFillFormMessage(
  message: unknown,
): message is FillFormMessage {
  if (typeof message !== "object" || message === null) return false;
  const msg = message as Record<string, unknown>;
  return msg.action === "FILL_FORM" && typeof msg.person === "object";
}
