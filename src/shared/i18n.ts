import { locale as localeEn } from "../../locales/en.js";
import { locale as localeTh } from "../../locales/th.js";

type LocaleMap = Record<string, string>;

const locales: Record<string, LocaleMap> = {
  en: localeEn,
  th: localeTh,
};

let currentLanguage = "en";

export async function init(): Promise<void> {
  currentLanguage = await getLanguage();
  document.documentElement.lang = currentLanguage;
  applyTranslations();
}

export function getCurrentLanguage(): string {
  return currentLanguage;
}

async function getLanguage(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["language"], (result) => {
      resolve((result.language as string) || "en");
    });
  });
}

export async function setLanguage(lang: string): Promise<void> {
  currentLanguage = lang;
  return new Promise((resolve) => {
    chrome.storage.local.set({ language: lang }, () => {
      document.documentElement.lang = lang;
      applyTranslations();
      resolve();
    });
  });
}

export function t(key: string): string {
  const locale = locales[currentLanguage] || locales.en;
  return locale[key] || locales.en[key] || key;
}

export function applyTranslations(): void {
  const titleKey = document.documentElement.dataset.i18nTitle;
  if (titleKey) {
    document.title = t(titleKey);
  }

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });

  document
    .querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]")
    .forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (key) el.placeholder = t(key);
    });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-title]")
    .forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (key) el.title = t(key);
    });

  const langSelector = document.getElementById(
    "language-selector",
  ) as HTMLSelectElement | null;
  if (langSelector) {
    langSelector.value = currentLanguage;
  }
}
