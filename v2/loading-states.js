/**
 * Loading States Manager for HVAC AI Demo
 * Provides loading indicators for API calls and UI interactions
 */

// Loading state management
const LoadingStates = {
    // Store active loading states
    activeStates: {},
    
    // API loading overlay element
    apiLoadingOverlay: null,
    
    // Initialize loading states
    init() {
        // Create API loading overlay
        this.createApiLoadingOverlay();
        
        // Add loading state classes to buttons
        this.setupButtonLoaders();
        
        console.log('Loading states initialized');
    },
    
    // Create API loading overlay
    createApiLoadingOverlay() {
        // Create overlay element if it doesn't exist
        if (!this.apiLoadingOverlay) {
            const overlay = document.createElement('div');
            overlay.className = 'api-loading-overlay';
            
            const spinner = document.createElement('div');
            spinner.className = 'api-loading-spinner';
            
            overlay.appendChild(spinner);
            document.body.appendChild(overlay);
            
            this.apiLoadingOverlay = overlay;
        }
    },
    
    // Setup button loaders
    setupButtonLoaders() {
        // Add btn-with-loader class to buttons that trigger API calls
        const apiButtons = [
            document.getElementById('sendMessage'),
            document.getElementById('loginBtn'),
            document.getElementById('registerBtn'),
            document.getElementById('resetBtn'),
            document.getElementById('addToParts'),
            document.getElementById('migrationBtn')
        ];
        
        apiButtons.forEach(button => {
            if (button) {
                button.classList.add('btn-with-loader');
            }
        });
    },
    
    // Show API loading overlay
    showApiLoading() {
        if (this.apiLoadingOverlay) {
            this.apiLoadingOverlay.classList.add('visible');
        }
    },
    
    // Hide API loading overlay
    hideApiLoading() {
        if (this.apiLoadingOverlay) {
            this.apiLoadingOverlay.classList.remove('visible');
        }
    },
    
    // Start loading state for a specific element
    startLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Store original content for buttons
        if (element.tagName === 'BUTTON') {
            this.activeStates[elementId] = element.innerHTML;
            element.classList.add('loading');
        } else if (element.classList.contains('form-group') || element.classList.contains('auth-form')) {
            // For form elements
            element.classList.add('form-loading');
        }
    },
    
    // Stop loading state for a specific element
    stopLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Restore original content for buttons
        if (element.tagName === 'BUTTON') {
            element.classList.remove('loading');
        } else if (element.classList.contains('form-group') || element.classList.contains('auth-form')) {
            // For form elements
            element.classList.remove('form-loading');
        }
    },
    
    // Show loading indicator in chat
    showChatLoading() {
        // Use existing addLoadingIndicator function
        if (typeof addLoadingIndicator === 'function') {
            return addLoadingIndicator();
        }
        return null;
    },
    
    // Hide loading indicator in chat
    hideChatLoading() {
        // Use existing removeLoadingIndicator function
        if (typeof removeLoadingIndicator === 'function') {
            removeLoadingIndicator();
        }
    }
};

// Enhanced API request function with loading states
async function apiRequest(url, options = {}, loadingElementId = null) {
    try {
        // Start loading states
        if (loadingElementId) {
            LoadingStates.startLoading(loadingElementId);
        } else {
            LoadingStates.showApiLoading();
        }
        
        // Make the API request
        const response = await fetch(url, options);
        
        // Check if response is ok
        if (!response.ok) {
            let errorMessage = 'Unknown error occurred';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || JSON.stringify(errorData);
            } catch (e) {
                const errorText = await response.text();
                errorMessage = errorText || `Request failed with status ${response.status}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // Parse and return the response data
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    } finally {
        // Stop loading states
        if (loadingElementId) {
            LoadingStates.stopLoading(loadingElementId);
        } else {
            LoadingStates.hideApiLoading();
        }
    }
}

// Enhanced version of sendChatRequest with better loading states
async function enhancedSendChatRequest(message, imageDataUrls = null) {
    try {
        // Start chat loading indicator
        const loadingIndicatorId = LoadingStates.showChatLoading();
        
        // Also show loading state on send button
        LoadingStates.startLoading('sendMessage');
        
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
        
        // API endpoint will be relative in production or absolute in development
        const apiEndpoint = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api/openai'
            : '/api/openai';
        
        console.log('Sending request to OpenAI API via Vercel API route');
        
        // Use fetch with API request options
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: state.chatMode === 'custom' ? state.customChatSettings.model : "gpt-4.1",
                messages: messages,
                max_tokens: state.chatMode === 'custom' ? state.customChatSettings.maxTokens : 2000,
                ...(state.chatMode === 'custom' && { temperature: state.customChatSettings.temperature })
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
    } finally {
        // Hide loading indicators
        LoadingStates.hideChatLoading();
        LoadingStates.stopLoading('sendMessage');
    }
}

// Initialize loading states when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    LoadingStates.init();
    
    // Override the original sendChatRequest function if it exists
    if (typeof window.sendChatRequest === 'function') {
        window.sendChatRequest = enhancedSendChatRequest;
    }
});

// Export the LoadingStates object and apiRequest function
window.LoadingStates = LoadingStates;
window.apiRequest = apiRequest;
