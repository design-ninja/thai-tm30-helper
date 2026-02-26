export const locale: Record<string, string> = {
  // Options page
  "options.title": "Thai TM30 Helper - Manage Profiles",
  "options.header": "Thai TM30 Helper",
  "options.subtitle": "Save profiles to auto-fill TM30 forms instantly",
  "options.formTitle.add": "👤 Add New Person",
  "options.formTitle.edit": "👤 Edit Profile",
  "options.label.firstName": "First Name",
  "options.label.lastName": "Last Name",
  "options.label.passportNo": "Passport Number",
  "options.label.nationality": "Nationality",
  "options.label.gender": "Gender",
  "options.label.birthDate": "Birth Date",
  "options.label.phoneNo": "Phone Number",
  "options.label.checkInDate": "Check-in Date",
  "options.label.checkOutDate": "Check-out Date",
  "options.gender.male": "Male",
  "options.gender.female": "Female",
  "options.btn.save": "Save Profile",
  "options.btn.update": "Update Profile",
  "options.btn.cancel": "Cancel",
  "options.btn.edit": "Edit",
  "options.btn.delete": "Delete",
  "options.btn.exportExcel": "Export to Excel",
  "options.btn.importExcel": "Import from Excel",
  "options.savedProfiles": "👥 Saved Profiles",
  "options.emptyState":
    "No profiles saved yet. Add your first person above.",
  "options.noNationality": "No nationality found",
  "options.alert.birthDateFormat":
    "Please enter birth date in DD/MM/YYYY format",
  "options.alert.selectNationality":
    "Please select a nationality from the list",
  "options.alert.noProfiles": "No profiles to export",
  "options.alert.importSuccess": "Successfully imported {count} profiles",
  "options.alert.exportSuccess": "Excel file exported successfully",
  "options.alert.importError":
    "Error importing file. Please check the format.",
  "options.alert.emptySheet":
    "The first sheet is empty. Please add data to the first sheet before importing.",
  "options.confirm.delete":
    "Are you sure you want to delete this profile?",
  "options.importExport.title": "🔄 Import / Export",
  "options.importExport.description":
    "Export profiles to Excel for bulk TM30 submission, or import from an existing template.",
  "options.language": "Language",

  // Popup
  "popup.header": "Thai TM30 Helper",
  "popup.settings": "Settings",
  "popup.addProfiles": "Add Profiles",
  "popup.emptyState": "No saved profiles found",
  "popup.editProfile": "Edit Profile",
  "popup.error.refresh":
    "Error: Please refresh the TM30 form page to enable the extension.",
  "popup.error.wrongUrl":
    "Please go to https://tm30.immigration.go.th/tm30/#/external/ifa/add and click on the person again to fill in the data.",
  "popup.leaveReview": "⭐ Leave a review",

  // PIN
  "pin.title": "Enter PIN",
  "pin.placeholder": "Enter PIN",
  "pin.error": "Incorrect PIN",
  "pin.attemptsLeft": "{count} attempts left",
  "pin.forgot": "Forgot PIN? Reset all data",
  "pin.resetConfirm":
    "This will delete ALL your saved profiles. Are you sure?",
  "pin.resetSuccess": "All data has been reset",

  // Security settings
  "options.security.title": "🔐 PIN code",
  "options.security.description": "Protect your data with a PIN code",
  "options.security.pinEnabled": "🔒 PIN code is enabled",
  "options.security.pinDisabled": "🔓 PIN code is not set",
  "options.security.newPin": "New PIN",
  "options.security.confirmPin": "Confirm PIN",
  "options.security.currentPin": "Current PIN",
  "options.security.setPin": "Set PIN",
  "options.security.changePin": "Change PIN",
  "options.security.removePin": "Remove PIN",
  "options.security.pinMismatch": "PINs do not match",
  "options.security.pinInvalid": "PIN must be 4 digits",
  "options.security.pinSet": "PIN has been set",
  "options.security.pinChanged": "PIN has been changed",
  "options.security.pinRemoved": "PIN has been removed",
  "options.security.wrongPin": "Incorrect PIN",
  "options.security.lockTimeout": "Lock after inactivity",
  "options.security.badgeEnabled": "Enabled",
  "options.security.badgeNotSet": "Not set",
  "options.security.status": "Status",
  "options.security.timeout.30s": "30 seconds",
  "options.security.timeout.1m": "1 minute",
  "options.security.timeout.2m": "2 minutes",
  "options.security.timeout.3m": "3 minutes",
  "options.security.timeout.4m": "4 minutes",
  "options.security.timeout.5m": "5 minutes",
  "options.security.timeout.10m": "10 minutes",
  "options.madeBy": "Made by",
  "options.withLove": "with",

  // Consent modal
  "consent.title": "Terms of Use",
  "consent.intro":
    "Before using Thai TM30 Helper, please review and accept the following terms:",
  "consent.point1.title": "You are the Data Controller",
  "consent.point1.text":
    "All personal data you enter is stored locally on your device. You are responsible for the lawful processing of this data under PDPA and applicable laws.",
  "consent.point2.title": "Your Responsibility",
  "consent.point2.text":
    "You must have a valid legal basis (such as consent) for processing personal data of guests, tenants, or other third parties.",
  "consent.point3.title": "Developer Disclaimer",
  "consent.point3.text":
    "The developer does not collect, store, or have access to any data you enter. The developer is not liable for any misuse or PDPA violations.",
  "consent.footer":
    'By clicking "I Agree" you confirm that you have read, understood, and accept these terms.',
  "consent.accept": "I Agree",
  "consent.viewFull": "View full Terms of Use",
};
