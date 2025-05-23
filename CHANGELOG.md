# Changelog

All notable changes to the Fixly Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/yourusername/fixly/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/yourusername/fixly/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/yourusername/fixly/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yourusername/fixly/releases/tag/v1.0.0 