export const DELAYS = {
  SHORT: 100,
  MEDIUM: 300,
  SELECT_ANIMATION: 600,
  FIELD_LOAD: 800,
  AUTOCOMPLETE: 1500,
} as const;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function escapeHtml(text: unknown): string {
  if (text == null) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

export function validateBirthDate(date: string): boolean {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(regex);
  if (!match) return false;
  const [, d, m, y] = match;
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const year = parseInt(y, 10);
  return (
    day > 0 &&
    day <= 31 &&
    month > 0 &&
    month <= 12 &&
    year > 1900 &&
    year <= new Date().getFullYear()
  );
}
