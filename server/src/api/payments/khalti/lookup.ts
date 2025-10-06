
import express from 'express';

const app = express();
app.use(express.json());
app.post('/api/payments/khalti/lookup', async (req, res) => {
  try {
    const { pidx } = req.body;
    
    const response = await fetch('https://dev.khalti.com/api/v2/epayment/lookup/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Khalti lookup error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});