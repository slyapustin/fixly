# Fixly - Text Fixer Chrome Extension

Fixly is a Chrome extension that helps you fix and improve selected text anywhere on the web using OpenAI's API. Simply select any text and a fix button (✨) will appear near your selection.

## Features

- Works with any selected text on web pages - paragraphs, headings, or within editable fields
- Floating button appears near your selection, similar to browser's context menu
- Uses OpenAI API to fix grammar, spelling, and improve the text
- Works with text selections in regular web content, inputs, textareas, and contenteditable elements
- Customizable model selection (GPT-4o-mini by default)

## Installation

### Development Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `src` folder from this repository
5. The extension should now be installed and visible in your extensions list

### Usage

1. Click on the extension icon to open the popup
2. Enter your OpenAI API key (starts with `sk-`)
3. Select your preferred model (default is `gpt-4o-mini`)
4. Click "Save Settings"
5. Navigate to any website
6. Select any text - in paragraphs, input fields, or contenteditable elements
7. A floating ✨ button will appear near your selection
8. Click the button to fix and improve the selected text

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

- Verify your OpenAI API key is correct and has sufficient credits
- Check the console for API error messages
- Make sure you have an internet connection

## Technical Details

The extension works by:

1. Injecting a content script that monitors text selections on the page
2. When text is selected, displaying a floating button near the cursor
3. When clicked, sending the selected text to the background script
4. The background script calls the OpenAI API to fix the text
5. The fixed text is then inserted back at the location of the original selection

## License

MIT License

## Distribution

For information about distributing this extension through GitHub Releases or the Chrome Web Store, please see [DISTRIBUTION.md](DISTRIBUTION.md).

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.