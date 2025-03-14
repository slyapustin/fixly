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

        // Get the model and system prompt from storage or use defaults
        chrome.storage.sync.get(['openai_model', 'system_prompt'], (result) => {
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