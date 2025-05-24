// Enhanced app.js with Supabase integration
import { supabase } from './supabase.js';
import { 
    getCurrentUser, 
    onAuthStateChange, 
    signOut 
} from './auth.js';
import { 
    loadUserSettings, 
    saveUserSettings,
    loadChats,
    saveChat,
    deleteChat,
    loadChatMessages,
    saveChatMessages,
    loadPartsList,
    savePartsList,
    loadDeletedChats,
    restoreDeletedChat
} from './data-service.js';

// Constants
const STORAGE_KEYS = {
    API_KEY: 'hvac_ai_api_key',
    PARTS_LIST: 'hvac_parts_list',
    SYSTEM_PROMPT: 'hvac_system_prompt',
    CHATS: 'hvac_chats',
    ACTIVE_CHAT_ID: 'hvac_active_chat_id',
    THEME: 'hvac_theme',
    DELETED_CHATS: 'hvac_deleted_chats',
    DELETED_CHATS_MAX: 'hvac_deleted_chats_max',
    CHAT_MODE: 'hvac_chat_mode',
    CUSTOM_CHAT_SETTINGS: 'hvac_custom_chat_settings',
    CUSTOM_SYSTEM_PROMPT: 'hvac_custom_system_prompt',
    SELECTED_PRESET: 'hvac_selected_preset'
};

const DEFAULT_SYSTEM_PROMPT = "You are an HVAC Repair and Maintenance Assistant Chatbot. You are very helpful. You ONLY want to talk about HVAC stuff. You are chatting with an HVAC technician who already knows about HVAC, so you should provide advice meant for experts. Make all answers very long and detailed, taking all factors into account. Ask follow-up questions. If images are provided, look at the specific model numbers, manufacturers, and more to determine differences between brands and such. Specifically call out differences and model numbers of brands, specifications, and such from images and text.";

const DEFAULT_DELETED_CHATS_MAX = 2;

// App state
const state = {
    user: null,
    apiKey: '',
    currentMode: 'chat',
    currentImage: null,
    partsList: [],
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    customSystemPrompt: '',
    chatImageFile: null,
    chats: [],
    activeChatId: null,
    theme: 'default',
    deletedChats: [],
    deletedChatsMax: DEFAULT_DELETED_CHATS_MAX,
    chatMode: 'easy',
    customChatSettings: {maxTokens: 2000, temperature: 0.7, model: "gpt-4.1"},
    selectedPreset: '',
    presets: [],
    isDataLoaded: false
};

// DOM Elements placeholder
let elements = {};

// Initialize app state from Supabase when logged in
async function loadUserStateFromSupabase() {
    try {
        // Get current user
        const user = await getCurrentUser().catch(() => null);
        if (!user) {
            return false;
        }
        
        state.user = user;
        state.isDataLoaded = false;
        
        // Load user settings
        const settings = await loadUserSettings();
        if (settings) {
            state.apiKey = settings.api_key || '';
            state.systemPrompt = settings.system_prompt || DEFAULT_SYSTEM_PROMPT;
            state.customSystemPrompt = settings.custom_system_prompt || '';
            state.theme = settings.theme || 'default';
            state.chatMode = settings.chat_mode || 'easy';
            state.customChatSettings = settings.custom_chat_settings || { maxTokens: 2000, temperature: 0.7, model: "gpt-4.1" };
            state.selectedPreset = settings.selected_preset || '';
            state.deletedChatsMax = settings.deleted_chats_max || DEFAULT_DELETED_CHATS_MAX;
            state.activeChatId = settings.active_chat_id || null;
        }
        
        // Apply theme
        applyTheme(state.theme);
        
        // Load chats
        const chats = await loadChats();
        if (chats) {
            state.chats = chats;
            
            // Load messages for each chat
            for (const chat of state.chats) {
                const messages = await loadChatMessages(chat.id);
                chat.messages = messages;
            }
            
            // Update chat tabs UI
            updateChatTabs();
            
            // Load active chat messages if there's an active chat
            if (state.activeChatId) {
                loadChatMessages(state.activeChatId);
            } else if (state.chats.length > 0) {
                // Set first chat as active if none is active
                state.activeChatId = state.chats[0].id;
            }
        }
        
        // Load parts list
        const parts = await loadPartsList();
        if (parts) {
            state.partsList = parts;
            updatePartsTable();
        }
        
        // Load deleted chats
        const deletedChats = await loadDeletedChats(state.deletedChatsMax);
        if (deletedChats) {
            state.deletedChats = deletedChats;
            updateRestoreButton();
        }
        
        // Update UI based on loaded data
        updateUIFromState();
        
        state.isDataLoaded = true;
        return true;
    } catch (error) {
        console.error('Error loading user state from Supabase:', error);
        return false;
    }
}

