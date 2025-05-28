// Chat Experience Enhancements
// Contains functionality for message editing and quick reply suggestions

// Message Editing Functionality
function setupMessageEditing() {
    // Add event delegation for edit buttons
    document.getElementById('chatMessages').addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-message-btn');
        if (editButton) {
            const messageId = editButton.getAttribute('data-message-id');
            const chatId = state.activeChatId;
            
            if (messageId && chatId) {
                startEditingMessage(chatId, messageId);
            }
        }
    });
}

function startEditingMessage(chatId, messageId) {
    // Find the message in state
    const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex === -1) return;
    
    const messageIndex = state.chats[chatIndex].messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    const message = state.chats[chatIndex].messages[messageIndex];
    
    // Only allow editing user messages
    if (message.role !== 'user') return;
    
    // Find the message element
    const messageDiv = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!messageDiv) return;
    
    // Store the original content
    const originalContent = message.isHtml 
        ? extractTextContent(message.content) 
        : message.content;
    
    // Replace the message content with an editor
    messageDiv.classList.add('editing');
    
    // Save original message HTML to restore if cancelled
    messageDiv.setAttribute('data-original-html', messageDiv.innerHTML);
    
    // Create edit interface
    messageDiv.innerHTML = `
        <div class="edit-message-container">
            <textarea class="edit-message-textarea">${originalContent}</textarea>
            <div class="edit-message-actions">
                <button class="save-edit-btn">Save</button>
                <button class="cancel-edit-btn">Cancel</button>
            </div>
        </div>
    `;
    
    // Focus on the textarea
    const textarea = messageDiv.querySelector('.edit-message-textarea');
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    
    // Add event listeners for the buttons
    messageDiv.querySelector('.save-edit-btn').addEventListener('click', () => {
        saveEditedMessage(chatId, messageId, textarea.value);
    });
    
    messageDiv.querySelector('.cancel-edit-btn').addEventListener('click', () => {
        cancelMessageEdit(messageDiv);
    });
    
    // Also handle Enter key to save (with shift+enter for new line)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEditedMessage(chatId, messageId, textarea.value);
        } else if (e.key === 'Escape') {
            cancelMessageEdit(messageDiv);
        }
    });
}

function saveEditedMessage(chatId, messageId, newContent) {
    // Find the message in state
    const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex === -1) return;
    
    const messageIndex = state.chats[chatIndex].messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    const message = state.chats[chatIndex].messages[messageIndex];
    
    // Only allow editing user messages
    if (message.role !== 'user') return;
    
    // Find the message element
    const messageDiv = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!messageDiv) return;
    
    // Update the message content in state
    if (message.isHtml) {
        // For HTML messages (like those with images), only update the text part
        const updatedContent = updateTextInHtmlContent(message.content, newContent);
        message.content = updatedContent;
    } else {
        message.content = newContent;
    }
    
    message.edited = true;
    message.editTimestamp = new Date().toISOString();
    
    // Update the message display
    messageDiv.classList.remove('editing');
    
    if (message.isHtml) {
        messageDiv.innerHTML = message.content + '<span class="edited-indicator">(edited)</span>';
    } else {
        messageDiv.innerHTML = escapeHtml(message.content) + '<span class="edited-indicator">(edited)</span>';
    }
    
    // Add back the edit button
    addEditButtonToMessage(messageDiv, messageId);
    
    // Save to local storage
    saveChatsToLocalStorage();
    
    // Always regenerate AI response when a message is edited
    regenerateAIResponse(chatId, messageIndex);
}

function cancelMessageEdit(messageDiv) {
    // Restore original HTML
    const originalHtml = messageDiv.getAttribute('data-original-html');
    messageDiv.innerHTML = originalHtml;
    messageDiv.classList.remove('editing');
}

function addEditButtonToMessage(messageDiv, messageId) {
    // Check if the message already has an edit button
    if (messageDiv.querySelector('.edit-message-btn')) return;
    
    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-message-btn';
    editButton.setAttribute('data-message-id', messageId);
    editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    
    // Add it to the message
    messageDiv.appendChild(editButton);
}

