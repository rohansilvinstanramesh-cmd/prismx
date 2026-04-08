const OpenAI = require('openai');
require('dotenv').config();

const getAIRecommendations = async (req, res) => {
  try {
    const { context } = req.body;

    const apiKey = process.env.OPENAI_API_KEY || process.env.EMERGENT_LLM_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'AI API key not configured. Please add OPENAI_API_KEY to environment variables.' });
    }

    // Check if using Emergent key - if so, provide helpful mock response
    if (apiKey.startsWith('sk-emergent')) {
      // For demo purposes with Emergent key, provide intelligent mock responses
      const mockRecommendations = [
        "Based on your sales data analysis:\n\n1. **Focus on High-Performers**: North America and Asia Pacific are your top regions. Allocate more resources and run targeted campaigns in these markets.\n\n2. **Revive At-Risk Customers**: Implement a re-engagement campaign for customers who haven't purchased in 90+ days. Consider personalized offers.\n\n3. **Product Diversification**: Enterprise Suite and Cloud Storage are top sellers. Bundle these with other products to increase average order value.\n\n4. **Agent Training**: Top performers are significantly outperforming others. Implement a mentorship program to share best practices.",
        
        "Strategic Recommendations for Revenue Growth:\n\n1. **Seasonal Patterns**: Your Q3 data shows stronger performance. Plan major launches and promotions during this period to maximize impact.\n\n2. **Cross-selling Opportunities**: Customers purchasing Analytics Pro often buy API Access. Create bundled offerings to increase transaction value.\n\n3. **Geographic Expansion**: Middle East shows promising growth potential but lower penetration. Consider targeted market entry strategies.\n\n4. **Customer Lifecycle**: Focus on converting prospects to active customers - your prospect-to-customer conversion rate could improve by 15-20%.",
        
        "Key Insights and Action Items:\n\n1. **Performance Metrics**: Your top 20% of agents generate 60% of revenue. Implement performance bonuses and recognition programs to maintain motivation.\n\n2. **Customer Retention**: Active customers have 3x higher lifetime value. Develop a customer success program focused on onboarding and continuous engagement.\n\n3. **Market Trends**: Security and Analytics products show increasing demand. Consider expanding your product portfolio in these categories.\n\n4. **Pricing Strategy**: Review your pricing tiers - Premium support could be bundled with higher-tier products for improved margins."
      ];
      
      const randomRecommendation = mockRecommendations[Math.floor(Math.random() * mockRecommendations.length)];
      
      return res.json({
        recommendation: randomRecommendation,
        timestamp: new Date(),
        note: 'Demo mode - Add your own OPENAI_API_KEY for real-time AI insights'
      });
    }

    // Use OpenAI SDK with user's own API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a business intelligence advisor for PrismX. Provide concise, actionable business recommendations based on sales data and metrics. Keep responses under 200 words. Format with clear bullet points and strategic focus.'
        },
        {
          role: 'user',
          content: context || 'Provide general business intelligence recommendations for improving sales and customer engagement based on current performance metrics.'
        }
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    const recommendation = completion.choices[0].message.content;

    res.json({
      recommendation,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('AI API Error:', error.message);
    
    // Fallback to intelligent mock response on error
    const fallbackRecommendation = "AI Service Temporarily Unavailable\n\nGeneral Best Practices:\n\n1. **Customer Segmentation**: Focus on high-value customers with personalized engagement strategies\n2. **Sales Team Optimization**: Regular training and performance reviews drive results\n3. **Data-Driven Decisions**: Use your analytics dashboard to identify trends and opportunities\n4. **Market Expansion**: Test new regions with small pilot programs before full rollout\n\nAdd your OPENAI_API_KEY to .env for real-time AI-powered recommendations.";
    
    res.json({ 
      recommendation: fallbackRecommendation,
      timestamp: new Date(),
      note: 'Using fallback recommendations - Configure OPENAI_API_KEY for AI-powered insights'
    });
  }
};

module.exports = { getAIRecommendations };
