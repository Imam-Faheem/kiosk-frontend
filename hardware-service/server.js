const express = require('express');
const cors = require('cors');
const cardService = require('./src/services/card.service');

const app = express();
const PORT = process.env.HARDWARE_SERVICE_PORT || 9000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hardware-service' });
});

// Issue card endpoint
app.post('/api/card/issue', async (req, res) => {
  try {
    const { cardData, hotelInfo, lockData } = req.body;

    // Support both new format (cardData) and legacy format (lockData)
    const finalCardData = cardData || lockData;

    if (!finalCardData) {
      return res.status(400).json({
        success: false,
        error: 'cardData or lockData is required',
        message: 'Card data (from TTLock getCardData API) is required to issue card'
      });
    }

    console.log('[Hardware Service] Card issuance request received', {
      card_data_length: finalCardData.length,
      has_hotel_info: !!hotelInfo,
      using_legacy_format: !!lockData
    });

    const result = await cardService.issueCard(finalCardData, hotelInfo);

    res.json(result);
  } catch (error) {
    console.error('[Hardware Service] Card issuance failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Card issuance failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Hardware Service running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Issue Card: POST http://localhost:${PORT}/api/card/issue`);
});

module.exports = app;

