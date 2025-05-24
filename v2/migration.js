// Migration utilities to transfer data from localStorage to Supabase
import { supabase } from './supabase.js';

// Storage keys from app.js
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

/**
 * Migrate user data from localStorage to Supabase
 * @param {string} userId - The user's ID from Supabase
 * @returns {Promise<{success: boolean, error?: Error}>}
 */
export async function migrateUserDataToSupabase(userId) {
    try {
        // Step 1: Migrate user settings
        await migrateUserSettings(userId);
        
        // Step 2: Migrate chats
        await migrateChats(userId);
        
        // Step 3: Migrate parts list
        await migratePartsList(userId);
        
        // Step 4: Migrate deleted chats
        await migrateDeletedChats(userId);
        
        return { success: true };
    } catch (error) {
        console.error('Migration error:', error);
        return { success: false, error };
    }
}

/**
 * Migrate user settings from localStorage to Supabase
 * @param {string} userId - The user's ID from Supabase
 */
async function migrateUserSettings(userId) {
    // Keep API key in localStorage only, don't migrate to Supabase
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    
    // These settings will be migrated to Supabase
    const systemPrompt = localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || '';
    const customSystemPrompt = localStorage.getItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT) || '';
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) || 'default';
    const chatMode = localStorage.getItem(STORAGE_KEYS.CHAT_MODE) || 'easy';
    const customChatSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_CHAT_SETTINGS) || '{"maxTokens": 2000, "temperature": 0.7, "model": "gpt-4.1"}');
    const selectedPreset = localStorage.getItem(STORAGE_KEYS.SELECTED_PRESET) || '';
    const deletedChatsMax = parseInt(localStorage.getItem(STORAGE_KEYS.DELETED_CHATS_MAX)) || 2;
    const activeChatId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID) || null;

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            id: userId,
            // api_key is intentionally not stored in Supabase for security
            system_prompt: systemPrompt,
            custom_system_prompt: customSystemPrompt,
            theme: theme,
            chat_mode: chatMode,
            custom_chat_settings: customChatSettings,
            selected_preset: selectedPreset,
            deleted_chats_max: deletedChatsMax,
            active_chat_id: activeChatId
        });

    if (error) {
        console.error('Error migrating user settings:', error);
        throw error;
    }
}

/**
 * Migrate chats from localStorage to Supabase
 * @param {string} userId - The user's ID from Supabase
 */
async function migrateChats(userId) {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]');
    
    for (const chat of chats) {
        // Create chat record
        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .upsert({
                id: chat.id, // Use existing ID 
                user_id: userId,
                title: chat.title || `Chat ${new Date().toLocaleString()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (chatError) {
            console.error('Error migrating chat:', chatError);
            throw chatError;
        }

        // Create chat messages
        if (chat.messages && chat.messages.length > 0) {
            const messagesWithChatId = chat.messages.map(msg => ({
                chat_id: chatData.id,
                role: msg.role,
                content: msg.content,
                is_html: msg.isHtml || false,
                image_url: msg.imageUrl || null,
                created_at: new Date().toISOString()
            }));

            const { error: messagesError } = await supabase
                .from('chat_messages')
                .upsert(messagesWithChatId);

            if (messagesError) {
                console.error('Error migrating chat messages:', messagesError);
                throw messagesError;
            }
        }
    }
}

/**
 * Migrate parts list from localStorage to Supabase
 * @param {string} userId - The user's ID from Supabase
 */
async function migratePartsList(userId) {
    const partsList = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTS_LIST) || '[]');
    
    if (partsList.length > 0) {
        const partsWithUserId = partsList.map(part => ({
            id: part.id,
            user_id: userId,
            part_name: part.name,
            description: part.description,
            quantity: part.quantity,
            price: part.price,
            link: part.link,
            created_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
            .from('parts_list')
            .upsert(partsWithUserId);

        if (error) {
            console.error('Error migrating parts list:', error);
            throw error;
        }
    }
}

/**
 * Migrate deleted chats from localStorage to Supabase
 * @param {string} userId - The user's ID from Supabase
 */
async function migrateDeletedChats(userId) {
    const deletedChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_CHATS) || '[]');
    
    if (deletedChats.length > 0) {
        const deletedChatsWithUserId = deletedChats.map(chat => ({
            id: chat.id,
            user_id: userId,
            chat_data: chat,
            deleted_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
            .from('deleted_chats')
            .upsert(deletedChatsWithUserId);

        if (error) {
            console.error('Error migrating deleted chats:', error);
            throw error;
        }
    }
}
