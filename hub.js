document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatContainer = document.getElementById('chatContainer');
    const chatHistory = document.getElementById('chatHistory');
    const newChatBtn = document.getElementById('newChatBtn');
    const connectWalletBtn = document.getElementById('connectWallet');
    const walletMenu = document.getElementById('walletMenu');
    const disconnectWalletBtn = document.getElementById('disconnectWallet');

    // Handle query parameter if present
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('query');

    // Chat history management
    let chats = JSON.parse(localStorage.getItem('chats') || '[]');
    let currentChatId = localStorage.getItem('currentChatId');

    function addChatToHistory(query) {
        const chatId = Date.now().toString();
        const chat = {
            id: chatId,
            title: query.slice(0, 30) + (query.length > 30 ? '...' : ''),
            messages: []
        };
        chats.unshift(chat);
        localStorage.setItem('chats', JSON.stringify(chats));
        currentChatId = chatId;
        localStorage.setItem('currentChatId', chatId);
        updateChatHistory();
        return chatId;
    }

    function updateChatHistory() {
        chatHistory.innerHTML = '';
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
            chatItem.textContent = chat.title;
            chatItem.addEventListener('click', () => loadChat(chat.id));
            chatHistory.appendChild(chatItem);
        });
    }

    function loadChat(chatId) {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        currentChatId = chatId;
        localStorage.setItem('currentChatId', chatId);
        chatContainer.innerHTML = '';
        
        // Add welcome message first
        addMessage('Welcome to Vanta AI. How can I assist you with market analysis today?', 'ai');
        
        // Then add chat messages
        chat.messages.forEach(msg => {
            addMessage(msg.content, msg.type);
        });
        
        updateChatHistory();
    }

    function saveMessage(content, type) {
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) {
            chat.messages.push({ content, type });
            localStorage.setItem('chats', JSON.stringify(chats));
        }
    }

    // Handle message sending
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Create new chat if needed
        if (!currentChatId) {
            currentChatId = addChatToHistory(message);
        }

        // Add user message
        addMessage(message, 'user');
        saveMessage(message, 'user');
        messageInput.value = '';
        messageInput.style.height = 'auto';

        try {
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
            chatContainer.appendChild(typingIndicator);

            // Get response from server
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // Remove typing indicator
            typingIndicator.remove();
            
            if (data.error) {
                throw new Error(data.details || data.error);
            }

            // Format and add AI response
            const formattedResponse = data.response.replace(/\n/g, '<br>');
            addMessage(formattedResponse, 'ai');
            saveMessage(formattedResponse, 'ai');

        } catch (error) {
            console.error('Error:', error);
            addMessage(`An error occurred: ${error.message}. Please try again.`, 'ai');
            saveMessage(`An error occurred: ${error.message}. Please try again.`, 'ai');
        }
    }

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });

    // Handle Enter key
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);

    // Add message to chat
    function addMessage(content, type) {
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        
        const header = document.createElement('div');
        header.className = 'message-header';
        header.textContent = type === 'user' ? 'You' : 'Vanta AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = content;
        
        message.appendChild(header);
        message.appendChild(messageContent);
        chatContainer.appendChild(message);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Wallet Connection
    let walletConnected = false;
    const storedWalletAddress = localStorage.getItem('walletAddress');
    
    if (storedWalletAddress) {
        walletConnected = true;
        const shortAddress = `${storedWalletAddress.slice(0, 4)}...${storedWalletAddress.slice(-4)}`;
        connectWalletBtn.innerHTML = `
            <svg class="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7zm-4 0a2 2 0 0 0-2-2H3m18 2h-6"/>
            </svg>
            ${shortAddress}
        `;
        connectWalletBtn.style.background = 'linear-gradient(135deg, #00E096 0%, #00D4FF 100%)';
    }

    // Toggle wallet menu
    connectWalletBtn.addEventListener('click', async () => {
        if (walletConnected) {
            walletMenu.classList.toggle('active');
            return;
        }

        connectWalletBtn.textContent = 'Connecting...';
        
        try {
            const { solana } = window;
            
            if (!solana?.isPhantom) {
                throw new Error('Phantom wallet is not installed');
            }

            const response = await solana.connect();
            const walletAddress = response.publicKey.toString();
            
            walletConnected = true;
            const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
            connectWalletBtn.innerHTML = `
                <svg class="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7zm-4 0a2 2 0 0 0-2-2H3m18 2h-6"/>
                </svg>
                ${shortAddress}
            `;
            connectWalletBtn.style.background = 'linear-gradient(135deg, #00E096 0%, #00D4FF 100%)';
            localStorage.setItem('walletAddress', walletAddress);

        } catch (error) {
            console.error('Wallet connection error:', error);
            connectWalletBtn.innerHTML = `
                <svg class="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7zm-4 0a2 2 0 0 0-2-2H3m18 2h-6"/>
                </svg>
                Connect Wallet
            `;
            alert('Failed to connect wallet: ' + error.message);
        }
    });

    // Handle wallet disconnect
    disconnectWalletBtn.addEventListener('click', () => {
        localStorage.removeItem('walletAddress');
        walletConnected = false;
        walletMenu.classList.remove('active');
        connectWalletBtn.innerHTML = `
            <svg class="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7zm-4 0a2 2 0 0 0-2-2H3m18 2h-6"/>
            </svg>
            Connect Wallet
        `;
        connectWalletBtn.style.background = 'linear-gradient(135deg, #FF3D71 0%, #00D4FF 100%)';
    });

    // Close wallet menu when clicking outside
    document.addEventListener('click', (e) => {
        if (walletConnected && !connectWalletBtn.contains(e.target) && !walletMenu.contains(e.target)) {
            walletMenu.classList.remove('active');
        }
    });

    // New Chat
    newChatBtn.addEventListener('click', () => {
        currentChatId = null;
        localStorage.removeItem('currentChatId');
        chatContainer.innerHTML = '';
        updateChatHistory();
        addMessage('Welcome to Vanta AI. How can I assist you with market analysis today?', 'ai');
    });

    // Initial setup
    updateChatHistory();
    if (currentChatId) {
        loadChat(currentChatId);
    } else {
        addMessage('Welcome to Vanta AI. How can I assist you with market analysis today?', 'ai');
    }

    // Handle initial query if present
    if (initialQuery) {
        messageInput.value = initialQuery;
        sendMessage();
    }
});
