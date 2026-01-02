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
    const { lockData } = req.body;

    if (!lockData) {
      return res.status(400).json({
        success: false,
        error: 'lockData is required',
        message: 'Lock data (encrypt_payload) is required to issue card'
      });
    }

    console.log('[Hardware Service] Card issuance request received', {
      lock_data_length: lockData.length
    });

    const result = await cardService.issueCard(lockData);

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

