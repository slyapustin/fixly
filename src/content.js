function addFixButton(element) {
    // Check if button already exists for this element
    if (element.dataset.fixlyButtonAdded) {
        return;
    }

    let button = document.createElement("span");
    button.innerText = "✨";
    button.style.padding = "4px 8px";
    button.style.cursor = "pointer";
    button.style.zIndex = "9999";
    button.style.margin = "5px";
    button.style.fontSize = "20px";
    button.style.fontFamily = "Arial, sans-serif";
    button.style.display = "none"; // Initially hidden
    button.style.userSelect = "none";
    button.title = "Fix text with AI";
    button.className = "fixly-button";

    // Add hover effect
    button.onmouseover = () => {
        button.style.transform = "scale(1.2)";
        button.style.transition = "transform 0.2s";
    };
    button.onmouseout = () => {
        button.style.transform = "scale(1)";
    };

    // Mark the element as having a button
    element.dataset.fixlyButtonAdded = "true";

    // Different placement strategy based on element type
    if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
        // For contenteditable elements, try to find a good container to append to
        // Often these editors have toolbar containers or are wrapped in a parent div

        // First, try to find a parent container that might be the editor wrapper
        let container = element;

        // If the element is a large area, insert the button directly inside it
        if (element.clientHeight > 50 && element.clientWidth > 200) {
            // Create a wrapper div to hold the button inside the contenteditable area
            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.justifyContent = "flex-end";
            wrapper.style.position = "relative";
            wrapper.style.margin = "0";
            wrapper.style.padding = "0";
            wrapper.appendChild(button);

            // Insert at the beginning of the contenteditable element
            if (element.firstChild) {
                element.insertBefore(wrapper, element.firstChild);
            } else {
                element.appendChild(wrapper);
            }
        } else {
            // For smaller elements, try to find a parent container
            let parentContainer = element.parentElement;
            if (parentContainer) {
                parentContainer.style.position = "relative";
                parentContainer.appendChild(button);
            } else {
                // Fallback to absolute positioning if no suitable container
                button.style.position = "absolute";
                const rect = element.getBoundingClientRect();
                button.style.top = `${rect.top + window.scrollY}px`;
                button.style.left = `${rect.right + window.scrollX - button.offsetWidth - 10}px`;
                document.body.appendChild(button);
            }
        }
    } else {
        // For regular inputs and textareas, position after the element
        button.style.verticalAlign = "middle";
        if (element.nextSibling) {
            element.parentNode.insertBefore(button, element.nextSibling);
        } else {
            element.parentNode.appendChild(button);
        }
    }

    // Function to check content and show/hide button
    const checkContent = () => {
        let content = "";
        if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
            content = element.innerText || element.textContent;
        } else {
            content = element.value;
        }

        // Trim the content to ignore whitespace
        content = content.trim();

        // Show button only if there's actual content
        if (content.length > 0) {
            button.style.display = "inline-block";
        } else {
            button.style.display = "none";
        }
    };

    // Initial content check
    checkContent();

    // Add event listeners to detect content changes
    element.addEventListener("input", checkContent);
    element.addEventListener("change", checkContent);
    element.addEventListener("keyup", checkContent);

    button.addEventListener("click", () => {
        // Show loading state
        const originalText = button.innerText;
        button.innerText = "⏳";
        button.style.cursor = "default";
        button.onmouseover = null;
        button.onmouseout = null;

        // Get text content based on element type
        let textContent = "";
        if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
            textContent = element.innerText || element.textContent;
        } else {
            textContent = element.value;
        }

        // Get API key from Chrome storage
        chrome.storage.sync.get(['openai_api_key'], (result) => {
            if (!result.openai_api_key) {
                alert("Please set your OpenAI API key in the Fixly extension settings.");
                button.innerText = originalText;
                resetButtonState();
                return;
            }

            chrome.runtime.sendMessage({
                action: "fixText",
                text: textContent,
                apiKey: result.openai_api_key
            }, response => {
                if (response.fixedText) {
                    // Set text content based on element type
                    if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
                        element.innerText = response.fixedText;
                    } else {
                        element.value = response.fixedText;
                    }
                } else {
                    alert("Error: " + (response.error || "Unknown error occurred"));
                }
                // Reset button state
                resetButtonState();
                // Check content after fixing
                checkContent();
            });
        });

        function resetButtonState() {
            button.innerText = originalText;
            button.style.cursor = "pointer";
            // Restore hover effects
            button.onmouseover = () => {
                button.style.transform = "scale(1.2)";
                button.style.transition = "transform 0.2s";
            };
            button.onmouseout = () => {
                button.style.transform = "scale(1)";
            };
        }
    });

    // For elements that might change position (like expanding textareas)
    const updateButtonPosition = () => {
        if (button.style.position === "absolute") {
            const updatedRect = element.getBoundingClientRect();
            button.style.top = `${updatedRect.top + window.scrollY}px`;
            button.style.left = `${updatedRect.right + window.scrollX - button.offsetWidth - 10}px`;
        }
    };

    // Update position on window resize and scroll
    window.addEventListener("resize", updateButtonPosition);
    window.addEventListener("scroll", updateButtonPosition);

    // Remove button when element is removed
    const observer = new MutationObserver((mutations) => {
        if (!document.body.contains(element)) {
            button.remove();
            element.removeEventListener("input", checkContent);
            element.removeEventListener("change", checkContent);
            element.removeEventListener("keyup", checkContent);
            window.removeEventListener("resize", updateButtonPosition);
            window.removeEventListener("scroll", updateButtonPosition);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Function to find and process all relevant elements
function processElements() {
    // Process regular inputs and textareas
    document.querySelectorAll("textarea, input[type='text']").forEach(addFixButton);

    // Process contenteditable elements
    document.querySelectorAll("[contenteditable='true']").forEach(addFixButton);

    // Also look for elements with role="textbox" which are often used for rich text editors
    document.querySelectorAll("[role='textbox']").forEach(addFixButton);
}

// Initial processing
processElements();

// Monitor for dynamically added elements
const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            shouldProcess = true;
        } else if (mutation.attributeName === "contenteditable" || mutation.attributeName === "role") {
            shouldProcess = true;
        }
    });

    if (shouldProcess) {
        processElements();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["contenteditable", "role"]
});

// Periodically check for new elements that might have been added via JavaScript
// without triggering mutations (some frameworks do this)
setInterval(processElements, 2000);