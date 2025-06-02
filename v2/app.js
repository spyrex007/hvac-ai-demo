// Constants and State Management
const STORAGE_KEYS = {
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
    SELECTED_PRESET: 'hvac_selected_preset',
    WEB_SEARCH_ENABLED: 'hvac_web_search_enabled'
};

const DEFAULT_SYSTEM_PROMPT = "You are an HVAC Repair and Maintenance Assistant Chatbot. You are very helpful. You ONLY want to talk about HVAC stuff. You are chatting with an HVAC technician who already knows about HVAC, so you should provide advice meant for experts. Make all answers very long and detailed, taking all factors into account. Ask follow-up questions. If images are provided, look at the specific model numbers, manufacturers, and more to determine differences between brands and such. Specifically call out differences and model numbers of brands, specifications, and such from images and text.";

const DEFAULT_DELETED_CHATS_MAX = 2;

const state = {
    currentMode: 'chat',
    currentImage: null,
    partsList: JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTS_LIST) || '[]'),
    systemPrompt: localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPT,
    customSystemPrompt: localStorage.getItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT) || '',
    chatImageFiles: [], // Changed from single chatImageFile to array of files
    chats: JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]'),
    activeChatId: localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID) || null,
    theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'default',
    deletedChats: JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_CHATS) || '[]'),
    deletedChatsMax: parseInt(localStorage.getItem(STORAGE_KEYS.DELETED_CHATS_MAX)) || DEFAULT_DELETED_CHATS_MAX,
    // Custom chat settings
    chatMode: localStorage.getItem(STORAGE_KEYS.CHAT_MODE) || 'easy', // 'easy', 'preset', or 'custom'
    customChatSettings: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_CHAT_SETTINGS) || '{"maxTokens": 2000, "temperature": 0.7, "model": "gpt-4.1"}'),
    selectedPreset: localStorage.getItem(STORAGE_KEYS.SELECTED_PRESET) || '',
    presets: [],
    // Web search functionality
    webSearchEnabled: localStorage.getItem(STORAGE_KEYS.WEB_SEARCH_ENABLED) === 'true'
};

// DOM Elements
let elements = {};

