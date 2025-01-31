document.addEventListener('DOMContentLoaded', () => {
    // Loading screen animation - reduced to 1.5 seconds
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        document.getElementById('loading-screen').style.pointerEvents = 'none';
        document.getElementById('main-content').classList.remove('hidden');
    }, 1500);

    // Background animation
    const bg = document.getElementById('background-animation');
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    const easing = 0.05;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
    });

    function animate() {
        // Smooth easing
        currentX += (mouseX - currentX) * easing;
        currentY += (mouseY - currentY) * easing;

        // Update gradient position
        bg.style.background = `
            radial-gradient(circle at ${currentX * 100}% ${currentY * 100}%, 
            rgba(255, 61, 113, 0.15) 0%, 
            rgba(0, 212, 255, 0.05) 30%, 
            transparent 70%)
        `;

        requestAnimationFrame(animate);
    }
    animate();

    // Query suggestions
    const chatInput = document.querySelector('.chat-input');
    const analyzeBtn = document.querySelector('.analyze-btn');
    
    document.querySelectorAll('.query-suggestion').forEach(button => {
        button.addEventListener('click', () => {
            chatInput.value = button.textContent;
            chatInput.focus();
        });
    });

    // Analyze button loading state
    async function handleAnalyze() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Show loading state
        analyzeBtn.classList.add('loading');
        analyzeBtn.disabled = true;

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Redirect to hub with query
        window.location.href = `/hub.html?query=${encodeURIComponent(message)}`;
    }

    analyzeBtn.addEventListener('click', handleAnalyze);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAnalyze();
        }
    });

    // Wallet Connection
    const connectWalletBtn = document.getElementById('connect-wallet');
    let walletConnected = false;
    let walletAddress = '';

    connectWalletBtn.addEventListener('click', async () => {
        if (walletConnected) {
            // Toggle dropdown menu
            const menu = document.createElement('div');
            menu.className = 'wallet-menu';
            menu.innerHTML = `
                <button class="disconnect-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3D71" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Disconnect
                </button>
            `;
            
            // Remove existing menu if any
            const existingMenu = document.querySelector('.wallet-menu');
            if (existingMenu) existingMenu.remove();
            
            document.body.appendChild(menu);
            
            // Position the menu below the wallet button
            const buttonRect = connectWalletBtn.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = buttonRect.bottom + 8 + 'px';
            menu.style.right = (window.innerWidth - buttonRect.right) + 'px';
            
            // Handle disconnect click
            const disconnectBtn = menu.querySelector('.disconnect-btn');
            disconnectBtn.addEventListener('click', () => {
                localStorage.removeItem('walletAddress');
                walletConnected = false;
                menu.remove();
                connectWalletBtn.innerHTML = `
                    <span class="wallet-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                    </span>
                    Connect Wallet
                `;
                connectWalletBtn.style.background = 'linear-gradient(135deg, #FF3D71 0%, #00D4FF 100%)';
            });
        }

        connectWalletBtn.innerHTML = `
            <span class="wallet-icon">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    <path d="M12 6v6l4 4"/>
                </svg>
            </span>
            Connecting...
        `;

        try {
            // Check if Phantom Wallet is installed
            const { solana } = window;
            
            if (!solana?.isPhantom) {
                throw new Error('Phantom wallet is not installed');
            }

            // Connect to wallet
            const response = await solana.connect();
            walletAddress = response.publicKey.toString();
            
            walletConnected = true;
            const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
            connectWalletBtn.innerHTML = `
                <span class="wallet-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                </span>
                ${shortAddress}
            `;
            connectWalletBtn.style.background = 'linear-gradient(135deg, #00E096 0%, #00D4FF 100%)';

            // Store wallet address for hub page
            localStorage.setItem('walletAddress', walletAddress);

        } catch (error) {
            console.error('Error connecting wallet:', error);
            connectWalletBtn.innerHTML = `
                <span class="wallet-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                </span>
                Connect Wallet
            `;
        }
    });

    // Check for stored wallet on load
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
        walletConnected = true;
        walletAddress = storedWalletAddress;
        const shortAddress = `${storedWalletAddress.slice(0, 4)}...${storedWalletAddress.slice(-4)}`;
        connectWalletBtn.innerHTML = `
            <span class="wallet-icon">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
            </span>
            ${shortAddress}
        `;
        connectWalletBtn.style.background = 'linear-gradient(135deg, #00E096 0%, #00D4FF 100%)';
    }
});
