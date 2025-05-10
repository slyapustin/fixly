// Check if the extension is disabled for this website before doing anything
chrome.storage.sync.get(['disabled_sites'], function(result) {
    // Initialize as empty array if not set
    const disabledSites = result.disabled_sites || [];
    let currentDomain = window.location.hostname;
    
    // Remove www. prefix if present to match how domains are stored in the disabled list
    if (currentDomain.startsWith('www.')) {
        currentDomain = currentDomain.substring(4);
    }
    
    // Check if current site is in the disabled list
    if (disabledSites.includes(currentDomain)) {
        console.log('Fixly is disabled for this website:', currentDomain);
        return; // Exit early, don't initialize the extension
    }
    
    // Continue with the rest of the extension logic
    // Load dependencies directly in content script
    loadDependencies();
});

// Load dependencies directly
function loadDependencies() {
    // Site adapters
    // W3Schools adapter
    window.fixlyAdapter_w3schools = {
      domains: ['w3schools.com'],
      processElements: function(addFixButton) {
        // Only run on tryit pages
        if (!window.location.href.includes('tryit.asp')) return;
        
        // Special handling for W3Schools CodeMirror editor
        // First, find the result frame which contains the editor iframe
        const resultFrame = document.getElementById('iframeResult');
        if (!resultFrame) {
          // If we're inside the result frame already, look for textareas
          const textareas = document.querySelectorAll('textarea');
          textareas.forEach(el => {
            // Force the button to be visible since W3Schools textareas might not trigger normal detection
            addFixButton(el);
            if (el._fixlyButton) {
              el._fixlyButton.style.display = 'inline-flex';
            }
          });
          return;
        }
        
        // If we found the result frame, it means we're in the parent page
        // We need to find the editor element (usually a textarea with CodeMirror)
        const editorElement = document.querySelector('.CodeMirror textarea') || 
                              document.querySelector('#textareaCode') ||
                              document.querySelector('textarea');
        
        if (editorElement) {
          addFixButton(editorElement);
          if (editorElement._fixlyButton) {
            // Force the button to be visible and positioned properly
            editorElement._fixlyButton.style.display = 'inline-flex';
            editorElement._fixlyButton.style.position = 'absolute';
            editorElement._fixlyButton.style.zIndex = '999999';
            
            // Position at the top right of the editor
            const editorRect = editorElement.getBoundingClientRect();
            editorElement._fixlyButton.style.top = `${editorRect.top + window.scrollY + 10}px`;
            editorElement._fixlyButton.style.left = `${editorRect.right + window.scrollX - 40}px`;
          }
        }
      },
      
      // Custom button styling for W3Schools
      styleButton: function(button, element, rect) {
        button.style.position = "absolute";
        button.style.top = `${rect.top + window.scrollY + 5}px`;
        button.style.left = `${rect.right + window.scrollX - 35}px`;
        button.style.zIndex = "999999"; // Higher z-index to ensure visibility
        button.style.display = "inline-flex"; // Force display
        
        // Make the button more visible
        button.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.4)"; // Stronger shadow
      },
      
      // Special text extraction method for W3Schools
      getElementText: function(element) {
        // For W3Schools, check if we're inside an iframe or dealing with CodeMirror
        if (element.classList.contains('CodeMirror-line') || element.closest('.CodeMirror')) {
          // For CodeMirror, we need to get the editor instance and get text from there
          const cmEditor = element.closest('.CodeMirror');
          if (cmEditor && cmEditor.CodeMirror) {
            return cmEditor.CodeMirror.getValue();
          }
        }
        
        // For textareas in W3Schools, ensure we get the actual value
        if (element.tagName === 'TEXTAREA') {
          return element.value || element.textContent || '';
        }
        
        // Default to standard text extraction
        return element.value || element.innerText || element.textContent || '';
      },
      
      // Custom text application for W3Schools
      applyFixedText: function(element, fixedText) {
        // For CodeMirror elements
        if (element.classList.contains('CodeMirror-line') || element.closest('.CodeMirror')) {
          const cmEditor = element.closest('.CodeMirror');
          if (cmEditor && cmEditor.CodeMirror) {
            cmEditor.CodeMirror.setValue(fixedText);
            return;
          }
        }
        
        // For standard textareas and inputs
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
          element.value = fixedText;
          
          // Trigger change events
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }
        
        // For contenteditable elements
        if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
          element.innerText = fixedText;
          
          // Trigger input event to handle dynamic updates
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    };

    // Define utilities
    window.fixlyUtils = {
      getNormalizedDomain: function() {
        let domain = window.location.hostname;
        if (domain.startsWith('www.')) {
          domain = domain.substring(4);
        }
        return domain;
      },
      
      isDisabledForCurrentSite: function(disabledSites) {
        const currentDomain = window.fixlyUtils.getNormalizedDomain();
        return disabledSites.includes(currentDomain);
      },
      
      applyFixedText: function(element, fixedText) {
        if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
          // For contenteditable elements
          element.focus();
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
            document.execCommand('insertText', false, fixedText);
          } else {
            // Fallback for older browsers
            element.innerText = fixedText;
          }

          // Dispatch input event to trigger any listeners
          const inputEvent = new Event('input', { bubbles: true });
          element.dispatchEvent(inputEvent);
        } else {
          // For regular inputs and textareas
          element.value = fixedText;

          // Trigger input event
          const inputEvent = new Event('input', { bubbles: true });
          element.dispatchEvent(inputEvent);
        }
      },
      
      getElementText: function(element) {
        // First check if we're on w3schools.com
        if (window.location.hostname.includes('w3schools.com')) {
          const w3SchoolsAdapter = window.fixlyAdapter_w3schools;
          if (w3SchoolsAdapter && typeof w3SchoolsAdapter.getElementText === 'function') {
            return w3SchoolsAdapter.getElementText(element);
          }
        }
        
        // Then check if element is inside an iframe
        if (window.frameElement) {
          console.log('Element is inside an iframe');
        }
        
        // For textareas and inputs, use value
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
          return element.value || '';
        }
        
        // For contenteditable elements
        if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
          return element.innerText || element.textContent || '';
        }
        
        // Fallback to standard value/innerText/textContent
        return element.value || element.innerText || element.textContent || '';
      },
      
      cleanupOrphanedButtons: function() {
        const buttonClasses = ['.fixly-button', '.fixly-direct-button'];
        
        buttonClasses.forEach(buttonClass => {
          document.querySelectorAll(buttonClass).forEach(button => {
            // Check if button is visible and has associated element
            const rect = button.getBoundingClientRect();
            
            // If button is not visible, remove it
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
        });
      }
    };
    
    // Define adapter registry
    window.fixlyAdapters = {
      // Registry of all site adapters
      adapters: [window.fixlyAdapter_w3schools],
      
      getAdapterForSite: function(domain) {
        return this.adapters.find(adapter => 
          adapter && adapter.domains && adapter.domains.some(adapterDomain => domain.includes(adapterDomain))
        ) || null;
      },
      
      registerSiteAdapter: function(adapter) {
        if (!adapter || !adapter.domains || !Array.isArray(adapter.domains)) {
          console.error('Invalid site adapter format');
          return;
        }
        
        this.adapters.push(adapter);
      },
      
      hasSiteAdapter: function(domain) {
        return this.adapters.some(adapter => 
          adapter && adapter.domains && adapter.domains.some(adapterDomain => domain.includes(adapterDomain))
        );
      }
    };
    
    // Initialize Fixly after all dependencies are set up
    initializeFixly();
}

