function addFixButton(element) {
    // Check if button already exists for this element
    // Use hasAttribute to check if the attribute exists at all
    if (element.hasAttribute("data-fixly-button-added") || element.hasAttribute("data-fixly-direct-button")) {
        return;
    }

    let button = document.createElement("span");
    button.innerText = "✨";
    button.style.padding = "0"; // Remove padding since we're using fixed width/height with flexbox
    button.style.cursor = "pointer";
    button.style.zIndex = "99999"; // Increased z-index
    button.style.margin = "5px";
    button.style.fontSize = "20px";
    button.style.fontFamily = "Arial, sans-serif";
    button.style.display = "none"; // Initially hidden
    button.style.userSelect = "none";
    button.style.backgroundColor = "rgba(255, 255, 255, 0.9)"; // Add background
    button.style.borderRadius = "50%"; // Make it circular
    button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)"; // Add shadow for visibility
    button.style.height = "30px"; // Increased fixed height
    button.style.width = "30px"; // Increased fixed width
    button.style.lineHeight = "30px"; // Align text vertically
    button.style.textAlign = "center"; // Center text horizontally
    button.style.display = "inline-flex"; // Use flexbox for better centering
    button.style.alignItems = "center"; // Center vertically with flexbox
    button.style.justifyContent = "center"; // Center horizontally with flexbox
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

    // Mark the element as having a button - use setAttribute instead of dataset
    element.setAttribute("data-fixly-button-added", "true");

    // Different placement strategy based on element type
    if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
        // For contenteditable elements, position the button absolutely relative to the element
        button.style.position = "absolute";

        // Position the button in the top-right corner of the element
        const rect = element.getBoundingClientRect();

        // For LinkedIn specifically, adjust the position
        if (window.location.hostname.includes("linkedin.com")) {
            // Position inside the element for better visibility
            button.style.top = `${rect.top + window.scrollY + 10}px`;
            button.style.left = `${rect.right + window.scrollX - 40}px`;

            // Make it more visible on LinkedIn
            button.style.fontSize = "22px";
            button.style.padding = "5px 10px";
        } else {
            button.style.top = `${rect.top + window.scrollY + 5}px`;
            button.style.left = `${rect.right + window.scrollX - 30}px`;
        }

        document.body.appendChild(button);

        // Update position when window is scrolled or resized
        const updatePosition = () => {
            if (!document.body.contains(element)) return;

            const updatedRect = element.getBoundingClientRect();

            // For LinkedIn specifically, adjust the position
            if (window.location.hostname.includes("linkedin.com")) {
                button.style.top = `${updatedRect.top + window.scrollY + 10}px`;
                button.style.left = `${updatedRect.right + window.scrollX - 40}px`;
            } else {
                button.style.top = `${updatedRect.top + window.scrollY + 5}px`;
                button.style.left = `${updatedRect.right + window.scrollX - 30}px`;
            }
        };

        window.addEventListener("scroll", updatePosition);
        window.addEventListener("resize", updatePosition);

        // Also update position periodically to handle dynamic changes
        const positionInterval = setInterval(updatePosition, 500);

        // Clean up when element is removed
        const cleanupEvents = () => {
            window.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
            clearInterval(positionInterval);
        };

        // Store cleanup function on the element
        element._fixlyCleanup = cleanupEvents;
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

        // For LinkedIn, always show the button on message composers
        if (window.location.hostname.includes("linkedin.com") &&
            (element.classList.contains("msg-form__contenteditable") ||
                element.closest(".msg-form__contenteditable") ||
                element.classList.contains("t-14") &&
                element.classList.contains("t-black--light") &&
                element.classList.contains("t-normal"))) {

            // Force button to be visible for LinkedIn message composers
            button.style.display = "inline-flex";

            // Also ensure the button is positioned correctly
            const rect = element.getBoundingClientRect();
            button.style.top = `${rect.top + window.scrollY + 10}px`;
            button.style.left = `${rect.right + window.scrollX - 40}px`;

            return;
        }

        // Normal content checking for other elements
        if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
            content = element.innerText || element.textContent;

            // Special handling for LinkedIn message composer
            if (window.location.hostname.includes("linkedin.com") &&
                (element.classList.contains("msg-form__contenteditable") ||
                    element.closest(".msg-form__contenteditable"))) {

                // Check if the element has a placeholder sibling
                const placeholder = element.querySelector('[data-placeholder]') ||
                    element.parentElement.querySelector('[data-placeholder]');

                if (placeholder) {
                    // If placeholder is visible, the field is likely empty
                    const isPlaceholderVisible = window.getComputedStyle(placeholder).display !== 'none';
                    if (isPlaceholderVisible) {
                        content = ""; // Consider it empty if placeholder is visible
                    }
                }

                // Also check aria-hidden attribute which LinkedIn uses to toggle placeholder visibility
                if (element.getAttribute('aria-hidden') === 'true') {
                    content = ""; // Consider it empty if aria-hidden is true
                }
            }
        } else {
            content = element.value;
        }

        // Trim the content to ignore whitespace
        content = content.trim();

        // Show button only if there's actual content
        if (content.length > 0) {
            button.style.display = "inline-flex";
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

    // Force check content after a short delay to handle dynamic content
    setTimeout(checkContent, 500);

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

        // Store original text for undo functionality
        element._fixlyOriginalText = textContent;

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
                        // For LinkedIn and other complex editors, use a more careful approach
                        // First, focus the element to ensure it's active
                        element.focus();

                        // Store the original text for undo functionality
                        if (!element._fixlyOriginalText) {
                            element._fixlyOriginalText = element.innerText || element.textContent;
                        }

                        // Clear the current content
                        // Use selection and execCommand for better compatibility with rich text editors
                        if (document.createRange && window.getSelection) {
                            // Modern browsers
                            const range = document.createRange();
                            range.selectNodeContents(element);
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);

                            // Delete the current content
                            document.execCommand('delete', false, null);

                            // Insert the new content
                            document.execCommand('insertText', false, response.fixedText);
                        } else {
                            // Fallback for older browsers
                            element.innerText = response.fixedText;
                        }

                        // Dispatch input event to trigger any listeners
                        const inputEvent = new Event('input', { bubbles: true });
                        element.dispatchEvent(inputEvent);

                        // For LinkedIn specifically
                        if (window.location.hostname.includes("linkedin.com")) {
                            // Trigger a keypress event to ensure LinkedIn's editor updates properly
                            const keypressEvent = new KeyboardEvent('keypress', {
                                bubbles: true,
                                cancelable: true,
                                key: ' ',
                                keyCode: 32
                            });
                            element.dispatchEvent(keypressEvent);

                            // Also trigger a change event
                            const changeEvent = new Event('change', { bubbles: true });
                            element.dispatchEvent(changeEvent);

                            // Special handling for LinkedIn message composer
                            if (element.classList.contains("msg-form__contenteditable") ||
                                element.closest(".msg-form__contenteditable")) {

                                // Find any placeholder elements and hide them
                                const placeholder = element.querySelector('[data-placeholder]') ||
                                    element.parentElement.querySelector('[data-placeholder]');
                                if (placeholder) {
                                    placeholder.style.display = 'none';
                                }

                                // Set aria-hidden to false to indicate content is present
                                element.setAttribute('aria-hidden', 'false');

                                // Set data-artdeco-is-focused to true
                                if (element.hasAttribute('data-artdeco-is-focused')) {
                                    element.setAttribute('data-artdeco-is-focused', 'true');
                                }

                                // Focus the element again to ensure it's active
                                setTimeout(() => {
                                    element.focus();

                                    // Move cursor to end
                                    if (document.createRange && window.getSelection) {
                                        const range = document.createRange();
                                        range.selectNodeContents(element);
                                        range.collapse(false); // false means collapse to end
                                        const selection = window.getSelection();
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                    }
                                }, 50);
                            }
                        }

                        // Add undo event listener if not already added
                        if (!element._fixlyUndoListenerAdded) {
                            element._fixlyUndoListenerAdded = true;

                            // Create the handler function and store it for later removal
                            element._fixlyUndoHandler = function (e) {
                                // Check for Ctrl+Z or Cmd+Z (Mac)
                                if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                                    // If we have stored original text, restore it
                                    if (element._fixlyOriginalText) {
                                        e.preventDefault(); // Prevent default undo behavior

                                        if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
                                            // For contenteditable elements
                                            // Use selection and execCommand for better compatibility
                                            if (document.createRange && window.getSelection) {
                                                // Modern browsers
                                                const range = document.createRange();
                                                range.selectNodeContents(element);
                                                const selection = window.getSelection();
                                                selection.removeAllRanges();
                                                selection.addRange(range);

                                                // Delete the current content
                                                document.execCommand('delete', false, null);

                                                // Insert the original content
                                                document.execCommand('insertText', false, element._fixlyOriginalText);
                                            } else {
                                                // Fallback for older browsers
                                                element.innerText = element._fixlyOriginalText;
                                            }

                                            // Dispatch input event to trigger any listeners
                                            const inputEvent = new Event('input', { bubbles: true });
                                            element.dispatchEvent(inputEvent);
                                        } else {
                                            // For regular inputs and textareas
                                            element.value = element._fixlyOriginalText;

                                            // Trigger input event
                                            const inputEvent = new Event('input', { bubbles: true });
                                            element.dispatchEvent(inputEvent);
                                        }

                                        // Clear the stored original text after using it once
                                        element._fixlyOriginalText = null;

                                        // Check content after undoing
                                        checkContent();
                                    }
                                }
                            };

                            element.addEventListener('keydown', element._fixlyUndoHandler);
                        }
                    } else {
                        // Store the original text for undo functionality
                        if (!element._fixlyOriginalText) {
                            element._fixlyOriginalText = element.value;
                        }

                        element.value = response.fixedText;

                        // Trigger input event for regular inputs
                        const inputEvent = new Event('input', { bubbles: true });
                        element.dispatchEvent(inputEvent);
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
            button.style.display = "inline-flex"; // Ensure display is set to inline-flex
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

    // Remove button when element is removed
    const observer = new MutationObserver((mutations) => {
        if (!document.body.contains(element)) {
            button.remove();
            element.removeEventListener("input", checkContent);
            element.removeEventListener("change", checkContent);
            element.removeEventListener("keyup", checkContent);

            // Remove undo event listener if it was added
            if (element._fixlyUndoListenerAdded) {
                element.removeEventListener('keydown', element._fixlyUndoHandler);
                element._fixlyUndoListenerAdded = false;
            }

            // Call cleanup function if it exists
            if (typeof element._fixlyCleanup === "function") {
                element._fixlyCleanup();
            }

            // Disconnect placeholder observer if it exists
            if (element._fixlyPlaceholderObserver) {
                element._fixlyPlaceholderObserver.disconnect();
            }

            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Add a specific fix for LinkedIn contenteditable elements
function addLinkedInFixes() {
    // LinkedIn message composer - use multiple selectors to ensure we catch it
    const messageComposerSelectors = [
        '.msg-form__contenteditable',
        '[role="textbox"][data-placeholder="Write a message…"]',
        '[role="textbox"][data-artdeco-is-focused]',
        '.msg-form__message-texteditor',
        '.msg-form__message-texteditor [contenteditable]'
    ];

    // Join all selectors with commas
    const composerSelector = messageComposerSelectors.join(', ');

    // Find all message composers
    document.querySelectorAll(composerSelector).forEach(element => {
        // Special handling for LinkedIn message composer
        if (!element.hasAttribute("data-fixly-button-added")) {
            // Add a mutation observer specifically for this element to detect placeholder changes
            const placeholderObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' &&
                        (mutation.attributeName === 'aria-hidden' ||
                            mutation.attributeName === 'data-artdeco-is-focused')) {
                        // When these attributes change, it might indicate the editor state changed
                        // Force a content check on the element's fix button
                        const buttons = document.querySelectorAll('.fixly-button');
                        buttons.forEach(btn => {
                            // Find the button associated with this element
                            const rect = element.getBoundingClientRect();
                            const btnRect = btn.getBoundingClientRect();

                            // If the button is near this element
                            if (Math.abs(btnRect.left - (rect.right - 40)) < 50 &&
                                Math.abs(btnRect.top - (rect.top + 10)) < 50) {
                                // Make button visible for LinkedIn message composers
                                btn.style.display = "inline-flex";
                            }
                        });
                    }
                });
            });

            placeholderObserver.observe(element, {
                attributes: true,
                attributeFilter: ['aria-hidden', 'data-artdeco-is-focused', 'placeholder', 'contenteditable']
            });

            // Store the observer for cleanup
            element._fixlyPlaceholderObserver = placeholderObserver;
        }

        addFixButton(element);

        // Also check parent elements for contenteditable
        let parent = element.parentElement;
        while (parent && parent.tagName !== 'BODY') {
            if (parent.isContentEditable || parent.getAttribute("contenteditable") === "true") {
                if (!parent.hasAttribute("data-fixly-button-added")) {
                    addFixButton(parent);
                }
            }
            parent = parent.parentElement;
        }

        // Also check child elements for contenteditable
        element.querySelectorAll('[contenteditable]').forEach(child => {
            if (!child.hasAttribute("data-fixly-button-added")) {
                addFixButton(child);
            }
        });
    });

    // LinkedIn post composer
    document.querySelectorAll('[role="textbox"][aria-label="Write a post"]').forEach(element => {
        addFixButton(element);
    });

    // LinkedIn comment fields
    document.querySelectorAll('[role="textbox"][aria-label*="comment"]').forEach(element => {
        addFixButton(element);
    });

    // LinkedIn has specific classes for their contenteditable elements
    document.querySelectorAll('.t-14.t-black--light.t-normal').forEach(element => {
        if (element.isContentEditable || element.getAttribute("contenteditable")) {
            addFixButton(element);
        }
    });

    // Look for elements with data-placeholder attribute (LinkedIn uses these)
    document.querySelectorAll('[data-placeholder]').forEach(element => {
        if (element.isContentEditable || element.getAttribute("contenteditable")) {
            addFixButton(element);
        }
    });
}

