document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelInput = document.getElementById('modelInput');
    const saveButton = document.getElementById('saveKey');
    const statusDiv = document.getElementById('status');

    // Load saved settings if they exist
    chrome.storage.sync.get(['openai_api_key', 'openai_model'], (result) => {
        if (result.openai_api_key) {
            apiKeyInput.value = result.openai_api_key;
        }

        if (result.openai_model) {
            modelInput.value = result.openai_model;
        } else {
            // Set default model if not previously set
            modelInput.value = 'gpt-4o-mini';
        }
    });

    // Save settings when button is clicked
    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const selectedModel = modelInput.value.trim() || 'gpt-4o-mini'; // Default if empty

        // Basic validation
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            showStatus('API key should start with "sk-"', 'error');
            return;
        }

        // Save to Chrome storage
        chrome.storage.sync.set({
            'openai_api_key': apiKey,
            'openai_model': selectedModel
        }, () => {
            showStatus('Settings saved successfully!', 'success');
        });
    });

    // Helper function to show status messages
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        // Hide the status message after 3 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});