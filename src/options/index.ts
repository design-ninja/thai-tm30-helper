import * as I18n from "../shared/i18n.js";
import * as Storage from "../shared/storage.js";
import * as Pin from "../shared/pin.js";
import {
  NATIONALITIES,
  searchNationalities,
} from "../shared/nationalities.js";
import type { Nationality } from "../shared/nationalities.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as XLSX from "xlsx";

dayjs.extend(utc);

document.addEventListener("DOMContentLoaded", async () => {
  await I18n.init();

  // Consent Modal
  const consentModal = document.getElementById("consent-modal")!;
  const consentAcceptBtn = document.getElementById("consent-accept-btn")!;

  const checkConsent = (): Promise<boolean> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["consentAccepted"], (result) => {
        resolve(result.consentAccepted === true);
      });
    });
  };

  const saveConsent = (): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ consentAccepted: true }, resolve);
    });
  };

  const consentAccepted = await checkConsent();
  if (!consentAccepted) {
    consentModal.style.display = "flex";

    const consentLangSelector = document.getElementById(
      "consent-language-selector",
    ) as HTMLSelectElement;
    consentLangSelector.value = I18n.getCurrentLanguage();
    consentLangSelector.addEventListener("change", async (e) => {
      await I18n.setLanguage((e.target as HTMLSelectElement).value);
    });

    await new Promise<void>((resolve) => {
      consentAcceptBtn.addEventListener("click", async () => {
        await saveConsent();
        consentModal.style.display = "none";
        resolve();
      });
    });
  }

  // PIN Lock Elements
  const pinLock = document.getElementById("pin-lock")!;
  const mainContent = document.getElementById("main-content")!;
  const pinError = document.getElementById("pin-error")!;
  const pinAttempts = document.getElementById("pin-attempts")!;
  const pinResetBtn = document.getElementById("pin-reset-btn")!;

  // Security Settings Elements
  const pinSetup = document.getElementById("pin-setup")!;
  const pinManage = document.getElementById("pin-manage")!;
  const newPinDigits = document.getElementById("new-pin-digits")!;
  const confirmPinDigits = document.getElementById("confirm-pin-digits")!;
  const setPinBtn = document.getElementById("set-pin-btn")!;
  const changePinBtn = document.getElementById("change-pin-btn")!;
  const removePinBtn = document.getElementById("remove-pin-btn")!;

  if (newPinDigits) {
    Pin.setupDigitInputs(newPinDigits, {
      onComplete: () => {
        if (confirmPinDigits) {
          Pin.focusFirst(confirmPinDigits);
        }
      },
    });
  }
  if (confirmPinDigits) {
    Pin.setupDigitInputs(confirmPinDigits);
  }

  const pinEnabled = await Pin.isPinEnabled();
  const sessionValid = await Pin.isSessionValid();
  const pinLockDigits = document.getElementById("pin-lock-digits")!;

  if (pinLockDigits) {
    Pin.setupDigitInputs(pinLockDigits, {
      autoSubmit: true,
      onComplete: async (pin) => {
        const isValid = await Pin.verifyPin(pin!);

        if (isValid) {
          pinLock.style.display = "none";
          mainContent.style.display = "block";
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
  }

  if (pinEnabled && !sessionValid) {
    pinLock.style.display = "flex";
    mainContent.style.display = "none";
    Pin.focusFirst(pinLockDigits);
    const attempts = await Pin.getAttempts();
    updateAttemptsDisplay(attempts);
  } else {
    pinLock.style.display = "none";
    mainContent.style.display = "block";
  }

  // Activity-based session management
  if (pinEnabled) {
    let sessionCheckInterval: ReturnType<typeof setInterval>;
    let activityDebounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const extendSession = (): void => {
      if (activityDebounceTimeout) return;
      activityDebounceTimeout = setTimeout(() => {
        if (mainContent.style.display !== "none") {
          Pin.startSession();
        }
        activityDebounceTimeout = null;
      }, Pin.PIN_CONFIG.ACTIVITY_DEBOUNCE_DELAY);
    };

    (["click", "keydown", "input", "scroll", "mousemove"] as const).forEach(
      (event) => {
        document.addEventListener(event, extendSession, { passive: true });
      },
    );

    sessionCheckInterval = setInterval(async () => {
      const stillValid = await Pin.isSessionValid();
      if (!stillValid && mainContent.style.display !== "none") {
        pinLock.style.display = "flex";
        mainContent.style.display = "none";
        Pin.clearDigits(pinLockDigits);
        pinError.style.display = "none";
        Pin.focusFirst(pinLockDigits);
      }
    }, Pin.PIN_CONFIG.SESSION_CHECK_INTERVAL);

    window.addEventListener("beforeunload", () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
      if (activityDebounceTimeout) {
        clearTimeout(activityDebounceTimeout);
      }
    });
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

  const lockTimeoutSelect = document.getElementById(
    "lock-timeout-select",
  ) as HTMLSelectElement;
  const pinStatusBadge = document.getElementById("pin-status-badge")!;

  async function updateSecurityUI(): Promise<void> {
    const enabled = await Pin.isPinEnabled();
    if (enabled) {
      pinSetup.style.display = "none";
      pinManage.style.display = "block";
      pinStatusBadge.className = "Options__Badge Options__Badge_enabled";
      pinStatusBadge.textContent = I18n.t(
        "options.security.badgeEnabled",
      );
      const currentTimeout = await Pin.getLockTimeout();
      lockTimeoutSelect.value = currentTimeout.toString();
    } else {
      pinSetup.style.display = "block";
      pinManage.style.display = "none";
      pinStatusBadge.className = "Options__Badge Options__Badge_disabled";
      pinStatusBadge.textContent = I18n.t(
        "options.security.badgeNotSet",
      );
    }
  }
  updateSecurityUI();

  lockTimeoutSelect.addEventListener("change", async (e) => {
    const timeout = parseInt((e.target as HTMLSelectElement).value, 10);
    await Pin.setLockTimeout(timeout);
  });

  const languageSelector = document.getElementById(
    "language-selector",
  ) as HTMLSelectElement | null;
  if (languageSelector) {
    languageSelector.value = I18n.getCurrentLanguage();
    languageSelector.addEventListener("change", async (e) => {
      await I18n.setLanguage((e.target as HTMLSelectElement).value);
    });
  }

  pinResetBtn.addEventListener("click", async () => {
    if (confirm(I18n.t("pin.resetConfirm"))) {
      await Pin.resetAll();
      alert(I18n.t("pin.resetSuccess"));
      pinLock.style.display = "none";
      mainContent.style.display = "block";
      updateSecurityUI();
      loadPersons();
    }
  });

  setPinBtn.addEventListener("click", async () => {
    const newPin = Pin.getPinFromDigits(newPinDigits);
    const confirmPin = Pin.getPinFromDigits(confirmPinDigits);

    if (!Pin.isValidFormat(newPin)) {
      alert(I18n.t("options.security.pinInvalid"));
      return;
    }

    if (newPin !== confirmPin) {
      alert(I18n.t("options.security.pinMismatch"));
      return;
    }

    await Pin.setPin(newPin);
    alert(I18n.t("options.security.pinSet"));
    Pin.clearDigits(newPinDigits);
    Pin.clearDigits(confirmPinDigits);
    updateSecurityUI();
  });

  changePinBtn.addEventListener("click", async () => {
    const currentPin = prompt(I18n.t("options.security.currentPin"));
    if (!currentPin) return;

    const isValid = await Pin.verifyPin(currentPin);
    if (!isValid) {
      alert(I18n.t("options.security.wrongPin"));
      return;
    }

    const newPin = prompt(I18n.t("options.security.newPin"));
    if (!newPin || !Pin.isValidFormat(newPin)) {
      alert(I18n.t("options.security.pinInvalid"));
      return;
    }

    const confirmPin = prompt(I18n.t("options.security.confirmPin"));
    if (newPin !== confirmPin) {
      alert(I18n.t("options.security.pinMismatch"));
      return;
    }

    await Pin.setPin(newPin);
    alert(I18n.t("options.security.pinChanged"));
  });

  removePinBtn.addEventListener("click", async () => {
    const currentPin = prompt(I18n.t("options.security.currentPin"));
    if (!currentPin) return;

    const isValid = await Pin.verifyPin(currentPin);
    if (!isValid) {
      alert(I18n.t("options.security.wrongPin"));
      return;
    }

    await Pin.removePin();
    alert(I18n.t("options.security.pinRemoved"));
    updateSecurityUI();
  });

  // Form Elements
  const form = document.getElementById("person-form") as HTMLFormElement;
  const personList = document.getElementById("person-list")!;
  const personIdInput = document.getElementById(
    "personId",
  ) as HTMLInputElement;
  const submitBtn = document.getElementById("submit-btn")!;
  const cancelEditBtn = document.getElementById("cancel-edit")!;
  const formTitle = document.getElementById("form-title")!;

  // Date auto-formatting
  const setupDateAutoFormat = (inputId: string): void => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      let value = target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
      }
      if (value.length >= 5) {
        value = value.slice(0, 5) + "/" + value.slice(5);
      }
      target.value = value.slice(0, 10);
    });
  };

  setupDateAutoFormat("birthDate");
  setupDateAutoFormat("checkInDate");
  setupDateAutoFormat("checkOutDate");

  // Nationality Autocomplete
  const nationalityInput = document.getElementById(
    "nationality",
  ) as HTMLInputElement;
  const nationalityCodeInput = document.getElementById(
    "nationalityCode",
  ) as HTMLInputElement;
  const nationalityDropdown = document.getElementById(
    "nationality-dropdown",
  )!;
  let activeIndex = -1;
  let currentResults: Nationality[] = [];

  const showDropdown = (): void => {
    nationalityDropdown.classList.add(
      "Options__AutocompleteDropdown_visible",
    );
  };

  const hideDropdown = (): void => {
    nationalityDropdown.classList.remove(
      "Options__AutocompleteDropdown_visible",
    );
    activeIndex = -1;
  };

  const renderDropdown = (results: Nationality[]): void => {
    currentResults = results;
    nationalityDropdown.innerHTML = "";

    if (results.length === 0) {
      const empty = document.createElement("div");
      empty.className = "Options__AutocompleteEmpty";
      empty.textContent = I18n.t("options.noNationality");
      nationalityDropdown.appendChild(empty);
      return;
    }

    results.forEach((item, index) => {
      const option = document.createElement("div");
      option.className = "Options__AutocompleteItem";
      if (nationalityCodeInput.value === item.code) {
        option.classList.add("Options__AutocompleteItem_selected");
      }
      if (index === activeIndex) {
        option.classList.add("Options__AutocompleteItem_active");
      }

      const codeSpan = document.createElement("span");
      codeSpan.className = "Options__AutocompleteCode";
      codeSpan.textContent = item.code;

      const nameSpan = document.createElement("span");
      nameSpan.className = "Options__AutocompleteName";
      nameSpan.textContent = item.name;

      option.appendChild(codeSpan);
      option.appendChild(nameSpan);

      option.addEventListener("mousedown", (e) => {
        e.preventDefault();
        selectNationality(item);
      });

      nationalityDropdown.appendChild(option);
    });
  };

  const selectNationality = (item: Nationality): void => {
    nationalityInput.value = `${item.code} : ${item.name}`;
    nationalityCodeInput.value = item.code;
    hideDropdown();
  };

  nationalityInput.addEventListener("focus", () => {
    const query = nationalityInput.value;
    const results = searchNationalities(query);
    renderDropdown(results);
    showDropdown();
  });

  nationalityInput.addEventListener("input", () => {
    activeIndex = -1;
    const query = nationalityInput.value;
    const results = searchNationalities(query);
    renderDropdown(results);
    showDropdown();
    nationalityCodeInput.value = "";
  });

  nationalityInput.addEventListener("blur", () => {
    setTimeout(hideDropdown, 150);
  });

  nationalityInput.addEventListener("keydown", (e) => {
    if (
      !nationalityDropdown.classList.contains(
        "Options__AutocompleteDropdown_visible",
      )
    )
      return;

    const items = nationalityDropdown.querySelectorAll(
      ".Options__AutocompleteItem",
    );
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      renderDropdown(currentResults);
      items[activeIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderDropdown(currentResults);
      items[activeIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && currentResults[activeIndex]) {
        selectNationality(currentResults[activeIndex]);
      } else if (currentResults.length > 0) {
        selectNationality(currentResults[0]);
      }
    } else if (e.key === "Escape") {
      hideDropdown();
    }
  });

  // Profile CRUD
  const loadPersons = async (): Promise<void> => {
    const persons = await Storage.getPersons();
    renderPersons(persons);
  };

  const savePerson = async (
    person: Omit<Storage.Person, "id">,
  ): Promise<void> => {
    const existingId = personIdInput.value || null;
    await Storage.savePerson(person, existingId);
    resetForm();
    loadPersons();
  };

  const editPerson = async (id: string): Promise<void> => {
    const person = await Storage.getPersonById(id);
    if (person) {
      personIdInput.value = person.id;
      (document.getElementById("firstName") as HTMLInputElement).value =
        person.firstName;
      (document.getElementById("lastName") as HTMLInputElement).value =
        person.lastName;
      (document.getElementById("passportNo") as HTMLInputElement).value =
        person.passportNo;

      const nationality = NATIONALITIES.find(
        (n) => n.code === person.nationalityCode,
      );
      if (nationality) {
        nationalityInput.value = `${nationality.code} : ${nationality.name}`;
        nationalityCodeInput.value = nationality.code;
      } else {
        nationalityInput.value = person.nationality || "";
        nationalityCodeInput.value = person.nationalityCode || "";
      }

      (document.getElementById("gender") as HTMLSelectElement).value =
        person.gender;
      (document.getElementById("birthDate") as HTMLInputElement).value =
        person.birthDate;
      (document.getElementById("phoneNo") as HTMLInputElement).value =
        person.phoneNo || "";
      (document.getElementById("checkInDate") as HTMLInputElement).value =
        person.checkInDate || "";
      (document.getElementById("checkOutDate") as HTMLInputElement).value =
        person.checkOutDate || "";

      formTitle.textContent = I18n.t("options.formTitle.edit");
      submitBtn.textContent = I18n.t("options.btn.update");
      cancelEditBtn.style.display = "inline-block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetForm = (): void => {
    form.reset();
    personIdInput.value = "";
    nationalityCodeInput.value = "";
    formTitle.textContent = I18n.t("options.formTitle.add");
    submitBtn.textContent = I18n.t("options.btn.save");
    cancelEditBtn.style.display = "none";
  };

  const deletePerson = async (id: string): Promise<void> => {
    if (!confirm(I18n.t("options.confirm.delete"))) return;
    await Storage.deletePerson(id);

    if (personIdInput.value == id) {
      resetForm();
    }

    loadPersons();
  };

  const renderPersons = (persons: Storage.Person[]): void => {
    if (persons.length === 0) {
      personList.innerHTML = `<p class="EmptyState">${I18n.t("options.emptyState")}</p>`;
      return;
    }

    personList.innerHTML = "";
    persons.forEach((person) => {
      const card = document.createElement("div");
      card.className = "Options__PersonCard";

      const info = document.createElement("div");
      info.className = "Options__PersonInfo";

      const name = document.createElement("h3");
      name.textContent = `${person.firstName} ${person.lastName}`;

      const details = document.createElement("p");
      details.textContent = `Passport: ${person.passportNo} | Nationality: ${person.nationality}`;

      info.appendChild(name);
      info.appendChild(details);

      const actions = document.createElement("div");
      actions.className = "Options__PersonActions";

      const editBtn = document.createElement("button");
      editBtn.className = "Options__BtnEdit";
      editBtn.textContent = I18n.t("options.btn.edit");
      editBtn.addEventListener("click", () => editPerson(person.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "Options__BtnDelete";
      deleteBtn.textContent = I18n.t("options.btn.delete");
      deleteBtn.addEventListener("click", () => deletePerson(person.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      card.appendChild(info);
      card.appendChild(actions);
      personList.appendChild(card);
    });
  };

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const birthDate = (
      document.getElementById("birthDate") as HTMLInputElement
    ).value;
    const birthDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    if (birthDate && !birthDateRegex.test(birthDate)) {
      alert(I18n.t("options.alert.birthDateFormat"));
      return;
    }

    if (!nationalityCodeInput.value) {
      alert(I18n.t("options.alert.selectNationality"));
      nationalityInput.focus();
      return;
    }

    const formData = {
      firstName: (document.getElementById("firstName") as HTMLInputElement)
        .value,
      lastName: (document.getElementById("lastName") as HTMLInputElement)
        .value,
      passportNo: (
        document.getElementById("passportNo") as HTMLInputElement
      ).value,
      nationality: nationalityInput.value,
      nationalityCode: nationalityCodeInput.value,
      gender: (document.getElementById("gender") as HTMLSelectElement).value,
      birthDate,
      phoneNo: (document.getElementById("phoneNo") as HTMLInputElement)
        .value,
      checkInDate:
        (document.getElementById("checkInDate") as HTMLInputElement).value ||
        "",
      checkOutDate:
        (document.getElementById("checkOutDate") as HTMLInputElement)
          .value || "",
    };
    await savePerson(formData);
  });

  // Excel Import/Export
  const exportExcelBtn = document.getElementById("export-excel-btn")!;
  const importExcelBtn = document.getElementById("import-excel-btn")!;
  const importFileInput = document.getElementById(
    "import-file-input",
  ) as HTMLInputElement;

  const EXCEL_HEADERS = [
    "ชื่อ\nFirst Name *",
    "ชื่อกลาง\nMiddle Name",
    "นามสกุล\nLast Name",
    "เพศ\nGender *",
    "เลขหนังสือเดินทาง\nPassport No. *",
    "สัญชาติ\nNationality *",
    "วัน เดือน ปี เกิด\nBirth Date\nDD/MM/YYYY(ค.ศ. / A.D.) \nเช่น 17/06/1985 หรือ 10/00/1985 หรือ 00/00/1985",
    "วันที่แจ้งออกจากที่พัก\nCheck-out Date\nDD/MM/YYYY(ค.ศ. / A.D.) \nเช่น 14/06/2023",
    "เบอร์โทรศัพท์\nPhone No.",
  ];

  exportExcelBtn.addEventListener("click", async () => {
    const persons = await Storage.getPersons();

    if (persons.length === 0) {
      alert(I18n.t("options.alert.noProfiles"));
      return;
    }

    const wb = XLSX.utils.book_new();

    const mainData: (string | number)[][] = [EXCEL_HEADERS];
    persons.forEach((person) => {
      mainData.push([
        person.firstName || "",
        "",
        person.lastName || "",
        person.gender || "",
        person.passportNo || "",
        person.nationalityCode || "",
        person.birthDate || "",
        person.checkOutDate || "",
        person.phoneNo || "",
      ]);
    });
    const ws1 = XLSX.utils.aoa_to_sheet(mainData);
    ws1["!cols"] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 18 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "แบบแจ้งที่พัก Inform Accom");

    const nationalityData: string[][] = [
      ["", "icao", "สัญชาติ(ไทย)", "สัญชาติ(อังกฤษ)"],
    ];
    NATIONALITIES.forEach((n) => {
      nationalityData.push(["", n.code, "", n.name]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(nationalityData);
    XLSX.utils.book_append_sheet(wb, ws2, "สัญชาติ Nationality");

    const genderData = [
      ["", "GENDER CODE\nรหัสเพศ", "SEX\nเพศ"],
      ["", "M", "ชาย"],
      ["", "F", "หญิง"],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(genderData);
    XLSX.utils.book_append_sheet(wb, ws3, "เพศ Gender ");

    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `TM30-Profiles-${today}.xlsx`);
    alert(I18n.t("options.alert.exportSuccess"));
  });

  importExcelBtn.addEventListener("click", () => {
    importFileInput.click();
  });

  importFileInput.addEventListener("change", async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);

      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
        header: 1,
      }) as unknown[][];

      const dataRows = rows
        .slice(1)
        .filter(
          (row) => row[0] && (row[0] as string).toString().trim(),
        );

      if (dataRows.length === 0) {
        alert(I18n.t("options.alert.emptySheet"));
        importFileInput.value = "";
        return;
      }

      const parseExcelDate = (value: unknown): string => {
        if (!value) return "";

        let dateObj: dayjs.Dayjs;

        if (typeof value === "number") {
          dateObj = dayjs(
            new Date(Math.round((value - 25569) * 86400 * 1000)),
          ).utc();
        } else {
          const str = (value as string).toString().trim();

          if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(str)) {
            const parts = str.split(/[\/-]/);
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1;
            let y = parseInt(parts[2]);

            if (y < 100) {
              y = y < 30 ? 2000 + y : 1900 + y;
            }

            dateObj = dayjs(
              `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
            );
          } else {
            dateObj = dayjs(str);
          }
        }

        if (dateObj.isValid()) {
          return dateObj.format("DD/MM/YYYY");
        }

        return (value as string).toString();
      };

      let importedCount = 0;
      for (const row of dataRows) {
        const firstName = ((row[0] as string) || "").toString().trim();
        const lastName = ((row[2] as string) || "").toString().trim();
        const gender = ((row[3] as string) || "")
          .toString()
          .trim()
          .toUpperCase();
        const passportNo = ((row[4] as string) || "").toString().trim();
        const nationalityCode = ((row[5] as string) || "")
          .toString()
          .trim()
          .toUpperCase();
        const birthDate = parseExcelDate(row[6]);
        const checkOutDate = parseExcelDate(row[7]);
        const phoneNo = ((row[8] as string) || "").toString().trim();

        if (!firstName || !passportNo) continue;

        const nationality = NATIONALITIES.find(
          (n) => n.code === nationalityCode,
        );
        const nationalityDisplay = nationality
          ? `${nationality.code} : ${nationality.name}`
          : nationalityCode;

        const person = {
          firstName,
          lastName,
          passportNo,
          nationality: nationalityDisplay,
          nationalityCode: nationalityCode || "",
          gender:
            gender === "M" || gender === "F" ? gender : "M",
          birthDate,
          phoneNo,
          checkInDate: "",
          checkOutDate,
        };

        await Storage.savePerson(person);
        importedCount++;
      }

      if (importedCount > 0) {
        alert(
          I18n.t("options.alert.importSuccess").replace(
            "{count}",
            String(importedCount),
          ),
        );
        loadPersons();
      } else {
        alert(I18n.t("options.alert.importError"));
      }
    } catch (err) {
      console.error("Import error:", err);
      alert(I18n.t("options.alert.importError"));
    }

    importFileInput.value = "";
  });

  cancelEditBtn.addEventListener("click", resetForm);

  // Initial load
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");

  await loadPersons();
  if (editId) {
    editPerson(editId);
  }
});
