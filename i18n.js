// Internationalization module for TM30 Helper

const I18n = {
    currentLanguage: 'en',
    locales: {
        en: typeof LOCALE_EN !== 'undefined' ? LOCALE_EN : {},
        th: typeof LOCALE_TH !== 'undefined' ? LOCALE_TH : {}
    },

    async init() {
        this.currentLanguage = await this.getLanguage();
        this.applyTranslations();
    },

    async getLanguage() {
        return new Promise(resolve => {
            chrome.storage.local.get(['language'], (result) => {
                resolve(result.language || 'en');
            });
        });
    },

    async setLanguage(lang) {
        this.currentLanguage = lang;
        return new Promise(resolve => {
            chrome.storage.local.set({ language: lang }, () => {
                this.applyTranslations();
                resolve();
            });
        });
    },

    t(key) {
        const locale = this.locales[this.currentLanguage] || this.locales.en;
        return locale[key] || this.locales.en[key] || key;
    },

    applyTranslations() {
        // Update page title
        const titleKey = document.documentElement.dataset.i18nTitle;
        if (titleKey) {
            document.title = this.t(titleKey);
        }

        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = this.t(key);
        });

        // Update elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = this.t(key);
        });

        // Update elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.dataset.i18nTitle;
            el.title = this.t(key);
        });

        // Update language selector if present
        const langSelector = document.getElementById('language-selector');
        if (langSelector) {
            langSelector.value = this.currentLanguage;
        }
    }
};