// Global event handler for chat tab close buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('chat-tab-close')) {
        e.stopPropagation();
        e.preventDefault();
        const chatId = e.target.getAttribute('data-chat-id');
        console.log('Global handler: Delete button clicked for chat:', chatId);
        
        if (chatId) {
            // Use our local deleteChat function if window.deleteChat is not available
            if (typeof window.deleteChat === 'function') {
                try {
                    window.deleteChat(chatId);
                } catch (error) {
                    console.error('Error deleting chat:', error);
                    // Fallback to local implementation
                    localDeleteChat(chatId);
                }
            } else {
                // Use local implementation as fallback
                localDeleteChat(chatId);
            }
        }
    }
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    elements = {
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
        // New chat mode elements
        easyChatMode: document.getElementById('easyChatMode'),
        presetChatMode: document.getElementById('presetChatMode'),
        customChatMode: document.getElementById('customChatMode'),
        customChatSettings: document.getElementById('customChatSettings'),
        // Custom chat settings elements
        customSystemPrompt: document.getElementById('customSystemPrompt'),
        addToSystemPrompt: document.getElementById('addToSystemPrompt'),
        replaceSystemPrompt: document.getElementById('replaceSystemPrompt'),
        displaySystemPrompt: document.getElementById('displaySystemPrompt'),
        systemPromptPreview: document.getElementById('systemPromptPreview'),
        systemPromptContent: document.getElementById('systemPromptContent'),
        resetSystemPromptCustom: document.getElementById('resetSystemPromptCustom'),
        resetCustomSettings: document.getElementById('resetCustomSettings'),
        maxTokens: document.getElementById('maxTokens'),
        temperature: document.getElementById('temperature'),
        presetDescription: document.getElementById('presetDescription'),
        temperatureValue: document.getElementById('temperatureValue'),
        modelSelection: document.getElementById('modelSelection'),
        presetPrompt: document.getElementById('presetPrompt'),
        customPresetPrompt: document.getElementById('customPresetPrompt'),
        // Web search toggle
        webSearchToggle: document.getElementById('webSearchToggle'),
        webSearchStatus: document.getElementById('webSearchStatus'),

        newChatBtn: document.getElementById('newChatBtn'),

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

    // Event Listeners - add null checks for all elements
    if (elements.chatMode) {
        elements.chatMode.addEventListener('click', () => switchMode('chat'));
    }
    if (elements.identifyMode) {
        elements.identifyMode.addEventListener('click', () => switchMode('identify'));
    }
    if (elements.webSearchToggle) {
        elements.webSearchToggle.addEventListener('click', toggleWebSearch);
    }
    if (elements.imageUpload) {
        elements.imageUpload.addEventListener('change', handleImageUpload);
    }
    if (elements.captureBtn) {
        elements.captureBtn.addEventListener('click', () => elements.imageUpload && elements.imageUpload.click());
    }
    if (elements.uploadBtn) {
        elements.uploadBtn.addEventListener('click', () => elements.imageUpload && elements.imageUpload.click());
    }
    if (elements.confirmYes) {
        elements.confirmYes.addEventListener('click', handleConfirmYes);
    }
    if (elements.confirmNo) {
        elements.confirmNo.addEventListener('click', handleConfirmNo);
    }
    if (elements.addToParts) {
        elements.addToParts.addEventListener('click', handleAddToParts);
    }
    if (elements.sendMessage) {
        elements.sendMessage.addEventListener('click', handleSendMessage);
    }
    if (elements.userInput) {
        elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
        
        // Add paste event listener for clipboard images
        elements.userInput.addEventListener('paste', handlePaste);
        
        // Add drag and drop event listeners
        elements.userInput.addEventListener('dragover', handleDragOver);
        elements.userInput.addEventListener('dragleave', handleDragLeave);
        elements.userInput.addEventListener('drop', handleDrop);
    }
    
    // Add global drag and drop event listeners to the chat container
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.addEventListener('dragover', handleDragOver);
        chatContainer.addEventListener('dragleave', handleDragLeave);
        chatContainer.addEventListener('drop', handleDrop);
    }
    if (elements.savePrompt) {
        elements.savePrompt.addEventListener('click', handleSaveSystemPrompt);
    }
    if (elements.resetPrompt) {
        elements.resetPrompt.addEventListener('click', handleResetSystemPrompt);
    }
    if (elements.chatImageUpload) {
        elements.chatImageUpload.addEventListener('change', handleChatImageUpload);
    }
    if (elements.newChatBtn) {
        elements.newChatBtn.addEventListener('click', createNewChat);
    }
    
    // Chat Mode Selector Event Listeners
    if (elements.easyChatMode) {
        elements.easyChatMode.addEventListener('click', () => switchChatMode('easy'));
    }
    if (elements.presetChatMode) {
        elements.presetChatMode.addEventListener('click', () => switchChatMode('preset'));
    }
    if (elements.customChatMode) {
        elements.customChatMode.addEventListener('click', () => switchChatMode('custom'));
    }
    
    // Custom Chat Settings Event Listeners
    if (elements.addToSystemPrompt) {
        elements.addToSystemPrompt.addEventListener('click', addToSystemPrompt);
    }
    if (elements.replaceSystemPrompt) {
        elements.replaceSystemPrompt.addEventListener('click', replaceSystemPrompt);
    }
    if (elements.displaySystemPrompt) {
        elements.displaySystemPrompt.addEventListener('click', toggleSystemPromptDisplay);
    }
    if (elements.presetPrompt) {
        elements.presetPrompt.addEventListener('change', handlePresetChange);
    }
    if (elements.resetSystemPromptCustom) {
        elements.resetSystemPromptCustom.addEventListener('click', resetSystemPromptToDefault);
    }
    if (elements.resetCustomSettings) {
        elements.resetCustomSettings.addEventListener('click', resetAllCustomSettings);
    }
    if (elements.temperature) {
        elements.temperature.addEventListener('input', updateTemperatureValue);
    }
    if (elements.maxTokens) {
        elements.maxTokens.addEventListener('change', updateMaxTokens);
    }
    if (elements.modelSelection) {
        elements.modelSelection.addEventListener('change', updateModel);
    }
    
    // Initialize temperature value display
    elements.temperatureValue.textContent = elements.temperature.value;
    
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
    
    // Load presets directly from a hardcoded array to ensure they're available
    state.presets = [
        {
            "id": "troubleshooting",
            "name": "Troubleshooting Guide",
            "category": "Technical",
            "description": "Diagnose HVAC issues with step-by-step guidance",
            "prompt": "You are an HVAC troubleshooting expert. Help diagnose issues step-by-step. Ask for symptoms, error codes, or photos of the equipment. Provide detailed repair procedures with safety precautions."
        },
        {
            "id": "maintenance",
            "name": "Maintenance Checklist",
            "category": "Technical",
            "description": "Create comprehensive maintenance plans for any HVAC system",
            "prompt": "You generate comprehensive maintenance checklists for HVAC systems. For each system type/model, provide: inspection points, cleaning procedures, lubrication requirements, and testing protocols."
        },
        {
            "id": "efficiency",
            "name": "Energy Efficiency Analysis",
            "category": "Consulting",
            "description": "Optimize HVAC systems for maximum energy savings",
            "prompt": "You analyze HVAC systems for energy efficiency improvements. Request system specs/age/usage patterns. Recommend upgrades, settings adjustments, and retrofits with ROI calculations."
        },
        {
            "id": "parts",
            "name": "Parts Identification",
            "category": "Technical",
            "description": "Identify parts and find compatible replacements",
            "prompt": "You help identify HVAC parts from descriptions or images. Provide: part numbers, compatible alternatives, manufacturers, suppliers, and installation instructions when available."
        },
        {
            "id": "installation",
            "name": "Installation Procedures",
            "category": "Technical",
            "description": "Get detailed installation guides for any HVAC equipment",
            "prompt": "You provide step-by-step HVAC installation guides. Include: tools required, safety measures, sizing calculations, ductwork design, electrical requirements, and commissioning tests."
        },
        {
            "id": "refrigerant",
            "name": "Refrigerant Handling",
            "category": "Compliance",
            "description": "Learn proper refrigerant procedures and regulations",
            "prompt": "You advise on refrigerant types, charging procedures, recovery, and EPA compliance. Always emphasize safety protocols and environmental regulations."
        }
    ];
    
    console.log('Presets loaded directly:', state.presets);
    
    // Initialize preset selector if it exists
    if (elements.presetPrompt) {
        console.log('Preset prompt element found, populating selector');
        populatePresetSelector();
    } else {
        console.error('Preset prompt element not found after loading presets');
    }
    
    // Try to load additional presets from the JSON file
    fetch('./presets.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Additional presets loaded successfully:', data);
            // Only update if we got valid data
            if (Array.isArray(data) && data.length > 0) {
                state.presets = data;
                // Re-initialize preset selector
                if (elements.presetPrompt) {
                    populatePresetSelector();
                }
            }
        })
        .catch(error => {
            console.error('Error loading additional presets (using defaults):', error);
        });
});


// API Key Management
function handleSaveApiKey() {
    const apiKey = elements.apiKey.value.trim();
    if (apiKey) {
        state.apiKey = apiKey;
        localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
        elements.apiStatus.textContent = '✓ API Key Saved';
        elements.apiStatus.className = '';
        
        // Close settings modal if it's open
        closeSettingsModal();
        
        // Dispatch event to notify that API key has been updated
        window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
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
    const files = event.target.files;
    if (files && files.length > 0) {
        // Process each file
        for (let i = 0; i < files.length; i++) {
            processImageFile(files[i]);
        }
    }
}

// Process image file (used by upload, paste, and drag-drop)
function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    
    // Generate a unique ID for this image
    const imageId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // Add file to our images array with its ID
    state.chatImageFiles.push({
        id: imageId,
        file: file
    });
    
    const reader = new FileReader();
    reader.onload = (e) => {
        // Create a images container if it doesn't exist
        let imagesContainer = document.querySelector('.chat-images-container');
        if (!imagesContainer) {
            imagesContainer = document.createElement('div');
            imagesContainer.classList.add('chat-images-container');
            // Add to user input area
            const inputArea = elements.userInput.parentElement;
            inputArea.insertBefore(imagesContainer, elements.userInput);
        }
        
        // Create image preview
        const imagePreview = document.createElement('div');
        imagePreview.classList.add('chat-image-preview-container');
        imagePreview.dataset.imageId = imageId;
        imagePreview.innerHTML = `
            <img src="${e.target.result}" alt="Chat image" class="chat-image-preview">
            <button class="remove-image-btn" aria-label="Remove image">×</button>
        `;
        
        // Add to images container
        imagesContainer.appendChild(imagePreview);
        
        // Add remove button functionality
        const removeBtn = imagePreview.querySelector('.remove-image-btn');
        removeBtn.addEventListener('click', () => {
            // Remove from DOM
            imagePreview.remove();
            
            // Remove from state
            state.chatImageFiles = state.chatImageFiles.filter(img => img.id !== imageId);
            
            // If no more images, remove the container
            if (state.chatImageFiles.length === 0) {
                imagesContainer.remove();
                if (elements.chatImageUpload) {
                    elements.chatImageUpload.value = '';
                }
            }
        });
    };
    reader.readAsDataURL(file);
}

