const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();
const app = express();
const port = 3001;

// Initialize OpenAI with project API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
    defaultHeaders: {
        'OpenAI-Beta': 'project-apis'
    }
});

// Enable CORS
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/hub.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'hub.html'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/hub.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'hub.js'));
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

// Serve static files for assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve other static files
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/hub.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'hub.js'));
});

app.get('/hub.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'hub.html'));
});

// API endpoint for chat responses
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        console.log('Attempting API call with key:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
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
        console.error('OpenAI API Error:', {
            message: error.message,
            type: error.type,
            code: error.code,
            param: error.param,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Error processing your request',
            details: error.message,
            type: error.type,
            code: error.code
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
