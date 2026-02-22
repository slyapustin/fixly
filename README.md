# Fixly - Text Fixer Chrome Extension

Fixly is a Chrome extension that fixes and improves selected text using OpenAI API or a locally running Ollama model.

## Features

- Works with selected text on web pages, inputs, textareas, and contenteditable editors
- Trigger from **context menu**: `Fix with Fixly`
- Trigger from **shortcut**: `Ctrl/Cmd + Shift + F`
- Uses OpenAI API or local Ollama
- Visual confirmation toasts for progress/success/error
- Configurable model selection for both OpenAI and Ollama

## Installation (Development)

1. Clone this repository
2. Open Chrome: `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `src` folder

## Usage

1. Open extension popup and configure provider/settings
2. Select text on any page
3. Trigger fix via:
   - Right-click → **Fix with Fixly**
   - or shortcut: **Ctrl/Cmd + Shift + F**
4. Fixed text is inserted in place (or copied to clipboard if page blocks replacement)

## How it works now

The extension now uses a single, stable flow (no floating action button):

1. **Selection capture (content script)**
   - Captures selected text from normal page selection, textarea/input, or contenteditable.
2. **Trigger (background)**
   - Trigger comes from context menu or keyboard shortcut.
   - Background sends `fixSelection` command to the active tab.
3. **LLM request (background service worker)**
   - Content script sends text to background (`fixText`).
   - Background calls configured provider:
     - OpenAI: `/v1/chat/completions`
     - Ollama: `/api/chat` (with fallback support for OpenAI-compatible `/v1/chat/completions` setups)
4. **Apply result (content script)**
   - Replaces selected text in-place when possible.
   - If replacement is blocked by the page/editor, copies fixed text to clipboard.
5. **Visual feedback**
   - Toast notifications: `Fixing…`, `✅ Text fixed`, `📋 copied`, or error.

## Ollama Setup

1. Install Ollama: https://ollama.com/
2. Pull model, e.g.:
   ```bash
   ollama pull llama3
   ```
3. Run with CORS allowed for extension:
   ```bash
   OLLAMA_ORIGINS="*" ollama serve
   ```
   Better security (recommended):
   ```bash
   OLLAMA_ORIGINS="chrome-extension://YOUR_EXTENSION_ID" ollama serve
   ```

## Troubleshooting

### Ollama returns 403
- This is CORS. Re-run Ollama with `OLLAMA_ORIGINS` as shown above.

### Nothing happens on page
- Reload extension in `chrome://extensions`
- Ensure extension has site access on target page
- Try context menu trigger first (most reliable on complex editors)

## Technical Notes

- Content script captures selection and applies replacement
- Background service worker performs API calls
- Local Ollama supports both `/api/chat` and `/v1/chat/completions` style endpoints

## License

MIT