// Update UI elements based on state
function updateUIFromState() {
    // API Key
    if (elements.apiKey) {
        elements.apiKey.value = state.apiKey;
        if (state.apiKey) {
            elements.apiStatus.textContent = '✓ API Key Saved';
            elements.apiStatus.className = '';
        }
    }
    
    // System Prompt
    if (elements.systemPrompt) {
        elements.systemPrompt.value = state.systemPrompt;
    }
    
    // Custom System Prompt
    if (elements.customSystemPrompt) {
        elements.customSystemPrompt.value = state.customSystemPrompt;
    }
    
    // Chat Mode
    if (elements.easyChatMode && elements.customChatMode) {
        if (state.chatMode === 'easy') {
            elements.easyChatMode.classList.add('active');
            elements.customChatMode.classList.remove('active');
            elements.customChatSettings.classList.add('hidden');
        } else {
            elements.easyChatMode.classList.remove('active');
            elements.customChatMode.classList.add('active');
            elements.customChatSettings.classList.remove('hidden');
        }
    }
    
    // Custom Chat Settings
    if (elements.maxTokens) {
        elements.maxTokens.value = state.customChatSettings.maxTokens;
    }
    if (elements.temperature) {
        elements.temperature.value = state.customChatSettings.temperature;
        updateTemperatureValue();
    }
    if (elements.modelSelection) {
        elements.modelSelection.value = state.customChatSettings.model;
    }
    
    // Selected Preset
    if (elements.presetPrompt) {
        elements.presetPrompt.value = state.selectedPreset;
        updatePresetDescription();
    }
    
    // Update chat messages if active chat
    if (state.activeChatId) {
        loadChatMessages(state.activeChatId);
    }
    
    // Update restore button
    updateRestoreButton();
    
    // Update storage info
    updateStorageInfo();
}

// Save state to Supabase
async function saveStateToSupabase() {
    if (!state.user || !state.isDataLoaded) return;
    
    try {
        // Save user settings
        await saveUserSettings({
            api_key: state.apiKey,
            system_prompt: state.systemPrompt,
            custom_system_prompt: state.customSystemPrompt,
            theme: state.theme,
            chat_mode: state.chatMode,
            custom_chat_settings: state.customChatSettings,
            selected_preset: state.selectedPreset,
            deleted_chats_max: state.deletedChatsMax,
            active_chat_id: state.activeChatId
        });
        
        // Save chats
        for (const chat of state.chats) {
            const chatId = await saveChat(chat);
            if (chatId) {
                await saveChatMessages(chatId, chat.messages || []);
            }
        }
        
        // Save parts list
        await savePartsList(state.partsList);
    } catch (error) {
        console.error('Error saving state to Supabase:', error);
    }
}

// Override key functions to use Supabase instead of localStorage

// API Key Management
async function handleSaveApiKey() {
    const apiKey = elements.apiKey.value.trim();
    state.apiKey = apiKey;
    
    // Test if the API key works (call to OpenAI API)
    elements.apiStatus.textContent = 'Testing API Key...';
    elements.apiStatus.className = '';
    
    // Save to state and Supabase
    if (state.user) {
        await saveUserSettings({ api_key: apiKey });
    } else {
        localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    }
    
    elements.apiStatus.textContent = '✓ API Key Saved';
}

// Chat creation and management
async function createNewChat() {
    const newChatId = `chat_${Date.now()}`;
    const newChat = {
        id: newChatId,
        title: `Chat ${state.chats.length + 1}`,
        messages: []
    };
    
    state.chats.unshift(newChat);
    state.activeChatId = newChatId;
    
    updateChatTabs();
    clearChatMessages();
    
    // Save to Supabase if logged in
    if (state.user) {
        await saveChat(newChat);
    } else {
        saveChatsToLocalStorage();
    }
}

