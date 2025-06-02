// hvacHat Modern UI - JavaScript for new UI elements
document.addEventListener('DOMContentLoaded', () => {
    // Make sure the settings button in header works properly
    const headerSettingsBtn = document.querySelector('.header-controls .header-btn#settingsBtn');
    if (headerSettingsBtn) {
        headerSettingsBtn.addEventListener('click', () => {
            // Use the existing openSettingsModal function from app.js if available
            if (typeof window.openSettingsModal === 'function') {
                window.openSettingsModal();
            } else if (typeof openSettingsModal === 'function') {
                openSettingsModal();
            } else {
                // Fallback: directly toggle modal visibility
                const settingsModal = document.getElementById('settingsModal');
                if (settingsModal) {
                    settingsModal.classList.toggle('hidden');
                }
            }
        });
    }
    // Feature cards have been removed from the UI

    // Quick action button handlers
    const quickActionButtons = document.querySelectorAll('.quick-actions .action-btn');
    quickActionButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleQuickActionClick(button.textContent.trim());
        });
    });

    // Feature card click handler function removed as feature cards have been removed from the UI

    // Handle quick action button clicks
    function handleQuickActionClick(action) {
        const userInput = document.getElementById('userInput');
        let message = '';

        switch (action) {
            case 'System Diagnostics':
                message = 'Can you guide me through diagnosing common HVAC system issues?';
                break;
            case 'Maintenance Planning':
                message = 'What kind of maintenance schedule should I follow for my HVAC system?';
                break;
            case 'Energy Analysis':
                message = 'How can I analyze and improve the energy efficiency of my HVAC system?';
                break;
            case 'Emergency Support':
                message = 'What emergency procedures should I follow if my HVAC system fails?';
                break;
            default:
                message = 'Can you tell me more about ' + action + '?';
        }

        userInput.value = message;
        userInput.focus();
    }

    // Update the web search toggle style when active
    const webSearchToggle = document.getElementById('webSearchToggle');
    if (webSearchToggle) {
        // Get the initial state from localStorage or fallback to false
        const isWebSearchEnabled = localStorage.getItem('hvac_web_search_enabled') === 'true';
        
        // Ensure UI matches the actual state
        if (isWebSearchEnabled) {
            webSearchToggle.classList.add('active');
        } else {
            webSearchToggle.classList.remove('active');
        }
        
        // We're NOT adding an event listener here anymore to avoid conflicts with app.js
        // The event listener in app.js will handle the toggle functionality
    }
    
    // This function is no longer used directly as an event handler
    // but we'll keep it for potential future use
    function syncWebSearchUIState() {
        const webSearchToggle = document.getElementById('webSearchToggle');
        if (!webSearchToggle) return;
        
        // Get the current state from localStorage
        const isActive = localStorage.getItem('hvac_web_search_enabled') === 'true';
        
        // Update UI to match state
        if (isActive) {
            webSearchToggle.classList.add('active');
        } else {
            webSearchToggle.classList.remove('active');
        }
        
        // Update state in app.js if it exists
        if (window.state) {
            window.state.webSearchEnabled = isActive;
        }
    }

    // Make sure the existing filter buttons are functioning
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');
            
            // In a real implementation, this would filter the chat list
            // For now, we'll just show a console message
            console.log('Filter applied:', button.textContent.trim());
        });
    });

    // Ensure the restore button works properly with its new prominent styling
    const restoreBtn = document.getElementById('restoreChat');
    if (restoreBtn) {
        updateRestoreButtonState();
        
        // Add click handler to restore button if not already set up
        restoreBtn.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                // Use existing restore function if available
                if (typeof window.restoreDeletedChat === 'function') {
                    window.restoreDeletedChat();
                } else if (typeof restoreDeletedChat === 'function') {
                    restoreDeletedChat();
                }
                // Update button state after restoration
                setTimeout(updateRestoreButtonState, 100);
            }
        });
        
        // Set up an observer to watch for changes in local storage
        window.addEventListener('storage', function(e) {
            if (e.key === 'hvac_deleted_chats') {
                updateRestoreButtonState();
            }
        });
    }

    function updateRestoreButtonState() {
        const restoreBtn = document.getElementById('restoreChat');
        if (!restoreBtn) return;
        
        // Check if there are any deleted chats
        const deletedChatsCount = JSON.parse(localStorage.getItem('hvac_deleted_chats') || '[]').length;
        
        // Update button text and disabled state
        const restoreText = document.createTextNode(`Restore Deleted Chats (${deletedChatsCount})`);
        const svgIcon = restoreBtn.querySelector('svg');
        
        // Clear button content and re-add icon and updated text
        restoreBtn.innerHTML = '';
        if (svgIcon) {
            restoreBtn.appendChild(svgIcon.cloneNode(true));
        }
        restoreBtn.appendChild(restoreText);
        
        if (deletedChatsCount === 0) {
            restoreBtn.classList.add('disabled');
        } else {
            restoreBtn.classList.remove('disabled');
        }
    }
});
