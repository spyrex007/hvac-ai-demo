/**
 * UI Enhancements for HVAC AI Demo
 * Adds modern UI features, animations, and mobile responsiveness
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI enhancements
    initUIEnhancements();
});

function initUIEnhancements() {
    // Add modern UI class to body
    document.body.classList.add('modern-ui');
    
    // Initialize dark mode toggle
    initDarkModeToggle();
    
    // Add glass card effect to key elements
    addGlassEffect();
    
    // Initialize mobile enhancements
    initMobileEnhancements();
    
    // Add feedback buttons to assistant messages
    initFeedbackButtons();
    
    // Add animations to elements
    addAnimations();
    
    // Initialize tooltips
    initTooltips();
    
    // Add preset testing button
    addPresetTestingButton();
    
    console.log('UI Enhancements initialized');
}

// Dark Mode Toggle
function initDarkModeToggle() {
    // Create the toggle HTML
    const themeToggleHTML = `
        <div class="theme-toggle">
            <span>☀️</span>
            <label>
                <input type="checkbox" id="themeToggle">
                <span class="slider"></span>
            </label>
            <span>🌙</span>
        </div>
    `;
    
    // Add toggle to settings modal
    const settingsContent = document.querySelector('.modal-content');
    if (settingsContent) {
        const themeSection = document.createElement('div');
        themeSection.className = 'settings-section';
        themeSection.innerHTML = `
            <h3>Display Theme</h3>
            ${themeToggleHTML}
        `;
        settingsContent.appendChild(themeSection);
    }
    
    // Add toggle functionality
    setTimeout(() => {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Check if dark mode is already enabled
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            themeToggle.checked = isDarkMode;
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
            }
            
            // Toggle dark mode on change
            themeToggle.addEventListener('change', function() {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('darkMode', this.checked);
            });
        }
    }, 100);
}

// Add glass card effect to elements
function addGlassEffect() {
    // Add glass effect to chat container
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.classList.add('glass-card');
    }
    
    // Add glass effect to custom chat settings
    const customChatSettings = document.getElementById('customChatSettings');
    if (customChatSettings) {
        customChatSettings.classList.add('glass-card');
    }
}

// Mobile enhancements
function initMobileEnhancements() {
    // Check if we're on mobile
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Add floating action button for mobile
        addFloatingActionButton();
        
        // Make preset selector more mobile-friendly
        const presetSelector = document.getElementById('presetPrompt');
        if (presetSelector) {
            presetSelector.classList.add('mobile-friendly');
        }
        
        // Adjust chat container height for mobile
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.height = 'calc(100vh - 220px)';
        }
    }
    
    // Add resize listener to adjust UI for orientation changes
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth < 768;
        if (newIsMobile !== isMobile) {
            // Reload to apply correct mobile/desktop styles
            location.reload();
        }
    });
}

// Add floating action button for mobile
function addFloatingActionButton() {
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    `;
    
    fab.addEventListener('click', function() {
        // Show a quick menu with common actions
        showQuickMenu();
    });
    
    document.body.appendChild(fab);
}

// Show quick menu for mobile
function showQuickMenu() {
    // Create a quick menu with common actions
    const quickMenu = document.createElement('div');
    quickMenu.className = 'quick-menu';
    
    quickMenu.innerHTML = `
        <div class="quick-menu-content">
            <button id="quickNewChat" class="quick-menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                New Chat
            </button>
            <button id="quickSettings" class="quick-menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Settings
            </button>
            <button id="quickTestPresets" class="quick-menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                Test Presets
            </button>
        </div>
    `;
    
    // Add overlay to close when clicking outside
    const overlay = document.createElement('div');
    overlay.className = 'quick-menu-overlay';
    overlay.addEventListener('click', function() {
        overlay.remove();
        quickMenu.remove();
    });
    
    document.body.appendChild(overlay);
    document.body.appendChild(quickMenu);
    
    // Add event listeners to quick menu items
    document.getElementById('quickNewChat').addEventListener('click', function() {
        // Create new chat
        if (typeof createNewChat === 'function') {
            createNewChat();
        }
        overlay.remove();
        quickMenu.remove();
    });
    
    document.getElementById('quickSettings').addEventListener('click', function() {
        // Open settings
        if (typeof openSettingsModal === 'function') {
            openSettingsModal();
        }
        overlay.remove();
        quickMenu.remove();
    });
    
    document.getElementById('quickTestPresets').addEventListener('click', function() {
        // Test presets
        testAllPresets();
        overlay.remove();
        quickMenu.remove();
    });
}

// Add feedback buttons to assistant messages
function initFeedbackButtons() {
    // Create a mutation observer to watch for new messages
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check for new assistant messages
                const newMessages = Array.from(mutation.addedNodes).filter(
                    node => node.nodeType === 1 && node.classList.contains('assistant-message')
                );
                
                // Add feedback buttons to new assistant messages
                newMessages.forEach(addFeedbackToMessage);
            }
        });
    });
    
    // Start observing the chat messages container
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        observer.observe(chatMessages, { childList: true });
        
        // Also add to existing messages
        const existingMessages = chatMessages.querySelectorAll('.assistant-message');
        existingMessages.forEach(addFeedbackToMessage);
    }
}

// Add feedback buttons to a message
function addFeedbackToMessage(message) {
    // Check if feedback buttons already exist
    if (message.querySelector('.feedback-buttons')) {
        return;
    }
    
    // Create feedback buttons
    const feedbackButtons = document.createElement('div');
    feedbackButtons.className = 'feedback-buttons';
    feedbackButtons.innerHTML = `
        <button class="feedback-btn" data-feedback="helpful">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            Helpful
        </button>
        <button class="feedback-btn" data-feedback="not-helpful">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
            Not Helpful
        </button>
    `;
    
    // Add event listeners to feedback buttons
    feedbackButtons.querySelectorAll('.feedback-btn').forEach(button => {
        button.addEventListener('click', function() {
            const feedback = this.dataset.feedback;
            handleFeedback(message, feedback);
            
            // Disable all feedback buttons in this group
            feedbackButtons.querySelectorAll('.feedback-btn').forEach(btn => {
                btn.disabled = true;
                btn.classList.add('disabled');
            });
            
            // Highlight the selected button
            this.classList.add('selected');
            
            // Show thank you toast
            showToast('Thank you for your feedback!', 'success');
        });
    });
    
    // Append feedback buttons to message
    message.appendChild(feedbackButtons);
}

// Handle feedback
function handleFeedback(message, feedback) {
    // In a real app, you would send this to your backend
    console.log('Feedback received:', {
        feedback,
        messageContent: message.textContent,
        timestamp: new Date().toISOString()
    });
    
    // You could store feedback in localStorage for demo purposes
    const feedbackData = JSON.parse(localStorage.getItem('feedbackData') || '[]');
    feedbackData.push({
        feedback,
        messageContent: message.textContent.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
            break;
        case 'error':
            icon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
            break;
        default:
            icon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            `;
    }
    
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add animations to elements
function addAnimations() {
    // Animate header
    const header = document.querySelector('header');
    if (header) {
        header.style.animation = 'fadeIn 0.5s ease-out';
    }
    
    // Animate chat messages on load
    const messages = document.querySelectorAll('.message');
    messages.forEach((message, index) => {
        message.style.animation = `slideInUp 0.3s ease-out ${index * 0.1}s both`;
    });
    
    // Animate buttons on hover
    const buttons = document.querySelectorAll('button:not(.feedback-btn)');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(var(--primary-color-rgb), 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

// Initialize tooltips
function initTooltips() {
    // Add tooltips to buttons that might need explanation
    const buttonsNeedingTooltips = [
        { selector: '#settingsBtn', text: 'Open Settings' },
        { selector: '#addToSystemPrompt', text: 'Add preset to system prompt' },
        { selector: '.image-upload-label', text: 'Upload an image' }
    ];
    
    buttonsNeedingTooltips.forEach(({ selector, text }) => {
        const button = document.querySelector(selector);
        if (button) {
            // Wrap button in tooltip container if not already
            if (!button.parentElement.classList.contains('tooltip')) {
                const tooltipContainer = document.createElement('div');
                tooltipContainer.className = 'tooltip';
                button.parentNode.insertBefore(tooltipContainer, button);
                tooltipContainer.appendChild(button);
                
                // Add tooltip text
                const tooltipText = document.createElement('span');
                tooltipText.className = 'tooltip-text';
                tooltipText.textContent = text;
                tooltipContainer.appendChild(tooltipText);
            }
        }
    });
}

// Add preset testing button
function addPresetTestingButton() {
    // Create the button
    const testButton = document.createElement('button');
    testButton.id = 'testPresetsBtn';
    testButton.className = 'primary-button';
    testButton.textContent = 'Test All Presets';
    testButton.style.marginTop = '1rem';
    
    // Add to custom chat settings
    const customChatSettings = document.getElementById('customChatSettings');
    if (customChatSettings) {
        customChatSettings.appendChild(testButton);
        
        // Add click event
        testButton.addEventListener('click', function() {
            testAllPresets();
        });
    }
}

// Test all presets
function testAllPresets() {
    // Show toast notification
    showToast('Testing all presets...', 'info');
    
    // Get all presets
    const presets = state.presets || [];
    console.log(`=== TESTING ${presets.length} PRESETS ===`);
    
    // Create a results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'preset-test-results glass-card';
    resultsContainer.innerHTML = `
        <h3>Preset Test Results</h3>
        <p>Testing ${presets.length} presets...</p>
        <div class="preset-test-list"></div>
        <button id="closeTestResults" class="primary-button">Close</button>
    `;
    
    // Add to document
    document.body.appendChild(resultsContainer);
    
    // Add close button functionality
    document.getElementById('closeTestResults').addEventListener('click', function() {
        resultsContainer.remove();
    });
    
    // Get the list container
    const listContainer = resultsContainer.querySelector('.preset-test-list');
    
    // Test each preset
    presets.forEach((preset, index) => {
        // Create a result item
        const resultItem = document.createElement('div');
        resultItem.className = 'preset-test-item';
        resultItem.innerHTML = `
            <div class="preset-test-header">
                <span class="preset-name">${preset.name}</span>
                <span class="preset-status shimmer">Testing...</span>
            </div>
            <div class="preset-details">
                <div>ID: ${preset.id}</div>
                <div>Category: ${preset.category || 'None'}</div>
            </div>
        `;
        
        // Add to list
        listContainer.appendChild(resultItem);
        
        // Simulate testing (in a real app, you would actually test the preset)
        setTimeout(() => {
            // Update status
            const statusElement = resultItem.querySelector('.preset-status');
            statusElement.classList.remove('shimmer');
            
            // Randomly succeed or fail for demo purposes
            const success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                statusElement.textContent = 'Success';
                statusElement.classList.add('success');
            } else {
                statusElement.textContent = 'Failed';
                statusElement.classList.add('error');
            }
            
            // Log to console
            console.log(`[${index + 1}/${presets.length}] Preset "${preset.name}" (${preset.id}): ${success ? 'Success' : 'Failed'}`);
            
            // If all tests are complete
            if (index === presets.length - 1) {
                // Update results container
                resultsContainer.querySelector('p').textContent = `Tested ${presets.length} presets. ${document.querySelectorAll('.preset-status.success').length} succeeded, ${document.querySelectorAll('.preset-status.error').length} failed.`;
                
                // Show toast
                showToast('All presets tested!', 'success');
            }
        }, 500 + (index * 300)); // Stagger the tests for visual effect
    });
}

// Add CSS for new UI elements
function addDynamicStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Dark mode */
        body.dark-mode {
            --background-color: #1a1a2e;
            --card-background: #16213e;
            --text-color: #e2e8f0;
            --border-color: #334155;
            --assistant-message-bg: #0f172a;
            --assistant-message-color: #e2e8f0;
        }
        
        /* Quick menu */
        .quick-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            animation: fadeIn 0.2s ease-out;
        }
        
        .quick-menu {
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 1000;
            animation: slideInUp 0.3s ease-out;
        }
        
        .quick-menu-content {
            background: var(--card-background);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        
        .quick-menu-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            width: 100%;
            border: none;
            background: transparent;
            color: var(--text-color);
            text-align: left;
            transition: all 0.2s ease;
        }
        
        .quick-menu-item:hover {
            background: rgba(var(--primary-color-rgb), 0.1);
        }
        
        .quick-menu-item:not(:last-child) {
            border-bottom: 1px solid var(--border-color);
        }
        
        /* Feedback buttons */
        .feedback-btn.selected {
            background-color: rgba(var(--primary-color-rgb), 0.2);
            border-color: var(--primary-color);
            font-weight: 500;
        }
        
        .feedback-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* Preset test results */
        .preset-test-results {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-background);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            max-width: 90%;
            width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            animation: fadeIn 0.3s ease-out;
        }
        
        .preset-test-list {
            margin-top: 1rem;
            max-height: 50vh;
            overflow-y: auto;
        }
        
        .preset-test-item {
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin-bottom: 0.5rem;
        }
        
        .preset-test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .preset-name {
            font-weight: 500;
        }
        
        .preset-status {
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            background: var(--border-color);
        }
        
        .preset-status.success {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }
        
        .preset-status.error {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }
        
        .preset-details {
            font-size: 0.8rem;
            color: var(--text-color);
            opacity: 0.8;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Call this function to add dynamic styles
addDynamicStyles();

// Expose functions to window scope
window.addFeedbackToMessage = addFeedbackToMessage;
window.handleFeedback = handleFeedback;
window.initFeedbackButtons = initFeedbackButtons;
