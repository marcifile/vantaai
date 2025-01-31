const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();
const app = express();
const port = 3001;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/hub', (req, res) => {
    res.sendFile(path.join(__dirname, 'hub.html'));
});

// API endpoint for chat responses
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: [
                {
                    role: "system",
                    content: `You are Vanta AI, an advanced market analysis AI. You specialize in providing real-time market insights and predictions.
                    Current market data:
                    - NVIDIA (NVDA): Recently dropped from $142 to $118.56 (-16.5%)
                    - Bitcoin (BTC): $43,250 (+2.3%)
                    - Ethereum (ETH): $2,280 (+1.8%)
                    
                    Provide concise, data-driven responses focused on market analysis. Include specific numbers and percentages when relevant.
                    If discussing NVIDIA, mention the recent significant drop and its implications.`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
            stream: false
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ 
            error: 'Error processing your request',
            details: error.message 
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