// Handle paste event for clipboard images
function handlePaste(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    
    // Check if there are any items in the clipboard
    const items = clipboardData.items;
    if (!items) return;
    
    // Look for an image in the clipboard items
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            // We found an image
            const file = items[i].getAsFile();
            processImageFile(file);
            
            // Prevent the default paste action
            e.preventDefault();
            return;
        }
    }
}

// Handle drag over event
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Add a visual indicator that we're in drag mode
    if (e.currentTarget.classList.contains('input-area') || 
        e.currentTarget.classList.contains('chat-container') ||
        e.currentTarget.id === 'userInput') {
        document.querySelector('.chat-container').classList.add('drag-over');
    }
}

// Handle drag leave event
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove the visual indicator
    document.querySelector('.chat-container').classList.remove('drag-over');
}

// Handle drop event
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove the visual indicator
    document.querySelector('.chat-container').classList.remove('drag-over');
    
    // Check if the dataTransfer object has files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Process all dropped image files
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            const file = e.dataTransfer.files[i];
            if (file.type.startsWith('image/')) {
                processImageFile(file);
            }
        }
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
        
        tab.setAttribute('data-chat-id', chat.id);
        tab.innerHTML = `
            <span class="chat-tab-title">${escapeHtml(chat.title)}</span>
            <span class="chat-tab-close" data-chat-id="${chat.id}">×</span>
        `;
        
        // Add click event to switch to this chat
        tab.addEventListener('click', (e) => {
            // Don't switch if clicking the close button
            if (e.target.classList.contains('chat-tab-close')) return;
            
            switchToChat(chat.id);
        });
        
        // We don't need to add individual event listeners here anymore
        // since we have a global event handler for all chat-tab-close elements
        
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
    
    // Add each message to the UI with consistent formatting
    chat.messages.forEach(msg => {
        renderMessage(msg);
    });
    
    // Save changes to localStorage
    saveChatsToLocalStorage();
    
    // Scroll to bottom
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Unified message rendering function to ensure consistency
function renderMessage(msg) {
    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.role}-message`;
    messageDiv.setAttribute('data-message-id', msg.id);
    
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Add message content with proper formatting
    if (msg.isHtml) {
        // For HTML content, just set innerHTML directly
        contentDiv.innerHTML = msg.content;
    } else {
        // For non-HTML content, use markdown parsing like in addMessageToChat
        if (typeof markdownit === 'function') {
            try {
                // Parse markdown in the content
                const md = markdownit({
                    linkify: true,
                    highlight: function (str, lang) {
                        if (window.hljs && lang && window.hljs.getLanguage(lang)) {
                            try {
                                return window.hljs.highlight(str, { language: lang }).value;
                            } catch (err) {}
                        }
                        return ''; // use external default escaping
                    }
                });
                
                contentDiv.innerHTML = md.render(msg.content);
                
                // Add syntax highlighting to code blocks if hljs is available
                if (window.hljs) {
                    contentDiv.querySelectorAll('pre code').forEach((block) => {
                        window.hljs.highlightElement(block);
                    });
                }
            } catch (err) {
                console.error('Error parsing markdown:', err);
                // Fallback to plain text with basic formatting
                contentDiv.innerHTML = msg.content
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            }
        } else {
            // Fallback if markdown-it is not available
            contentDiv.innerHTML = msg.content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
    }
    
    // Add the content div to the message
    messageDiv.appendChild(contentDiv);
    
    // Add sources if available (for assistant messages)
    if (msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && msg.role === 'assistant') {
        const sourcesContainer = document.createElement('div');
        sourcesContainer.className = 'sources-container';
        
        const sourcesTitle = document.createElement('div');
        sourcesTitle.className = 'sources-title';
        sourcesTitle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Sources
        `;
        sourcesContainer.appendChild(sourcesTitle);
        
        const sourcesList = document.createElement('div');
        sourcesList.className = 'sources-list';
        
        msg.sources.forEach((source, index) => {
            const sourceItem = document.createElement('div');
            sourceItem.className = 'source-item';
            
            const sourceNumber = document.createElement('div');
            sourceNumber.className = 'source-number';
            sourceNumber.textContent = index + 1;
            
            const sourceLink = document.createElement('a');
            sourceLink.className = 'source-link';
            sourceLink.href = source.url;
            sourceLink.target = '_blank';
            sourceLink.rel = 'noopener noreferrer';
            
            const sourceContent = document.createElement('div');
            sourceContent.className = 'source-content';
            
            const sourceTitle = document.createElement('div');
            sourceTitle.className = 'source-title';
            sourceTitle.textContent = source.title || 'Web Source';
            
            const sourceUrl = document.createElement('div');
            sourceUrl.className = 'source-url';
            sourceUrl.textContent = source.url;
            
            sourceContent.appendChild(sourceTitle);
            sourceContent.appendChild(sourceUrl);
            
            sourceLink.appendChild(sourceContent);
            sourceItem.appendChild(sourceNumber);
            sourceItem.appendChild(sourceLink);
            sourcesList.appendChild(sourceItem);
        });
        
        sourcesContainer.appendChild(sourcesList);
        messageDiv.appendChild(sourcesContainer);
    }
    
    // Add the message to the chat container
    elements.chatMessages.appendChild(messageDiv);
    
    // Add edit button for user messages
    if (msg.role === 'user') {
        // Check if the function is available in window scope
        if (typeof window.addEditButtonToMessage === 'function') {
            window.addEditButtonToMessage(messageDiv, msg.id);
        } else {
            // Fallback implementation if the function is not available
            const editButton = document.createElement('button');
            editButton.className = 'edit-message-btn';
            editButton.setAttribute('data-message-id', msg.id);
            editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
            messageDiv.appendChild(editButton);
        }
    }
    
    // Add feedback buttons for assistant messages
    if (msg.role === 'assistant') {
        // Apply any saved feedback state
        if (msg.feedback) {
            messageDiv.setAttribute('data-feedback-given', msg.feedback);
        }
        
        // Make sure we wait until the element is fully rendered before adding feedback
        setTimeout(() => {
            if (typeof window.addFeedbackToMessage === 'function') {
                window.addFeedbackToMessage(messageDiv);
            } else if (typeof addFeedbackToMessage === 'function') {
                addFeedbackToMessage(messageDiv);
            }
        }, 0);
    }
    
    return messageDiv;
}