// Wrap all the existing functionality in a function to call it conditionally
function initializeFixly() {
    // Don't assign methods to variables - this loses the 'this' context
    // Instead use them directly from the global objects
    
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
        button.setAttribute("data-fixly-persistent", "true"); // Mark as persistent to prevent cleanup

        // Add hover effect
        button.onmouseover = () => {
            button.style.transform = "scale(1.2)";
            button.style.transition = "transform 0.2s";
        };
        button.onmouseout = () => {
            button.style.transform = "scale(1)";
        };

        // Store reference to the button on the element for easier access later
        element._fixlyButton = button;

        // Mark the element as having a button - use setAttribute instead of dataset
        element.setAttribute("data-fixly-button-added", "true");

        // Get normalized domain without www. prefix
        let domain = window.fixlyUtils.getNormalizedDomain();

        // Get site adapter if one exists for this domain
        const siteAdapter = window.fixlyAdapters.getAdapterForSite(domain);
        
        // Different positioning strategies based on element type and site adapter
        if (siteAdapter) {
            // Use site adapter's styling
            const rect = element.getBoundingClientRect();
            siteAdapter.styleButton(button, element, rect);
            
            // If button was positioned absolutely, add to body
            if (button.style.position === "absolute") {
                document.body.appendChild(button);
                
                // Update position when window is scrolled or resized
                const updatePosition = () => {
                    if (!document.body.contains(element)) return;
                    
                    const updatedRect = element.getBoundingClientRect();
                    siteAdapter.styleButton(button, element, updatedRect);
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
                // For non-absolute positioned buttons, place them adjacent to the element
                if (element.nextSibling) {
                    element.parentNode.insertBefore(button, element.nextSibling);
                } else {
                    element.parentNode.appendChild(button);
                }
            }
        } else {
            // If no site adapter, use element type to determine positioning
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                // For regular inputs and textareas: place button adjacent (not absolute)
                button.style.position = "static";
                button.style.verticalAlign = "middle";
                button.style.marginLeft = "5px";
                
                // Insert after the element
                if (element.nextSibling) {
                    element.parentNode.insertBefore(button, element.nextSibling);
                } else {
                    element.parentNode.appendChild(button);
                }
                
                // Force button to be visible 
                button.style.display = "inline-flex";
            } else if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
                // For contenteditable elements, position absolutely
                button.style.position = "absolute";
                button.style.zIndex = "999999"; // Higher z-index

                // Position in the top-right corner of the element
                const rect = element.getBoundingClientRect();
                button.style.top = `${rect.top + window.scrollY + 5}px`;
                button.style.left = `${rect.right + window.scrollX - 35}px`;
                
                // Add to document body
                document.body.appendChild(button);

                // Update position when needed
                const updatePosition = () => {
                    if (!document.body.contains(element)) return;

                    const updatedRect = element.getBoundingClientRect();
                    button.style.top = `${updatedRect.top + window.scrollY + 5}px`;
                    button.style.left = `${updatedRect.right + window.scrollX - 35}px`;
                };

                window.addEventListener("scroll", updatePosition);
                window.addEventListener("resize", updatePosition);

                // Update periodically to handle dynamic changes
                const positionInterval = setInterval(updatePosition, 500);

                // Clean up when element is removed
                const cleanupEvents = () => {
                    window.removeEventListener("scroll", updatePosition);
                    window.removeEventListener("resize", updatePosition);
                    clearInterval(positionInterval);
                };

                // Store cleanup function
                element._fixlyCleanup = cleanupEvents;
            } else {
                // For any other element type, default to adjacent positioning
                button.style.verticalAlign = "middle";
                if (element.nextSibling) {
                    element.parentNode.insertBefore(button, element.nextSibling);
                } else {
                    element.parentNode.appendChild(button);
                }
            }
        }

        // Function to check content and show/hide button
        const checkContent = () => {
            let content = window.fixlyUtils.getElementText(element).trim();

            // For W3Schools and textareas, always show button regardless of content
            if (domain.includes('w3schools') || element.tagName === 'TEXTAREA') {
                button.style.display = "inline-flex";
                return;
            }

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

        // Force check content after delays to handle dynamic content
        setTimeout(checkContent, 500);
        setTimeout(checkContent, 1000);
        setTimeout(checkContent, 2000);

        // Add click handler with debugging
        button.addEventListener("click", () => {
            console.log('Fixly button clicked!');
            
            // Show loading state
            const originalText = button.innerText;
            button.innerText = "⏳";
            button.style.cursor = "default";
            button.onmouseover = null;
            button.onmouseout = null;

            // Get text content from element based on specific element type
            let textContent = "";
            
            // Special handling for W3Schools
            if (domain.includes('w3schools.com')) {
                console.log('W3Schools site detected, using special text extraction');
                
                // For textareas in W3Schools
                if (element.tagName === 'TEXTAREA') {
                    textContent = element.value || '';
                    console.log('Using direct textarea value:', textContent.substring(0, 30));
                }
                
                // If we're in an iframe editor
                if (window.location.href.includes('tryit.asp')) {
                    // Try to get direct value first
                    if (!textContent && element.value) {
                        textContent = element.value;
                        console.log('Using iframe element value:', textContent.substring(0, 30));
                    }
                    
                    // If still empty, try other methods
                    if (!textContent) {
                        // Try innerText/textContent
                        textContent = element.innerText || element.textContent || '';
                        console.log('Using innerText/textContent:', textContent.substring(0, 30));
                    }
                }
                
                // If still empty, look for CodeMirror
                if (!textContent && window.CodeMirror) {
                    // For CodeMirror editors
                    const cmElement = element.closest('.CodeMirror');
                    if (cmElement && cmElement.CodeMirror) {
                        textContent = cmElement.CodeMirror.getValue() || '';
                        console.log('Using CodeMirror value:', textContent.substring(0, 30));
                    }
                }
                
                // Final fallback for W3Schools - check the page for any visible textarea
                if (!textContent) {
                    const allTextareas = document.querySelectorAll('textarea');
                    if (allTextareas.length > 0) {
                        textContent = allTextareas[0].value || '';
                        console.log('Using fallback first textarea value:', textContent.substring(0, 30));
                    }
                }
            } else {
                // Standard extraction for non-W3Schools sites
                textContent = window.fixlyUtils.getElementText(element);
            }
            
            // Ensure we have text content
            if (!textContent) {
                console.error('Failed to extract text content');
                alert("Error: Could not extract text from the element");
                resetButtonState();
                return;
            }
            
            console.log('Text content to fix:', textContent.substring(0, 50) + (textContent.length > 50 ? '...' : ''));

            // Store original text for undo functionality
            element._fixlyOriginalText = textContent;

            // Get API key from Chrome storage
            chrome.storage.sync.get(['openai_api_key'], (result) => {
                if (!result.openai_api_key) {
                    alert("Please set your OpenAI API key in the Fixly extension settings.");
                    console.log('No API key found');
                    button.innerText = originalText;
                    resetButtonState();
                    return;
                }

                console.log('Sending fix request to background script, text length:', textContent.length);
                chrome.runtime.sendMessage({
                    action: "fixText",
                    text: textContent,
                    apiKey: result.openai_api_key
                }, response => {
                    console.log('Received response:', response ? 'success' : 'error');
                    
                    if (response && response.fixedText) {
                        // Check if we have a site adapter that can handle text application
                        const domain = window.fixlyUtils.getNormalizedDomain();
                        const siteAdapter = window.fixlyAdapters.getAdapterForSite(domain);
                        
                        if (siteAdapter && typeof siteAdapter.applyFixedText === 'function') {
                            // Use site-specific text handling
                            console.log('Using site adapter to apply fixed text');
                            siteAdapter.applyFixedText(element, response.fixedText);
                        } else {
                            // Use default text handling
                            console.log('Using default method to apply fixed text');
                            window.fixlyUtils.applyFixedText(element, response.fixedText);
                        }
                        
                        // Add undo functionality
                        addUndoFunctionality(element);
                    } else {
                        alert("Error: " + (response && response.error ? response.error : "Unknown error occurred"));
                        console.log('Error fixing text:', response ? response.error : 'Unknown error');
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

    // Function to add undo functionality to elements
    function addUndoFunctionality(element) {
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

                        // Apply the original text
                        window.fixlyUtils.applyFixedText(element, element._fixlyOriginalText);

                        // Clear the stored original text after using it once
                        element._fixlyOriginalText = null;
                    }
                }
            };

            element.addEventListener('keydown', element._fixlyUndoHandler);
        }
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
            ".full-height",
            ".CodeMirror" // Add CodeMirror as a common editor class
        ];

        document.querySelectorAll(editorSelectors.join(", ")).forEach(element => {
            if (element.isContentEditable || element.getAttribute("contenteditable")) {
                addFixButton(element);
            }
        });

        // Try to access iframe contents if they're from the same origin
        try {
            document.querySelectorAll('iframe').forEach(iframe => {
                try {
                    // This will throw if cross-origin
                    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    
                    // Apply the same logic to the iframe's content
                    iframeDocument.querySelectorAll("textarea, input[type='text']").forEach(addFixButton);
                    iframeDocument.querySelectorAll("[contenteditable='true']").forEach(addFixButton);
                    iframeDocument.querySelectorAll("[contenteditable='']").forEach(addFixButton);
                    iframeDocument.querySelectorAll("[contenteditable]").forEach(element => {
                        if (element.isContentEditable) {
                            addFixButton(element);
                        }
                    });
                    
                    // Look for editor elements in the iframe
                    iframeDocument.querySelectorAll("[role='textbox']").forEach(addFixButton);
                    iframeDocument.querySelectorAll(editorSelectors.join(", ")).forEach(element => {
                        if (element.isContentEditable || element.getAttribute("contenteditable")) {
                            addFixButton(element);
                        }
                    });
                } catch (e) {
                    // Silently fail on cross-origin iframe access
                    console.log("Could not access iframe content due to same-origin policy");
                }
            });
        } catch (e) {
            console.log("Error processing iframes:", e);
        }

        // Get domain and check for site adapter
        const domain = window.fixlyUtils.getNormalizedDomain();
        const siteAdapter = window.fixlyAdapters.getAdapterForSite(domain);
        
        // Use site-specific processor if available
        if (siteAdapter && typeof siteAdapter.processElements === 'function') {
            siteAdapter.processElements(addFixButton);
        }
    }

    // Initial processing with delay to ensure page is fully loaded
    setTimeout(processElements, 1000);

    // Get normalized domain and check for site adapter
    const domain = window.fixlyUtils.getNormalizedDomain();
    const siteAdapter = window.fixlyAdapters.getAdapterForSite(domain);
    
    // Set up site-specific periodic processes if needed
    if (siteAdapter) {
        // For sites that need special handling of direct buttons
        if (domain.includes("linkedin.com") && typeof siteAdapter.addDirectMessageButton === 'function') {
            // Set a flag to indicate we're using the direct button approach
            window.fixlyUsingDirectButtons = true;

            // Initial call with delay
            setTimeout(siteAdapter.addDirectMessageButton, 2000);

            // Periodic calls for the direct button approach
            setInterval(siteAdapter.addDirectMessageButton, 3000);
        }
        
        // Special handling for W3Schools
        if (domain.includes("w3schools.com") && typeof siteAdapter.processElements === 'function') {
            // Initial call with longer delay to ensure frames are loaded
            setTimeout(() => siteAdapter.processElements(addFixButton), 2000);
            
            // Periodic calls to handle dynamic changes in the editor
            setInterval(() => siteAdapter.processElements(addFixButton), 3000);
        }
    }

    // Monitor for dynamically added elements
    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;

        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check specifically for added textareas or elements that might be editors
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'TEXTAREA' || 
                            node.hasAttribute('contenteditable') || 
                            node.getAttribute('role') === 'textbox') {
                            // If we find a direct text editor element, process it immediately
                            addFixButton(node);
                        } else if (node.querySelector) {
                            // Check for any relevant elements inside the added node
                            const textareas = node.querySelectorAll('textarea');
                            if (textareas.length > 0) {
                                textareas.forEach(addFixButton);
                                shouldProcess = true;
                            }
                            
                            const editables = node.querySelectorAll('[contenteditable]');
                            if (editables.length > 0) {
                                editables.forEach(addFixButton);
                                shouldProcess = true;
                            }
                        }
                    }
                }
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
        attributeFilter: ["contenteditable", "role", "data-placeholder", "aria-hidden", "data-artdeco-is-focused"]
    });

    // Periodically check for new elements that might have been added via JavaScript
    // without triggering mutations (some frameworks do this)
    setInterval(() => {
        processElements();
    }, 2000);
}