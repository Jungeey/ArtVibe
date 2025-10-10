import express from 'express';
import { register, login } from '../controllers/auth.controller';
import profileRoutes from './profileRoutes';

const router = express.Router();

router.use(profileRoutes);

router.post('/register', register);
router.post('/login', login);

export default router;
