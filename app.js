// Constants and State Management
const STORAGE_KEYS = {
    API_KEY: 'hvac_ai_api_key',
    PARTS_LIST: 'hvac_parts_list'
};

const state = {
    apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
    currentMode: 'chat',
    currentImage: null,
    partsList: JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTS_LIST) || '[]')
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
        confirmNo: document.getElementById('confirmNo')
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

        // Initialize parts table
    if (elements.partsTableBody) {
        updatePartsTable();
    }
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
                max_tokens: 500
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

// Chat Functionality
async function handleSendMessage() {
    const message = elements.userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);
    elements.userInput.value = '';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [{
                    role: "system",
                    content: "You are an expert HVAC technician assistant. Provide accurate, technical, and helpful responses about HVAC systems, parts, maintenance, and troubleshooting."
                }, {
                    role: "user",
                    content: message
                }],
                max_tokens: 500
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiResponse = data.choices[0].message.content;
        addMessageToChat('ai', aiResponse);
        
    } catch (error) {
        addMessageToChat('ai', `Error: ${error.message}`);
    }
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.innerHTML = marked.parse(content);
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
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

// Initialize
updatePartsTable();