// Chat message handling
async function addMessageToChat(role, content, isHtml = false) {
    const activeChat = state.chats.find(chat => chat.id === state.activeChatId);
    if (!activeChat) return;
    
    // Create message object
    const message = {
        role,
        content,
        isHtml,
        imageUrl: role === 'user' && state.chatImageFile ? state.chatImageFile : null
    };
    
    // Add to chat
    if (!activeChat.messages) {
        activeChat.messages = [];
    }
    activeChat.messages.push(message);
    
    // Update UI
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'content';
    
    if (isHtml) {
        contentEl.innerHTML = content;
    } else {
        contentEl.textContent = content;
    }
    
    messageEl.appendChild(contentEl);
    
    // Add image if present
    if (message.imageUrl) {
        const imageEl = document.createElement('img');
        imageEl.src = message.imageUrl;
        imageEl.className = 'message-image';
        contentEl.appendChild(imageEl);
    }
    
    elements.chatMessages.appendChild(messageEl);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    // Clear image if it was added
    if (role === 'user') {
        state.chatImageFile = null;
    }
    
    // Save to storage
    if (state.user) {
        // Save the active chat's messages to Supabase
        await saveChatMessages(activeChat.id, activeChat.messages);
    } else {
        saveChatsToLocalStorage();
    }
}

// Delete chat
async function handleDeleteChat(chatId) {
    // Find the chat in the state
    const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex === -1) return;
    
    // Get the chat to save to deleted chats
    const deletedChat = state.chats[chatIndex];
    
    // Remove from chats array
    state.chats.splice(chatIndex, 1);
    
    // Add to deleted chats
    state.deletedChats.unshift(deletedChat);
    
    // Enforce maximum deleted chats
    if (state.deletedChats.length > state.deletedChatsMax) {
        state.deletedChats.length = state.deletedChatsMax;
    }
    
    // If the deleted chat was active, set a new active chat
    if (state.activeChatId === chatId) {
        if (state.chats.length > 0) {
            state.activeChatId = state.chats[0].id;
        } else {
            state.activeChatId = null;
            createNewChat();
        }
    }
    
    // Update UI
    updateChatTabs();
    updateRestoreButton();
    
    // Load messages for the new active chat
    if (state.activeChatId) {
        loadChatMessages(state.activeChatId);
    }
    
    // Save to storage
    if (state.user) {
        // Delete from Supabase
        await deleteChat(chatId);
    } else {
        saveChatsToLocalStorage();
        localStorage.setItem(STORAGE_KEYS.DELETED_CHATS, JSON.stringify(state.deletedChats));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, state.activeChatId);
    }
}

// Restore deleted chat
async function handleRestoreDeletedChat() {
    if (state.deletedChats.length === 0) return;
    
    // Get the most recently deleted chat
    const chatToRestore = state.deletedChats.shift();
    
    // Add back to chats array
    state.chats.unshift(chatToRestore);
    state.activeChatId = chatToRestore.id;
    
    // Update UI
    updateChatTabs();
    updateRestoreButton();
    loadChatMessages(chatToRestore.id);
    
    // Save to storage
    if (state.user) {
        // Restore in Supabase
        await restoreDeletedChat(chatToRestore.id);
    } else {
        saveChatsToLocalStorage();
        localStorage.setItem(STORAGE_KEYS.DELETED_CHATS, JSON.stringify(state.deletedChats));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, state.activeChatId);
    }
}

// Handle parts management
async function handleAddToParts() {
    const partDetails = document.getElementById('partDetails');
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (!partDetails || !quantity) return;
    
    const partText = partDetails.textContent;
    const lines = partText.split('\n');
    
    // Extract part details from text
    let name = '';
    let description = '';
    let price = '';
    let link = '';
    
    for (const line of lines) {
        if (line.startsWith('Name:')) {
            name = line.replace('Name:', '').trim();
        } else if (line.startsWith('Description:')) {
            description = line.replace('Description:', '').trim();
        } else if (line.startsWith('Price:')) {
            price = line.replace('Price:', '').trim();
        } else if (line.startsWith('Link:')) {
            link = line.replace('Link:', '').trim();
        }
    }
    
    const partId = `part_${Date.now()}`;
    const newPart = {
        id: partId,
        name,
        description,
        quantity,
        price,
        link
    };
    
    state.partsList.push(newPart);
    updatePartsTable();
    
    // Save to storage
    if (state.user) {
        await savePartsList(state.partsList);
    } else {
        localStorage.setItem(STORAGE_KEYS.PARTS_LIST, JSON.stringify(state.partsList));
    }
    
    // Reset the form
    document.getElementById('quantity').value = 1;
    document.getElementById('partDetails').innerHTML = '';
    document.querySelector('.quantity-section').classList.add('hidden');
    document.querySelector('.confirmation-section').classList.add('hidden');
}