function extractTextContent(htmlContent) {
    // Extract text from HTML content (for editing purposes)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.querySelector('.message-text')?.textContent || tempDiv.textContent;
}

function updateTextInHtmlContent(htmlContent, newText) {
    // Update only the text part of HTML content (keeping images)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const messageTextElement = tempDiv.querySelector('.message-text');
    if (messageTextElement) {
        messageTextElement.textContent = newText;
    }
    
    return tempDiv.innerHTML;
}

function isLastMessageFromUser(chatIndex, messageIndex) {
    const messages = state.chats[chatIndex].messages;
    
    // Check if there are any user messages after this one
    for (let i = messageIndex + 1; i < messages.length; i++) {
        if (messages[i].role === 'user') {
            return false;
        }
    }
    
    return true;
}

function regenerateAIResponse(chatId, lastUserMessageIndex) {
    // Find the chat
    const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex === -1) return;
    
    const messages = state.chats[chatIndex].messages;
    
    // Find the AI message that follows the edited user message
    let aiMessageIndex = -1;
    for (let i = lastUserMessageIndex + 1; i < messages.length; i++) {
        if (messages[i].role === 'assistant') {
            aiMessageIndex = i;
            break;
        }
    }
    
    if (aiMessageIndex === -1) return;
    
    // Remove all messages after the edited user message
    const removedMessages = messages.splice(lastUserMessageIndex + 1);
    
    // Update the DOM
    const messageElements = document.querySelectorAll('.message');
    for (let i = lastUserMessageIndex + 1; i < messageElements.length; i++) {
        messageElements[i].remove();
    }
    
    // Save to local storage
    saveChatsToLocalStorage();
    
    // Get the user message content
    const userMessage = messages[lastUserMessageIndex];
    
    // Regenerate the AI response
    if (userMessage.isHtml && userMessage.content.includes('<img')) {
        // Message with images
        const imgMatches = Array.from(userMessage.content.matchAll(/<img src="(data:image\/[^;]+;base64,[^"]+)"/g));
        const imageDataUrls = imgMatches.map(match => match[1]);
        const textContent = extractTextContent(userMessage.content);
        
        sendChatRequest(textContent, imageDataUrls);
    } else {
        // Text-only message
        sendChatRequest(userMessage.content);
    }
}

// Quick Reply Suggestions
function setupQuickReplySuggestions() {
    // Create quick reply container if it doesn't exist
    if (!document.getElementById('quickReplySuggestions')) {
        const container = document.createElement('div');
        container.id = 'quickReplySuggestions';
        container.className = 'quick-reply-container hidden';
        
        // Fix: Insert at the beginning of input-area instead of trying to insert before userInput
        // userInput is not a direct child of input-area
        const inputArea = document.querySelector('.input-area');
        if (inputArea) {
            inputArea.insertBefore(container, inputArea.firstChild);
        }
    }
}

function generateQuickReplySuggestions() {
    if (!state.activeChatId) return;
    
    const chatIndex = state.chats.findIndex(chat => chat.id === state.activeChatId);
    if (chatIndex === -1) return;
    
    const messages = state.chats[chatIndex].messages;
    if (messages.length < 2) return; // Need at least one exchange
    
    // Get the last AI message
    let lastAIMessage = null;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
            lastAIMessage = messages[i];
            break;
        }
    }
    
    if (!lastAIMessage) return;
    
    // Extract text content
    let aiMessageText = lastAIMessage.content;
    if (lastAIMessage.isHtml) {
        aiMessageText = extractTextContent(aiMessageText);
    }
    
    // Generate suggestions based on the context
    const suggestions = generateSuggestionsFromContext(aiMessageText);
    
    // Update the UI
    displayQuickReplySuggestions(suggestions);
}

