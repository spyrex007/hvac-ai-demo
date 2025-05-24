// app-integrator.js - Integrates the original app.js with Supabase functionality
import { stateManager } from './state-manager.js';
import { onAuthStateChange } from './auth.js';
import { 
    saveChat, 
    deleteChat as deleteSupabaseChat, 
    loadChatMessages, 
    saveChatMessages,
    restoreDeletedChat as restoreSupabaseDeletedChat
} from './data-service.js';

// This script runs after app.js has loaded and patches its functions
// to use Supabase when a user is authenticated

// Wait for DOM and app.js to fully load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize event listener for auth state changes
    onAuthStateChange((event, session) => {
        stateManager.handleAuthStateChange(event, session).then(() => {
            // Update UI based on auth state
            updateAppUIForAuthState(event === 'SIGNED_IN');
        });
    });
    
    // Patch app.js functions once the app is fully loaded
    setTimeout(patchAppFunctions, 500);
});

// Update app UI based on authentication state
function updateAppUIForAuthState(isAuthenticated) {
    // Toggle visibility of app container
    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
        appContainer.classList.toggle('hidden', !isAuthenticated);
    }
    
    // Toggle visibility of auth container
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.toggle('hidden', isAuthenticated);
        
        // Set appropriate class for styling
        if (isAuthenticated) {
            authContainer.classList.add('auth-logged-in');
            authContainer.classList.remove('auth-logged-out');
        } else {
            authContainer.classList.add('auth-logged-out');
            authContainer.classList.remove('auth-logged-in');
        }
    }
    
    // Update UI elements if user is authenticated
    if (isAuthenticated && window.elements) {
        // Update API key field
        if (window.elements.apiKey) {
            window.elements.apiKey.value = window.state.apiKey || '';
            if (window.state.apiKey) {
                window.elements.apiStatus.textContent = '✓ API Key Saved';
                window.elements.apiStatus.className = '';
            }
        }
        
        // Update chat tabs
        if (typeof window.updateChatTabs === 'function') {
            window.updateChatTabs();
        }
        
        // Update active chat
        if (window.state.activeChatId && typeof window.loadChatMessages === 'function') {
            window.loadChatMessages(window.state.activeChatId);
        }
        
        // Update parts table
        if (typeof window.updatePartsTable === 'function') {
            window.updatePartsTable();
        }
        
        // Update restore button
        if (typeof window.updateRestoreButton === 'function') {
            window.updateRestoreButton();
        }
        
        // Apply theme
        if (typeof window.applyTheme === 'function') {
            window.applyTheme(window.state.theme);
        }
        
        // Update chat mode
        if (window.elements.easyChatMode && window.elements.customChatMode) {
            if (window.state.chatMode === 'easy') {
                window.elements.easyChatMode.classList.add('active');
                window.elements.customChatMode.classList.remove('active');
                window.elements.customChatSettings.classList.add('hidden');
            } else {
                window.elements.easyChatMode.classList.remove('active');
                window.elements.customChatMode.classList.add('active');
                window.elements.customChatSettings.classList.remove('hidden');
            }
        }
    }
}

