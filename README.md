# Fixly

Fixly is a Chrome extension that helps you fix and improve text in any input field on the web using OpenAI's GPT-4 model.

## Features

- Adds a "Fix" button next to text inputs and textareas on any webpage
- Automatically corrects grammar, spelling, and improves text clarity
- Uses OpenAI's powerful GPT-4 model for high-quality text improvements
- Simple and intuitive user interface
- Works on any website

## Installation

1. Download the extension from the Chrome Web Store (coming soon)
   
   OR
   
   Install manually:
   - Download the latest release (.crx file)
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Drag and drop the .crx file onto the extensions page

2. After installation, click on the Fixly icon in your browser toolbar
3. Enter your OpenAI API key and click "Save"
   - You can get an API key from [OpenAI's platform](https://platform.openai.com/api-keys)

## Usage

1. Navigate to any website with text input fields
2. You'll see a "Fix" button appear next to text inputs and textareas
3. Type your text in the input field
4. Click the "Fix" button to improve your text
5. The improved text will replace your original text in the input field

## Building from Source

To build the .crx file from source:

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/fixly.git
   cd fixly
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top-right corner)

4. Click "Pack extension" button

5. In the "Extension root directory" field, select the `src` folder from this repository

6. Leave the "Private key file" field empty if this is your first time building (Chrome will generate a new key)
   - For subsequent builds, use the .pem file generated from the first build

7. Click "Pack Extension"

8. Chrome will generate a .crx file and a .pem file
   - The .crx file is your packaged extension
   - The .pem file is your private key (keep this secure for future updates)

9. You can now distribute the .crx file or use it for installation as described in the Installation section

## Privacy

- Your API key is stored locally in your browser
- Text is sent directly to OpenAI's API from your browser
- No data is stored on any servers

## Development

This extension is built using:
- JavaScript
- Chrome Extension Manifest V3
- OpenAI API

## License

MIT

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.