// Function to find and process all relevant elements
function processElements() {
    // Process regular inputs and textareas
    document.querySelectorAll("textarea, input[type='text']").forEach(addFixButton);

    // Process contenteditable elements - use multiple selectors to catch all variations
    document.querySelectorAll("[contenteditable='true']").forEach(addFixButton);
    document.querySelectorAll("[contenteditable='']").forEach(addFixButton);
    document.querySelectorAll("[contenteditable]").forEach(element => {
        if (element.isContentEditable) {
            addFixButton(element);
        }
    });

    // Also look for elements with role="textbox" which are often used for rich text editors
    document.querySelectorAll("[role='textbox']").forEach(addFixButton);

    // Look for common editor class names
    const editorSelectors = [
        ".editor",
        ".rich-text-editor",
        ".text-editor",
        ".msg-form__contenteditable",
        ".t-14",
        ".t-black--light",
        ".t-normal",
        ".notranslate",
        ".flex-grow-1",
        ".full-height"
    ];

    document.querySelectorAll(editorSelectors.join(", ")).forEach(element => {
        if (element.isContentEditable || element.getAttribute("contenteditable")) {
            addFixButton(element);
        }
    });

    // Apply LinkedIn-specific fixes - but only if we're not using the direct button approach
    if (window.location.hostname.includes("linkedin.com") && !window.fixlyUsingDirectButtons) {
        addLinkedInFixes();
    }
}

