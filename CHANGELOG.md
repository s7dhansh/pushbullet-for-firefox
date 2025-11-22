# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions workflow for automatic XPI builds and releases
- Semantic versioning support
- Automated release creation on version bump

## [367.0.0] - 2024-11-22

### Added
- **Dark Mode**: System theme detection with manual override (works for all users, not just Pro)
- **OTP Detection**: Automatic detection of verification codes in SMS notifications
- **OTP Auto-Copy**: Click notification to copy OTP code to clipboard
- **Enhanced Keyboard Shortcuts**: `Ctrl+Shift+P` to toggle popup
- **Improved Notification Duration**: Increased to 15 seconds (from 8 seconds)
- Content script for better cookie detection on pushbullet.com
- Manual API key entry for more reliable authentication

### Fixed
- Manifest V3 compatibility issues
- Context menu errors in Firefox (removed deprecated `onclick` property)
- SMS history display issues (undefined variable errors)
- Chat push/SMS undefined errors (`pb.fileQueue`, `pb.successfulSms`, `pb.smsQueue`)
- End-to-end encryption option errors (`pb.e2e` undefined)
- Deprecated `chrome.extension.getURL` replaced with `chrome.runtime.getURL`
- Cookie access issues in Firefox (implemented fallback authentication)
- Dark mode Pro restriction removed (now available to all users)

### Changed
- Authentication now uses manual API key entry instead of cookies (more reliable in Firefox)
- Notification duration increased from 8s to 15s
- Dark mode follows system theme by default
- Improved error handling throughout the extension

### Technical
- Added safety checks for undefined variables (`pb.fileQueue`, `pb.e2e`, etc.)
- Improved null checking in chat-sms.js and chat-push.js
- Fixed context menu implementation for Manifest V3
- Cleaned up debug console logs

## [366] - Original Pushbullet Version

Base version from official Pushbullet extension.

---

## Version Numbering

This fork uses semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes or significant feature additions
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes and minor improvements

Starting from version 367.0.0 to differentiate from the official extension (version 366).
