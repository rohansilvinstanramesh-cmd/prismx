const axios = require('axios');
require('dotenv').config();

const getAIRecommendations = async (req, res) => {
  try {
    const { context } = req.body;

    const apiKey = process.env.EMERGENT_LLM_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'AI API key not configured' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence advisor for PrismX. Provide concise, actionable business recommendations based on sales data and metrics. Keep responses under 200 words.'
          },
          {
            role: 'user',
            content: context || 'Provide general business intelligence recommendations for improving sales and customer engagement.'
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const recommendation = response.data.choices[0].message.content;

    res.json({
      recommendation,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to get AI recommendations',
      error: error.response?.data?.error?.message || error.message 
    });
  }
};

module.exports = { getAIRecommendations };