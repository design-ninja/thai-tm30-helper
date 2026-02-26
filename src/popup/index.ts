import * as I18n from "../shared/i18n.js";
import * as Storage from "../shared/storage.js";
import * as Pin from "../shared/pin.js";
import type { Person } from "../shared/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  await I18n.init();

  const pinLock = document.getElementById("pin-lock")!;
  const mainContent = document.getElementById("main-content")!;
  const pinLockDigits = document.getElementById("pin-lock-digits")!;
  const pinError = document.getElementById("pin-error")!;
  const pinAttempts = document.getElementById("pin-attempts")!;
  const pinResetBtn = document.getElementById("pin-reset-btn")!;
  const personList = document.getElementById("person-list")!;
  const openOptions = document.getElementById("open-options")!;

  const pinEnabled = await Pin.isPinEnabled();
  const sessionValid = await Pin.isSessionValid();

  if (pinEnabled && !sessionValid) {
    pinLock.style.display = "flex";
    mainContent.style.display = "none";

    Pin.setupDigitInputs(pinLockDigits, {
      autoSubmit: true,
      onComplete: async (pin) => {
        const isValid = await Pin.verifyPin(pin!);

        if (isValid) {
          pinLock.style.display = "none";
          mainContent.style.display = "block";
          await loadProfiles();
        } else {
          const attempts = await Pin.incrementAttempts();
          Pin.clearDigits(pinLockDigits);
          pinError.style.display = "block";
          updateAttemptsDisplay(attempts);
          Pin.shake(pinLockDigits);
          Pin.focusFirst(pinLockDigits);
        }
      },
    });

    Pin.focusFirst(pinLockDigits);

    const attempts = await Pin.getAttempts();
    updateAttemptsDisplay(attempts);
  } else {
    pinLock.style.display = "none";
    mainContent.style.display = "block";
    await loadProfiles();
  }

  function updateAttemptsDisplay(attempts: number): void {
    const remaining = Pin.PIN_CONFIG.MAX_ATTEMPTS - attempts;

    if (attempts > 0 && remaining > 0) {
      pinAttempts.textContent = I18n.t("pin.attemptsLeft").replace(
        "{count}",
        String(remaining),
      );
      pinAttempts.style.display = "block";
    }

    if (attempts >= Pin.PIN_CONFIG.MAX_ATTEMPTS) {
      pinResetBtn.style.display = "block";
      Pin.disableInputs(pinLockDigits);
    }
  }

  pinResetBtn.addEventListener("click", async () => {
    if (confirm(I18n.t("pin.resetConfirm"))) {
      await Pin.resetAll();
      alert(I18n.t("pin.resetSuccess"));
      pinLock.style.display = "none";
      mainContent.style.display = "block";
      await loadProfiles();
    }
  });

  async function loadProfiles(): Promise<void> {
    const persons = await Storage.getPersons();

    if (persons.length === 0) {
      personList.innerHTML = "";
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "EmptyState";
      emptyDiv.textContent = I18n.t("popup.emptyState");
      const addBtn = document.createElement("button");
      addBtn.className = "EmptyState__Btn";
      addBtn.id = "add-profiles-btn";
      addBtn.textContent = I18n.t("popup.addProfiles");
      emptyDiv.appendChild(addBtn);
      personList.appendChild(emptyDiv);
      openOptions.style.display = "none";

      document
        .getElementById("add-profiles-btn")!
        .addEventListener("click", () => {
          chrome.runtime.openOptionsPage();
        });
    } else {
      personList.innerHTML = "";
      openOptions.style.display = "block";
      persons.forEach((person) => {
        const item = document.createElement("div");
        item.className = "Popup__PersonItem";

        const info = document.createElement("div");
        info.className = "Popup__PersonInfo";

        const name = document.createElement("span");
        name.className = "Popup__PersonName";
        name.textContent = `${person.firstName} ${person.lastName}`;

        const details = document.createElement("span");
        details.className = "Popup__PersonDetails";
        details.textContent = `${person.passportNo} | ${person.nationality}`;

        info.appendChild(name);
        info.appendChild(details);

        info.addEventListener("click", () => {
          fillForm(person);
        });

        const editBtn = document.createElement("button");
        editBtn.className = "Popup__BtnEdit";
        editBtn.title = I18n.t("popup.editProfile");
        editBtn.textContent = "✏️";
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          chrome.tabs.create({ url: `options.html?edit=${person.id}` });
        });

        item.appendChild(info);
        item.appendChild(editBtn);
        personList.appendChild(item);
      });
    }
  }

  const fillForm = (person: Person): void => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = tabs[0].url;
        if (!url || !url.startsWith("https://tm30.immigration.go.th/")) {
          alert(I18n.t("popup.error.wrongUrl"));
          return;
        }

        chrome.tabs.sendMessage(
          tabs[0].id!,
          { action: "FILL_FORM", person },
          (response) => {
            if (chrome.runtime.lastError) {
              alert(I18n.t("popup.error.refresh"));
            } else {
              window.close();
            }
          },
        );
      }
    });
  };

  openOptions.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  document.getElementById("leave-review")!.addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://chromewebstore.google.com/detail/thai-tm30-helper/dodmpjhindfijnojfiikocaklabohlac/reviews",
    });
  });

  document.getElementById("buy-coffee")!.addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://www.buymeacoffee.com/design_ninja",
    });
  });

  document
    .getElementById("author-link")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: "https://lirik.pro/en" });
    });
});
