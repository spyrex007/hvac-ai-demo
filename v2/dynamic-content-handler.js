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
    nodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Apply scrolling behavior to the new element if it's a container
            applyScrollBehaviorToElement(node);
            
            // Check children as well
            if (node.children && node.children.length > 0) {
                handleAddedNodes(node.children);
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
    
    // Initial container size adjustment
    adjustContainerSizes();
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

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDynamicContentHandler);

// Handle dynamic content even after initial page load
window.addEventListener('load', () => {
    // Re-check sizing after all resources are loaded
    setTimeout(adjustContainerSizes, 500);
});

// Expose functions to window scope
window.initDynamicContentHandler = initDynamicContentHandler;
window.adjustContainerSizes = adjustContainerSizes;
