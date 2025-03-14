function addFixButton(input) {
    let button = document.createElement("button");
    button.innerText = "Fix";
    button.style.marginLeft = "5px";
    input.parentNode.insertBefore(button, input.nextSibling);

    button.addEventListener("click", () => {
        let apiKey = localStorage.getItem("openai_api_key");
        if (!apiKey) {
            alert("Please set your OpenAI API key in the extension settings.");
            return;
        }

        chrome.runtime.sendMessage({ action: "fixText", text: input.value, apiKey }, response => {
            if (response.fixedText) {
                input.value = response.fixedText;
            } else {
                alert("Error: " + response.error);
            }
        });
    });
}

document.querySelectorAll("textarea, input[type='text']").forEach(addFixButton);