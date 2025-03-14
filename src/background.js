chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fixText") {
        fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${request.apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: `Fix this text: ${request.text}` }],
                max_tokens: 1000
            })
        })
            .then(response => response.json())
            .then(data => sendResponse({ fixedText: data.choices[0].message.content }))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
});