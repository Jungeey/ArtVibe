import { Request, Response } from 'express';
import {
  KhaltiInitiateRequest,
  KhaltiInitiateResponse,
  KhaltiLookupRequest,
  KhaltiLookupResponse,
  KhaltiErrorResponse
} from '../models/khalti';

export const initiateKhaltiPayment = async (req: Request, res: Response) => {
  try {
    const payload: KhaltiInitiateRequest = req.body;
    
    // Validate required fields
    const requiredFields: (keyof KhaltiInitiateRequest)[] = ['return_url', 'website_url', 'amount', 'purchase_order_id', 'purchase_order_name'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        return res.status(400).json({
          error: `Missing required field: ${field}`,
          error_key: 'validation_error'
        });
      }
    }

    // Validate amount (minimum 1000 paisa = 10 NPR)
    if (payload.amount < 1000) {
      return res.status(400).json({
        amount: ['Amount should be greater than Rs. 10, that is 1000 paisa.'],
        error_key: 'validation_error'
      });
    }

    const khaltiResponse = await fetch('https://dev.khalti.com/api/v2/epayment/initiate/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: KhaltiInitiateResponse | KhaltiErrorResponse = await khaltiResponse.json() as any;
    
    if (!khaltiResponse.ok) {
      const errorData = data as KhaltiErrorResponse;
      return res.status(khaltiResponse.status).json(errorData);
    }

    const successData = data as KhaltiInitiateResponse;

    // Store payment initiation in your database if needed
    console.log('Payment initiated:', {
      pidx: successData.pidx, // This should now work without TypeScript error
      purchase_order_id: payload.purchase_order_id,
      amount: payload.amount,
      status: 'initiated'
    });

    res.json(successData);
  } catch (error) {
    console.error('Khalti initiation error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const lookupKhaltiPayment = async (req: Request, res: Response) => {
  try {
    const { pidx }: KhaltiLookupRequest = req.body;

    if (!pidx) {
      return res.status(400).json({
        error: 'pidx is required',
        error_key: 'validation_error'
      });
    }

    const khaltiResponse = await fetch('https://dev.khalti.com/api/v2/epayment/lookup/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    const data: KhaltiLookupResponse | KhaltiErrorResponse = await khaltiResponse.json() as any;
    
    if (!khaltiResponse.ok) {
      const errorData = data as KhaltiErrorResponse;
      return res.status(khaltiResponse.status).json(errorData);
    }

    const lookupData = data as KhaltiLookupResponse;
    res.json(lookupData);
  } catch (error) {
    console.error('Khalti lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};