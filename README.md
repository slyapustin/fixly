# Fixly - Text Fixer Chrome Extension

Fixly is a Chrome extension that adds a fix button (✨) to text input fields, textareas, and contenteditable elements. When clicked, it uses OpenAI's API to fix grammar, spelling, and improve the text.

## Features

- Adds a fix button to text inputs, textareas, and contenteditable elements
- Uses OpenAI API to fix and improve text
- Works on most websites, including LinkedIn, Gmail, and other sites with rich text editors
- Customizable model selection (GPT-4o-mini by default)
- Undo functionality: Press Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) to revert AI changes

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
5. Navigate to any website with text inputs or contenteditable elements
6. Type some text in an input field or contenteditable element
7. Look for the ✨ button that appears near the element
8. Click the button to fix and improve your text
9. If you want to revert the changes, press Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) immediately after the AI makes changes

## Debugging

If the fix button doesn't appear on contenteditable elements, try the following:

1. Open Chrome DevTools (F12 or right-click > Inspect)
2. Go to the Console tab to check for any error messages
3. Look for log messages from the extension (they start with "Fixly")
4. Make sure the extension has permission to run on the current website
5. Try reloading the page after the extension is loaded
6. Test with the included `test.html` file to verify the extension works correctly

### Testing with test.html

1. Open the `test.html` file in Chrome
2. The page contains various types of contenteditable elements
3. Verify that the fix button appears when you type in each element
4. If the button appears in the test page but not on other websites, there might be specific issues with those websites

## Troubleshooting

### Fix Button Not Appearing

- Make sure you've entered text in the field (buttons only appear when there's content)
- Some websites use complex editors that might prevent the button from appearing
- Try clicking in and out of the field to trigger the button
- Check the console for any error messages

### Button Appears But Doesn't Work

- Verify your OpenAI API key is correct and has sufficient credits
- Check the console for API error messages
- Make sure you have an internet connection

### Undo Functionality Not Working

- Make sure to press Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) while the text field is still in focus
- The undo functionality only works once per AI fix
- Some complex editors might override the standard undo behavior
- Try clicking in the field again if the focus was lost

## Technical Details

The extension works by:

1. Injecting a content script that scans the page for text inputs and contenteditable elements
2. Adding a fix button next to these elements
3. When clicked, sending the text to the background script
4. The background script calls the OpenAI API to fix the text
5. The fixed text is then inserted back into the original element
6. The original text is stored temporarily to enable undo functionality

## License

MIT License

## Distribution

For information about distributing this extension through GitHub Releases or the Chrome Web Store, please see [DISTRIBUTION.md](DISTRIBUTION.md).

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.