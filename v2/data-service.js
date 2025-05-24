// Data service for Supabase operations
import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

// Utility function to check if user is authenticated
async function ensureAuthenticated() {
    const user = await getCurrentUser().catch(() => null);
    if (!user) {
        throw new Error('User not authenticated');
    }
    return user;
}

// Load user settings from Supabase
export async function loadUserSettings() {
    try {
        const user = await ensureAuthenticated();
        
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (error) throw error;
        
        return data || {};
    } catch (error) {
        console.error('Error loading user settings:', error);
        return {};
    }
}

// Save user settings to Supabase
export async function saveUserSettings(settings) {
    try {
        const user = await ensureAuthenticated();
        
        // Create a copy of settings without the api_key
        const safeSettings = { ...settings };
        delete safeSettings.api_key; // Never store API key in Supabase
        
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                id: user.id,
                ...safeSettings
            });
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error saving user settings:', error);
        return false;
    }
}

// Load chats from Supabase
export async function loadChats() {
    try {
        const user = await ensureAuthenticated();
        
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
            
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error loading chats:', error);
        return [];
    }
}

// Save a chat to Supabase
export async function saveChat(chat) {
    try {
        const user = await ensureAuthenticated();
        
        const { data, error } = await supabase
            .from('chats')
            .upsert({
                id: chat.id,
                user_id: user.id,
                title: chat.title || `Chat ${new Date().toLocaleString()}`,
                updated_at: new Date().toISOString()
            })
            .select('id')
            .single();
            
        if (error) throw error;
        
        return data.id;
    } catch (error) {
        console.error('Error saving chat:', error);
        return null;
    }
}

// Delete a chat from Supabase
export async function deleteChat(chatId) {
    try {
        const user = await ensureAuthenticated();
        
        // First, get the chat data to store in deleted_chats
        const { data: chatData, error: fetchError } = await supabase
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .eq('user_id', user.id)
            .single();
            
        if (fetchError) throw fetchError;
        
        // Get chat messages
        const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chatId);
            
        if (messagesError) throw messagesError;
        
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
            
        if (deleteStoreError) throw deleteStoreError;
        
        // Now delete the chat and its messages (messages will cascade delete)
        const { error: deleteError } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId)
            .eq('user_id', user.id);
            
        if (deleteError) throw deleteError;
        
        return true;
    } catch (error) {
        console.error('Error deleting chat:', error);
        return false;
    }
}

// Load chat messages from Supabase
export async function loadChatMessages(chatId) {
    try {
        const user = await ensureAuthenticated();
        
        // First verify the chat belongs to the user
        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .select('user_id')
            .eq('id', chatId)
            .single();
            
        if (chatError) throw chatError;
        
        if (chatData.user_id !== user.id) {
            throw new Error('Unauthorized access to chat');
        }
        
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        // Transform to match the expected format
        return data.map(msg => ({
            role: msg.role,
            content: msg.content,
            isHtml: msg.is_html,
            imageUrl: msg.image_url
        })) || [];
    } catch (error) {
        console.error('Error loading chat messages:', error);
        return [];
    }
}

// Save chat messages to Supabase
export async function saveChatMessages(chatId, messages) {
    try {
        const user = await ensureAuthenticated();
        
        // First verify the chat belongs to the user
        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .select('user_id')
            .eq('id', chatId)
            .single();
            
        if (chatError) throw chatError;
        
        if (chatData.user_id !== user.id) {
            throw new Error('Unauthorized access to chat');
        }
        
        // Delete existing messages
        const { error: deleteError } = await supabase
            .from('chat_messages')
            .delete()
            .eq('chat_id', chatId);
            
        if (deleteError) throw deleteError;
        
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
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error saving chat messages:', error);
        return false;
    }
}

// Load parts list from Supabase
export async function loadPartsList() {
    try {
        const user = await ensureAuthenticated();
        
        const { data, error } = await supabase
            .from('parts_list')
            .select('*')
            .eq('user_id', user.id);
            
        if (error) throw error;
        
        // Transform to match the expected format
        return data.map(part => ({
            id: part.id,
            name: part.part_name,
            description: part.description,
            quantity: part.quantity,
            price: part.price,
            link: part.link
        })) || [];
    } catch (error) {
        console.error('Error loading parts list:', error);
        return [];
    }
}

// Save parts list to Supabase
export async function savePartsList(partsList) {
    try {
        const user = await ensureAuthenticated();
        
        // Delete existing parts
        const { error: deleteError } = await supabase
            .from('parts_list')
            .delete()
            .eq('user_id', user.id);
            
        if (deleteError) throw deleteError;
        
        if (!partsList || partsList.length === 0) {
            return true;
        }
        
        // Insert new parts
        const partsWithUserId = partsList.map(part => ({
            id: part.id,
            user_id: user.id,
            part_name: part.name,
            description: part.description,
            quantity: part.quantity,
            price: part.price,
            link: part.link,
            created_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
            .from('parts_list')
            .insert(partsWithUserId);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error saving parts list:', error);
        return false;
    }
}

// Load deleted chats from Supabase
export async function loadDeletedChats(limit) {
    try {
        const user = await ensureAuthenticated();
        
        const { data, error } = await supabase
            .from('deleted_chats')
            .select('chat_data')
            .eq('user_id', user.id)
            .order('deleted_at', { ascending: false })
            .limit(limit || 10);
            
        if (error) throw error;
        
        return data.map(item => item.chat_data) || [];
    } catch (error) {
        console.error('Error loading deleted chats:', error);
        return [];
    }
}

// Restore a deleted chat
export async function restoreDeletedChat(chatId) {
    try {
        const user = await ensureAuthenticated();
        
        // Get the deleted chat data
        const { data, error } = await supabase
            .from('deleted_chats')
            .select('chat_data')
            .eq('id', chatId)
            .eq('user_id', user.id)
            .single();
            
        if (error) throw error;
        
        const chatData = data.chat_data;
        const messages = chatData.messages || [];
        
        // Restore the chat
        await saveChat(chatData);
        
        // Restore the messages
        await saveChatMessages(chatId, messages);
        
        // Delete from deleted_chats
        const { error: deleteError } = await supabase
            .from('deleted_chats')
            .delete()
            .eq('id', chatId)
            .eq('user_id', user.id);
            
        if (deleteError) throw deleteError;
        
        return true;
    } catch (error) {
        console.error('Error restoring deleted chat:', error);
        return false;
    }
}