function clearChatMessages() {
    elements.chatMessages.innerHTML = '';
}

// Local implementation of deleteChat as a fallback
function localDeleteChat(chatId) {
    console.log('Using local deleteChat implementation for chat ID:', chatId);
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
    saveChatsToLocalStorage();
    localStorage.setItem(STORAGE_KEYS.DELETED_CHATS, JSON.stringify(state.deletedChats));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, state.activeChatId);
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
    
    // API key is now handled by the server, no need to clear it
    
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
    const hasImages = state.chatImageFiles.length > 0;
    
    if (!message && !hasImages) return;

    // Add user message to chat
    if (hasImages) {
        // Process all images to data URLs
        const processAllImages = state.chatImageFiles.map(imgObj => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        id: imgObj.id,
                        dataUrl: e.target.result
                    });
                };
                reader.readAsDataURL(imgObj.file);
            });
        });
        
        // Wait for all images to be processed
        const imageResults = await Promise.all(processAllImages);
        
        // Create HTML content for the message with all images
        let imagesHtml = '';
        imageResults.forEach(img => {
            imagesHtml += `
                <div class="message-image-container" data-image-id="${img.id}">
                    <img src="${img.dataUrl}" alt="User uploaded image" class="chat-image-preview">
                </div>
            `;
        });
        
        const messageContent = `
            <div class="message-content-wrapper">
                <div class="message-text">${escapeHtml(message)}</div>
                <div class="message-images-grid">${imagesHtml}</div>
            </div>
        `;
        
        addMessageToChat('user', messageContent, true);
        
        // Clear input and images
        elements.userInput.value = '';
        const imagesContainer = document.querySelector('.chat-images-container');
        if (imagesContainer) imagesContainer.remove();
        
        // Send to API
        await sendChatRequest(message, imageResults.map(img => img.dataUrl));
        
        // Reset state
        state.chatImageFiles = [];
        if (elements.chatImageUpload) {
            elements.chatImageUpload.value = '';
        }
    } else {
        // Text-only message
        addMessageToChat('user', message);
        elements.userInput.value = '';
        await sendChatRequest(message);
    }
}

