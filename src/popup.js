document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelInput = document.getElementById('modelInput');
    const systemPromptInput = document.getElementById('systemPromptInput');
    const saveButton = document.getElementById('saveKey');
    const resetPromptButton = document.getElementById('resetPrompt');
    const statusDiv = document.getElementById('status');
    
    // New elements for disabled sites functionality
    const disableSiteInput = document.getElementById('disableSiteInput');
    const addDisabledSiteButton = document.getElementById('addDisabledSite');
    const disabledSitesList = document.getElementById('disabledSitesList');
    const currentSiteAction = document.getElementById('currentSiteAction');
    const toggleCurrentSiteButton = document.getElementById('toggleCurrentSite');
    
    // Track current site
    let currentSite = '';
    
    // Get the current tab's domain
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url) {
            const url = new URL(tabs[0].url);
            currentSite = url.hostname;
            
            // Remove www. prefix if present
            if (currentSite.startsWith('www.')) {
                currentSite = currentSite.substring(4);
            }
            
            // Now check if this site is already in the disabled list
            chrome.storage.sync.get(['disabled_sites'], (result) => {
                const disabledSites = result.disabled_sites || [];
                const isDisabled = disabledSites.includes(currentSite);
                
                // Now show the button and set its text
                currentSiteAction.style.display = 'block';
                
                if (isDisabled) {
                    toggleCurrentSiteButton.textContent = `Enable Fixly on ${currentSite}`;
                    toggleCurrentSiteButton.style.backgroundColor = '#28a745'; // Green for enable
                } else {
                    toggleCurrentSiteButton.textContent = `Disable Fixly on ${currentSite}`;
                    toggleCurrentSiteButton.style.backgroundColor = '#dc3545'; // Red for disable
                }
                
                // Add click event to toggle the current site
                toggleCurrentSiteButton.addEventListener('click', () => {
                    toggleCurrentSiteStatus(currentSite, isDisabled);
                });
            });
        }
    });
    
    // Function to toggle the current site's disabled status
    function toggleCurrentSiteStatus(site, isCurrentlyDisabled) {
        chrome.storage.sync.get(['disabled_sites'], (result) => {
            const disabledSites = result.disabled_sites || [];
            
            let updatedSites;
            let statusMessage;
            
            if (isCurrentlyDisabled) {
                // Enable the site by removing it from the list
                updatedSites = disabledSites.filter(s => s !== site);
                statusMessage = `Fixly enabled on ${site}`;
                
                // Update button
                toggleCurrentSiteButton.textContent = `Disable Fixly on ${site}`;
                toggleCurrentSiteButton.style.backgroundColor = '#dc3545';
            } else {
                // Disable the site by adding it to the list
                if (!disabledSites.includes(site)) {
                    updatedSites = [...disabledSites, site];
                } else {
                    updatedSites = disabledSites; // Already in the list
                }
                statusMessage = `Fixly disabled on ${site}`;
                
                // Update button
                toggleCurrentSiteButton.textContent = `Enable Fixly on ${site}`;
                toggleCurrentSiteButton.style.backgroundColor = '#28a745';
            }
            
            // Save the updated list
            chrome.storage.sync.set({ 'disabled_sites': updatedSites }, () => {
                // Update the display
                displayDisabledSites(updatedSites);
                showStatus(statusMessage, 'success');
            });
        });
    }

    // Default system prompt
    const defaultSystemPrompt = "You are a helpful assistant that improves text. Fix grammar, spelling, punctuation, and improve clarity and conciseness without changing the meaning or tone. If the text is already correct or if you can't identify any issues to fix, return the EXACT original text unchanged. Never return explanations, error messages, or quotes - only return the fixed text or the original text if no fixes are needed.";

    // Load saved settings if they exist
    chrome.storage.sync.get(['openai_api_key', 'openai_model', 'system_prompt', 'disabled_sites'], (result) => {
        if (result.openai_api_key) {
            apiKeyInput.value = result.openai_api_key;
        }

        if (result.openai_model) {
            modelInput.value = result.openai_model;
        } else {
            // Set default model if not previously set
            modelInput.value = 'gpt-4o-mini';
        }

        // For system prompt, set the default as the initial value if not saved before
        if (result.system_prompt) {
            systemPromptInput.value = result.system_prompt;
        } else {
            // Set default system prompt as the initial value
            systemPromptInput.value = defaultSystemPrompt;
        }
        
        // Load and display disabled sites
        const disabledSites = result.disabled_sites || [];
        displayDisabledSites(disabledSites);
    });
    
    // Function to display disabled sites
    function displayDisabledSites(sites) {
        disabledSitesList.innerHTML = '';
        
        if (sites.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'No websites disabled';
            emptyMessage.style.color = '#666';
            emptyMessage.style.fontStyle = 'italic';
            emptyMessage.style.fontSize = '12px';
            emptyMessage.style.padding = '5px 0';
            disabledSitesList.appendChild(emptyMessage);
            return;
        }
        
        sites.forEach(site => {
            const siteElement = document.createElement('div');
            siteElement.style.display = 'flex';
            siteElement.style.justifyContent = 'space-between';
            siteElement.style.alignItems = 'center';
            siteElement.style.padding = '5px 0';
            siteElement.style.borderBottom = '1px solid #eee';
            
            const siteText = document.createElement('span');
            siteText.textContent = site;
            siteText.style.fontSize = '13px';
            
            const removeButton = document.createElement('button');
            removeButton.textContent = '✕';
            removeButton.style.background = 'none';
            removeButton.style.border = 'none';
            removeButton.style.color = '#d33';
            removeButton.style.cursor = 'pointer';
            removeButton.style.padding = '0 5px';
            removeButton.title = 'Enable Fixly on this website';
            
            removeButton.addEventListener('click', () => {
                removeDisabledSite(site);
            });
            
            siteElement.appendChild(siteText);
            siteElement.appendChild(removeButton);
            disabledSitesList.appendChild(siteElement);
        });
    }
    
    // Function to add a new disabled site
    function addDisabledSite() {
        let site = disableSiteInput.value.trim().toLowerCase();
        
        // Simple validation
        if (!site) {
            showStatus('Please enter a website domain', 'error');
            return;
        }
        
        // Remove www. prefix if present
        if (site.startsWith('www.')) {
            site = site.substring(4);
        }
        
        // Remove http:// or https:// if present
        if (site.startsWith('http://')) {
            site = site.substring(7);
        } else if (site.startsWith('https://')) {
            site = site.substring(8);
        }
        
        // Remove any path after the domain
        const domainParts = site.split('/');
        site = domainParts[0];
        
        chrome.storage.sync.get(['disabled_sites'], (result) => {
            const disabledSites = result.disabled_sites || [];
            
            // Check if the site is already in the list
            if (disabledSites.includes(site)) {
                showStatus('This website is already disabled', 'error');
                return;
            }
            
            // Add the new site
            disabledSites.push(site);
            
            // Save the updated list
            chrome.storage.sync.set({ 'disabled_sites': disabledSites }, () => {
                // Clear the input
                disableSiteInput.value = '';
                
                // Update the display
                displayDisabledSites(disabledSites);
                
                showStatus(`Fixly disabled on ${site}`, 'success');
            });
        });
    }
    
    // Function to remove a disabled site
    function removeDisabledSite(site) {
        chrome.storage.sync.get(['disabled_sites'], (result) => {
            const disabledSites = result.disabled_sites || [];
            
            // Remove the site
            const updatedSites = disabledSites.filter(s => s !== site);
            
            // Save the updated list
            chrome.storage.sync.set({ 'disabled_sites': updatedSites }, () => {
                // Update the display
                displayDisabledSites(updatedSites);
                
                showStatus(`Fixly enabled on ${site}`, 'success');
            });
        });
    }

    // Reset prompt button click handler
    resetPromptButton.addEventListener('click', () => {
        systemPromptInput.value = defaultSystemPrompt;
        showStatus('System prompt reset to default', 'success');
    });
    
    // Add disabled site button click handler
    addDisabledSiteButton.addEventListener('click', addDisabledSite);
    
    // Also add Enter key support for the input
    disableSiteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addDisabledSite();
        }
    });

    // Save settings when button is clicked
    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const selectedModel = modelInput.value.trim() || 'gpt-4o-mini'; // Default if empty

        // For system prompt, if it's empty after trimming, use the default
        let systemPrompt = systemPromptInput.value.trim();
        if (!systemPrompt) {
            systemPrompt = defaultSystemPrompt;
            // Also update the textarea to show the default
            systemPromptInput.value = defaultSystemPrompt;
        }

        // Basic validation
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            showStatus('API key should start with "sk-"', 'error');
            return;
        }

        // Save to Chrome storage
        chrome.storage.sync.set({
            'openai_api_key': apiKey,
            'openai_model': selectedModel,
            'system_prompt': systemPrompt
        }, () => {
            showStatus('Settings saved successfully!', 'success');
        });
    });

    // Helper function to show status messages
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        // Hide the status message after 3 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});