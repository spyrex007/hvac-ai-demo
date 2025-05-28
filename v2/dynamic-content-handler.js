/**
 * Dynamic Content Handler
 * Ensures proper scrolling and responsive behavior for dynamically injected elements
 */

// Main function to initialize the dynamic content handler
function initDynamicContentHandler() {
    // Observe DOM changes to handle dynamically injected content
    setupMutationObserver();
    
    // Handle resizing of the window
    setupResizeHandler();
    
    // Initialize scrolling behavior for existing elements
    initializeScrollBehavior();
}

// Set up a mutation observer to watch for DOM changes
function setupMutationObserver() {
    // Create a new observer instance
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Process added nodes
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                handleAddedNodes(mutation.addedNodes);
            }
            
            // Handle attribute changes that might affect layout
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                handleAttributeChange(mutation.target);
            }
        });
        
        // Ensure proper container sizes after DOM changes
        adjustContainerSizes();
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
}

// Handle newly added DOM nodes
function handleAddedNodes(nodes) {
    // Ensure nodes is iterable by converting to array
    const nodesArray = Array.from(nodes || []);
    
    nodesArray.forEach(node => {
        if (node && node.nodeType === Node.ELEMENT_NODE) {
            // Apply scrolling behavior to the new element if it's a container
            applyScrollBehaviorToElement(node);
            
            // Check children as well
            if (node.children && node.children.length > 0) {
                // Pass as array to avoid potential issues
                handleAddedNodes(Array.from(node.children));
            }
        }
    });
}

// Handle attribute changes that might affect layout
function handleAttributeChange(element) {
    // Re-apply scrolling behavior if needed
    applyScrollBehaviorToElement(element);
    
    // Adjust container sizes in case display state has changed
    requestAnimationFrame(adjustContainerSizes);
}

// Apply scrolling behavior to specific elements
function applyScrollBehaviorToElement(element) {
    // Containers that should have scrolling behavior
    const scrollableContainers = [
        'messages-container', 
        'chat-area', 
        'modal-content',
        'modal-body',
        'custom-chat-settings',
        'edit-message-container',
        'quick-reply-container',
        'chat-list',
        'settings-content'
    ];
    
    // Check if element is a scrollable container or contains one
    if (element.classList) {
        scrollableContainers.forEach(className => {
            if (element.classList.contains(className)) {
                ensureScrollableContainer(element);
            }
        });
    }
    
    // Check for elements that need horizontal scrolling
    const horizontalScrollContainers = [
        'quick-reply-container',
        'code-block'
    ];
    
    if (element.classList) {
        horizontalScrollContainers.forEach(className => {
            if (element.classList.contains(className)) {
                ensureHorizontalScrollContainer(element);
            }
        });
    }
    
    // Special handling for pre elements (code blocks)
    if (element.tagName === 'PRE') {
        ensureHorizontalScrollContainer(element);
    }
}

// Ensure an element can scroll properly
function ensureScrollableContainer(element) {
    // Apply overflow styles if not already set by CSS
    if (getComputedStyle(element).overflowY !== 'auto' && 
        getComputedStyle(element).overflowY !== 'scroll') {
        element.style.overflowY = 'auto';
    }
    
    // Ensure element doesn't expand beyond viewport
    ensureContainerSizing(element);
}

// Ensure an element can scroll horizontally
function ensureHorizontalScrollContainer(element) {
    // Apply overflow styles if not already set by CSS
    if (getComputedStyle(element).overflowX !== 'auto' && 
        getComputedStyle(element).overflowX !== 'scroll') {
        element.style.overflowX = 'auto';
    }
}

// Set up window resize handler
function setupResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        // Debounce resize events
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            adjustContainerSizes();
        }, 100);
    });
}

// Initialize scrolling behavior for existing elements
function initializeScrollBehavior() {
    // Get all scrollable containers
    const scrollableContainers = document.querySelectorAll('.messages-container, .chat-area, .modal-content, .modal-body, .custom-chat-settings, .edit-message-container, .quick-reply-container, .chat-list, .settings-content');
    
    // Apply scrolling behavior
    scrollableContainers.forEach(container => {
        ensureScrollableContainer(container);
    });
    
    // Get all horizontal scroll containers
    const horizontalScrollContainers = document.querySelectorAll('.quick-reply-container, .code-block, pre');
    
    // Apply horizontal scrolling behavior
    horizontalScrollContainers.forEach(container => {
        ensureHorizontalScrollContainer(container);
    });
    
    // Set up specific observer for custom chat settings
    setupCustomChatSettingsObserver();
    
    // Initial container size adjustment
    adjustContainerSizes();
}