async function sendChatRequest(message, imageDataUrls = null) {
    try {
        // Add a loading indicator while waiting for the AI response
        const loadingIndicatorId = addLoadingIndicator();
        
        // Also show loading state on send button if LoadingStates is available
        if (window.LoadingStates) {
            window.LoadingStates.startLoading('sendMessage');
        }
        
        // Choose the appropriate system prompt based on chat mode
        const promptToUse = (state.chatMode === 'custom' && state.customSystemPrompt) ? 
                           state.customSystemPrompt : state.systemPrompt;
        
        // Start with system prompt
        let messages = [
            {
                role: "system",
                content: promptToUse
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
                        // Check if it contains multiple images
                        const imgMatches = Array.from(prevMsg.content.matchAll(/<img src="(data:image\/[^;]+;base64,[^"]+)"/g));
                        
                        if (imgMatches && imgMatches.length > 0) {
                            // This was a message with one or more images
                            const textContent = prevMsg.content.replace(/<[^>]*>/g, '').trim();
                            
                            // Create content array with text first
                            const contentArray = [
                                { type: "text", text: textContent || "What can you tell me about these HVAC components?" }
                            ];
                            
                            // Add each image to the content array
                            imgMatches.forEach(match => {
                                if (match && match[1]) {
                                    contentArray.push({
                                        type: "image_url", 
                                        image_url: { url: match[1] }
                                    });
                                }
                            });
                            
                            messages.push({
                                role: prevMsg.role,
                                content: contentArray
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
        if (imageDataUrls && (Array.isArray(imageDataUrls) ? imageDataUrls.length > 0 : imageDataUrls)) {
            // Format message with image(s) for GPT-4o
            // Create content array with text first
            const contentArray = [
                {
                    type: "text",
                    text: message || "What can you tell me about these HVAC components?"
                }
            ];
            
            // Handle both single image and array of images
            const imagesToProcess = Array.isArray(imageDataUrls) ? imageDataUrls : [imageDataUrls];
            
            // Add each image to the content array
            imagesToProcess.forEach(imageUrl => {
                // Ensure the image data URL is properly formatted
                const formattedImageUrl = imageUrl.startsWith('data:image/') 
                    ? imageUrl 
                    : `data:image/jpeg;base64,${imageUrl.replace(/^data:.*?;base64,/, '')}`;
                
                contentArray.push({
                    type: "image_url",
                    image_url: {
                        url: formattedImageUrl
                    }
                });
            });
            
            console.log(`Sending message with ${imagesToProcess.length} image(s)`);
            
            messages.push({
                role: "user",
                content: contentArray
            });
        } else {
            // Text-only message
            messages.push({
                role: "user",
                content: message
            });
        }
        
        // Use Vercel API route to handle OpenAI API communication
        // This eliminates the need for a Cloudflare Worker proxy
        
        // API endpoint will be relative in production or absolute in development
        const apiEndpoint = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api/openai'
            : '/api/openai';
        
        // Determine if we should use web search based on state
        const useWebSearch = state.webSearchEnabled;
        
        console.log(`Sending request to OpenAI ${useWebSearch ? 'Responses' : 'Completions'} API via Vercel API route`);
        
        // Prepare request payload
        const requestPayload = {
            model: state.chatMode === 'custom' ? state.customChatSettings.model : "gpt-4.1",
            messages: messages,
            max_tokens: state.chatMode === 'custom' ? state.customChatSettings.maxTokens : 2000,
            ...(state.chatMode === 'custom' && { temperature: state.customChatSettings.temperature }),
            // Include useWebSearch flag for the backend to route correctly
            useWebSearch: useWebSearch
        };
        
        // Log if web search is being used
        if (useWebSearch) {
            console.log('Web search functionality is enabled for this request');
        }
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestPayload)
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

        // Remove the loading indicators
        removeLoadingIndicator();
        
        // Stop loading state on send button if LoadingStates is available
        if (window.LoadingStates) {
            window.LoadingStates.stopLoading('sendMessage');
        }
        
        // Extract AI response content and sources if available
        const aiResponse = data.choices[0].message.content;
        
        // Check if we have web search sources in the response
        let sources = null;
        
        // Check if this is a responses API response with citations
        if (useWebSearch && data.choices[0].message.tool_calls) {
            // Look for web_search tool calls
            const webSearchCalls = data.choices[0].message.tool_calls.filter(
                call => call.type === 'function' && 
                call.function && 
                call.function.name === 'web_search'
            );
            
            if (webSearchCalls.length > 0) {
                try {
                    // Extract sources from the tool calls
                    sources = [];
                    
                    webSearchCalls.forEach(call => {
                        if (call.function && call.function.arguments) {
                            const args = JSON.parse(call.function.arguments);
                            if (args.citations && Array.isArray(args.citations)) {
                                args.citations.forEach(citation => {
                                    if (citation.url) {
                                        sources.push({
                                            url: citation.url,
                                            title: citation.title || 'Web Source'
                                        });
                                    }
                                });
                            }
                        }
                    });
                    
                    console.log('Extracted web search sources:', sources);
                } catch (error) {
                    console.error('Error parsing web search citations:', error);
                }
            }
        }
        
        // Add the message with sources if available
        addMessageToChat('assistant', aiResponse, false, sources);
        
    } catch (error) {
        // Remove the loading indicators on error
        removeLoadingIndicator();
        
        // Stop loading state on send button if LoadingStates is available
        if (window.LoadingStates) {
            window.LoadingStates.stopLoading('sendMessage');
        }
        
        console.error('Error in sendChatRequest:', error);
        addMessageToChat('assistant', `Error: ${error.message}. Please check the console for more details.`);
    }
}

function addMessageToChat(role, content, isHtml = false, sources = null) {
    // Create a message object first
    const messageId = generateMessageId();
    
    // Create message object
    const messageObj = {
        id: messageId,
        role,
        content,
        isHtml,
        timestamp: new Date().toISOString()
    };
    
    // Add sources if available
    if (sources) {
        messageObj.sources = sources;
    }
    
    // Add the message to the state
    if (state.activeChatId) {
        const chatIndex = state.chats.findIndex(chat => chat.id === state.activeChatId);
        if (chatIndex !== -1) {
            // Add to chat
            state.chats[chatIndex].messages.push(messageObj);
            
            // If this is the first user message and the chat title is still the default,
            // generate a meaningful title based on the user's prompt
            if (role === 'user' && state.chats[chatIndex].title === '...' && state.chats[chatIndex].messages.length === 1) {
                // Generate title from user message
                const title = generateChatTitle(content);
                state.chats[chatIndex].title = title;
                
                // Update the chat tabs to show the new title
                updateChatTabs();
            }
            
            // Save to local storage
            saveChatsToLocalStorage();
        }
    }
    
    // Use the unified rendering function to display the message
    const messageElement = renderMessage(messageObj);
    
    // Scroll to the bottom of the messages
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    return messageElement;
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

// Function to generate a meaningful chat title based on the user's prompt
function generateChatTitle(message) {
    // Trim the message and limit its length
    let title = message.trim();
    
    // Remove any HTML tags if present
    title = title.replace(/<[^>]*>/g, '');
    
    // If the message is too long, truncate it and add ellipsis
    const maxLength = 30;
    if (title.length > maxLength) {
        // Try to find a good breaking point (space, period, comma, etc.)
        const breakPoint = title.substring(0, maxLength).lastIndexOf(' ');
        if (breakPoint > maxLength / 2) {
            // If we found a good breaking point, use it
            title = title.substring(0, breakPoint) + '...';
        } else {
            // Otherwise just truncate at maxLength
            title = title.substring(0, maxLength) + '...';
        }
    }
    
    // If the title is empty or just whitespace, use a default
    if (!title || title.length === 0) {
        // Generate a timestamp-based title
        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        title = `Chat - ${formattedDate} ${formattedTime}`;
    }
    
    return title;
}

// AI Loading Indicator Functions
function addLoadingIndicator() {
    const loadingId = 'ai-loading-indicator';
    
    // Create loading indicator element
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.classList.add('message', 'assistant-message', 'loading-message');
    
    // Determine the appropriate text based on web search status
    const loadingText = state.webSearchEnabled ? 'Searching the web' : 'Thinking';
    
    // Add the thinking animation with dots
    loadingDiv.innerHTML = `
        <div class="thinking-indicator">
            <span>${loadingText}</span>
            <span class="dot-animation">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
            </span>
        </div>
    `;
    
    // Add to DOM
    elements.chatMessages.appendChild(loadingDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    return loadingId;
}

function removeLoadingIndicator() {
    const loadingIndicator = document.getElementById('ai-loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
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

// Function to show API key required popup - disabled as per new requirements
function showApiKeyRequiredPopup() {
    // This function is now disabled - we show the signup form directly instead
    return;
}

// Chat Mode Functions
function switchChatMode(mode) {
    // Update state
    state.chatMode = mode;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.CHAT_MODE, mode);
    
    // Update UI - only if elements exist
    if (!elements.easyChatMode || !elements.presetChatMode || !elements.customChatMode || !elements.customChatSettings) {
        console.log('Chat mode elements not found in the DOM');
        return;
    }
    
    // Reset all active classes
    elements.easyChatMode.classList.remove('active');
    elements.presetChatMode.classList.remove('active');
    elements.customChatMode.classList.remove('active');
    
    // Hide custom settings by default
    elements.customChatSettings.classList.add('hidden');
    
    // Show/hide appropriate settings based on mode
    if (mode === 'easy') {
        elements.easyChatMode.classList.add('active');
    } else if (mode === 'preset') {
        elements.presetChatMode.classList.add('active');
        // Show custom settings but hide everything except preset and model selection
        elements.customChatSettings.classList.remove('hidden');
        
        // Hide all settings rows except the first one (preset selector)
        const settingsRows = document.querySelectorAll('.settings-row');
        settingsRows.forEach((row, index) => {
            if (index === 0) {
                // First row contains preset selector, always show it
                row.classList.remove('hidden');
            } else if (row.querySelector('#modelSelection')) {
                // This row contains the model selection, show it
                row.classList.remove('hidden');
            } else {
                // Hide all other rows
                row.classList.add('hidden');
            }
        });
    } else if (mode === 'custom') {
        elements.customChatMode.classList.add('active');
        elements.customChatSettings.classList.remove('hidden');
        
        // Show all settings rows that might have been hidden in preset mode
        const settingsRows = document.querySelectorAll('.settings-row');
        settingsRows.forEach(row => {
            row.classList.remove('hidden');
        });
    }
}

// Initialize chat mode based on state - only if elements exist
if (elements.easyChatMode && elements.presetChatMode && elements.customChatMode) {
    // Call switchChatMode to properly initialize the UI based on the saved mode
    switchChatMode(state.chatMode);
}

// Initialize preset selector if it exists
if (elements.presetPrompt) {
    populatePresetSelector();
}

// Function to populate preset selector
function populatePresetSelector() {
    console.log('Populating preset selectors with presets:', state.presets);
    
    // Function to populate a single preset selector
    const populateSelector = (selector) => {
        if (!selector) return false;
        
        // Clear all existing options except the first one (the placeholder)
        while (selector.options.length > 1) {
            selector.remove(1);
        }
        
        // Add all presets directly to ensure they appear
        if (state.presets.length > 0) {
            state.presets.forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.id;
                option.textContent = preset.name;
                if (preset.category) {
                    option.textContent = `${preset.name} (${preset.category})`;
                }
                option.dataset.description = preset.description || '';
                selector.appendChild(option);
            });
            return true;
        }
        return false;
    };
    
    // Populate the main preset dropdown
    const mainPopulated = populateSelector(elements.presetPrompt);
    if (!mainPopulated) {
        console.error('No presets available or preset prompt element not found');
    }
    
    // Populate the custom preset dropdown
    const customPopulated = populateSelector(elements.customPresetPrompt);
    if (!customPopulated && elements.customPresetPrompt) {
        console.error('Failed to populate custom preset dropdown');
    }
    
    // Set the selected value if one exists in localStorage
    if (state.selectedPreset) {
        if (elements.presetPrompt) elements.presetPrompt.value = state.selectedPreset;
        if (elements.customPresetPrompt) elements.customPresetPrompt.value = state.selectedPreset;
    }
    
    // Add change event listeners for both preset dropdowns
    if (elements.presetPrompt) {
        // Define named handler functions that we can reference for removal
        elements.presetPrompt.onchange = function() {
            handlePresetChange(elements.presetPrompt);
        };
    }
    
    if (elements.customPresetPrompt) {
        elements.customPresetPrompt.onchange = function() {
            handlePresetChange(elements.customPresetPrompt);
        };
    }
    
    // Update description for the selected preset
    updatePresetDescription();
    
    console.log('Preset selectors populated successfully');
    if (elements.presetPrompt) {
        console.log('Main preset selector has', elements.presetPrompt.options.length - 1, 'options');
    }
    if (elements.customPresetPrompt) {
        console.log('Custom preset selector has', elements.customPresetPrompt.options.length - 1, 'options');
    }
}

// Function to update preset description when a preset is selected
function updatePresetDescription() {
    console.log('Updating preset description');
    
    // Use elements.presetDescription if available, otherwise try to get by ID
    const presetDescription = elements.presetDescription || document.getElementById('presetDescription');
    if (!presetDescription) {
        console.error('Preset description element not found');
        return;
    }
    
    // Get the active preset selector based on which mode is active
    let activePresetSelector = null;
    
    // Check if we're in preset mode or custom mode
    const chatSection = document.getElementById('chatSection');
    if (chatSection) {
        if (chatSection.classList.contains('mode-preset') && elements.presetPrompt) {
            activePresetSelector = elements.presetPrompt;
        } else if (chatSection.classList.contains('mode-custom') && elements.customPresetPrompt) {
            activePresetSelector = elements.customPresetPrompt;
        } else {
            // Default to presetPrompt if available
            activePresetSelector = elements.presetPrompt || elements.customPresetPrompt;
        }
    } else {
        // Fallback if chatSection not found
        activePresetSelector = elements.presetPrompt || elements.customPresetPrompt;
    }
    
    if (!activePresetSelector) {
        console.error('No active preset selector found in updatePresetDescription');
        return;
    }
    
    const selectedIndex = activePresetSelector.selectedIndex;
    if (selectedIndex <= 0) { // Account for the placeholder option at index 0
        console.log('No preset selected (placeholder or invalid selection)');
        presetDescription.textContent = '';
        presetDescription.classList.remove('active');
        return;
    }
    
    const selectedOption = activePresetSelector.options[selectedIndex];
    console.log('Selected option:', selectedOption);
    
    // Find the preset in the state.presets array to get its full details
    const selectedPresetId = selectedOption.value;
    const selectedPreset = state.presets.find(preset => preset.id === selectedPresetId);
    
    if (selectedPreset && selectedPreset.description) {
        console.log('Description found from state:', selectedPreset.description);
        presetDescription.textContent = selectedPreset.description;
        presetDescription.classList.add('active');
    } else if (selectedOption && selectedOption.dataset && selectedOption.dataset.description) {
        console.log('Description found from dataset:', selectedOption.dataset.description);
        presetDescription.textContent = selectedOption.dataset.description;
        presetDescription.classList.add('active');
    } else {
        console.log('No description available for selected option');
        presetDescription.textContent = '';
        presetDescription.classList.remove('active');
    }
}

// Function to handle preset selection change
function handlePresetChange(selectorElement) {
    // Determine which selector triggered the change
    const activeSelector = selectorElement || elements.presetPrompt || elements.customPresetPrompt;
    if (!activeSelector) {
        console.error('No active selector found in handlePresetChange');
        return;
    }
    
    const selectedPresetId = activeSelector.value;
    state.selectedPreset = selectedPresetId;
    localStorage.setItem(STORAGE_KEYS.SELECTED_PRESET, selectedPresetId);
    
    // Synchronize both dropdowns to show the same selection
    if (elements.presetPrompt && activeSelector !== elements.presetPrompt) {
        elements.presetPrompt.value = selectedPresetId;
    }
    if (elements.customPresetPrompt && activeSelector !== elements.customPresetPrompt) {
        elements.customPresetPrompt.value = selectedPresetId;
    }
    
    if (selectedPresetId) {
        // Find the selected preset
        const selectedPreset = state.presets.find(preset => preset.id === selectedPresetId);
        if (selectedPreset) {
            // Update the custom system prompt with the preset prompt
            state.customSystemPrompt = selectedPreset.prompt;
            localStorage.setItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT, state.customSystemPrompt);
            
            // Update the UI
            if (elements.customSystemPrompt) {
                elements.customSystemPrompt.value = '';
            }
            updateSystemPromptPreview();
        }
    }
    
    // Update the description display
    updatePresetDescription();
}

// Expose functions to the global scope
window.handlePresetChange = handlePresetChange;
window.toggleSystemPromptDisplay = toggleSystemPromptDisplay;
window.updateSystemPromptPreview = updateSystemPromptPreview;

// Custom Chat Settings Functions
function addToSystemPrompt() {
    if (!elements.customSystemPrompt) return;
    
    const additionalPrompt = elements.customSystemPrompt.value.trim();
    if (additionalPrompt) {
        // Check if we're starting fresh or adding to existing
        const isFirstInstruction = !state.customSystemPrompt || state.customSystemPrompt.trim() === '';
        
        if (isFirstInstruction) {
            // If this is the first instruction, just set it directly
            state.customSystemPrompt = additionalPrompt;
        } else {
            // Otherwise, append to the existing instructions
            state.customSystemPrompt = `${state.customSystemPrompt}\n\n${additionalPrompt}`;
        }
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT, state.customSystemPrompt);
        elements.customSystemPrompt.value = '';
        
        // Reset preset selection if we're modifying the system prompt
        if (elements.presetPrompt && elements.presetPrompt.value) {
            state.selectedPreset = '';
            localStorage.setItem(STORAGE_KEYS.SELECTED_PRESET, '');
            elements.presetPrompt.value = '';
        }
        
        // Show success feedback
        const textarea = elements.customSystemPrompt;
        textarea.classList.add('success-flash');
        setTimeout(() => {
            textarea.classList.remove('success-flash');
        }, 1000);
        
        // Automatically show the preview if it's hidden
        if (elements.systemPromptPreview && elements.systemPromptPreview.classList.contains('hidden')) {
            toggleSystemPromptDisplay();
        } else {
            // Just update the preview if it's already visible
            updateSystemPromptPreview();
        }
    }
}

function replaceSystemPrompt() {
    if (!elements.customSystemPrompt) return;
    
    const newPrompt = elements.customSystemPrompt.value.trim();
    if (newPrompt) {
        // Set the new system prompt
        state.customSystemPrompt = newPrompt;
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT, state.customSystemPrompt);
        elements.customSystemPrompt.value = '';
        
        // Reset preset selection
        state.selectedPreset = '';
        localStorage.setItem(STORAGE_KEYS.SELECTED_PRESET, '');
        if (elements.presetPrompt) {
            elements.presetPrompt.value = '';
        }
        
        // Show success feedback
        const textarea = elements.customSystemPrompt;
        textarea.classList.add('success-flash');
        setTimeout(() => {
            textarea.classList.remove('success-flash');
        }, 1000);
        
        // Automatically show the preview if it's hidden
        if (elements.systemPromptPreview && elements.systemPromptPreview.classList.contains('hidden')) {
            toggleSystemPromptDisplay();
        } else {
            // Just update the preview if it's already visible
            updateSystemPromptPreview();
        }
    }
}

function updateTemperatureValue() {
    if (!elements.temperature || !elements.temperatureValue) return;
    const value = elements.temperature.value;
    elements.temperatureValue.textContent = value;
    state.customChatSettings.temperature = parseFloat(value);
    
    // Save to localStorage
    saveCustomChatSettings();
}

function updateMaxTokens() {
    if (!elements.maxTokens) return;
    state.customChatSettings.maxTokens = parseInt(elements.maxTokens.value);
    
    // Save to localStorage
    saveCustomChatSettings();
}

function updateModel() {
    if (!elements.modelSelection) return;
    state.customChatSettings.model = elements.modelSelection.value;
    
    // Save to localStorage
    saveCustomChatSettings();
}

// Function to toggle system prompt display
function toggleSystemPromptDisplay() {
    if (!elements.systemPromptPreview || !elements.displaySystemPrompt || !elements.systemPromptContent) return;
    
    const isHidden = elements.systemPromptPreview.classList.contains('hidden');
    
    if (isHidden) {
        // Show the system prompt preview
        elements.systemPromptPreview.classList.remove('hidden');
        elements.displaySystemPrompt.innerHTML = '<span class="toggle-icon">🔽</span> Hide Current';
        updateSystemPromptPreview();
        
        // Scroll to the preview
        elements.systemPromptPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        // Hide the system prompt preview
        elements.systemPromptPreview.classList.add('hidden');
        elements.displaySystemPrompt.innerHTML = '<span class="toggle-icon">👁️</span> View Current';
    }
}

// Function to update the system prompt preview content
function updateSystemPromptPreview() {
    if (!elements.systemPromptContent) return;
    
    // Show the appropriate system prompt based on whether a custom one exists
    const hasCustomPrompt = state.customSystemPrompt && state.customSystemPrompt.trim() !== '';
    const promptToShow = hasCustomPrompt ? state.customSystemPrompt : state.systemPrompt;
    
    // Clear the content container
    elements.systemPromptContent.innerHTML = '';
    
    if (hasCustomPrompt) {
        // Split the custom prompt into individual instructions
        const instructions = state.customSystemPrompt.split('\n\n').filter(instr => instr.trim() !== '');
        
        // Create elements for each instruction
        instructions.forEach((instruction, index) => {
            const instructionElement = document.createElement('div');
            instructionElement.className = 'instruction-item';
            instructionElement.dataset.index = index;
            
            const instructionText = document.createElement('div');
            instructionText.className = 'instruction-text';
            instructionText.textContent = instruction;
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-instruction-btn';
            removeButton.innerHTML = '&times;';
            removeButton.title = 'Remove this instruction';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                removeInstruction(index);
            });
            
            instructionElement.appendChild(instructionText);
            instructionElement.appendChild(removeButton);
            elements.systemPromptContent.appendChild(instructionElement);
        });
    } else {
        // Just show the default prompt as text
        elements.systemPromptContent.textContent = promptToShow;
    }
    
    // Add a visual indicator if using default prompt
    if (!hasCustomPrompt && elements.systemPromptPreview) {
        elements.systemPromptPreview.classList.add('using-default');
    } else if (elements.systemPromptPreview) {
        elements.systemPromptPreview.classList.remove('using-default');
    }
}

