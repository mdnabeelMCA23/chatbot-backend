const Message = require('../models/Message');
const axios = require('axios');
require('dotenv').config();

exports.chatWithBot = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Valid message string is required" });
  }

  console.log("Sending message to OpenRouter:", message);
  console.log("API Key Loaded:", process.env.OPENAI_API_KEY?.slice(0, 5) + '...');

  try {
    const botResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "deepseek/deepseek-r1:free", // or another model you have access to
      messages: [{ role: "user", content: message }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5000',  // Required by OpenRouter
        'X-Title': 'ChatBot App'                 // Optional but good to include
      }
    });

    console.log("OpenRouter raw response:", JSON.stringify(botResponse.data, null, 2));

    const reply = botResponse.data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Invalid response from OpenRouter");

    const savedMessage = await Message.create({
      userMessage: message,
      botReply: reply
    });

    res.json(savedMessage);
  } catch (err) {
    if (err.response) {
      console.error("OpenRouter API Error Response:", JSON.stringify(err.response.data, null, 2));
      res.status(500).json({
        error: 'OpenRouter API error',
        details: err.response.data
      });
    } else if (err.request) {
      console.error("No response received from OpenRouter:", err.request);
      res.status(500).json({
        error: 'No response from OpenRouter',
      });
    } else {
      console.error("Unexpected Error:", err.message);
      res.status(500).json({
        error: 'Unexpected error',
        message: err.message
      });
    }
  }
};
