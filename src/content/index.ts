import { isFillFormMessage } from "../shared/messages.js";
import type { Person } from "../shared/storage.js";

console.log(
  "%c TM30 Helper Content Script v3.0 Loaded 🫡 ",
  "background: #333; color: #fff; padding: 2px 5px; border-radius: 3px;",
);

const MICRO_DELAY = 50;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scanFormControls(): void {
  const controls = Array.from(
    document.querySelectorAll("[formcontrolname]"),
  ).map((el) => el.getAttribute("formcontrolname"));
  if (controls.length > 0) {
    console.log("TM30 Helper: Detected FormControls:", controls);
  }
}

scanFormControls();

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      scanFormControls();
      break;
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

window.addEventListener("popstate", scanFormControls);

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (isFillFormMessage(request)) {
    fillTM30Form(request.person);
    sendResponse({ status: "received" });
  }
  return true;
});

async function fillTM30Form(person: Person): Promise<void> {
  console.log("TM30 Helper: Starting instant fill for", person.firstName);
  const [d, m, y] = (person.birthDate || "").split("/");
  const [ciD, ciM, ciY] = (person.checkInDate || "").split("/");
  const [coD, coM, coY] = (person.checkOutDate || "").split("/");

  selectAddress();

  const textFields = [
    {
      name: "First Name",
      val: person.firstName,
      selectors: ['input[formcontrolname="firstName"]'],
    },
    {
      name: "Last Name",
      val: person.lastName,
      selectors: [
        'input[formcontrolname="familyName"]',
        'input[formcontrolname="lastName"]',
      ],
    },
    {
      name: "Passport No.",
      val: person.passportNo,
      selectors: ['input[formcontrolname="passportNo"]'],
    },
    {
      name: "Birth Day",
      val: d,
      selectors: ['input[formcontrolname="dayOfBirth"]'],
    },
    {
      name: "Birth Month",
      val: m,
      selectors: ['input[formcontrolname="monthOfBirth"]'],
    },
    {
      name: "Birth Year",
      val: y,
      selectors: ['input[formcontrolname="yearOfBirth"]'],
    },
    {
      name: "Phone No.",
      val: person.phoneNo,
      selectors: ['input[formcontrolname="phoneNo"]'],
    },
    {
      name: "Check-in Day",
      val: ciD,
      selectors: ['input[formcontrolname="dayOfCheckIn"]'],
    },
    {
      name: "Check-in Month",
      val: ciM,
      selectors: ['input[formcontrolname="monthOfCheckIn"]'],
    },
    {
      name: "Check-in Year",
      val: ciY,
      selectors: ['input[formcontrolname="yearOfCheckIn"]'],
    },
    {
      name: "Check-out Date",
      val: person.checkOutDate,
      selectors: [
        '[sit-element-group="datepicker-check-out"] input',
        'input[formcontrolname="checkOutDate"]',
      ],
    },
  ];

  for (const field of textFields) {
    const el = findElement(field.selectors);
    if (el) {
      setNativeValue(el as HTMLInputElement, field.val);
      console.log(
        `TM30 Helper: ✓ Filled "${field.name}" with "${field.val}"`,
      );
    } else if (field.val) {
      console.warn(
        `TM30 Helper: ✗ Field "${field.name}" NOT FOUND. Tried selectors:`,
        field.selectors,
      );
    }
  }

  const genderEl = findElement(['mat-select[formcontrolname="genderCode"]']);
  if (genderEl) {
    setSelectValue(genderEl, person.gender === "M" ? "Male" : "Female");
  }

  await delay(MICRO_DELAY);
  const nationEl = findElement([
    'input[formcontrolname="key"]',
    'input[formcontrolname="nationality"]',
    'input[formcontrolname="nationalityKey"]',
    "input[matautocomplete]",
    'input[aria-autocomplete="list"]',
  ]);
  if (nationEl) {
    console.log("TM30 Helper: Filling Nationality");
    const searchValue = person.nationalityCode;
    if (searchValue) {
      await setAutocompleteValue(nationEl as HTMLInputElement, searchValue);
    } else {
      console.warn("TM30 Helper: No nationalityCode provided!");
    }
  } else {
    console.warn("TM30 Helper: Nationality field not found!");
  }

  console.log("TM30 Helper: Instant fill complete ✓");
}

