# 👮 Thai TM30 Helper

**Thai TM30 Helper** is a lightweight, privacy-focused Chrome extension designed to simplify the mandatory Notification of Residence for Foreigners (TM30) in Thailand. It automates the tedious task of filling out immigration forms by storing family/guest profiles and injecting them instantly into the official TM30 website.

## ✨ Features

- **Profile Management:** Store multiple family members or recurring guests for quick access.
- **Instant Auto-fill:** Single-click injection into the official TM30 web forms.
- **Smart Mapping:** Automatically handles complex fields like Nationalities, Gender, and Dates.
- **Modern UI:** Clean, intuitive interface using Google Sans typeography and a prioritized workflow.
- **Privacy First:** All data is stored locally in your browser's storage. Nothing is sent to external servers or cloud services.

## 🚀 Installation (Manual)

Since this is an open-source project, you can load it as an "unpacked" extension:

1.  **Download/Clone** this repository to your local machine.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** (toggle in the top right corner).
4.  Click **Load unpacked** and select the folder containing this extension's files.

## 📖 How to Use

1.  **Add Profiles:** Click on the extension icon and select **Manage Profiles** (or go to the extension options). Add the details for the travelers you frequently report.
2.  **Navigate to TM30 Site:** Open the official [Thai Immigration TM30 Portal](https://tm30.immigration.go.th/).
3.  **Login and Fill:** Once you are on the "Notification of Residence" form page:
    - Click the extension icon.
    - Click on the person you wish to report.
    - Watch as the form is instantly populated.

## 🔒 Privacy & Security

We take privacy seriously. This extension:
- **Does NOT** collect personal data.
- **Does NOT** use external APIs for tracking.
- **ONLY** interacts with the `tm30.immigration.go.th` domain.
- **STORES** all data locally via `chrome.storage.local`.

## 🛠 Tech Stack

- **Manifest V3** (Latest Chrome Extension Standard)
- **Vanilla JavaScript/HTML/CSS**
- **Google Sans Variable Font**

## 📄 License

This project is open-source. Feel free to contribute or adapt it for your needs.
