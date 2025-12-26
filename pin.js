// PIN Manager for Thai TM30 Helper
// Provides PIN-based access control using SHA-256 hashing

const PinManager = {
    MAX_ATTEMPTS: 3,
    DEFAULT_TIMEOUT: 300000, // 5 minutes in milliseconds
    LOCK_TIMEOUT_OPTIONS: [
        { value: 30000, label: '30s' },
        { value: 60000, label: '1m' },
        { value: 120000, label: '2m' },
        { value: 180000, label: '3m' },
        { value: 240000, label: '4m' },
        { value: 300000, label: '5m' },
        { value: 600000, label: '10m' }
    ],
    
    // Hash PIN using SHA-256
    async hashPin(pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // Check if PIN is enabled
    async isPinEnabled() {
        return new Promise(resolve => {
            chrome.storage.local.get(['pinHash'], (result) => {
                resolve(!!result.pinHash);
            });
        });
    },

    // Get lock timeout setting
    async getLockTimeout() {
        return new Promise(resolve => {
            chrome.storage.local.get(['pinLockTimeout'], (result) => {
                resolve(result.pinLockTimeout || this.DEFAULT_TIMEOUT);
            });
        });
    },

    // Set lock timeout setting
    async setLockTimeout(timeout) {
        return new Promise(resolve => {
            chrome.storage.local.set({ pinLockTimeout: timeout }, resolve);
        });
    },

    // Set new PIN
    async setPin(pin) {
        const hash = await this.hashPin(pin);
        return new Promise(resolve => {
            chrome.storage.local.set({ pinHash: hash, pinAttempts: 0 }, resolve);
        });
    },

    // Verify PIN and start session on success
    async verifyPin(pin) {
        const hash = await this.hashPin(pin);
        return new Promise(resolve => {
            chrome.storage.local.get(['pinHash'], (result) => {
                const isValid = result.pinHash === hash;
                if (isValid) {
                    // Reset attempts and start session on success
                    this.startSession();
                    chrome.storage.local.set({ pinAttempts: 0 });
                }
                resolve(isValid);
            });
        });
    },

    // Start unlock session using saved timeout
    async startSession() {
        const timeout = await this.getLockTimeout();
        const expiresAt = Date.now() + timeout;
        return new Promise(resolve => {
            chrome.storage.local.set({ pinSessionExpires: expiresAt }, resolve);
        });
    },

    // Check if session is still valid
    async isSessionValid() {
        return new Promise(resolve => {
            chrome.storage.local.get(['pinSessionExpires'], (result) => {
                if (!result.pinSessionExpires) {
                    resolve(false);
                    return;
                }
                resolve(Date.now() < result.pinSessionExpires);
            });
        });
    },

    // Clear session
    async clearSession() {
        return new Promise(resolve => {
            chrome.storage.local.remove(['pinSessionExpires'], resolve);
        });
    },

    // Get failed attempts count
    async getAttempts() {
        return new Promise(resolve => {
            chrome.storage.local.get(['pinAttempts'], (result) => {
                resolve(result.pinAttempts || 0);
            });
        });
    },

    // Increment failed attempts
    async incrementAttempts() {
        const attempts = await this.getAttempts();
        const newAttempts = attempts + 1;
        return new Promise(resolve => {
            chrome.storage.local.set({ pinAttempts: newAttempts }, () => {
                resolve(newAttempts);
            });
        });
    },

    // Remove PIN (keeping data)
    async removePin() {
        return new Promise(resolve => {
            chrome.storage.local.remove(['pinHash', 'pinAttempts', 'pinSessionExpires'], resolve);
        });
    },

    // Reset all data (PIN + persons + session)
    async resetAll() {
        return new Promise(resolve => {
            chrome.storage.local.remove(['pinHash', 'pinAttempts', 'pinSessionExpires', 'persons'], resolve);
        });
    },

    // Validate PIN format (exactly 4 digits)
    isValidFormat(pin) {
        return /^\d{4}$/.test(pin);
    }
};
