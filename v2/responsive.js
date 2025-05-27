/**
 * Responsive functionality for HVAC AI Demo
 * Handles mobile sidebar toggle and responsive layout adjustments
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.chat-sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const appContainer = document.getElementById('appContainer');
    
    // Function to check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Function to update UI based on screen size
    function updateResponsiveUI() {
        if (isMobile()) {
            // Show sidebar toggle button when logged in
            if (!appContainer.classList.contains('hidden')) {
                sidebarToggle.classList.remove('hidden');
            } else {
                sidebarToggle.classList.add('hidden');
            }
        } else {
            // Hide sidebar toggle on desktop
            sidebarToggle.classList.add('hidden');
            
            // Ensure sidebar is visible on desktop
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    }
    
    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        
        // Add accessibility attributes for screen readers
        const isExpanded = sidebar.classList.contains('active');
        this.setAttribute('aria-expanded', isExpanded);
        this.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
    });
    
    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
    
    // Update UI on page load
    updateResponsiveUI();
    
    // Update UI on window resize
    window.addEventListener('resize', updateResponsiveUI);
    
    // Close sidebar when a chat is selected on mobile
    document.addEventListener('click', function(e) {
        if (isMobile() && sidebar.classList.contains('active')) {
            // Check if clicked element is a chat list item or its child
            const chatItem = e.target.closest('.chat-list-item');
            if (chatItem) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                
                // Update accessibility attributes
                if (sidebarToggle) {
                    sidebarToggle.setAttribute('aria-expanded', 'false');
                    sidebarToggle.setAttribute('aria-label', 'Open menu');
                }
            }
        }
    });
    
    // Update UI when app container visibility changes
    // This is needed because the sidebar toggle should only be visible when logged in
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateResponsiveUI();
            }
        });
    });
    
    // Start observing app container for class changes
    if (appContainer) {
        observer.observe(appContainer, { attributes: true });
    }
});
