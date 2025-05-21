// Constants and State Management
const STORAGE_KEYS = {
    API_KEY: 'hvac_ai_api_key',
    PARTS_LIST: 'hvac_parts_list',
    SYSTEM_PROMPT: 'hvac_system_prompt',
    CHATS: 'hvac_chats',
    ACTIVE_CHAT_ID: 'hvac_active_chat_id',
    THEME: 'hvac_theme',
    DELETED_CHATS: 'hvac_deleted_chats',
    DELETED_CHATS_MAX: 'hvac_deleted_chats_max'
};

const DEFAULT_SYSTEM_PROMPT = "You are an HVAC Repair and Maintenance Assistant Chatbot. You are very helpful. You ONLY want to talk about HVAC stuff. You are chatting with an HVAC technician who already knows about HVAC, so you should provide advice meant for experts. Make all answers very long and detailed, taking all factors into account. Ask follow-up questions. If images are provided, look at the specific model numbers, manufacturers, and more to determine differences between brands and such. Specifically call out differences and model numbers of brands, specifications, and such from images and text.";

const DEFAULT_DELETED_CHATS_MAX = 5;

const state = {
    apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
    currentMode: 'chat',
    currentImage: null,
    partsList: JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTS_LIST) || '[]'),
    systemPrompt: localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPT,
    chatImageFile: null,
    chats: JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]'),
    activeChatId: localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID) || null,
    theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'default',
    deletedChats: JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_CHATS) || '[]'),
    deletedChatsMax: parseInt(localStorage.getItem(STORAGE_KEYS.DELETED_CHATS_MAX)) || DEFAULT_DELETED_CHATS_MAX
};