function generateSuggestionsFromContext(aiMessageText) {
    // Simple suggestion generation rules based on AI response content
    const suggestions = [];
    
    // Check for questions in the AI response
    if (aiMessageText.includes('?')) {
        // Find questions in the AI response
        const sentences = aiMessageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const questions = sentences.filter(s => s.trim().endsWith('?'));
        
        if (questions.length > 0) {
            // For each question, generate appropriate responses
            for (const question of questions.slice(0, 2)) { // Limit to 2 questions
                if (question.toLowerCase().includes('yes or no')) {
                    suggestions.push('Yes, that sounds right');
                    suggestions.push('No, that\'s not correct');
                } else if (question.toLowerCase().includes('how many')) {
                    suggestions.push('I\'m not sure about the exact number');
                    suggestions.push('Can you help me calculate that?');
                } else if (question.toLowerCase().includes('what') || question.toLowerCase().includes('which')) {
                    suggestions.push('I need more information about that');
                    suggestions.push('Let me check and get back to you');
                }
            }
        }
    }
    
    // Add generic follow-up questions if we don't have enough
    if (suggestions.length < 3) {
        if (aiMessageText.toLowerCase().includes('temperature') || 
            aiMessageText.toLowerCase().includes('thermostat')) {
            suggestions.push('What temperature range is optimal?');
        }
        
        if (aiMessageText.toLowerCase().includes('maintenance') || 
            aiMessageText.toLowerCase().includes('repair')) {
            suggestions.push('Is this something I can fix myself?');
        }
        
        if (aiMessageText.toLowerCase().includes('efficiency') || 
            aiMessageText.toLowerCase().includes('energy')) {
            suggestions.push('How can I improve efficiency?');
        }
    }
    
    // Add generic responses if we still need more
    const genericResponses = [
        'Tell me more about that',
        'What are the next steps?',
        'Are there any alternatives?',
        'What should I watch out for?',
        'What\'s the most common problem with this?'
    ];
    
    while (suggestions.length < 3 && genericResponses.length > 0) {
        const randomIndex = Math.floor(Math.random() * genericResponses.length);
        suggestions.push(genericResponses.splice(randomIndex, 1)[0]);
    }
    
    // Limit to 3 suggestions
    return suggestions.slice(0, 3);
}

function displayQuickReplySuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) {
        hideQuickReplySuggestions();
        return;
    }
    
    const container = document.getElementById('quickReplySuggestions');
    if (!container) return;
    
    // Clear previous suggestions
    container.innerHTML = '';
    
    // Add each suggestion as a button
    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = suggestion;
        button.addEventListener('click', () => {
            // Set the suggestion as the input value
            document.getElementById('userInput').value = suggestion;
            
            // Hide suggestions
            hideQuickReplySuggestions();
            
            // Focus on the input
            document.getElementById('userInput').focus();
        });
        
        container.appendChild(button);
    });
    
    // Show the container
    container.classList.remove('hidden');
}

function hideQuickReplySuggestions() {
    const container = document.getElementById('quickReplySuggestions');
    if (container) {
        container.classList.add('hidden');
    }
}

// Initialization function to set up all chat enhancements
function initChatEnhancements() {
    setupMessageEditing();
    setupQuickReplySuggestions();
        
    // If the chats already exist, update them with message IDs
    if (state && state.chats && state.chats.length > 0) {
        updateExistingMessagesWithIdsAndButtons();
    }
        
    // Wait a bit to handle any initial setup delays
    setTimeout(() => {
        // Ensure older messages have edit buttons
        updateExistingMessagesWithIdsAndButtons();
            
        // Ensure proper scrolling for dynamic content
        if (window.adjustContainerSizes) {
            window.adjustContainerSizes();
        }
    }, 1000);
        
    // Modify addMessageToChat to add IDs to messages
    modifyAddMessageToChatForIds();
        
    // Integrate with dynamic content handler
    integrateWithDynamicContentHandler();
        
    console.log('Chat enhancements initialized');
}