// Function to remove a specific instruction by index
function removeInstruction(index) {
    if (state.customSystemPrompt) {
        // Split the custom prompt into individual instructions
        const instructions = state.customSystemPrompt.split('\n\n').filter(instr => instr.trim() !== '');
        
        // Make sure the index is valid
        if (index >= 0 && index < instructions.length) {
            // Remove the instruction at the specified index
            instructions.splice(index, 1);
            
            // Update the custom system prompt
            state.customSystemPrompt = instructions.join('\n\n');
            
            // If no instructions left, clear the custom system prompt
            if (instructions.length === 0) {
                state.customSystemPrompt = '';
                localStorage.removeItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT);
            } else {
                localStorage.setItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT, state.customSystemPrompt);
            }
            
            // Update the preview
            updateSystemPromptPreview();
            
            // Show feedback animation on the preview container
            if (elements.systemPromptPreview) {
                elements.systemPromptPreview.classList.add('success-flash');
                setTimeout(() => {
                    elements.systemPromptPreview.classList.remove('success-flash');
                }, 1000);
            }
        }
    }
}

// Custom confirmation modal functions
function showConfirmationModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    const titleElement = document.getElementById('confirmationTitle');
    const messageElement = document.getElementById('confirmationMessage');
    const confirmButton = document.getElementById('confirmationConfirmBtn');
    const cancelButton = document.getElementById('confirmationCancelBtn');
    const closeButton = document.getElementById('closeConfirmationModal');
    
    if (!modal || !titleElement || !messageElement || !confirmButton || !cancelButton) return;
    
    // Set content
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Show the modal
    modal.classList.remove('hidden');
    
    // Set up event listeners
    const closeModal = () => {
        modal.classList.add('hidden');
        confirmButton.removeEventListener('click', handleConfirm);
        cancelButton.removeEventListener('click', handleCancel);
        closeButton.removeEventListener('click', handleCancel);
    };
    
    const handleConfirm = () => {
        closeModal();
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };
    
    const handleCancel = () => {
        closeModal();
    };
    
    confirmButton.addEventListener('click', handleConfirm);
    cancelButton.addEventListener('click', handleCancel);
    closeButton.addEventListener('click', handleCancel);
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Function to reset system prompt to default
function resetSystemPromptToDefault() {
    // Use custom confirmation modal
    showConfirmationModal(
        'Reset System Instructions',
        'Are you sure you want to reset the system instructions? This will remove all custom instructions.',
        () => {
            // Clear the custom system prompt
            state.customSystemPrompt = '';
            localStorage.removeItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT);
            
            // Reset preset selection
            state.selectedPreset = '';
            localStorage.setItem(STORAGE_KEYS.SELECTED_PRESET, '');
            if (elements.presetPrompt) {
                elements.presetPrompt.value = '';
            }
            
            // Update the preview
            updateSystemPromptPreview();
            
            // Show feedback message
            const previewContent = elements.systemPromptContent;
            if (previewContent) {
                previewContent.classList.add('success-flash');
                setTimeout(() => {
                    previewContent.classList.remove('success-flash');
                }, 1000);
            }
        }
    );
}