// DOM Elements
let elements = {};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    elements = {
        apiKey: document.getElementById('apiKey'),
        apiStatus: document.getElementById('apiStatus'),
        saveApiKey: document.getElementById('saveApiKey'),
        chatMode: document.getElementById('chatMode'),
        identifyMode: document.getElementById('identifyMode'),
        chatSection: document.getElementById('chatSection'),
        identifySection: document.getElementById('identifySection'),
        imageUpload: document.getElementById('imageUpload'),
        captureBtn: document.getElementById('captureBtn'),
        uploadBtn: document.getElementById('uploadBtn'),
        imagePreview: document.getElementById('imagePreview'),
        analysisResult: document.getElementById('analysisResult'),
        partDetails: document.getElementById('partDetails'),
        confirmationSection: document.querySelector('.confirmation-section'),
        quantitySection: document.querySelector('.quantity-section'),
        quantity: document.getElementById('quantity'),
        addToParts: document.getElementById('addToParts'),
        partsTableBody: document.getElementById('partsTableBody'),
        userInput: document.getElementById('userInput'),
        sendMessage: document.getElementById('sendMessage'),
        chatMessages: document.getElementById('chatMessages'),
        confirmYes: document.getElementById('confirmYes'),
        confirmNo: document.getElementById('confirmNo'),
        systemPrompt: document.getElementById('systemPrompt'),
        savePrompt: document.getElementById('savePrompt'),
        resetPrompt: document.getElementById('resetPrompt'),
        chatImageUpload: document.getElementById('chatImageUpload'),
        chatTabs: document.getElementById('chatTabs'),
        newChatBtn: document.getElementById('newChatBtn'),
        exportJobHistory: document.getElementById('exportJobHistory'),
        exportServiceTitan: document.getElementById('exportServiceTitan'),
        exportHousecallPro: document.getElementById('exportHousecallPro'),
        // Settings modal elements
        settingsBtn: document.getElementById('settingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeSettings: document.getElementById('closeSettings'),
        // Theme buttons
        themeButtons: document.querySelectorAll('.theme-btn'),
        // Restore and storage management
        restoreChat: document.getElementById('restoreChat'),
        deletedChatsMax: document.getElementById('deletedChatsMax'),
        clearStorage: document.getElementById('clearStorage'),
        clearApiKey: document.getElementById('clearApiKey'),
        storageInfo: document.getElementById('storageInfo')
    };

    // Initialize event listeners
    if (elements.apiKey) {
        elements.apiKey.value = state.apiKey;
        if (state.apiKey) {
            elements.apiStatus.textContent = '✓ API Key Saved';
            elements.apiStatus.className = '';
        }
    }

    // Event Listeners
    elements.saveApiKey.addEventListener('click', handleSaveApiKey);
    elements.chatMode.addEventListener('click', () => switchMode('chat'));
    elements.identifyMode.addEventListener('click', () => switchMode('identify'));
    elements.imageUpload.addEventListener('change', handleImageUpload);
    elements.captureBtn.addEventListener('click', () => elements.imageUpload.click());
    elements.uploadBtn.addEventListener('click', () => elements.imageUpload.click());
    elements.confirmYes.addEventListener('click', handleConfirmYes);
    elements.confirmNo.addEventListener('click', handleConfirmNo);
    elements.addToParts.addEventListener('click', handleAddToParts);
    elements.sendMessage.addEventListener('click', handleSendMessage);
    elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    elements.savePrompt.addEventListener('click', handleSaveSystemPrompt);
    elements.resetPrompt.addEventListener('click', handleResetSystemPrompt);
    elements.chatImageUpload.addEventListener('change', handleChatImageUpload);
    elements.newChatBtn.addEventListener('click', createNewChat);
    
    // Settings modal event listeners
    elements.settingsBtn.addEventListener('click', openSettingsModal);
    elements.closeSettings.addEventListener('click', closeSettingsModal);
    
    // Theme buttons event listeners
    elements.themeButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTheme(btn.dataset.theme));
    });
    
    // Restore and storage management event listeners
    elements.restoreChat.addEventListener('click', restoreDeletedChat);
    elements.deletedChatsMax.addEventListener('change', () => updateDeletedChatsMax(elements.deletedChatsMax.value));
    elements.clearStorage.addEventListener('click', () => {
        const includeApiKey = elements.clearApiKey.checked;
        if (confirm(`Are you sure you want to clear all chat data${includeApiKey ? ' and API key' : ''}? This cannot be undone.`)) {
            clearLocalStorage(includeApiKey);
        }
    });
    
    // Export button event listeners (no functionality yet)
    elements.exportJobHistory.addEventListener('click', () => console.log('Export Job History clicked'));
    elements.exportServiceTitan.addEventListener('click', () => console.log('Export to Service Titan clicked'));
    elements.exportHousecallPro.addEventListener('click', () => console.log('Export to Housecall Pro clicked'));

        // Initialize parts table
    if (elements.partsTableBody) {
        updatePartsTable();
    }
    
    // Initialize system prompt
    if (elements.systemPrompt) {
        elements.systemPrompt.value = state.systemPrompt;
    }
    
    // Initialize chat tabs
    initializeChats();
    
    // Apply saved theme
    applyTheme(state.theme);
    
    // Initialize storage info and restore button
    elements.deletedChatsMax.value = state.deletedChatsMax;
    updateStorageInfo();
    updateRestoreButton();
});


// API Key Management
function handleSaveApiKey() {
    const apiKey = elements.apiKey.value.trim();
    if (apiKey) {
        state.apiKey = apiKey;
        localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
        elements.apiStatus.textContent = '✓ API Key Saved';
        elements.apiStatus.className = '';
    } else {
        elements.apiStatus.textContent = '✗ Invalid API Key';
        elements.apiStatus.className = 'error';
    }
}

// Mode Switching
function switchMode(mode) {
    state.currentMode = mode;
    elements.chatMode.classList.toggle('active', mode === 'chat');
    elements.identifyMode.classList.toggle('active', mode === 'identify');
    elements.chatSection.classList.toggle('hidden', mode !== 'chat');
    elements.identifySection.classList.toggle('hidden', mode !== 'identify');
}

// Image Handling
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        state.currentImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            analyzeImage(file);
        };
        reader.readAsDataURL(file);
    }
}

