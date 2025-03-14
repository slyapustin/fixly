document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelInput = document.getElementById('modelInput');
    const systemPromptInput = document.getElementById('systemPromptInput');
    const saveButton = document.getElementById('saveKey');
    const resetPromptButton = document.getElementById('resetPrompt');
    const statusDiv = document.getElementById('status');

    // Default system prompt
    const defaultSystemPrompt = "You are a helpful assistant that improves text. Fix grammar, spelling, punctuation, and improve clarity and conciseness without changing the meaning or tone. If the text is already correct or if you can't identify any issues to fix, return the EXACT original text unchanged. Never return explanations, error messages, or quotes - only return the fixed text or the original text if no fixes are needed.";

    // Load saved settings if they exist
    chrome.storage.sync.get(['openai_api_key', 'openai_model', 'system_prompt'], (result) => {
        if (result.openai_api_key) {
            apiKeyInput.value = result.openai_api_key;
        }

        if (result.openai_model) {
            modelInput.value = result.openai_model;
        } else {
            // Set default model if not previously set
            modelInput.value = 'gpt-4o-mini';
        }

        // For system prompt, set the default as the initial value if not saved before
        if (result.system_prompt) {
            systemPromptInput.value = result.system_prompt;
        } else {
            // Set default system prompt as the initial value
            systemPromptInput.value = defaultSystemPrompt;
        }
    });

    // Reset prompt button click handler
    resetPromptButton.addEventListener('click', () => {
        systemPromptInput.value = defaultSystemPrompt;
        showStatus('System prompt reset to default', 'success');
    });

    // Save settings when button is clicked
    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const selectedModel = modelInput.value.trim() || 'gpt-4o-mini'; // Default if empty

        // For system prompt, if it's empty after trimming, use the default
        let systemPrompt = systemPromptInput.value.trim();
        if (!systemPrompt) {
            systemPrompt = defaultSystemPrompt;
            // Also update the textarea to show the default
            systemPromptInput.value = defaultSystemPrompt;
        }

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
            'openai_model': selectedModel,
            'system_prompt': systemPrompt
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