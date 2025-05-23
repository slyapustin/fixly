document.addEventListener('DOMContentLoaded', () => {
    // OpenAI elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelInput = document.getElementById('modelInput');
    
    // Ollama elements
    const ollamaUrlInput = document.getElementById('ollamaUrlInput');
    const ollamaModelInput = document.getElementById('ollamaModelInput');
    
    // Provider selection elements
    const providerOpenAI = document.getElementById('providerOpenAI');
    const providerOllama = document.getElementById('providerOllama');
    const openaiSettings = document.getElementById('openaiSettings');
    const ollamaSettings = document.getElementById('ollamaSettings');
    
    // Common elements
    const systemPromptInput = document.getElementById('systemPromptInput');
    const saveButton = document.getElementById('saveKey');
    const resetPromptButton = document.getElementById('resetPrompt');
    const statusDiv = document.getElementById('status');

    // Default system prompt
    const defaultSystemPrompt = "You are a helpful assistant that improves text. Fix grammar, spelling, punctuation, and improve clarity and conciseness without changing the meaning or tone. If the text is already correct or if you can't identify any issues to fix, return the EXACT original text unchanged. Never return explanations, error messages, or quotes - only return the fixed text or the original text if no fixes are needed.";

    // Load saved settings if they exist
    chrome.storage.sync.get([
        'provider', 
        'openai_api_key', 
        'openai_model', 
        'ollama_url',
        'ollama_model',
        'system_prompt'
    ], (result) => {
        // Set provider
        if (result.provider === 'ollama') {
            providerOllama.checked = true;
            openaiSettings.style.display = 'none';
            ollamaSettings.style.display = 'block';
        } else {
            // Default to OpenAI
            providerOpenAI.checked = true;
            openaiSettings.style.display = 'block';
            ollamaSettings.style.display = 'none';
        }

        // Set OpenAI settings
        if (result.openai_api_key) {
            apiKeyInput.value = result.openai_api_key;
        }

        if (result.openai_model) {
            modelInput.value = result.openai_model;
        } else {
            // Set default model if not previously set
            modelInput.value = 'gpt-4o-mini';
        }

        // Set Ollama settings
        if (result.ollama_url) {
            ollamaUrlInput.value = result.ollama_url;
        } else {
            ollamaUrlInput.value = 'http://localhost:11434';
        }

        if (result.ollama_model) {
            ollamaModelInput.value = result.ollama_model;
        } else {
            ollamaModelInput.value = 'llama3';
        }

        // For system prompt, set the default as the initial value if not saved before
        if (result.system_prompt) {
            systemPromptInput.value = result.system_prompt;
        } else {
            // Set default system prompt as the initial value
            systemPromptInput.value = defaultSystemPrompt;
        }
    });

    // Provider change handlers
    providerOpenAI.addEventListener('change', () => {
        if (providerOpenAI.checked) {
            openaiSettings.style.display = 'block';
            ollamaSettings.style.display = 'none';
        }
    });

    providerOllama.addEventListener('change', () => {
        if (providerOllama.checked) {
            openaiSettings.style.display = 'none';
            ollamaSettings.style.display = 'block';
        }
    });

    // Reset prompt button click handler
    resetPromptButton.addEventListener('click', () => {
        systemPromptInput.value = defaultSystemPrompt;
        showStatus('System prompt reset to default', 'success');
    });

    // Save settings when button is clicked
    saveButton.addEventListener('click', () => {
        // Determine which provider is selected
        const provider = providerOllama.checked ? 'ollama' : 'openai';
        
        // Get OpenAI settings
        const apiKey = apiKeyInput.value.trim();
        const selectedModel = modelInput.value.trim() || 'gpt-4o-mini'; // Default if empty
        
        // Get Ollama settings
        const ollamaUrl = ollamaUrlInput.value.trim() || 'http://localhost:11434'; // Default if empty
        const ollamaModel = ollamaModelInput.value.trim() || 'llama3'; // Default if empty

        // For system prompt, if it's empty after trimming, use the default
        let systemPrompt = systemPromptInput.value.trim();
        if (!systemPrompt) {
            systemPrompt = defaultSystemPrompt;
            // Also update the textarea to show the default
            systemPromptInput.value = defaultSystemPrompt;
        }

        // Validation
        if (provider === 'openai') {
            if (!apiKey) {
                showStatus('Please enter an API key', 'error');
                return;
            }

            if (!apiKey.startsWith('sk-')) {
                showStatus('API key should start with "sk-"', 'error');
                return;
            }
        } else if (provider === 'ollama') {
            if (!ollamaUrl) {
                showStatus('Please enter Ollama URL', 'error');
                return;
            }

            if (!ollamaModel) {
                showStatus('Please enter Ollama model name', 'error');
                return;
            }
        }

        // Save to Chrome storage
        chrome.storage.sync.set({
            'provider': provider,
            'openai_api_key': apiKey,
            'openai_model': selectedModel,
            'ollama_url': ollamaUrl,
            'ollama_model': ollamaModel,
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