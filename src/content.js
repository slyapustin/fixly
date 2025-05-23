// Create the floating button
let floatingBtn = document.createElement("button");
floatingBtn.innerText = "✨"; // Sparkle emoji
floatingBtn.id = "fixlyFloatingBtn";
floatingBtn.title = "Fix selected text with AI";
floatingBtn.style.position = "absolute";
floatingBtn.style.display = "none";
floatingBtn.style.zIndex = "99999";
floatingBtn.style.padding = "5px";
floatingBtn.style.cursor = "pointer";
floatingBtn.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
floatingBtn.style.borderRadius = "50%";
floatingBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
floatingBtn.style.border = "none";
floatingBtn.style.height = "30px";
floatingBtn.style.width = "30px";
floatingBtn.style.lineHeight = "1";
floatingBtn.style.fontSize = "20px";
floatingBtn.style.fontFamily = "Arial, sans-serif";
floatingBtn.style.userSelect = "none";
floatingBtn.style.display = "flex";
floatingBtn.style.alignItems = "center";
floatingBtn.style.justifyContent = "center";

// Add hover effect
floatingBtn.onmouseover = () => {
    floatingBtn.style.transform = "scale(1.2)";
    floatingBtn.style.transition = "transform 0.2s";
};
floatingBtn.onmouseout = () => {
    floatingBtn.style.transform = "scale(1)";
};

// Add button to the body
document.body.appendChild(floatingBtn);

// Event listeners for text selection
document.addEventListener('mouseup', showButton);
document.addEventListener('keyup', showButton);

// Function to show the button when text is selected
function showButton(event) {
    // Check if selection is in an input or textfield
    const active = document.activeElement;
    const isTextField = active && (
        active.tagName === 'TEXTAREA' || 
        (active.tagName === 'INPUT' && active.type === 'text') ||
        active.isContentEditable
    );

    // If in a text field, check selection
    if (isTextField) {
        // For contenteditable
        if (active.isContentEditable) {
            const selection = window.getSelection();
            if (selection.rangeCount === 0 || selection.isCollapsed) {
                floatingBtn.style.display = 'none';
                return;
            }
            
            // Place button near cursor
            placeButtonAt(event.clientX, event.clientY);
        } 
        // For input and textarea elements
        else {
            const start = active.selectionStart;
            const end = active.selectionEnd;
            if (start === end) {
                floatingBtn.style.display = 'none';
                return;
            }
            
            // Place button near cursor
            placeButtonAt(event.clientX, event.clientY);
        }
    } 
    // For regular text selection
    else {
        const selection = window.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            floatingBtn.style.display = 'none';
            return;
        }
        
        // Place button near cursor
        placeButtonAt(event.clientX, event.clientY);
    }
}

// Function to position the button at the specified coordinates
function placeButtonAt(x, y) {
    floatingBtn.style.top = `${window.scrollY + y + 20}px`;
    floatingBtn.style.left = `${window.scrollX + x + 10}px`;
    floatingBtn.style.display = 'flex';
}

// Function to get selected text
function getSelectedText() {
    const active = document.activeElement;
    let selectedText = '';
    
    // Handle different types of selections
    if (active && (active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && active.type === 'text'))) {
        // For input and textarea elements
        selectedText = active.value.substring(active.selectionStart, active.selectionEnd);
    } else {
        // For contenteditable and regular text selections
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            selectedText = selection.toString();
        }
    }
    
    return selectedText;
}

// Function to apply fixed text to the selection
function applyFixedText(fixedText) {
    const active = document.activeElement;
    
    // For input and textarea elements
    if (active && (active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && active.type === 'text'))) {
        const start = active.selectionStart;
        const end = active.selectionEnd;
        const value = active.value;
        
        // Replace selected text with fixed text
        active.value = value.substring(0, start) + fixedText + value.substring(end);
        
        // Set cursor position after the inserted text
        active.selectionStart = active.selectionEnd = start + fixedText.length;
        
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        active.dispatchEvent(inputEvent);
    } 
    // For contenteditable elements and regular text selections
    else {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(fixedText));
            
            // Collapse selection to end
            selection.collapseToEnd();
        }
    }
}

// Function to reset button state
function resetButtonState() {
    floatingBtn.innerText = "✨";
    floatingBtn.style.cursor = "pointer";
    
    // Restore hover effects
    floatingBtn.onmouseover = () => {
        floatingBtn.style.transform = "scale(1.2)";
        floatingBtn.style.transition = "transform 0.2s";
    };
    floatingBtn.onmouseout = () => {
        floatingBtn.style.transform = "scale(1)";
    };
}

// Add click event listener to the button
floatingBtn.addEventListener('click', () => {
    // Show loading state
    floatingBtn.innerText = "⏳";
    floatingBtn.style.cursor = "default";
    floatingBtn.onmouseover = null;
    floatingBtn.onmouseout = null;

    // Get selected text
    const selectedText = getSelectedText();
    if (!selectedText || selectedText.trim() === '') {
        resetButtonState();
        floatingBtn.style.display = 'none';
        return;
    }

    // Get provider and settings from Chrome storage
    chrome.storage.sync.get(['provider', 'openai_api_key'], (result) => {
        const provider = result.provider || 'openai';

        // Create request object
        const request = {
            action: "fixText",
            text: selectedText
        };

        // Add apiKey for OpenAI
        if (provider === 'openai') {
            if (!result.openai_api_key) {
                alert("Please set your OpenAI API key in the Fixly extension settings.");
                resetButtonState();
                return;
            }
            request.apiKey = result.openai_api_key;
        }

        // Send message to background script
        chrome.runtime.sendMessage(request, response => {
            if (response.fixedText) {
                // Apply fixed text to selection
                applyFixedText(response.fixedText);
            } else {
                alert("Error: " + (response.error || "Unknown error occurred"));
            }
            
            // Reset button state and hide
            resetButtonState();
            floatingBtn.style.display = 'none';
        });
    });
});

// Hide button when clicking elsewhere
document.addEventListener('mousedown', (event) => {
    // Don't hide if clicking on the button itself
    if (event.target !== floatingBtn) {
        floatingBtn.style.display = 'none';
    }
});

// Log when the content script is loaded
console.log("Fixly content script loaded");