// Part deletion
async function deletePart(id) {
    const index = state.partsList.findIndex(part => part.id === id);
    if (index !== -1) {
        state.partsList.splice(index, 1);
        updatePartsTable();
        
        // Save to storage
        if (state.user) {
            await savePartsList(state.partsList);
        } else {
            localStorage.setItem(STORAGE_KEYS.PARTS_LIST, JSON.stringify(state.partsList));
        }
    }
}

// Event listener initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all the UI elements
    initializeElements();
    
    // Initialize authentication
    initializeAuth();
    
    // Load presets
    fetch('presets.json')
        .then(response => response.json())
        .then(data => {
            state.presets = data;
            populatePresetSelector();
        })
        .catch(error => console.error('Error loading presets:', error));
});

// Initialize auth-related functionality
function initializeAuth() {
    // Import the auth UI initialization function
    import('./auth-ui.js')
        .then(module => {
            // Initialize auth UI
            module.initializeAuthUI();
            
            // Listen for auth state changes
            onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                if (event === 'SIGNED_IN') {
                    // User signed in, load their data
                    loadUserStateFromSupabase().then(() => {
                        console.log('User data loaded from Supabase');
                        
                        // Show app container
                        const appContainer = document.getElementById('appContainer');
                        if (appContainer) {
                            appContainer.classList.remove('hidden');
                        }
                        
                        // Update UI
                        updateUIFromState();
                    });
                } else if (event === 'SIGNED_OUT') {
                    // User signed out, reset state
                    resetState();
                    
                    // Hide app container
                    const appContainer = document.getElementById('appContainer');
                    if (appContainer) {
                        appContainer.classList.add('hidden');
                    }
                }
            });
        })
        .catch(error => console.error('Error initializing auth:', error));
}

// Reset state to defaults
function resetState() {
    state.user = null;
    state.apiKey = '';
    state.partsList = [];
    state.systemPrompt = DEFAULT_SYSTEM_PROMPT;
    state.customSystemPrompt = '';
    state.chats = [];
    state.activeChatId = null;
    state.theme = 'default';
    state.deletedChats = [];
    state.deletedChatsMax = DEFAULT_DELETED_CHATS_MAX;
    state.chatMode = 'easy';
    state.customChatSettings = {maxTokens: 2000, temperature: 0.7, model: "gpt-4.1"};
    state.selectedPreset = '';
    state.isDataLoaded = false;
}

// Initialize DOM elements
function initializeElements() {
    // All your existing element initialization code...
    // (This would be copied from the original app.js)
}

// Export functions that need to be accessible from the HTML
window.handleSaveApiKey = handleSaveApiKey;
window.switchMode = switchMode;
window.handleImageUpload = handleImageUpload;
window.analyzeImage = analyzeImage;
window.handleConfirmYes = handleConfirmYes;
window.handleConfirmNo = handleConfirmNo;
window.handleAddToParts = handleAddToParts;
window.deletePart = deletePart;
window.handleSaveSystemPrompt = handleSaveSystemPrompt;
window.handleResetSystemPrompt = handleResetSystemPrompt;
window.handleChatImageUpload = handleChatImageUpload;
window.processImageFile = processImageFile;
window.handlePaste = handlePaste;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.createNewChat = createNewChat;
window.switchToChat = switchToChat;
window.deleteChat = handleDeleteChat;
window.restoreDeletedChat = handleRestoreDeletedChat;
window.handleSendMessage = handleSendMessage;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.switchTheme = switchTheme;
window.switchChatMode = switchChatMode;
window.addToSystemPrompt = addToSystemPrompt;
window.replaceSystemPrompt = replaceSystemPrompt;
window.updateTemperatureValue = updateTemperatureValue;
window.updateMaxTokens = updateMaxTokens;
window.updateModel = updateModel;
window.toggleSystemPromptDisplay = toggleSystemPromptDisplay;
window.resetSystemPromptToDefault = resetSystemPromptToDefault;
window.resetAllCustomSettings = resetAllCustomSettings;
window.handlePresetChange = handlePresetChange;
