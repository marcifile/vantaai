const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message } = JSON.parse(event.body);

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

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ response: completion.choices[0].message.content })
        };
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Error processing your request',
                details: error.message
            })
        };
    }
};
