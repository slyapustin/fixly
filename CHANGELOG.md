# Changelog

All notable changes to the Fixly Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Context menu action `Fix with Fixly` as a fallback when the floating button is hidden by complex page behavior.
- Keyboard shortcut command (`Ctrl/Cmd + Shift + F`) to trigger fixing selected text directly.

### Changed
- Simplified content script selection flow to reduce edge-case bugs on complex pages/editors.
- Added stable selection snapshotting for both text fields and DOM ranges before API calls.
- Prevented selection loss when clicking the floating button (`mousedown.preventDefault`).
- Improved keyboard-selection behavior (`selectionchange` + keyboard-triggered updates).

### Fixed
- Switched OpenAI request param from `max_tokens` to `max_completion_tokens` for compatibility with GPT-5 mini/nano models.
- Routed all LLM network calls through the background service worker (instead of content script) to avoid page-level local network restrictions with Ollama.
- Improved Ollama endpoint handling to support both `/api/chat` and OpenAI-compatible `/v1/chat/completions` setups.
- Added host permissions for local Ollama endpoints (`localhost`, `127.0.0.1`, `*.local`).
- Better compatibility with pages where selection collapses before replacement.
- Improved GitHub/editor compatibility by allowing fix flow via runtime message trigger even when inline button visibility is unreliable.
- Graceful fallback to clipboard when direct in-place replacement is blocked by page behavior.

## [1.2.0] - 2024-05-31

### Added
- Support for locally-running Ollama LLM models
- Option to choose between OpenAI API and Ollama in settings
- Configuration options for Ollama URL and model selection

### Changed
- Updated popup UI to accommodate provider selection
- Improved error handling for both OpenAI and Ollama requests

## [1.1.0] - 2024-05-30

### Changed
- Completely redesigned text selection mechanism
- Replaced per-input field buttons with a single floating button
- Button now appears near cursor when text is selected, similar to browser's default context menu
- Extended functionality to work with regular text on web pages, not just input fields

### Improved
- Better support for selecting text in textareas, input fields, and contenteditable elements
- More intuitive UI with button appearing only when text is actively selected
- Button automatically disappears when clicking elsewhere on the page
- Reduced DOM manipulation for improved performance

## [1.0.0] - 2025-03-14

### Added
- Initial release of Fixly Chrome Extension
- Fix button (✨) for text input fields, textareas, and contenteditable elements
- OpenAI API integration for text improvement
- Support for rich text editors (LinkedIn, Gmail, etc.)
- Customizable model selection
- Undo functionality (Ctrl+Z/Cmd+Z)

[Unreleased]: https://github.com/slyapustin/fixly/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/slyapustin/fixly/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/slyapustin/fixly/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/slyapustin/fixly/releases/tag/v1.0.0