// Set up a specific observer for the custom chat settings container
function setupCustomChatSettingsObserver() {
    const customChatSettings = document.getElementById('customChatSettings');
    
    if (customChatSettings) {
        // Create a new observer instance specifically for custom chat settings
        const observer = new MutationObserver((mutations) => {
            // Process mutations
            let contentChanged = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || 
                    (mutation.type === 'attributes' && 
                     (mutation.attributeName === 'class' || mutation.attributeName === 'style'))) {
                    contentChanged = true;
                }
            });
            
            // If content changed, ensure proper sizing and scrolling
            if (contentChanged) {
                ensureCustomChatSettingsSizing(customChatSettings);
                
                // Handle any newly added elements
                const newElements = customChatSettings.querySelectorAll('select, textarea, input, button');
                newElements.forEach(element => {
                    // Ensure new form elements don't cause layout issues
                    element.addEventListener('focus', () => {
                        ensureCustomChatSettingsSizing(customChatSettings);
                    });
                    
                    element.addEventListener('change', () => {
                        setTimeout(() => ensureCustomChatSettingsSizing(customChatSettings), 100);
                    });
                });
            }
        });
        
        // Start observing the custom chat settings container
        observer.observe(customChatSettings, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
        
        // Also handle visibility changes
        const handleVisibilityChange = () => {
            if (!customChatSettings.classList.contains('hidden')) {
                ensureCustomChatSettingsSizing(customChatSettings);
            }
        };
        
        // Add event listeners for tab changes that might show the custom chat settings
        const customChatModeBtn = document.getElementById('customChatMode');
        if (customChatModeBtn) {
            customChatModeBtn.addEventListener('click', () => {
                setTimeout(handleVisibilityChange, 100);
            });
        }
    }
}

// Adjust container sizes based on viewport
function adjustContainerSizes() {
    // Messages container sizing
    const messagesContainers = document.querySelectorAll('.messages-container');
    messagesContainers.forEach(container => {
        ensureContainerSizing(container);
    });
    
    // Modal body sizing
    const modalBodies = document.querySelectorAll('.modal-body');
    modalBodies.forEach(modalBody => {
        const maxHeight = window.innerHeight * 0.7;
        modalBody.style.maxHeight = `${maxHeight}px`;
    });
    
    // Chat list sizing
    const chatLists = document.querySelectorAll('.chat-list');
    chatLists.forEach(chatList => {
        ensureContainerSizing(chatList);
    });
    
    // Custom chat settings sizing
    const customChatSettings = document.querySelectorAll('.custom-chat-settings');
    customChatSettings.forEach(container => {
        ensureCustomChatSettingsSizing(container);
    });
}

// Ensure container has proper sizing
function ensureContainerSizing(container) {
    if (container.classList.contains('messages-container')) {
        // Use fixed height for messages container to prevent UI from being pushed down
        // Height is set in CSS, we don't need to calculate it dynamically
        // Just ensure overflow is set properly
        container.style.overflowY = 'auto';
    } else if (container.classList.contains('chat-list')) {
        const viewportHeight = window.innerHeight;
        container.style.maxHeight = `${viewportHeight - 200}px`;
    }
}

// Ensure custom chat settings container has proper sizing and scrolling behavior
function ensureCustomChatSettingsSizing(container) {
    // Make sure overflow is set properly
    container.style.overflowY = 'auto';
    container.style.overscrollBehavior = 'contain';
    
    // Calculate appropriate max height based on content and viewport
    const viewportHeight = window.innerHeight;
    const maxHeight = Math.min(500, viewportHeight * 0.6); // Either 500px or 60% of viewport, whichever is smaller
    container.style.maxHeight = `${maxHeight}px`;
    
    // Ensure the container doesn't push other elements down when content is added dynamically
    // Add a small delay to handle dynamic content injection
    setTimeout(() => {
        // Check if the container has a scrollbar
        const hasScrollbar = container.scrollHeight > container.clientHeight;
        
        // Add padding for scrollbar if needed
        if (hasScrollbar) {
            container.style.paddingRight = '8px';
        }
    }, 100);
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        initDynamicContentHandler();
        console.log('Dynamic content handler initialized successfully');
    } catch (error) {
        console.error('Error initializing dynamic content handler:', error);
    }
});

// Handle dynamic content even after initial page load
window.addEventListener('load', () => {
    try {
        // Re-check sizing after all resources are loaded
        setTimeout(adjustContainerSizes, 500);
    } catch (error) {
        console.error('Error adjusting container sizes:', error);
    }
});

// Expose functions to window scope with error handling
window.initDynamicContentHandler = function() {
    try {
        initDynamicContentHandler();
    } catch (error) {
        console.error('Error in initDynamicContentHandler:', error);
    }
};

window.adjustContainerSizes = function() {
    try {
        adjustContainerSizes();
    } catch (error) {
        console.error('Error in adjustContainerSizes:', error);
    }
};
