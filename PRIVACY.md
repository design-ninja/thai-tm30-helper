# Privacy Policy for Thai TM30 Helper

**Last updated:** December 29, 2025

## Overview

Thai TM30 Helper is a browser extension that helps users auto-fill the Thai Immigration TM30 form. We are committed to protecting your privacy and being transparent about data handling.

## Data Controller Status

**The developer of this extension is NOT a Data Controller or Data Processor.**

Under the Personal Data Protection Act (PDPA) B.E. 2562 (2019) of Thailand and similar data protection laws:
- The **user** who enters personal data is the Data Controller
- The developer has no access to, control over, or responsibility for personal data entered by users
- All data processing decisions are made by the user, not the developer

## Data Collection

**We do not collect any personal data.**

All information you enter (guest profiles, passport details, etc.) is stored **locally on your device** using Chrome's built-in storage (`chrome.storage.local`). This data never leaves your browser.

## Data Sharing

We do not:
- Transmit any data to external servers
- Share data with third parties
- Use analytics or tracking services
- Store any data outside your browser
- Have any mechanism to access user data

## Permissions

The extension requires the following permissions:

- **storage**: To save guest profiles locally on your device
- **activeTab**: To fill the TM30 form when you click the extension
- **Host permission (tm30.immigration.go.th)**: To interact with the official TM30 website

## Data Security

Your data is stored locally in your browser's encrypted storage. Only you have access to this data. Uninstalling the extension will remove all stored data.

### PIN Protection

The optional PIN feature provides an additional layer of security:
- PINs are stored as SHA-256 hashes with salt, never in plain text
- Brute-force protection limits incorrect attempts
- Session timeout automatically locks access after inactivity
- All data is deleted after maximum failed attempts

## User Responsibility

As the Data Controller, you are responsible for:
- Ensuring lawful basis for processing personal data under PDPA
- Obtaining necessary consent from data subjects (guests, tenants)
- Complying with all applicable data protection laws
- Securely managing access to your device and browser

## PDPA Compliance (Thailand)

If you operate in Thailand, please ensure you comply with PDPA requirements including:
- Having a lawful basis for processing personal data
- Providing appropriate privacy notices to data subjects
- Implementing appropriate security measures
- Respecting data subject rights

For more information, see [DISCLAIMER.md](DISCLAIMER.md).

## Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be reflected in the "Last updated" date above.

## Contact

If you have questions about this Privacy Policy, please open an issue on our GitHub repository.