// Modify the addMessageToChat function to add IDs to messages
function modifyAddMessageToChatForIds() {
    // Store original function
    const originalAddMessageToChat = window.addMessageToChat || addMessageToChat;
    
    // Override the function
    window.addMessageToChat = function(role, content, isHtml = false) {
        // Call the original function
        originalAddMessageToChat(role, content, isHtml);
        
        // Find the message we just added in the DOM (last child of chat messages)
        const messageDiv = elements.chatMessages.lastChild;
        if (!messageDiv) return;
        
        // Get current active chat
        if (!state.activeChatId) return;
        const chatIndex = state.chats.findIndex(chat => chat.id === state.activeChatId);
        if (chatIndex === -1) return;
        
        // Get the message we just added to state
        const messages = state.chats[chatIndex].messages;
        const messageIndex = messages.length - 1;
        if (messageIndex < 0) return;
        
        const message = messages[messageIndex];
        
        // Generate an ID if it doesn't have one
        if (!message.id) {
            message.id = generateMessageId();
            saveChatsToLocalStorage();
        }
        
        // Add the ID to the DOM element
        messageDiv.setAttribute('data-message-id', message.id);
        
        // Add edit button if it's a user message
        if (role === 'user') {
            addEditButtonToMessage(messageDiv, message.id);
        }
    };
}

// Helper function to generate a unique message ID
function generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Update existing messages with IDs and edit buttons
function updateExistingMessagesWithIdsAndButtons() {
    // For each chat
    state.chats.forEach(chat => {
        // For each message
        chat.messages.forEach((message, index) => {
            // Generate an ID if it doesn't have one
            if (!message.id) {
                message.id = generateMessageId();
            }
        });
    });
    
    // Save updates to localStorage
    saveChatsToLocalStorage();
    
    // Update current chat's message elements
    if (state.activeChatId) {
        const chatIndex = state.chats.findIndex(chat => chat.id === state.activeChatId);
        if (chatIndex !== -1) {
            const messageElements = document.querySelectorAll('.message');
            const messages = state.chats[chatIndex].messages;
            
            messageElements.forEach((element, index) => {
                if (index < messages.length) {
                    // Add the message ID to the element
                    element.setAttribute('data-message-id', messages[index].id);
                    
                    // Add edit button if it's a user message
                    if (messages[index].role === 'user') {
                        addEditButtonToMessage(element, messages[index].id);
                    }
                }
            });
        }
    }
}

// Integration with dynamic content handler
function integrateWithDynamicContentHandler() {
    // Hook into message rendering to ensure scroll after dynamic content is added
    const originalAddMessageToChat = window.addMessageToChat;
    if (originalAddMessageToChat) {
        window.addMessageToChat = function(role, content, isHtml = false) {
            // Call the original function
            originalAddMessageToChat(role, content, isHtml);
            
            // Generate suggestions if it's an AI message
            if (role === 'assistant') {
                setTimeout(generateQuickReplySuggestions, 500); // Delay to ensure message is rendered
            }
            
            // Ensure proper scrolling after adding content
            if (window.adjustContainerSizes) {
                setTimeout(() => window.adjustContainerSizes(), 200);
            }
            
            // Scroll to the bottom of the messages container
            setTimeout(() => {
                const messagesContainer = document.querySelector('.messages-container');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }, 100);
        };
    }
    
    // Handle edits to ensure proper container sizing
    const originalSaveEditedMessage = saveEditedMessage;
    window.saveEditedMessage = function(chatId, messageId, newContent) {
        // Call original function
        originalSaveEditedMessage(chatId, messageId, newContent);
        
        // Adjust container sizes after edit
        if (window.adjustContainerSizes) {
            setTimeout(() => window.adjustContainerSizes(), 200);
        }
    };
}

// Expose functions to window scope
window.initChatEnhancements = initChatEnhancements;
window.updateExistingMessagesWithIdsAndButtons = updateExistingMessagesWithIdsAndButtons;
