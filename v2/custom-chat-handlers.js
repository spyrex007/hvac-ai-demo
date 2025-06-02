// Custom Chat Settings Handlers

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const customSystemPrompt = document.getElementById('customSystemPrompt');
    const addToSystemPrompt = document.getElementById('addToSystemPrompt');
    const displaySystemPrompt = document.getElementById('displaySystemPrompt');
    const systemPromptPreview = document.getElementById('systemPromptPreview');
    const systemPromptContent = document.getElementById('systemPromptContent');
    const resetSystemPromptCustom = document.getElementById('resetSystemPromptCustom');
    const presetPrompt = document.getElementById('presetPrompt');
    const customPresetPrompt = document.getElementById('customPresetPrompt');
    const presetDescription = document.getElementById('presetDescription');
    const modelSelection = document.getElementById('modelSelection');
    const temperatureRange = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    const maxTokens = document.getElementById('maxTokens');
    const resetCustomSettings = document.getElementById('resetCustomSettings');
    const testAIPresetsBtn = document.getElementById('testAIPresetsBtn');

    // Initialize values from localStorage or set defaults
    function initializeCustomChatSettings() {
        // Load system prompt from localStorage if available
        const savedSystemPrompt = localStorage.getItem('hvac_system_prompt');
        if (savedSystemPrompt) {
            updateSystemPromptPreview(savedSystemPrompt);
        }

        // Load temperature value
        const savedTemp = localStorage.getItem('hvac_temperature');
        if (savedTemp) {
            temperatureRange.value = savedTemp;
            temperatureValue.textContent = savedTemp;
        }

        // Load max tokens
        const savedMaxTokens = localStorage.getItem('hvac_max_tokens');
        if (savedMaxTokens) {
            maxTokens.value = savedMaxTokens;
        }

        // Load model selection
        const savedModel = localStorage.getItem('hvac_model');
        if (savedModel && modelSelection.querySelector(`option[value="${savedModel}"]`)) {
            modelSelection.value = savedModel;
        }
    }

    // Handle preset selection
    if (presetPrompt) {
        presetPrompt.addEventListener('change', () => {
            const selectedValue = presetPrompt.value;
            if (selectedValue) {
                // Get preset description and display it
                const selectedOption = presetPrompt.options[presetPrompt.selectedIndex];
                const description = selectedOption.getAttribute('data-description') || 'No description available';
                
                if (presetDescription) {
                    presetDescription.textContent = description;
                    presetDescription.classList.remove('hidden');
                }
                
                // If the app.js has applyPreset function, call it
                if (typeof applyPreset === 'function') {
                    applyPreset(selectedValue);
                } else if (window.applyPreset) {
                    window.applyPreset(selectedValue);
                }
            } else {
                if (presetDescription) {
                    presetDescription.classList.add('hidden');
                }
            }
        });
    }
    
    // Handle custom preset selection
    if (customPresetPrompt) {
        customPresetPrompt.onchange = function() {
            const selectedValue = customPresetPrompt.value;
            if (selectedValue) {
                // Get preset description and display it
                const selectedOption = customPresetPrompt.options[customPresetPrompt.selectedIndex];
                const description = selectedOption.getAttribute('data-description') || 'No description available';
                
                if (presetDescription) {
                    presetDescription.textContent = description;
                    presetDescription.classList.remove('hidden');
                }
                
                // If the app.js has handlePresetChange function, call it
                if (typeof window.handlePresetChange === 'function') {
                    window.handlePresetChange(customPresetPrompt);
                } else if (typeof applyPreset === 'function') {
                    applyPreset(selectedValue);
                } else if (window.applyPreset) {
                    window.applyPreset(selectedValue);
                }
            } else {
                if (presetDescription) {
                    presetDescription.classList.add('hidden');
                }
            }
        };
    }

    // Temperature slider
    if (temperatureRange && temperatureValue) {
        temperatureRange.addEventListener('input', () => {
            const value = temperatureRange.value;
            temperatureValue.textContent = value;
            localStorage.setItem('hvac_temperature', value);
        });
    }

    // Max tokens input
    if (maxTokens) {
        maxTokens.addEventListener('change', () => {
            localStorage.setItem('hvac_max_tokens', maxTokens.value);
        });
    }

    // Model selection
    if (modelSelection) {
        modelSelection.addEventListener('change', () => {
            localStorage.setItem('hvac_model', modelSelection.value);
        });
    }

    // Toggle system prompt preview
    if (displaySystemPrompt) {
        displaySystemPrompt.addEventListener('click', () => {
            // Use the toggleSystemPromptDisplay function from app.js if available
            if (typeof window.toggleSystemPromptDisplay === 'function') {
                window.toggleSystemPromptDisplay();
            } else {
                // Fallback to simple toggle if the function isn't available
                systemPromptPreview.classList.toggle('hidden');
                
                // Update button text based on visibility
                if (systemPromptPreview.classList.contains('hidden')) {
                    displaySystemPrompt.innerHTML = '<span class="toggle-icon">👁️</span> View Current';
                } else {
                    displaySystemPrompt.innerHTML = '<span class="toggle-icon">🔽</span> Hide Current';
                    // Update the preview content
                    if (typeof window.updateSystemPromptPreview === 'function') {
                        window.updateSystemPromptPreview();
                    }
                }
            }
        });
    }

    // Apply system instructions
    if (addToSystemPrompt && customSystemPrompt) {
        addToSystemPrompt.addEventListener('click', () => {
            const promptText = customSystemPrompt.value.trim();
            if (promptText) {
                // Save to localStorage
                localStorage.setItem('hvac_system_prompt', promptText);
                
                // Update the preview
                updateSystemPromptPreview(promptText);
                
                // Show success feedback
                customSystemPrompt.classList.add('success-flash');
                setTimeout(() => {
                    customSystemPrompt.classList.remove('success-flash');
                }, 1000);
                
                // If addToSystemPrompt function exists in the main app, call it
                if (typeof addToSystemPrompt === 'function' && typeof window.addToSystemPrompt !== 'function') {
                    // Function name conflict, use another approach
                    applySystemInstructions(promptText);
                } else if (window.addToSystemPrompt) {
                    window.addToSystemPrompt(promptText);
                }
            }
        });
    }

    // Reset system prompt
    if (resetSystemPromptCustom) {
        resetSystemPromptCustom.addEventListener('click', () => {
            // Clear localStorage
            localStorage.removeItem('hvac_system_prompt');
            
            // Clear the textarea
            if (customSystemPrompt) {
                customSystemPrompt.value = '';
            }
            
            // Clear the preview
            systemPromptContent.textContent = 'System instructions have been reset to default.';
            
            // If resetSystemPrompt function exists in the main app, call it
            if (typeof resetSystemPrompt === 'function') {
                resetSystemPrompt();
            } else if (window.resetSystemPrompt) {
                window.resetSystemPrompt();
            }
        });
    }

    // Reset all custom settings
    if (resetCustomSettings) {
        resetCustomSettings.addEventListener('click', () => {
            // Clear localStorage for all custom settings
            localStorage.removeItem('hvac_system_prompt');
            localStorage.removeItem('hvac_temperature');
            localStorage.removeItem('hvac_max_tokens');
            localStorage.removeItem('hvac_model');
            
            // Reset UI elements
            if (customSystemPrompt) customSystemPrompt.value = '';
            if (temperatureRange) {
                temperatureRange.value = 0.7;
                if (temperatureValue) temperatureValue.textContent = '0.7';
            }
            if (maxTokens) maxTokens.value = 2000;
            if (modelSelection) modelSelection.value = 'gpt-4.1';
            if (systemPromptContent) {
                systemPromptContent.textContent = 'System instructions have been reset to default.';
            }
            if (presetPrompt) presetPrompt.value = '';
            if (presetDescription) presetDescription.classList.add('hidden');
            
            // Provide user feedback
            alert('All custom settings have been reset to default values.');
        });
    }

    // Test AI Presets button
    if (testAIPresetsBtn) {
        testAIPresetsBtn.addEventListener('click', () => {
            // Collect current settings
            const settings = {
                systemPrompt: localStorage.getItem('hvac_system_prompt') || '',
                temperature: parseFloat(temperatureRange.value) || 0.7,
                maxTokens: parseInt(maxTokens.value) || 2000,
                model: modelSelection.value || 'gpt-4.1'
            };
            
            // If testAIWithSettings function exists in the main app, call it
            if (typeof testAIWithSettings === 'function') {
                testAIWithSettings(settings);
            } else if (window.testAIWithSettings) {
                window.testAIWithSettings(settings);
            } else {
                // Fallback - show settings in console and alert user
                console.log('Current AI Settings:', settings);
                alert('Test with current settings: ' + JSON.stringify(settings, null, 2));
            }
        });
    }

    // Helper function to update system prompt preview
    function updateSystemPromptPreview(text) {
        if (systemPromptContent) {
            systemPromptContent.textContent = text;
        }
        if (systemPromptPreview && systemPromptPreview.classList.contains('hidden')) {
            systemPromptPreview.classList.remove('hidden');
        }
    }

    // Helper function in case of function name conflicts
    function applySystemInstructions(promptText) {
        // This is a fallback if there's a conflict with the function name
        console.log('Applying system instructions:', promptText);
        // Try to find the chat object in the global state
        if (window.state && window.state.activeChat) {
            window.state.activeChat.systemPrompt = promptText;
            console.log('System prompt updated in state');
        }
    }

    // Initialize on page load
    initializeCustomChatSettings();
});