// Initial processing with delay to ensure page is fully loaded
setTimeout(processElements, 1000);

// For LinkedIn, we'll use either the direct button approach OR the standard approach, not both
if (window.location.hostname.includes("linkedin.com")) {
    // Set a flag to indicate we're using the direct button approach
    window.fixlyUsingDirectButtons = true;

    // Initial call with delay
    setTimeout(addLinkedInMessageComposerButton, 2000);

    // Periodic calls for the direct button approach
    setInterval(addLinkedInMessageComposerButton, 3000);
}

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

        // Apply LinkedIn-specific fixes if on LinkedIn - but only if not using direct buttons
        if (window.location.hostname.includes("linkedin.com") && !window.fixlyUsingDirectButtons) {
            addLinkedInFixes();
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["contenteditable", "role", "data-placeholder", "aria-hidden", "data-artdeco-is-focused"]
});

// Periodically check for new elements that might have been added via JavaScript
// without triggering mutations (some frameworks do this)
setInterval(() => {
    processElements();

    // Apply LinkedIn-specific fixes if on LinkedIn - but only if not using direct buttons
    if (window.location.hostname.includes("linkedin.com") && !window.fixlyUsingDirectButtons) {
        addLinkedInFixes();
    }
}, 2000);

// Function to directly add a fix button to LinkedIn's message composer
// This is a more aggressive approach that bypasses the normal detection
function addLinkedInMessageComposerButton() {
    // First, clean up any existing direct buttons to prevent duplicates
    document.querySelectorAll('.fixly-direct-button').forEach(button => {
        // Check if the button's associated element still exists
        const rect = button.getBoundingClientRect();
        const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        const hasAssociatedElement = elementsAtPoint.some(el =>
            el.hasAttribute("data-fixly-direct-button") ||
            el.hasAttribute("data-fixly-button-added")
        );

        // If no associated element exists, remove the button
        if (!hasAssociatedElement) {
            button.remove();
        }
    });

    // Try to find the message composer using various selectors
    const selectors = [
        '.msg-form__contenteditable',
        '[role="textbox"][data-placeholder="Write a message…"]',
        '.msg-form__message-texteditor [contenteditable]',
        '.msg-form__message-texteditor'
    ];

    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(element => {
                // Skip if already processed by either method
                if (element.hasAttribute("data-fixly-direct-button") || element.hasAttribute("data-fixly-button-added")) {
                    return;
                }

                // Mark as processed
                element.setAttribute("data-fixly-direct-button", "true");

                // Create a button directly in the element's parent
                const button = document.createElement("span");
                button.innerText = "✨";
                button.style.position = "absolute";
                button.style.zIndex = "999999";
                button.style.fontSize = "22px";
                button.style.padding = "0"; // Remove padding since we're using fixed width/height with flexbox
                button.style.cursor = "pointer";
                button.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                button.style.borderRadius = "50%";
                button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                button.style.userSelect = "none";
                button.style.height = "32px"; // Increased fixed height
                button.style.width = "32px"; // Increased fixed width
                button.style.lineHeight = "32px"; // Align text vertically
                button.style.textAlign = "center"; // Center text horizontally
                button.style.display = "inline-flex"; // Use flexbox for better centering
                button.style.alignItems = "center"; // Center vertically with flexbox
                button.style.justifyContent = "center"; // Center horizontally with flexbox
                button.title = "Fix text with AI";
                button.className = "fixly-direct-button";

                // Position the button
                const rect = element.getBoundingClientRect();
                button.style.top = `${rect.top + window.scrollY + 10}px`;
                button.style.left = `${rect.right + window.scrollX - 40}px`;

                // Add hover effect
                button.onmouseover = () => {
                    button.style.transform = "scale(1.2)";
                    button.style.transition = "transform 0.2s";
                };
                button.onmouseout = () => {
                    button.style.transform = "scale(1)";
                };

                // Add click handler
                button.addEventListener("click", () => {
                    // Show loading state
                    const originalText = button.innerText;
                    button.innerText = "⏳";

                    // Get text content
                    const textContent = element.innerText || element.textContent;

                    // Get API key from Chrome storage
                    chrome.storage.sync.get(['openai_api_key'], (result) => {
                        if (!result.openai_api_key) {
                            alert("Please set your OpenAI API key in the Fixly extension settings.");
                            button.innerText = originalText;
                            return;
                        }

                        chrome.runtime.sendMessage({
                            action: "fixText",
                            text: textContent,
                            apiKey: result.openai_api_key
                        }, response => {
                            if (response.fixedText) {
                                // Focus the element
                                element.focus();

                                // Use execCommand to replace text
                                if (document.createRange && window.getSelection) {
                                    const range = document.createRange();
                                    range.selectNodeContents(element);
                                    const selection = window.getSelection();
                                    selection.removeAllRanges();
                                    selection.addRange(range);

                                    document.execCommand('delete', false, null);
                                    document.execCommand('insertText', false, response.fixedText);
                                } else {
                                    element.innerText = response.fixedText;
                                }

                                // Trigger events
                                element.dispatchEvent(new Event('input', { bubbles: true }));
                                element.dispatchEvent(new KeyboardEvent('keypress', {
                                    bubbles: true,
                                    cancelable: true,
                                    key: ' ',
                                    keyCode: 32
                                }));
                            } else {
                                alert("Error: " + (response.error || "Unknown error occurred"));
                            }

                            // Reset button
                            button.innerText = originalText;
                            button.style.display = "inline-flex"; // Ensure display is set to inline-flex
                        });
                    });
                });

                // Add to document
                document.body.appendChild(button);

                // Update position on scroll and resize
                const updatePosition = () => {
                    if (!document.body.contains(element)) {
                        button.remove();
                        return;
                    }

                    const updatedRect = element.getBoundingClientRect();
                    button.style.top = `${updatedRect.top + window.scrollY + 10}px`;
                    button.style.left = `${updatedRect.right + window.scrollX - 40}px`;
                };

                window.addEventListener("scroll", updatePosition);
                window.addEventListener("resize", updatePosition);

                // Update periodically
                const interval = setInterval(() => {
                    if (!document.body.contains(element)) {
                        button.remove();
                        clearInterval(interval);
                        window.removeEventListener("scroll", updatePosition);
                        window.removeEventListener("resize", updatePosition);
                        return;
                    }

                    updatePosition();
                }, 500);
            });

            return; // Exit after processing the first matching selector
        }
    }
}