// Patch app.js functions to use Supabase when authenticated
function patchAppFunctions() {
    // Ensure the original app.js functions are available
    if (!window.handleSaveApiKey || !window.createNewChat || !window.deleteChat || 
        !window.addMessageToChat || !window.saveChatsToLocalStorage || 
        !window.handleSaveSystemPrompt || !window.switchTheme || 
        !window.deletePart || !window.handleAddToParts || !window.restoreDeletedChat) {
        console.error('App functions not available yet, retrying in 500ms');
        setTimeout(patchAppFunctions, 500);
        return;
    }
    
    console.log('Patching app functions to use Supabase...');
    
    // 1. Patch API key management
    const originalHandleSaveApiKey = window.handleSaveApiKey;
    window.handleSaveApiKey = async function() {
        // Call original function to maintain UI updates
        originalHandleSaveApiKey();
        
        // Save to Supabase if authenticated
        if (stateManager.useSupabase) {
            const apiKey = window.elements.apiKey.value.trim();
            await stateManager.saveApiKey(apiKey);
        }
    };
    
    // 2. Patch system prompt management
    const originalHandleSaveSystemPrompt = window.handleSaveSystemPrompt;
    window.handleSaveSystemPrompt = async function() {
        // Call original function to maintain UI updates
        originalHandleSaveSystemPrompt();
        
        // Save to Supabase if authenticated
        if (stateManager.useSupabase) {
            const systemPrompt = window.elements.systemPrompt.value;
            await stateManager.saveSystemPrompt(systemPrompt);
        }
    };
    
    // 3. Patch theme switching
    const originalSwitchTheme = window.switchTheme;
    window.switchTheme = async function(theme) {
        // Call original function to maintain UI updates
        originalSwitchTheme(theme);
        
        // Save to Supabase if authenticated
        if (stateManager.useSupabase) {
            await stateManager.saveTheme(theme);
        }
    };
    
    // 4. Patch chat creation
    const originalCreateNewChat = window.createNewChat;
    window.createNewChat = async function() {
        // Call original function to maintain UI updates
        originalCreateNewChat();
        
        // Save to Supabase if authenticated
        if (stateManager.useSupabase) {
            // Find the newly created chat (first in the array)
            const newChat = window.state.chats[0];
            
            if (newChat) {
                await saveChat(newChat);
                await stateManager.saveActiveChatId(newChat.id);
            }
        }
    };
    
    // 5. Patch chat deletion
    const originalDeleteChat = window.deleteChat;
    window.deleteChat = async function(chatId) {
        // Store chat before deletion for Supabase
        const chatToDelete = window.state.chats.find(chat => chat.id === chatId);
        
        // Call original function to maintain UI updates
        originalDeleteChat(chatId);
        
        // Delete from Supabase if authenticated
        if (stateManager.useSupabase && chatToDelete) {
            await deleteSupabaseChat(chatId);
            
            // Save new active chat ID
            if (window.state.activeChatId) {
                await stateManager.saveActiveChatId(window.state.activeChatId);
            }
        }
    };
    
    // 6. Patch message addition
    const originalAddMessageToChat = window.addMessageToChat;
    window.addMessageToChat = async function(role, content, isHtml = false) {
        // Call original function to maintain UI updates
        originalAddMessageToChat(role, content, isHtml);
        
        // Save to Supabase if authenticated
        if (stateManager.useSupabase) {
            const activeChat = window.state.chats.find(chat => chat.id === window.state.activeChatId);
            if (activeChat && activeChat.messages) {
                await saveChatMessages(activeChat.id, activeChat.messages);
            }
        }
    };
    
    // 7. Patch chat saving
    const originalSaveChatsToLocalStorage = window.saveChatsToLocalStorage;
    window.saveChatsToLocalStorage = async function() {
        // Call original function to maintain local storage
        originalSaveChatsToLocalStorage();
        
        // Save to Supabase if authenticated
        if (stateManager.useSupabase) {
            await stateManager.saveChats();
        }
    };
    
    // 8. Patch restore deleted chat
    const originalRestoreDeletedChat = window.restoreDeletedChat;
    window.restoreDeletedChat = async function() {
        // Get the chat to restore
        const chatToRestore = window.state.deletedChats[0];
        
        // Call original function to maintain UI updates
        originalRestoreDeletedChat();
        
        // Restore in Supabase if authenticated
        if (stateManager.useSupabase && chatToRestore) {
            await restoreSupabaseDeletedChat(chatToRestore.id);
            
            // Save new active chat ID
            if (window.state.activeChatId) {
                await stateManager.saveActiveChatId(window.state.activeChatId);
            }
        }
    };
    
    // 9. Patch parts management
    const originalHandleAddToParts = window.handleAddToParts;
    window.handleAddToParts = async function() {
        // Call original function to maintain UI updates
        originalHandleAddToParts();
        
        // Save to Supabase if authenticated
        if (stateManager.useSupabase) {
            await stateManager.savePartsList();
        }
    };
    
    // 10. Patch part deletion
    const originalDeletePart = window.deletePart;
    window.deletePart = async function(id) {
        // Call original function to maintain UI updates
        originalDeletePart(id);
        
        // Save to Supabase if authenticated
        if (stateManager.useSupabase) {
            await stateManager.savePartsList();
        }
    };
    
    // 11. Patch custom chat settings
    if (window.saveCustomChatSettings) {
        const originalSaveCustomChatSettings = window.saveCustomChatSettings;
        window.saveCustomChatSettings = async function() {
            // Call original function to maintain UI updates
            originalSaveCustomChatSettings();
            
            // Save to Supabase if authenticated
            if (stateManager.useSupabase) {
                await stateManager.saveCustomChatSettings(window.state.customChatSettings);
            }
        };
    }
    
    // 12. Patch chat mode switching
    if (window.switchChatMode) {
        const originalSwitchChatMode = window.switchChatMode;
        window.switchChatMode = async function(mode) {
            // Call original function to maintain UI updates
            originalSwitchChatMode(mode);
            
            // Save to Supabase if authenticated
            if (stateManager.useSupabase) {
                await stateManager.saveChatMode(mode);
            }
        };
    }
    
    console.log('App functions patched successfully!');
}

// Export functions for debugging
window.stateManager = stateManager;