// Function to reset all custom settings
function resetAllCustomSettings() {
    // Reset max tokens
    if (elements.maxTokens) {
        elements.maxTokens.value = 2000;
        state.customChatSettings.maxTokens = 2000;
    }
    
    // Reset temperature
    if (elements.temperature && elements.temperatureValue) {
        elements.temperature.value = 0.7;
        elements.temperatureValue.textContent = 0.7;
        state.customChatSettings.temperature = 0.7;
    }
    
    // Reset model
    if (elements.modelSelection) {
        elements.modelSelection.value = 'gpt-4.1';
        state.customChatSettings.model = 'gpt-4.1';
    }
    
    // Reset custom system prompt
    state.customSystemPrompt = '';
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_SYSTEM_PROMPT);
    
    // Update the preview if it's visible
    if (elements.systemPromptPreview && !elements.systemPromptPreview.classList.contains('hidden')) {
        updateSystemPromptPreview();
    }
    
    // Save to localStorage
    saveCustomChatSettings();
}

// Function to save custom chat settings to localStorage
function saveCustomChatSettings() {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CHAT_SETTINGS, JSON.stringify(state.customChatSettings));
    console.log('Custom chat settings saved:', state.customChatSettings);
}

// Web Search Toggle Functionality
function toggleWebSearch(event) {
    // Toggle the state
    state.webSearchEnabled = !state.webSearchEnabled;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.WEB_SEARCH_ENABLED, state.webSearchEnabled);
    
    // Update UI
    updateWebSearchStatus();
    
    // Log the change
    console.log(`Web search ${state.webSearchEnabled ? 'enabled' : 'disabled'}`);
    
    // Prevent the event from being handled multiple times
    if (event) {
        event.stopPropagation();
    }
}

