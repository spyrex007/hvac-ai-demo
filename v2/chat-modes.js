// Chat Modes Handler - Manages switching between Easy, Preset, and Custom chat modes
document.addEventListener('DOMContentLoaded', () => {
    // Chat mode elements
    const easyChatModeBtn = document.getElementById('easyChatMode');
    const presetChatModeBtn = document.getElementById('presetChatMode');
    const customChatModeBtn = document.getElementById('customChatMode');
    
    // Content panels
    const chatSection = document.getElementById('chatSection');
    const presetSettings = document.getElementById('presetSettings');
    const customChatSettings = document.getElementById('customChatSettings');
    
    // Initialize mode-specific elements
    initChatModes();
    
    // Setup event listeners for mode switching
    easyChatModeBtn.addEventListener('click', () => switchChatMode('easy'));
    presetChatModeBtn.addEventListener('click', () => switchChatMode('preset'));
    customChatModeBtn.addEventListener('click', () => switchChatMode('custom'));
    
    // Initialize temperature sliders
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValueSpan = document.getElementById('temperatureValue');
    const temperaturePresetSlider = document.getElementById('temperaturePreset');
    const temperaturePresetValueSpan = document.getElementById('temperatureValuePreset');
    
    if (temperatureSlider && temperatureValueSpan) {
        temperatureSlider.addEventListener('input', () => {
            temperatureValueSpan.textContent = temperatureSlider.value;
        });
    }
    
    if (temperaturePresetSlider && temperaturePresetValueSpan) {
        temperaturePresetSlider.addEventListener('input', () => {
            temperaturePresetValueSpan.textContent = temperaturePresetSlider.value;
        });
    }
    
    // Initialize the Test AI Presets buttons
    const testAIPresetsBtns = document.querySelectorAll('.test-ai-btn');
    testAIPresetsBtns.forEach(btn => {
        btn.addEventListener('click', handleTestAIPresets);
    });
    
    // Apply Instructions button handler
    const applyInstructionsBtn = document.getElementById('applyInstructionsBtn');
    if (applyInstructionsBtn) {
        applyInstructionsBtn.addEventListener('click', () => {
            const customSystemPrompt = document.getElementById('customSystemPrompt');
            if (customSystemPrompt && customSystemPrompt.value.trim()) {
                // If the original addToSystemPrompt function exists, use it
                if (typeof window.addToSystemPrompt === 'function') {
                    window.addToSystemPrompt(customSystemPrompt.value);
                } else {
                    // Otherwise, store in local storage for later use
                    localStorage.setItem('hvac_custom_system_prompt', customSystemPrompt.value);
                }
                
                // Provide visual feedback
                showFeedbackMessage('System instructions applied successfully!');
            } else {
                showFeedbackMessage('Please enter system instructions first.', 'error');
            }
        });
    }
    
    // Initialization function
    function initChatModes() {
        // Set initial mode to Easy Chat
        switchChatMode('easy');
        
        // Load any saved preferences
        loadSavedPreferences();
    }
    
    // Function to switch between chat modes
    function switchChatMode(mode) {
        // Reset all active states
        easyChatModeBtn.classList.remove('active');
        presetChatModeBtn.classList.remove('active');
        customChatModeBtn.classList.remove('active');
        
        // Reset all mode classes
        chatSection.classList.remove('mode-easy', 'mode-preset', 'mode-custom');
        
        // Hide all settings panels
        presetSettings.classList.add('hidden');
        customChatSettings.classList.add('hidden');
        
        // Set the active mode
        switch (mode) {
            case 'easy':
                easyChatModeBtn.classList.add('active');
                chatSection.classList.add('mode-easy');
                break;
            case 'preset':
                presetChatModeBtn.classList.add('active');
                chatSection.classList.add('mode-preset');
                presetSettings.classList.remove('hidden');
                break;
            case 'custom':
                customChatModeBtn.classList.add('active');
                chatSection.classList.add('mode-custom');
                customChatSettings.classList.remove('hidden');
                break;
        }
        
        // Save the current mode preference
        localStorage.setItem('hvac_chat_mode', mode);
        
        // Update the chat layout based on the mode
        updateChatLayout(mode);
    }
    
    // Function to update the chat layout based on mode
    function updateChatLayout(mode) {
        const welcomeMessage = document.querySelector('.welcome-message');
        
        // Update welcome message
        if (welcomeMessage) {
            if (mode === 'easy') {
                welcomeMessage.innerHTML = `
                    <div class="welcome-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div class="welcome-content">
                        <h3>Welcome to HvacChat AI Assistant</h3>
                        <p>I'm your AI-powered HVAC assistant. I can help you with diagnostics, maintenance scheduling, energy efficiency analysis, and emergency troubleshooting. How can I assist you today?</p>
                        <div class="quick-actions">
                            <button class="action-btn" id="systemDiagnosticsBtn">System Diagnostics</button>
                            <button class="action-btn" id="maintenancePlanningBtn">Maintenance Planning</button>
                            <button class="action-btn" id="energyAnalysisBtn">Energy Analysis</button>
                            <button class="action-btn" id="emergencySupportBtn">Emergency Support</button>
                        </div>
                    </div>
                `;
            } else if (mode === 'preset') {
                welcomeMessage.innerHTML = `
                    <h1>Welcome to HvacChat AI Assistant</h1>
                    <p>Select a preset from the panel on the right to get started.</p>
                `;
            } else if (mode === 'custom') {
                welcomeMessage.innerHTML = `
                    <h1>Welcome to HvacChat AI Assistant</h1>
                    <p>Customize your AI assistant using the options on the right.</p>
                `;
            }
            
            // Reattach event listeners for quick action buttons
            const quickActionButtons = document.querySelectorAll('.quick-actions .action-btn');
            quickActionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    if (typeof handleQuickActionClick === 'function') {
                        handleQuickActionClick(button.textContent.trim());
                    }
                });
            });
        }
    }
    
    // Function to load saved preferences
    function loadSavedPreferences() {
        // Load saved chat mode
        const savedMode = localStorage.getItem('hvac_chat_mode');
        if (savedMode) {
            switchChatMode(savedMode);
        }
        
        // Load saved temperature values
        const savedTemperature = localStorage.getItem('hvac_temperature');
        if (savedTemperature && temperatureSlider && temperatureValueSpan) {
            temperatureSlider.value = savedTemperature;
            temperatureValueSpan.textContent = savedTemperature;
        }
        
        const savedPresetTemperature = localStorage.getItem('hvac_preset_temperature');
        if (savedPresetTemperature && temperaturePresetSlider && temperaturePresetValueSpan) {
            temperaturePresetSlider.value = savedPresetTemperature;
            temperaturePresetValueSpan.textContent = savedPresetTemperature;
        }
        
        // Load saved token values
        const savedMaxTokens = localStorage.getItem('hvac_max_tokens');
        const maxTokensInput = document.getElementById('maxTokens');
        if (savedMaxTokens && maxTokensInput) {
            maxTokensInput.value = savedMaxTokens;
        }
        
        const savedMaxTokensPreset = localStorage.getItem('hvac_max_tokens_preset');
        const maxTokensPresetInput = document.getElementById('maxTokensPreset');
        if (savedMaxTokensPreset && maxTokensPresetInput) {
            maxTokensPresetInput.value = savedMaxTokensPreset;
        }
        
        // Load saved model selection
        const savedModel = localStorage.getItem('hvac_model');
        const modelSelection = document.getElementById('modelSelection');
        if (savedModel && modelSelection) {
            modelSelection.value = savedModel;
        }
        
        const savedModelPreset = localStorage.getItem('hvac_model_preset');
        const modelSelectionPreset = document.getElementById('modelSelectionPreset');
        if (savedModelPreset && modelSelectionPreset) {
            modelSelectionPreset.value = savedModelPreset;
        }
        
        // Load saved system prompt
        const savedSystemPrompt = localStorage.getItem('hvac_custom_system_prompt');
        const customSystemPrompt = document.getElementById('customSystemPrompt');
        if (savedSystemPrompt && customSystemPrompt) {
            customSystemPrompt.value = savedSystemPrompt;
        }
    }
    
    // Handle the Test AI Presets button click
    function handleTestAIPresets() {
        // Determine which mode we're in
        const isPresetMode = chatSection.classList.contains('mode-preset');
        const isCustomMode = chatSection.classList.contains('mode-custom');
        
        let model, temperature, maxTokens;
        
        if (isPresetMode) {
            model = document.getElementById('modelSelectionPreset').value;
            temperature = document.getElementById('temperaturePreset').value;
            maxTokens = document.getElementById('maxTokensPreset').value;
        } else if (isCustomMode) {
            model = document.getElementById('modelSelection').value;
            temperature = document.getElementById('temperature').value;
            maxTokens = document.getElementById('maxTokens').value;
        } else {
            return; // Not in a relevant mode
        }
        
        // Save these settings to localStorage
        if (isPresetMode) {
            localStorage.setItem('hvac_model_preset', model);
            localStorage.setItem('hvac_preset_temperature', temperature);
            localStorage.setItem('hvac_max_tokens_preset', maxTokens);
        } else {
            localStorage.setItem('hvac_model', model);
            localStorage.setItem('hvac_temperature', temperature);
            localStorage.setItem('hvac_max_tokens', maxTokens);
        }
        
        // If there's an existing function to test AI, use it
        if (typeof window.testAIWithSettings === 'function') {
            window.testAIWithSettings(model, temperature, maxTokens);
        } else {
            // Otherwise, just show a feedback message
            showFeedbackMessage(`Testing AI with Model: ${model}, Temperature: ${temperature}, Max Tokens: ${maxTokens}`);
        }
    }
    
    // Utility function to show feedback messages
    function showFeedbackMessage(message, type = 'success') {
        // Create feedback element if it doesn't exist
        let feedbackEl = document.getElementById('feedbackMessage');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.id = 'feedbackMessage';
            document.body.appendChild(feedbackEl);
            
            // Style the feedback element
            feedbackEl.style.position = 'fixed';
            feedbackEl.style.bottom = '20px';
            feedbackEl.style.right = '20px';
            feedbackEl.style.padding = '10px 20px';
            feedbackEl.style.borderRadius = '4px';
            feedbackEl.style.fontWeight = '500';
            feedbackEl.style.zIndex = '1000';
            feedbackEl.style.transition = 'opacity 0.3s ease';
        }
        
        // Set styles based on message type
        if (type === 'success') {
            feedbackEl.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
            feedbackEl.style.color = 'white';
        } else if (type === 'error') {
            feedbackEl.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
            feedbackEl.style.color = 'white';
        }
        
        // Set message content
        feedbackEl.textContent = message;
        feedbackEl.style.opacity = '1';
        
        // Hide after 3 seconds
        setTimeout(() => {
            feedbackEl.style.opacity = '0';
            setTimeout(() => {
                feedbackEl.remove();
            }, 300);
        }, 3000);
    }
    
    // Make functions available globally
    window.switchChatMode = switchChatMode;
    window.updateChatLayout = updateChatLayout;
    window.showFeedbackMessage = showFeedbackMessage;
});