// Image Analysis
async function analyzeImage(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Identify this HVAC part. Provide the following information: 1) Part name 2) Description 3) Estimated price range 4) Common applications 5) Any relevant part numbers or specifications"
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: await fileToBase64(file)
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 2000
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }

        const analysis = data.choices[0].message.content;
        elements.partDetails.innerHTML = marked.parse(analysis);
        elements.analysisResult.classList.remove('hidden');
        elements.confirmationSection.classList.remove('hidden');
        
    } catch (error) {
        elements.partDetails.innerHTML = `<div class="error">Error analyzing image: ${error.message}</div>`;
        elements.analysisResult.classList.remove('hidden');
    }
}

// Parts Management
function handleConfirmYes() {
    elements.quantitySection.classList.remove('hidden');
}

function handleConfirmNo() {
    elements.analysisResult.classList.add('hidden');
    elements.imagePreview.innerHTML = '';
    elements.imageUpload.value = '';
    state.currentImage = null;
}

function handleAddToParts() {
    const quantity = parseInt(elements.quantity.value) || 1;
    const partDetails = elements.partDetails.textContent;
    
    // Parse the analysis text to extract information
    const lines = partDetails.split('\n');
    const part = {
        name: lines[0]?.replace('1) Part name:', '').trim() || 'Unknown Part',
        description: lines[1]?.replace('2) Description:', '').trim() || 'No description available',
        quantity: quantity,
        price: lines[2]?.replace('3) Estimated price range:', '').trim() || 'Price not available',
        link: '', // This would need to be populated from a parts database in a real application
        id: Date.now().toString()
    };
    
    state.partsList.push(part);
    localStorage.setItem(STORAGE_KEYS.PARTS_LIST, JSON.stringify(state.partsList));
    updatePartsTable();
    
    // Reset the form
    elements.analysisResult.classList.add('hidden');
    elements.imagePreview.innerHTML = '';
    elements.imageUpload.value = '';
    elements.quantity.value = '1';
    state.currentImage = null;
}

