export const PIN_CONFIG = {
  MAX_ATTEMPTS: 3,
  DEFAULT_TIMEOUT: 300000,
  SESSION_CHECK_INTERVAL: 5000,
  SHAKE_ANIMATION_DURATION: 500,
  ACTIVITY_DEBOUNCE_DELAY: 1000,
} as const;

export async function hashPin(
  pin: string,
  existingSalt: string | null = null,
): Promise<{ hash: string; salt: string }> {
  let salt = existingSalt;
  if (!salt) {
    const saltBuffer = new Uint8Array(16);
    crypto.getRandomValues(saltBuffer);
    salt = Array.from(saltBuffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { hash, salt };
}

export async function isPinEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pinHash"], (result) => {
      resolve(!!result.pinHash);
    });
  });
}

export async function getLockTimeout(): Promise<number> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pinLockTimeout"], (result) => {
      resolve(
        (result.pinLockTimeout as number) || PIN_CONFIG.DEFAULT_TIMEOUT,
      );
    });
  });
}

export async function setLockTimeout(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ pinLockTimeout: timeout }, resolve);
  });
}

export async function setPin(pin: string): Promise<void> {
  const { hash, salt } = await hashPin(pin);
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { pinHash: hash, pinSalt: salt, pinAttempts: 0 },
      resolve,
    );
  });
}

export async function verifyPin(pin: string): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["pinHash", "pinSalt"],
      async (result) => {
        if (!result.pinHash || !result.pinSalt) {
          resolve(false);
          return;
        }

        const { hash } = await hashPin(pin, result.pinSalt as string);
        const isValid = result.pinHash === hash;

        if (isValid) {
          await startSession();
          chrome.storage.local.set({ pinAttempts: 0 });
        }
        resolve(isValid);
      },
    );
  });
}

export async function startSession(): Promise<void> {
  const timeout = await getLockTimeout();
  const expiresAt = Date.now() + timeout;
  return new Promise((resolve) => {
    chrome.storage.local.set({ pinSessionExpires: expiresAt }, resolve);
  });
}

export async function isSessionValid(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pinSessionExpires"], (result) => {
      if (!result.pinSessionExpires) {
        resolve(false);
        return;
      }
      resolve(Date.now() < (result.pinSessionExpires as number));
    });
  });
}

export async function clearSession(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(["pinSessionExpires"], resolve);
  });
}

export async function getAttempts(): Promise<number> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pinAttempts"], (result) => {
      resolve((result.pinAttempts as number) || 0);
    });
  });
}

export async function incrementAttempts(): Promise<number> {
  const attempts = await getAttempts();
  const newAttempts = attempts + 1;
  return new Promise((resolve) => {
    chrome.storage.local.set({ pinAttempts: newAttempts }, () => {
      resolve(newAttempts);
    });
  });
}

export async function removePin(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(
      ["pinHash", "pinSalt", "pinAttempts", "pinSessionExpires"],
      resolve,
    );
  });
}

export async function resetAll(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(
      [
        "pinHash",
        "pinSalt",
        "pinAttempts",
        "pinSessionExpires",
        "persons",
      ],
      resolve,
    );
  });
}

export function isValidFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

// PIN UI Helpers

export function getPinFromDigits(container: HTMLElement): string {
  const inputs =
    container.querySelectorAll<HTMLInputElement>(".PinDigits__Input");
  return Array.from(inputs)
    .map((i) => i.value)
    .join("");
}

export function clearDigits(container: HTMLElement): void {
  const inputs =
    container.querySelectorAll<HTMLInputElement>(".PinDigits__Input");
  inputs.forEach((i) => {
    i.value = "";
    i.classList.remove("PinDigits__Input_filled");
  });
}

interface DigitInputOptions {
  onComplete?: (pin?: string) => void | Promise<void>;
  autoSubmit?: boolean;
}

export function setupDigitInputs(
  container: HTMLElement,
  { onComplete, autoSubmit = false }: DigitInputOptions = {},
): void {
  const inputs =
    container.querySelectorAll<HTMLInputElement>(".PinDigits__Input");

  inputs.forEach((input, index) => {
    input.addEventListener("input", async (e) => {
      const target = e.target as HTMLInputElement;
      const value = target.value.replace(/\D/g, "");
      target.value = value.slice(0, 1);

      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else if (
        value &&
        index === inputs.length - 1 &&
        onComplete &&
        !autoSubmit
      ) {
        onComplete();
      }

      target.classList.toggle("PinDigits__Input_filled", !!value);

      if (autoSubmit) {
        const pin = getPinFromDigits(container);
        if (pin.length === 4 && onComplete) {
          await onComplete(pin);
        }
      }
    });

    input.addEventListener("keydown", (e) => {
      const target = e.target as HTMLInputElement;
      if (e.key === "Backspace" && !target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = e.clipboardData?.getData("text") ?? "";
      const digits = paste.replace(/\D/g, "").slice(0, 4);
      digits.split("").forEach((digit: string, i: number) => {
        if (inputs[i]) {
          inputs[i].value = digit;
          inputs[i].classList.add("PinDigits__Input_filled");
        }
      });
      if (digits.length === 4 && onComplete) {
        if (autoSubmit) {
          onComplete(digits);
        } else {
          onComplete();
        }
      } else if (digits.length > 0 && !autoSubmit) {
        inputs[Math.min(digits.length, inputs.length - 1)].focus();
      }
    });
  });
}

export function focusFirst(container: HTMLElement): void {
  const input = container.querySelector<HTMLInputElement>(".PinDigits__Input");
  if (input) input.focus();
}

export function disableInputs(container: HTMLElement): void {
  const inputs =
    container.querySelectorAll<HTMLInputElement>(".PinDigits__Input");
  inputs.forEach((i) => (i.disabled = true));
}

export function shake(container: HTMLElement): void {
  container.classList.add("PinLock__Input_shake");
  setTimeout(() => {
    container.classList.remove("PinLock__Input_shake");
  }, PIN_CONFIG.SHAKE_ANIMATION_DURATION);
}
