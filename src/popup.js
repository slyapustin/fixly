document.getElementById("saveKey").addEventListener("click", () => {
    let apiKey = document.getElementById("apiKeyInput").value;
    localStorage.setItem("openai_api_key", apiKey);
    alert("API Key saved!");
});