function updatePartsTable() {
    if (!elements.partsTableBody) return; // Don't update if element doesn't exist yet
    
    elements.partsTableBody.innerHTML = state.partsList.map(part => `
        <tr>
            <td>${escapeHtml(part.name)}</td>
            <td>${escapeHtml(part.description)}</td>
            <td>${part.quantity}</td>
            <td>${escapeHtml(part.price)}</td>
            <td>${part.link ? `<a href="${escapeHtml(part.link)}" target="_blank">View Part</a>` : 'N/A'}</td>
            <td>
                <button class="delete-btn" onclick="deletePart('${part.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Make deletePart function global for onclick handlers
window.deletePart = function(id) {
    state.partsList = state.partsList.filter(part => part.id !== id);
    localStorage.setItem(STORAGE_KEYS.PARTS_LIST, JSON.stringify(state.partsList));
    updatePartsTable();
};

// System Prompt Management
function handleSaveSystemPrompt() {
    const promptText = elements.systemPrompt.value.trim();
    if (promptText) {
        state.systemPrompt = promptText;
        localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, promptText);
        // Show feedback
        const originalBg = elements.savePrompt.style.backgroundColor;
        elements.savePrompt.style.backgroundColor = 'var(--success-color)';
        setTimeout(() => {
            elements.savePrompt.style.backgroundColor = originalBg;
        }, 1000);
    }
}

function handleResetSystemPrompt() {
    state.systemPrompt = DEFAULT_SYSTEM_PROMPT;
    elements.systemPrompt.value = DEFAULT_SYSTEM_PROMPT;
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, DEFAULT_SYSTEM_PROMPT);
    // Show feedback
    const originalBg = elements.resetPrompt.style.backgroundColor;
    elements.resetPrompt.style.backgroundColor = 'var(--success-color)';
    setTimeout(() => {
        elements.resetPrompt.style.backgroundColor = originalBg;
    }, 1000);
}

// Chat Image Upload
function handleChatImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        state.chatImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            // Create image preview
            const imagePreview = document.createElement('div');
            imagePreview.classList.add('chat-image-preview-container');
            imagePreview.innerHTML = `
                <img src="${e.target.result}" alt="Chat image" class="chat-image-preview">
                <button class="remove-image-btn">×</button>
            `;
            
            // Add to user input area
            const inputArea = elements.userInput.parentElement;
            // Check if there's already an image preview
            const existingPreview = inputArea.querySelector('.chat-image-preview-container');
            if (existingPreview) {
                existingPreview.remove();
            }
            inputArea.insertBefore(imagePreview, elements.userInput);
            
            // Add remove button functionality
            const removeBtn = imagePreview.querySelector('.remove-image-btn');
            removeBtn.addEventListener('click', () => {
                imagePreview.remove();
                state.chatImageFile = null;
                elements.chatImageUpload.value = '';
            });
        };
        reader.readAsDataURL(file);
    }
}

// Chat Tabs Functionality
function initializeChats() {
    // Create a new chat if none exist
    if (state.chats.length === 0) {
        createNewChat();
    } else {
        // Load existing chats
        updateChatTabs();
        
        // Load active chat or set to first chat
        if (!state.activeChatId || !state.chats.some(chat => chat.id === state.activeChatId)) {
            state.activeChatId = state.chats[0].id;
            localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, state.activeChatId);
        }
        
        loadChatMessages(state.activeChatId);
    }
}

function createNewChat() {
    // Create a new chat object
    const newChat = {
        id: Date.now().toString(),
        title: '...',
        createdAt: new Date().toISOString(),
        messages: []
    };
    
    // Add to state
    state.chats.push(newChat);
    state.activeChatId = newChat.id;
    
    // Save to local storage
    saveChatsToLocalStorage();
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, state.activeChatId);
    
    // Update UI
    updateChatTabs();
    clearChatMessages();
}

function updateChatTabs() {
    // Clear existing tabs
    elements.chatTabs.innerHTML = '';
    
    // Add tab for each chat
    state.chats.forEach(chat => {
        const tab = document.createElement('div');
        tab.classList.add('chat-tab');
        if (chat.id === state.activeChatId) {
            tab.classList.add('active');
        }
        
        tab.innerHTML = `
            <span class="chat-tab-title">${escapeHtml(chat.title)}</span>
            <span class="chat-tab-close">×</span>
        `;
        
        // Add click event to switch to this chat
        tab.addEventListener('click', (e) => {
            // Don't switch if clicking the close button
            if (e.target.classList.contains('chat-tab-close')) return;
            
            switchToChat(chat.id);
        });
        
        // Add close button functionality
        const closeBtn = tab.querySelector('.chat-tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        });
        
        elements.chatTabs.appendChild(tab);
    });
}

function switchToChat(chatId) {
    // Don't do anything if already on this chat
    if (state.activeChatId === chatId) return;
    
    // Update state
    state.activeChatId = chatId;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, chatId);
    
    // Update UI
    updateChatTabs();
    loadChatMessages(chatId);
}

function loadChatMessages(chatId) {
    // Clear current messages
    clearChatMessages();
    
    // Find the chat
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;
    
    // Add each message to the UI
    chat.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(`${msg.role}-message`);
        
        if (msg.isHtml) {
            messageDiv.innerHTML = msg.content;
        } else {
            messageDiv.innerHTML = msg.content;
        }
        
        elements.chatMessages.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function clearChatMessages() {
    elements.chatMessages.innerHTML = '';
}

function deleteChat(chatId) {
    // Find index of chat to delete
    const chatIndex = state.chats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;
    
    // Get the chat to delete
    const chatToDelete = state.chats[chatIndex];
    
    // Add to deleted chats
    state.deletedChats.push({
        ...chatToDelete,
        deletedAt: new Date().toISOString()
    });
    
    // Maintain max deleted chats
    if (state.deletedChats.length > state.deletedChatsMax) {
        state.deletedChats.shift(); // Remove oldest deleted chat
    }
    
    // Save deleted chats to local storage
    localStorage.setItem(STORAGE_KEYS.DELETED_CHATS, JSON.stringify(state.deletedChats));
    
    // Remove the chat from active chats
    state.chats.splice(chatIndex, 1);
    
    // If we deleted the active chat, switch to another one
    if (state.activeChatId === chatId) {
        if (state.chats.length > 0) {
            // Switch to the next chat or the previous one if we deleted the last chat
            const newIndex = Math.min(chatIndex, state.chats.length - 1);
            state.activeChatId = state.chats[newIndex].id;
        } else {
            // No chats left, create a new one
            createNewChat();
            return; // createNewChat will handle the UI updates
        }
    }
    
    // Save to local storage
    saveChatsToLocalStorage();
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, state.activeChatId);
    
    // Update UI
    updateChatTabs();
    loadChatMessages(state.activeChatId);
    updateRestoreButton();
}

function restoreDeletedChat() {
    if (state.deletedChats.length === 0) return;
    
    // Get the most recently deleted chat
    const chatToRestore = state.deletedChats.pop();
    
    // Remove the deletedAt property
    delete chatToRestore.deletedAt;
    
    // Add it back to active chats
    state.chats.push(chatToRestore);
    
    // Switch to the restored chat
    state.activeChatId = chatToRestore.id;
    
    // Save to local storage
    saveChatsToLocalStorage();
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, state.activeChatId);
    localStorage.setItem(STORAGE_KEYS.DELETED_CHATS, JSON.stringify(state.deletedChats));
    
    // Update UI
    updateChatTabs();
    loadChatMessages(state.activeChatId);
    updateRestoreButton();
}

function updateRestoreButton() {
    const restoreBtn = document.getElementById('restoreChat');
    if (restoreBtn) {
        restoreBtn.disabled = state.deletedChats.length === 0;
        restoreBtn.textContent = `Restore Deleted Chat (${state.deletedChats.length})`;
    }
}

function updateDeletedChatsMax(value) {
    const maxValue = parseInt(value);
    if (isNaN(maxValue) || maxValue < 0) return;
    
    state.deletedChatsMax = maxValue;
    localStorage.setItem(STORAGE_KEYS.DELETED_CHATS_MAX, maxValue);
    
    // Trim deleted chats if needed
    if (state.deletedChats.length > maxValue) {
        state.deletedChats = state.deletedChats.slice(-maxValue);
        localStorage.setItem(STORAGE_KEYS.DELETED_CHATS, JSON.stringify(state.deletedChats));
    }
    
    updateStorageInfo();
}

function clearLocalStorage(includeApiKey) {
    // Clear chats
    state.chats = [];
    state.deletedChats = [];
    state.activeChatId = null;
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_CHATS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
    
    // Clear API key if requested
    if (includeApiKey) {
        state.apiKey = '';
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
        elements.apiKey.value = '';
        elements.apiStatus.textContent = '';
    }
    
    // Create a new chat
    createNewChat();
    
    // Update UI
    updateStorageInfo();
    closeSettingsModal();
}

function updateStorageInfo() {
    const storageInfoElement = document.getElementById('storageInfo');
    if (!storageInfoElement) return;
    
    // Calculate storage usage
    const chatsSize = new Blob([JSON.stringify(state.chats)]).size;
    const deletedChatsSize = new Blob([JSON.stringify(state.deletedChats)]).size;
    const totalSize = chatsSize + deletedChatsSize;
    
    // Format sizes
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    
    // Update info text
    storageInfoElement.innerHTML = `
        <div>Active Chats: ${state.chats.length} (${formatSize(chatsSize)})</div>
        <div>Deleted Chats: ${state.deletedChats.length}/${state.deletedChatsMax} (${formatSize(deletedChatsSize)})</div>
        <div>Total Storage: ${formatSize(totalSize)}</div>
    `;
}

function saveChatsToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(state.chats));
    } catch (error) {
        if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            // Show storage quota exceeded popup
            showStorageQuotaExceededPopup();
            console.error('Local storage quota exceeded:', error);
        } else {
            // For other errors, just log them
            console.error('Error saving chats to local storage:', error);
        }
    }
}

function showStorageQuotaExceededPopup() {
    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'storage-quota-popup';
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'storage-quota-popup-content';
    
    // Add header
    const header = document.createElement('h3');
    header.textContent = 'Storage Limit Reached';
    
    // Add message
    const message = document.createElement('p');
    message.textContent = 'Your chat history has reached the browser storage limit. Please go to Settings and clear some storage to continue saving new messages.';
    
    // Add buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'storage-quota-popup-buttons';
    
    // Add settings button
    const settingsButton = document.createElement('button');
    settingsButton.textContent = 'Open Settings';
    settingsButton.className = 'primary-button';
    settingsButton.onclick = () => {
        popupContainer.remove();
        openSettingsModal();
    };
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Continue Without Saving';
    closeButton.onclick = () => {
        popupContainer.remove();
    };
    
    // Assemble the popup
    buttonsContainer.appendChild(settingsButton);
    buttonsContainer.appendChild(closeButton);
    
    popupContent.appendChild(header);
    popupContent.appendChild(message);
    popupContent.appendChild(buttonsContainer);
    
    popupContainer.appendChild(popupContent);
    
    // Add to the document
    document.body.appendChild(popupContainer);
}

// Chat Functionality
async function handleSendMessage() {
    // Make sure we have an active chat
    if (!state.activeChatId) {
        createNewChat();
    }
    
    const message = elements.userInput.value.trim();
    const hasImage = state.chatImageFile !== null;
    
    if (!message && !hasImage) return;

    // Add user message to chat
    if (hasImage) {
        // Create a message with both text and image
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageDataUrl = e.target.result;
            const messageContent = `
                <div>${escapeHtml(message)}</div>
                <img src="${imageDataUrl}" alt="User uploaded image" class="chat-image-preview">
            `;
            addMessageToChat('user', messageContent, true);
            
            // Clear input and image
            elements.userInput.value = '';
            const imagePreview = document.querySelector('.chat-image-preview-container');
            if (imagePreview) imagePreview.remove();
            
            // Send to API
            await sendChatRequest(message, imageDataUrl);
        };
        reader.readAsDataURL(state.chatImageFile);
        state.chatImageFile = null;
        elements.chatImageUpload.value = '';
    } else {
        // Text-only message
        addMessageToChat('user', message);
        elements.userInput.value = '';
        await sendChatRequest(message);
    }
}

async function sendChatRequest(message, imageDataUrl = null) {
    try {
        // Start with system prompt
        let messages = [
            {
                role: "system",
                content: state.systemPrompt
            }
        ];
        
        // Add conversation history if we have an active chat
        if (state.activeChatId) {
            const chatIndex = state.chats.findIndex(chat => chat.id === state.activeChatId);
            if (chatIndex !== -1) {
                // Get previous messages from this chat
                const previousMessages = state.chats[chatIndex].messages;
                
                // Add previous messages to the context (up to a reasonable limit)
                const maxPreviousMessages = 10; // Adjust as needed
                const startIndex = Math.max(0, previousMessages.length - maxPreviousMessages);
                
                for (let i = startIndex; i < previousMessages.length; i++) {
                    const prevMsg = previousMessages[i];
                    
                    // Skip adding the current message
                    if (i === previousMessages.length - 1 && prevMsg.role === 'user') {
                        continue;
                    }
                    
                    // Convert HTML content to plain text or structured content
                    if (prevMsg.isHtml) {
                        // Check if it contains an image
                        const imgMatch = prevMsg.content.match(/<img src="(data:image\/[^;]+;base64,[^"]+)"/);
                        
                        if (imgMatch && imgMatch[1]) {
                            // This was a message with an image
                            const imgDataUrl = imgMatch[1];
                            const textContent = prevMsg.content.replace(/<[^>]*>/g, '').trim();
                            
                            messages.push({
                                role: prevMsg.role,
                                content: [
                                    { type: "text", text: textContent || "What can you tell me about this HVAC component?" },
                                    { type: "image_url", image_url: { url: imgDataUrl } }
                                ]
                            });
                        } else {
                            // HTML without image, convert to plain text
                            const textContent = prevMsg.content.replace(/<[^>]*>/g, '').trim();
                            messages.push({
                                role: prevMsg.role,
                                content: textContent
                            });
                        }
                    } else {
                        // Regular text message
                        messages.push({
                            role: prevMsg.role,
                            content: prevMsg.content
                        });
                    }
                }
            }
        }
        
        // Add the current message
        if (imageDataUrl) {
            // Format message with image for GPT-4o
            // Ensure the image data URL is properly formatted
            const formattedImageUrl = imageDataUrl.startsWith('data:image/') 
                ? imageDataUrl 
                : `data:image/jpeg;base64,${imageDataUrl.replace(/^data:.*?;base64,/, '')}`;
                
            console.log('Sending message with image:', {
                messageText: message,
                hasImageData: !!formattedImageUrl,
                imageUrlLength: formattedImageUrl.length
            });
            
            messages.push({
                role: "user",
                content: [
                    {
                        type: "text",
                        text: message || "What can you tell me about this HVAC component?"
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: formattedImageUrl
                        }
                    }
                ]
            });
        } else {
            // Text-only message
            messages.push({
                role: "user",
                content: message
            });
        }
        
        // Use Cloudflare Worker as a proxy to handle CORS issues
        // The worker handles the OpenAI API request and adds proper CORS headers
        
        // Replace this URL with your deployed Cloudflare Worker URL
        const cloudflareWorkerUrl = 'https://hvachat.matthewwarrenjackson.workers.dev';
        
        console.log('Sending request to Cloudflare Worker proxy');
        
        const response = await fetch(cloudflareWorkerUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: messages,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            let errorMessage = 'Unknown error occurred';
            try {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                
                // Handle OpenAI-specific error format
                if (errorData.error && errorData.error.message) {
                    errorMessage = errorData.error.message;
                } else {
                    errorMessage = JSON.stringify(errorData);
                }
            } catch (e) {
                // If response is not JSON, get it as text
                const errorText = await response.text();
                console.error('Non-JSON Error Response:', errorText);
                errorMessage = errorText || `Request failed with status ${response.status}`;
            }
            
            throw new Error(errorMessage);
        }

        // Log the response status for debugging
        console.log('API Response Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API Response Data:', data);
        
        if (data.error) {
            console.error('OpenAI API Error:', data.error);
            throw new Error(data.error.message || 'Unknown API error');
        }

        const aiResponse = data.choices[0].message.content;
        addMessageToChat('assistant', aiResponse);
        
    } catch (error) {
        console.error('Error in sendChatRequest:', error);
        addMessageToChat('assistant', `Error: ${error.message}. Please check the console for more details.`);
    }
}

function addMessageToChat(role, content, isHtml = false) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(`${role}-message`);
    
    if (isHtml) {
        messageDiv.innerHTML = content;
    } else {
        messageDiv.innerHTML = role === 'user' ? escapeHtml(content) : marked.parse(content);
    }
    
    // Add to DOM
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    // Save to current chat in state
    if (state.activeChatId) {
        const chatIndex = state.chats.findIndex(chat => chat.id === state.activeChatId);
        if (chatIndex !== -1) {
            // Add message to chat history
            state.chats[chatIndex].messages.push({
                role,
                content: isHtml ? content : (role === 'user' ? content : marked.parse(content)),
                timestamp: new Date().toISOString(),
                isHtml
            });
            
            // Update chat title if it's the first user message
            if (role === 'user' && state.chats[chatIndex].messages.filter(m => m.role === 'user').length === 1) {
                // Use first few words of first message as title
                const plainTextContent = isHtml ? 
                    content.replace(/<[^>]*>/g, '') : content;
                const words = plainTextContent.split(' ');
                const title = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
                state.chats[chatIndex].title = title;
                updateChatTabs();
            }
            
            // Save to local storage
            saveChatsToLocalStorage();
        }
    }
}

// Utility Functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Settings Modal Functions
function openSettingsModal() {
    elements.settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
    elements.settingsModal.classList.add('hidden');
}

// Theme Management
function switchTheme(theme) {
    // Update active button
    elements.themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    // Apply theme
    applyTheme(theme);
    
    // Save to state and localStorage
    state.theme = theme;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    
    // Add the selected theme class (if not default)
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
}

// Initialize
updatePartsTable();
