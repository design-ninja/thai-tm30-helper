# Changelog

All notable changes to this project will be documented in this file.

## [1.6.0] - 2026-02-26

### Security
- Extension no longer connects to Google Fonts — better privacy, fully offline
- Safer handling of displayed content to prevent potential injection
- Improved error handling for data storage operations
- Secure external link handling

### Added
- Dark mode — automatically follows your system theme

### Fixed
- Improved accessibility for screen readers (dialogs, error messages, labels)
- Better color contrast for error messages in both light and dark themes
- Popup footer now fully translatable (EN/TH)
- Animation respects system "reduce motion" setting

### Improved
- Faster content script — removed unnecessary background page monitoring
- Smaller extension size — cleaned up unused files and styles

## [1.5.0] - 2025-12-29

### Added
- Terms of Use / Disclaimer document (DISCLAIMER.md)
- First-run consent modal for PDPA compliance
- Thai translations for consent modal

### Changed
- Updated Privacy Policy with PDPA-specific language
- Clarified Data Controller status in documentation

## [1.4.0] - 2025-12-27

### Fixed
- Fixed date parsing issues during Excel import by using `dayjs` library
- Improved auto-fill reliability on slow connections with smart polling
- Relaxed URL check to support all `tm30.immigration.go.th` pages
- Fixed profile editing for IDs with string format

### Added
- URL validation and usage hints in popup

### Security
- Enhanced PIN security with salt hashing

## [1.3.0] - 2025-12-26

### Added
- PIN-code lock for extension
- Auto-lock by timer
- Protection against PIN brute-force

## [1.2.0] - 2025-12-20

### Added
- Excel export with immigration template format
- Excel import from existing templates
- Check-in Date field in profiles
- Check-out Date field in profiles
- Auto-fill support for Check-in Date on TM30 form

### Technical
- SheetJS (xlsx) library for Excel file handling
- Multi-sheet Excel export matching official template

## [1.1.0] - 2025-12-19

### Added
- Thai language support for the entire interface
- Language selector in options page header
- Internationalization (i18n) module for translations

## [1.0.0] - 2025-12-19

### Added
- Profile management for storing traveler information
- Auto-fill functionality for TM30 forms
- Support for nationality autocomplete
- Gender and date field handling
- Options page for managing profiles
- Popup for quick profile selection

### Technical
- MutationObserver for efficient DOM monitoring
- XSS protection with safe DOM methods
- Birth date validation (DD/MM/YYYY format)
- Shared storage module for data management
