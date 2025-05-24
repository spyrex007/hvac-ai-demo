// crud-operations.js - CRUD operations for Supabase integration
import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

/**
 * Utility function to ensure a user is authenticated before proceeding
 * @returns {Promise<Object>} User object if authenticated
 * @throws {Error} If not authenticated
 */
async function ensureAuthenticated() {
    const user = await getCurrentUser().catch(() => null);
    if (!user) {
        throw new Error('User not authenticated');
    }
    return user;
}

/**
 * Create a new chat in Supabase
 * @param {Object} chat Chat object to create
 * @returns {Promise<String>} Chat ID
 */
export async function createChat(chat) {
    const user = await ensureAuthenticated();
    
    const { data, error } = await supabase
        .from('chats')
        .insert({
            id: chat.id || `chat_${Date.now()}`,
            user_id: user.id,
            title: chat.title || `Chat ${new Date().toLocaleString()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
    if (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
    
    return data.id;
}

/**
 * Update an existing chat in Supabase
 * @param {Object} chat Chat object to update
 * @returns {Promise<String>} Chat ID
 */
export async function updateChat(chat) {
    const user = await ensureAuthenticated();
    
    const { data, error } = await supabase
        .from('chats')
        .update({
            title: chat.title,
            updated_at: new Date().toISOString()
        })
        .eq('id', chat.id)
        .eq('user_id', user.id)
        .select('id')
        .single();
        
    if (error) {
        console.error('Error updating chat:', error);
        throw error;
    }
    
    return data.id;
}

/**
 * Get all chats for the authenticated user
 * @param {Object} options Query options
 * @returns {Promise<Array>} Array of chats
 */
export async function getChats(options = {}) {
    const user = await ensureAuthenticated();
    
    let query = supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id);
        
    if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending !== false });
    } else {
        query = query.order('updated_at', { ascending: false });
    }
    
    if (options.limit) {
        query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
        
    if (error) {
        console.error('Error getting chats:', error);
        throw error;
    }
    
    return data || [];
}

/**
 * Get a single chat by ID
 * @param {String} chatId Chat ID
 * @returns {Promise<Object>} Chat object
 */
export async function getChatById(chatId) {
    const user = await ensureAuthenticated();
    
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .eq('user_id', user.id)
        .single();
        
    if (error) {
        console.error('Error getting chat:', error);
        throw error;
    }
    
    return data;
}

/**
 * Delete a chat by ID
 * @param {String} chatId Chat ID
 * @returns {Promise<Boolean>} Success status
 */
export async function deleteChat(chatId) {
    const user = await ensureAuthenticated();
    
    // First, get the chat to store in deleted_chats
    const { data: chatData, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .eq('user_id', user.id)
        .single();
        
    if (fetchError) {
        console.error('Error fetching chat for deletion:', fetchError);
        throw fetchError;
    }
    
    // Get chat messages
    const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId);
        
    if (messagesError) {
        console.error('Error fetching chat messages for deletion:', messagesError);
        throw messagesError;
    }
    
    // Store in deleted_chats
    const deletedChatData = {
        ...chatData,
        messages: messagesData || []
    };
    
    const { error: deleteStoreError } = await supabase
        .from('deleted_chats')
        .upsert({
            id: chatId,
            user_id: user.id,
            chat_data: deletedChatData,
            deleted_at: new Date().toISOString()
        });
        
    if (deleteStoreError) {
        console.error('Error storing deleted chat:', deleteStoreError);
        throw deleteStoreError;
    }
    
    // Now delete the chat (messages will cascade delete)
    const { error: deleteError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id);
        
    if (deleteError) {
        console.error('Error deleting chat:', deleteError);
        throw deleteError;
    }
    
    return true;
}

/**
 * Create or update chat messages
 * @param {String} chatId Chat ID
 * @param {Array} messages Array of message objects
 * @returns {Promise<Boolean>} Success status
 */
export async function saveMessages(chatId, messages) {
    const user = await ensureAuthenticated();
    
    // First verify the chat belongs to the user
    const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('user_id')
        .eq('id', chatId)
        .single();
        
    if (chatError) {
        console.error('Error verifying chat ownership:', chatError);
        throw chatError;
    }
    
    if (chatData.user_id !== user.id) {
        throw new Error('Unauthorized access to chat');
    }
    
    // Delete existing messages
    const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatId);
        
    if (deleteError) {
        console.error('Error deleting existing messages:', deleteError);
        throw deleteError;
    }
    
    if (!messages || messages.length === 0) {
        return true;
    }
    
    // Insert new messages
    const messagesWithChatId = messages.map(msg => ({
        chat_id: chatId,
        role: msg.role,
        content: msg.content,
        is_html: msg.isHtml || false,
        image_url: msg.imageUrl || null,
        created_at: new Date().toISOString()
    }));
    
    const { error } = await supabase
        .from('chat_messages')
        .insert(messagesWithChatId);
        
    if (error) {
        console.error('Error saving messages:', error);
        throw error;
    }
    
    // Update chat's updated_at timestamp
    await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
    
    return true;
}

/**
 * Get messages for a chat
 * @param {String} chatId Chat ID
 * @returns {Promise<Array>} Array of message objects
 */
export async function getMessages(chatId) {
    const user = await ensureAuthenticated();
    
    // First verify the chat belongs to the user
    const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('user_id')
        .eq('id', chatId)
        .single();
        
    if (chatError) {
        console.error('Error verifying chat ownership:', chatError);
        throw chatError;
    }
    
    if (chatData.user_id !== user.id) {
        throw new Error('Unauthorized access to chat');
    }
    
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
        
    if (error) {
        console.error('Error getting messages:', error);
        throw error;
    }
    
    // Transform to match the expected format
    return data.map(msg => ({
        role: msg.role,
        content: msg.content,
        isHtml: msg.is_html,
        imageUrl: msg.image_url
    })) || [];
}

/**
 * Save a part to the parts list
 * @param {Object} part Part object to save
 * @returns {Promise<String>} Part ID
 */
export async function savePart(part) {
    const user = await ensureAuthenticated();
    
    const { data, error } = await supabase
        .from('parts_list')
        .upsert({
            id: part.id || `part_${Date.now()}`,
            user_id: user.id,
            part_name: part.name,
            description: part.description,
            quantity: part.quantity,
            price: part.price,
            link: part.link,
            created_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
    if (error) {
        console.error('Error saving part:', error);
        throw error;
    }
    
    return data.id;
}

/**
 * Get all parts for the authenticated user
 * @returns {Promise<Array>} Array of part objects
 */
export async function getParts() {
    const user = await ensureAuthenticated();
    
    const { data, error } = await supabase
        .from('parts_list')
        .select('*')
        .eq('user_id', user.id);
        
    if (error) {
        console.error('Error getting parts:', error);
        throw error;
    }
    
    // Transform to match the expected format
    return data.map(part => ({
        id: part.id,
        name: part.part_name,
        description: part.description,
        quantity: part.quantity,
        price: part.price,
        link: part.link
    })) || [];
}

/**
 * Delete a part by ID
 * @param {String} partId Part ID
 * @returns {Promise<Boolean>} Success status
 */
export async function deletePart(partId) {
    const user = await ensureAuthenticated();
    
    const { error } = await supabase
        .from('parts_list')
        .delete()
        .eq('id', partId)
        .eq('user_id', user.id);
        
    if (error) {
        console.error('Error deleting part:', error);
        throw error;
    }
    
    return true;
}

/**
 * Save user settings
 * @param {Object} settings Settings object
 * @returns {Promise<Boolean>} Success status
 */
export async function saveSettings(settings) {
    const user = await ensureAuthenticated();
    
    const { error } = await supabase
        .from('user_settings')
        .upsert({
            id: user.id,
            ...settings
        });
        
    if (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
    
    return true;
}

/**
 * Get user settings
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
    const user = await ensureAuthenticated();
    
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single();
        
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error getting settings:', error);
        throw error;
    }
    
    return data || {};
}

/**
 * Get deleted chats
 * @param {Number} limit Maximum number of deleted chats to return
 * @returns {Promise<Array>} Array of deleted chat objects
 */
export async function getDeletedChats(limit = 10) {
    const user = await ensureAuthenticated();
    
    const { data, error } = await supabase
        .from('deleted_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('deleted_at', { ascending: false })
        .limit(limit);
        
    if (error) {
        console.error('Error getting deleted chats:', error);
        throw error;
    }
    
    return data.map(item => item.chat_data) || [];
}

/**
 * Restore a deleted chat
 * @param {String} chatId Chat ID to restore
 * @returns {Promise<Boolean>} Success status
 */
export async function restoreDeletedChat(chatId) {
    const user = await ensureAuthenticated();
    
    // Get the deleted chat
    const { data, error } = await supabase
        .from('deleted_chats')
        .select('chat_data')
        .eq('id', chatId)
        .eq('user_id', user.id)
        .single();
        
    if (error) {
        console.error('Error getting deleted chat:', error);
        throw error;
    }
    
    const chatData = data.chat_data;
    
    // Create a new chat
    await createChat({
        id: chatData.id,
        title: chatData.title
    });
    
    // Add messages if they exist
    if (chatData.messages && chatData.messages.length > 0) {
        await saveMessages(chatData.id, chatData.messages);
    }
    
    // Delete from deleted_chats
    const { error: deleteError } = await supabase
        .from('deleted_chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id);
        
    if (deleteError) {
        console.error('Error deleting restored chat:', deleteError);
        throw deleteError;
    }
    
    return true;
}
