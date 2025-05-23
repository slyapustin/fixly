chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fixText") {
        console.log("Received fixText request:", request.text ? request.text.substring(0, 20) + "..." : "empty");

        // Don't process empty text
        if (!request.text || request.text.trim() === "") {
            console.error("No text to fix");
            sendResponse({ error: "No text to fix" });
            return true;
        }

        // Store original text for comparison
        const originalText = request.text.trim();

        // Get the provider and other settings from storage
        chrome.storage.sync.get([
            'provider',
            'openai_model', 
            'ollama_url',
            'ollama_model',
            'system_prompt'
        ], (result) => {
            // Default system prompt if none is set
            const defaultSystemPrompt = "You are a helpful assistant that improves text. Fix grammar, spelling, punctuation, and improve clarity and conciseness without changing the meaning or tone. If the text is already correct or if you can't identify any issues to fix, return the EXACT original text unchanged. Never return explanations, error messages, or quotes - only return the fixed text or the original text if no fixes are needed.";

            // Use custom system prompt or default
            const systemPrompt = result.system_prompt || defaultSystemPrompt;
            console.log("Using system prompt:", systemPrompt.substring(0, 30) + "...");

            // Determine which provider to use
            const provider = result.provider || 'openai';
            console.log("Using provider:", provider);

            if (provider === 'openai') {
                // Use OpenAI API
                processWithOpenAI(originalText, systemPrompt, result.openai_model, request.apiKey, sendResponse);
            } else if (provider === 'ollama') {
                // Use Ollama API
                processWithOllama(originalText, systemPrompt, result.ollama_model, result.ollama_url, sendResponse);
            } else {
                // Unsupported provider
                console.error("Unsupported provider:", provider);
                sendResponse({ error: "Unsupported provider: " + provider });
            }
        });

        return true;
    }
});

// Process text with OpenAI API
function processWithOpenAI(originalText, systemPrompt, model, apiKey, sendResponse) {
    // Use the selected model or default to gpt-4o-mini
    const modelToUse = model || 'gpt-4o-mini';
    console.log("Using OpenAI model:", modelToUse);

    fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelToUse,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Fix this text if needed: ${originalText}`
                }
            ],
            max_tokens: 1000
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    console.error("API error:", errorData);
                    throw new Error(errorData.error?.message || "API request failed");
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("OpenAI API response received");
            if (data.choices && data.choices[0] && data.choices[0].message) {
                let fixedText = data.choices[0].message.content.trim();
                processResponseText(fixedText, originalText, sendResponse);
            } else {
                console.error("Unexpected API response format:", data);
                throw new Error("Unexpected API response format");
            }
        })
        .catch(error => {
            console.error("Error in OpenAI request:", error);
            sendResponse({ error: error.message });
        });
}

// Process text with Ollama API
function processWithOllama(originalText, systemPrompt, model, ollamaUrl, sendResponse) {
    // Use the selected model or default to llama3
    const modelToUse = model || 'llama3';
    console.log("Using Ollama model:", modelToUse);
    
    // Ensure the URL ends with /api/chat
    const baseUrl = ollamaUrl || 'http://localhost:11434';
    const apiUrl = baseUrl.endsWith('/') 
        ? `${baseUrl}api/chat` 
        : `${baseUrl}/api/chat`;
        
    console.log("Using Ollama URL:", apiUrl);

    // Note: If you get 403 Forbidden errors, you need to run Ollama with CORS headers enabled.
    // Run Ollama with: OLLAMA_ORIGINS="chrome-extension://<your-extension-id>" ollama serve
    // Or try: OLLAMA_ORIGINS="*" ollama serve (less secure, but easier for testing)
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelToUse,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Fix this text if needed: ${originalText}`
                }
            ],
            stream: false
        })
    })
        .then(response => {
            if (!response.ok) {
                // Handle HTTP errors - first try to get the response body
                return response.text().then(text => {
                    // Try to parse as JSON, but don't fail if it's not valid JSON
                    let errorMessage = `Ollama API error: ${response.status} ${response.statusText}`;
                    console.error(errorMessage);
                    
                    if (text) {
                        console.error("Response body:", text);
                        try {
                            const errorData = JSON.parse(text);
                            if (errorData.error) {
                                errorMessage = errorData.error;
                            }
                        } catch (e) {
                            // If it's not valid JSON, use the text as the error message
                            if (text.length < 100) errorMessage = text;
                        }
                    }
                    
                    // For 403 errors, add a helpful message about CORS
                    if (response.status === 403) {
                        errorMessage += ". This is likely a CORS issue. Try running Ollama with CORS headers enabled: OLLAMA_ORIGINS=\"*\" ollama serve";
                    }
                    
                    throw new Error(errorMessage);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Ollama API response received");
            
            // Handle different possible Ollama response formats
            let fixedText;
            if (data.message && data.message.content) {
                // Standard chat completion format
                fixedText = data.message.content.trim();
            } else if (data.response) {
                // Some Ollama models return a direct "response" field
                fixedText = data.response.trim();
            } else if (data.choices && data.choices[0]) {
                // Handle OpenAI-compatible format some models might use
                const choice = data.choices[0];
                fixedText = choice.message?.content || choice.text || "";
                fixedText = fixedText.trim();
            } else {
                console.error("Unexpected Ollama API response format:", data);
                throw new Error("Unexpected Ollama API response format");
            }
            
            processResponseText(fixedText, originalText, sendResponse);
        })
        .catch(error => {
            console.error("Error in Ollama request:", error);
            sendResponse({ error: error.message || "Unknown Ollama error" });
        });
}

// Process the response text from either API
function processResponseText(fixedText, originalText, sendResponse) {
    // Check if the response contains error-like messages and use original text instead
    const errorPhrases = [
        "doesn't contain any",
        "does not contain any",
        "no recognizable",
        "no text to fix",
        "nothing to fix",
        "already correct",
        "I cannot fix",
        "cannot identify any",
        "please provide"
    ];

    const containsErrorPhrase = errorPhrases.some(phrase =>
        fixedText.toLowerCase().includes(phrase.toLowerCase())
    );

    if (containsErrorPhrase) {
        // If response contains error phrases, return original text
        console.log("Response contained error phrase, returning original text");
        sendResponse({ fixedText: originalText });
    } else {
        console.log("Returning fixed text");
        sendResponse({ fixedText: fixedText });
    }
}

// Log when the background script is loaded
console.log("Fixly background script loaded");