// Function to clean up orphaned buttons
function cleanupOrphanedButtons() {
    // Clean up fixly-button elements
    document.querySelectorAll('.fixly-button').forEach(button => {
        // Check if the button is still visible and has an associated element
        const rect = button.getBoundingClientRect();

        // If the button is not visible (zero size or off-screen), remove it
        if (rect.width === 0 || rect.height === 0 ||
            rect.left < 0 || rect.top < 0 ||
            rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
            button.remove();
            return;
        }

        // Check if there's an element with our data attribute near the button
        const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        const hasAssociatedElement = elementsAtPoint.some(el =>
            el.hasAttribute("data-fixly-button-added") ||
            el.hasAttribute("data-fixly-direct-button")
        );

        if (!hasAssociatedElement) {
            button.remove();
        }
    });

    // Clean up fixly-direct-button elements
    document.querySelectorAll('.fixly-direct-button').forEach(button => {
        // Check if the button is still visible and has an associated element
        const rect = button.getBoundingClientRect();

        // If the button is not visible (zero size or off-screen), remove it
        if (rect.width === 0 || rect.height === 0 ||
            rect.left < 0 || rect.top < 0 ||
            rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
            button.remove();
            return;
        }

        // Check if there's an element with our data attribute near the button
        const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        const hasAssociatedElement = elementsAtPoint.some(el =>
            el.hasAttribute("data-fixly-direct-button") ||
            el.hasAttribute("data-fixly-button-added")
        );

        if (!hasAssociatedElement) {
            button.remove();
        }
    });
}

// Run the cleanup periodically
setInterval(cleanupOrphanedButtons, 5000);