const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});

console.log('Test server file created successfully');
