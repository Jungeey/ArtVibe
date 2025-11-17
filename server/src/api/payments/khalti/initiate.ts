import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/payments/khalti/initiate', async (req, res) => {
  try {
    const payload = req.body;
    
    const response = await fetch('https://dev.khalti.com/api/v2/epayment/initiate/', {
      method: 'POST',
      headers: {
        'Authorization': `Key 3e149db413474bfaa6e379e15af46275`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    console.log('Khalti initiate response status:', response.status);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Khalti initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});