// Update the web search status indicator
function updateWebSearchStatus() {
    if (elements.webSearchStatus) {
        elements.webSearchStatus.textContent = state.webSearchEnabled ? 'Enabled' : 'Disabled';
        elements.webSearchStatus.className = state.webSearchEnabled ? 'status-enabled' : 'status-disabled';
    }
    
    if (elements.webSearchToggle) {
        elements.webSearchToggle.classList.toggle('active', state.webSearchEnabled);
    }
}

// Initialize
updatePartsTable();

// Initialize web search state from localStorage
state.webSearchEnabled = localStorage.getItem(STORAGE_KEYS.WEB_SEARCH_ENABLED) === 'true';

// Make sure the UI reflects the correct state on page load
updateWebSearchStatus();

// Expose state to window for access from other scripts
window.state = state;

// Initialize chat mode based on state - only if elements exist
if (elements.easyChatMode && elements.customChatMode && elements.customChatSettings) {
    switchChatMode(state.chatMode);
    
    // Initialize custom chat settings UI
    if (elements.maxTokens) {
        elements.maxTokens.value = state.customChatSettings.maxTokens;
    }
    if (elements.temperature && elements.temperatureValue) {
        elements.temperature.value = state.customChatSettings.temperature;
        elements.temperatureValue.textContent = state.customChatSettings.temperature;
    }
    if (elements.modelSelection) {
        elements.modelSelection.value = state.customChatSettings.model;
    }
}

// Check if API key is missing and show popup if needed
if (!state.apiKey) {
    // Use a small timeout to ensure the DOM is fully loaded
    setTimeout(showApiKeyRequiredPopup, 500);
}
