chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fixText") {
        // Enhanced logging
        console.log("Request received:", JSON.stringify({
            action: request.action,
            hasText: !!request.text,
            textLength: request.text ? request.text.length : 0
        }));
        
        try {
            console.log("Received fixText request:", request.text ? request.text.substring(0, 20) + "..." : "empty");
        } catch (e) {
            console.error("Error logging text preview:", e);
        }

        // Don't process empty text - but provide more detailed error
        if (!request.text) {
            console.error("Text is null or undefined");
            sendResponse({ error: "No text was received" });
            return true;
        }
        
        // Try to convert text to string if it's not already
        let textToProcess;
        try {
            textToProcess = request.text.toString().trim();
        } catch (e) {
            console.error("Could not convert text to string:", e);
            sendResponse({ error: "Invalid text format" });
            return true;
        }
        
        if (textToProcess === "") {
            console.error("Text is empty (blank)");
            sendResponse({ error: "Text is empty" });
            return true;
        }

        // Store original text for comparison
        const originalText = textToProcess;
        
        // Special logging for W3Schools
        const isW3Schools = sender.tab && sender.tab.url && sender.tab.url.includes('w3schools.com');
        if (isW3Schools) {
            console.log("W3Schools detected - Text length:", originalText.length);
            console.log("W3Schools text sample:", originalText.substring(0, 50));
        }

        // Get the model and system prompt from storage or use defaults
        chrome.storage.sync.get(['openai_api_key', 'openai_model', 'system_prompt'], (result) => {
            // Check API key again
            if (!request.apiKey) {
                console.error("API key missing");
                sendResponse({ error: "API key not provided" });
                return;
            }
            
            // Use the selected model or default to gpt-4o-mini
            const model = result.openai_model || 'gpt-4o-mini';
            console.log("Using model:", model);

            // Default system prompt if none is set
            const defaultSystemPrompt = "You are a helpful assistant that improves text. Fix grammar, spelling, punctuation, and improve clarity and conciseness without changing the meaning or tone. If the text is already correct or if you can't identify any issues to fix, return the EXACT original text unchanged. Never return explanations, error messages, or quotes - only return the fixed text or the original text if no fixes are needed.";

            // Use custom system prompt or default
            const systemPrompt = result.system_prompt || defaultSystemPrompt;
            console.log("Using system prompt:", systemPrompt.substring(0, 30) + "...");

            fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${request.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
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
                    console.log("API response received");
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        let fixedText = data.choices[0].message.content.trim();
                        console.log("Fixed text length:", fixedText.length);
                        console.log("Fixed text (first 50 chars):", fixedText.substring(0, 50));

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
                    } else {
                        console.error("Unexpected API response format:", data);
                        throw new Error("Unexpected API response format");
                    }
                })
                .catch(error => {
                    console.error("Error in fixText:", error);
                    sendResponse({ error: error.message });
                });
        });

        return true;
    }
});

// Log when the background script is loaded
console.log("Fixly background script loaded");