function selectAddress(): void {
  console.log("TM30 Helper: Selecting address...");

  const radio =
    document.querySelector(
      'mat-radio-button[sit-element="address-radio"]',
    ) ||
    document.querySelector(
      ".style-list-address-cont mat-radio-button",
    ) ||
    document.querySelector("mat-radio-button");

  if (radio) {
    (radio as HTMLElement).click();

    const label = radio.querySelector("label");
    if (label) label.click();

    const input = radio.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement | null;
    if (input) {
      input.click();
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    console.log("TM30 Helper: Address selected ✓");
  } else {
    console.warn("TM30 Helper: Could not find address radio button!");
  }
}

function findElement(selectors: string[]): Element | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function setNativeValue(element: HTMLInputElement, value: string): void {
  const lastValue = element.value;
  element.value = value;

  const tracker = (element as any)._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }

  let proto: any = element;
  while (proto && !Object.getOwnPropertyDescriptor(proto, "value")) {
    proto = Object.getPrototypeOf(proto);
  }

  if (proto) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && descriptor.set) {
      descriptor.set.call(element, value);
    }
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

function setSelectValue(el: Element, value: string): void {
  (el as HTMLElement).click();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const options = Array.from(document.querySelectorAll("mat-option"));
      const option =
        options.find((opt) =>
          opt.textContent?.toLowerCase().includes(value.toLowerCase()),
        ) ||
        options.find(
          (opt) =>
            opt.textContent?.includes("Male") ||
            opt.textContent?.includes("Female"),
        );
      if (option) (option as HTMLElement).click();
    });
  });
}

async function setAutocompleteValue(
  el: HTMLInputElement,
  value: string,
): Promise<void> {
  el.focus();
  el.click();

  setNativeValue(el, "");

  console.log(`TM30 Helper: Typing nationality code: ${value}`);

  for (const char of value) {
    try {
      document.execCommand("insertText", false, char);
    } catch {
      const currentValue = el.value;
      setNativeValue(el, currentValue + char);
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    await delay(50);
  }

  el.dispatchEvent(
    new KeyboardEvent("keydown", { key: "a", bubbles: true }),
  );

  console.log("TM30 Helper: Waiting for options...");

  const optionSelectors = [
    "mat-option",
    ".mat-autocomplete-panel mat-option",
    ".mat-mdc-option",
  ];

  const startTime = Date.now();
  let options: Element[] = [];

  while (Date.now() - startTime < 3000) {
    options = Array.from(
      document.querySelectorAll(optionSelectors.join(", ")),
    );
    if (options.length > 0) {
      console.log(`TM30 Helper: Found ${options.length} options`);

      const normalizedValue = value.toUpperCase();
      const option =
        options.find((opt) =>
          (opt as HTMLElement).innerText
            .toUpperCase()
            .startsWith(normalizedValue),
        ) ||
        options.find((opt) =>
          (opt as HTMLElement).innerText
            .toUpperCase()
            .includes(normalizedValue),
        );

      if (option) {
        console.log(
          "TM30 Helper: Clicking option:",
          (option as HTMLElement).innerText,
        );
        (option as HTMLElement).click();
        await delay(200);
        el.dispatchEvent(new Event("blur", { bubbles: true }));
        return;
      }
    }
    await delay(100);
  }

  if (options.length > 0) {
    console.warn(
      "TM30 Helper: Timeout waiting for exact match, picking first option",
    );
    (options[0] as HTMLElement).click();
    await delay(200);
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  } else {
    console.error("TM30 Helper: No nationality options appeared!");
  }
}
