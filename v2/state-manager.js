// state-manager.js - Manages application state using Supabase
import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { 
    loadUserSettings, 
    saveUserSettings,
    loadChats,
    saveChat,
    saveChatMessages,
    loadPartsList,
    savePartsList,
    loadDeletedChats
} from './data-service.js';

// Constants
const DEFAULT_SYSTEM_PROMPT = "You are an HVAC Repair and Maintenance Assistant Chatbot. You are very helpful. You ONLY want to talk about HVAC stuff. You are chatting with an HVAC technician who already knows about HVAC, so you should provide advice meant for experts. Make all answers very long and detailed, taking all factors into account. Ask follow-up questions. If images are provided, look at the specific model numbers, manufacturers, and more to determine differences between brands and such. Specifically call out differences and model numbers of brands, specifications, and such from images and text.";
const DEFAULT_DELETED_CHATS_MAX = 2;

// Storage key constants - same as in app.js
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

// Global state object - will be exported and used by app.js
export const stateManager = {
    // Core state properties
    user: null,
    isInitialized: false,
    isDataLoaded: false,
    useSupabase: false,  // Will be true if user is authenticated
    
    // Initialize state manager
    async initialize() {
        try {
            // Check for authenticated user
            const user = await getCurrentUser().catch(() => null);
            this.user = user;
            this.useSupabase = !!user;
            
            if (this.useSupabase) {
                // Load data from Supabase
                await this.loadFromSupabase();
            }
            
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing state manager:', error);
            this.isInitialized = true;
            return false;
        }
    },
    
    // Load state from Supabase
    async loadFromSupabase() {
        if (!this.user) return false;
        
        try {
            this.isDataLoaded = false;
            
            // Load user settings
            const settings = await loadUserSettings();
            
            // Apply settings to the global state object (window.state)
            if (settings) {
                window.state.apiKey = settings.api_key || '';
                window.state.systemPrompt = settings.system_prompt || DEFAULT_SYSTEM_PROMPT;
                window.state.customSystemPrompt = settings.custom_system_prompt || '';
                window.state.theme = settings.theme || 'default';
                window.state.chatMode = settings.chat_mode || 'easy';
                window.state.customChatSettings = settings.custom_chat_settings || { 
                    maxTokens: 2000, 
                    temperature: 0.7, 
                    model: "gpt-4.1" 
                };
                window.state.selectedPreset = settings.selected_preset || '';
                window.state.deletedChatsMax = settings.deleted_chats_max || DEFAULT_DELETED_CHATS_MAX;
                window.state.activeChatId = settings.active_chat_id || null;
            }
            
            // Load chats
            const chats = await loadChats();
            if (chats && chats.length > 0) {
                window.state.chats = chats;
            }
            
            // Load parts list
            const parts = await loadPartsList();
            if (parts && parts.length > 0) {
                window.state.partsList = parts;
            }
            
            // Load deleted chats
            const deletedChats = await loadDeletedChats(window.state.deletedChatsMax);
            if (deletedChats && deletedChats.length > 0) {
                window.state.deletedChats = deletedChats;
            }
            
            this.isDataLoaded = true;
            return true;
        } catch (error) {
            console.error('Error loading from Supabase:', error);
            this.isDataLoaded = true;
            return false;
        }
    },
    
    // Save API key
    async saveApiKey(apiKey) {
        window.state.apiKey = apiKey;
        
        if (this.useSupabase) {
            await saveUserSettings({ api_key: apiKey });
        } else {
            localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
        }
    },
    
    // Save system prompt
    async saveSystemPrompt(systemPrompt) {
        window.state.systemPrompt = systemPrompt;
        
        if (this.useSupabase) {
            await saveUserSettings({ system_prompt: systemPrompt });
        } else {
            localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, systemPrompt);
        }
    },
    
    // Save custom system prompt
    async saveCustomSystemPrompt(customSystemPrompt) {
        window.state.customSystemPrompt = customSystemPrompt;
        
        if (this.useSupabase) {
            await saveUserSettings({ custom_system_prompt: customSystemPrompt });
        } else {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT, customSystemPrompt);
        }
    },
    
    // Save theme
    async saveTheme(theme) {
        window.state.theme = theme;
        
        if (this.useSupabase) {
            await saveUserSettings({ theme });
        } else {
            localStorage.setItem(STORAGE_KEYS.THEME, theme);
        }
    },
    
    // Save chat mode
    async saveChatMode(chatMode) {
        window.state.chatMode = chatMode;
        
        if (this.useSupabase) {
            await saveUserSettings({ chat_mode: chatMode });
        } else {
            localStorage.setItem(STORAGE_KEYS.CHAT_MODE, chatMode);
        }
    },
    
    // Save custom chat settings
    async saveCustomChatSettings(settings) {
        window.state.customChatSettings = settings;
        
        if (this.useSupabase) {
            await saveUserSettings({ custom_chat_settings: settings });
        } else {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_CHAT_SETTINGS, JSON.stringify(settings));
        }
    },
    
    // Save selected preset
    async saveSelectedPreset(preset) {
        window.state.selectedPreset = preset;
        
        if (this.useSupabase) {
            await saveUserSettings({ selected_preset: preset });
        } else {
            localStorage.setItem(STORAGE_KEYS.SELECTED_PRESET, preset);
        }
    },
    
    // Save deleted chats max
    async saveDeletedChatsMax(max) {
        window.state.deletedChatsMax = max;
        
        if (this.useSupabase) {
            await saveUserSettings({ deleted_chats_max: max });
        } else {
            localStorage.setItem(STORAGE_KEYS.DELETED_CHATS_MAX, max.toString());
        }
    },
    
    // Save active chat ID
    async saveActiveChatId(chatId) {
        window.state.activeChatId = chatId;
        
        if (this.useSupabase) {
            await saveUserSettings({ active_chat_id: chatId });
        } else {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, chatId);
        }
    },
    
    // Save chats
    async saveChats() {
        if (this.useSupabase) {
            // Save each chat to Supabase
            for (const chat of window.state.chats) {
                const chatId = await saveChat(chat);
                if (chatId && chat.messages && chat.messages.length > 0) {
                    await saveChatMessages(chatId, chat.messages);
                }
            }
        } else {
            localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(window.state.chats));
        }
    },
    
    // Save parts list
    async savePartsList() {
        if (this.useSupabase) {
            await savePartsList(window.state.partsList);
        } else {
            localStorage.setItem(STORAGE_KEYS.PARTS_LIST, JSON.stringify(window.state.partsList));
        }
    },
    
    // Save deleted chats
    async saveDeletedChats() {
        if (this.useSupabase) {
            // This is handled by the deleteChat function in data-service.js
        } else {
            localStorage.setItem(STORAGE_KEYS.DELETED_CHATS, JSON.stringify(window.state.deletedChats));
        }
    },
    
    // Handle auth state change
    async handleAuthStateChange(event, session) {
        if (event === 'SIGNED_IN') {
            this.user = session.user;
            this.useSupabase = true;
            await this.loadFromSupabase();
        } else if (event === 'SIGNED_OUT') {
            this.user = null;
            this.useSupabase = false;
        }
    }
};

// Initialize on module import
stateManager.initialize().catch(console.error);
