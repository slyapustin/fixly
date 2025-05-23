# Fixly - Text Fixer Chrome Extension

Fixly is a Chrome extension that helps you fix and improve selected text anywhere on the web using OpenAI's API or locally running Ollama models. Simply select any text and a fix button (✨) will appear near your selection.

## Features

- Works with any selected text on web pages - paragraphs, headings, or within editable fields
- Floating button appears near your selection, similar to browser's context menu
- Uses OpenAI API or locally running Ollama to fix grammar, spelling, and improve text
- Choose between cloud-based OpenAI models or privacy-focused local Ollama models
- Works with text selections in regular web content, inputs, textareas, and contenteditable elements
- Customizable model selection for both OpenAI and Ollama

## Installation

### Development Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `src` folder from this repository
5. The extension should now be installed and visible in your extensions list

### Usage

1. Click on the extension icon to open the popup
2. Choose your LLM provider (OpenAI or Ollama)
3. For OpenAI:
   - Enter your OpenAI API key (starts with `sk-`)
   - Select your preferred model (default is `gpt-4o-mini`)
4. For Ollama:
   - Enter the URL of your Ollama instance (default is `http://localhost:11434`)
   - Enter the name of your preferred Ollama model (e.g., `llama3`, `mistral`, `gemma`)
5. Click "Save Settings"
6. Navigate to any website
7. Select any text - in paragraphs, input fields, or contenteditable elements
8. A floating ✨ button will appear near your selection
9. Click the button to fix and improve the selected text

## Ollama Setup

To use Fixly with Ollama:

1. Install Ollama from [https://ollama.com/](https://ollama.com/)
2. Download a model by running `ollama pull llama3` (or another model of your choice)
3. **Important**: Ollama needs to be started with CORS headers enabled to work with browser extensions
4. Start Ollama with CORS enabled by running this command:
   ```bash
   OLLAMA_ORIGINS="*" ollama serve
   ```
   - For Windows, use:
     ```
     set OLLAMA_ORIGINS=* && ollama serve
     ```
   - For Mac/Linux, you can also use:
     ```
     env OLLAMA_ORIGINS="*" ollama serve
     ```
5. For better security in production, you can specify exactly which extension can access Ollama:
   ```bash
   OLLAMA_ORIGINS="chrome-extension://YOUR_EXTENSION_ID" ollama serve
   ```
   where `YOUR_EXTENSION_ID` is the ID of your Chrome extension (visible in the chrome://extensions page)

6. After Ollama is running with proper CORS settings, the extension should be able to connect to it

## Debugging

If the fix button doesn't appear when selecting text, try the following:

1. Open Chrome DevTools (F12 or right-click > Inspect)
2. Go to the Console tab to check for any error messages
3. Look for log messages from the extension (they start with "Fixly")
4. Make sure the extension has permission to run on the current website
5. Try reloading the page after the extension is loaded
6. Test on different websites to verify the extension works correctly

## Troubleshooting

### Fix Button Not Appearing

- Make sure you've selected text (the button only appears when text is selected)
- Some websites might prevent selection or use complex editors
- Try selecting text in different areas of the page
- Check the console for any error messages

### Button Appears But Doesn't Work

- If using OpenAI, verify your API key is correct and has sufficient credits
- If using Ollama, ensure the Ollama server is running locally
- Check the console for API error messages
- Make sure you have an internet connection (for OpenAI) or that Ollama is properly configured

### Ollama Connection Issues

- If you see "403 Forbidden" errors, this is a CORS issue. Make sure to run Ollama with `OLLAMA_ORIGINS="*" ollama serve` 
- Verify that Ollama is actually running (try opening http://localhost:11434 in your browser)
- Make sure the model you specified is installed in Ollama (run `ollama list` to check)
- Try restarting Ollama with verbose logging: `OLLAMA_ORIGINS="*" OLLAMA_DEBUG=1 ollama serve`

## Technical Details

The extension works by:

1. Injecting a content script that monitors text selections on the page
2. When text is selected, displaying a floating button near the cursor
3. When clicked, sending the selected text to the background script
4. The background script calls either the OpenAI API or the Ollama API to fix the text
5. The fixed text is then inserted back at the location of the original selection

## License

MIT License

## Distribution

For information about distributing this extension through GitHub Releases or the Chrome Web Store, please see [DISTRIBUTION.md](DISTRIBUTION.md).

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.