import express from 'express';
import { initiateKhaltiPayment, lookupKhaltiPayment } from '../controllers/paymentController';

const router = express.Router();

router.post('/khalti/initiate', initiateKhaltiPayment);
router.post('/khalti/lookup', lookupKhaltiPayment);

export default router;