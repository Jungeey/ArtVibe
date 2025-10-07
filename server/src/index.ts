import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes'; 
import cartRoutes from './routes/cartRoutes'; // Import cart routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', orderRoutes);

app.use('/api/cart', cartRoutes); // Use cart routes

// Connect to database
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug route to check all routes
app.get('/api/debug/routes', (req, res) => {
  res.json({
    message: 'Available API routes',
    timestamp: new Date().toISOString(),
    routes: {
      orders: [
        'POST /api/orders',
        'GET /api/orders/pidx/:pidx',
        'GET /api/orders/product/:productId'
      ],
      payments: [
        'POST /api/payments/khalti/initiate',
        'POST /api/payments/khalti/lookup'
      ],
      products: [
        'GET /api/products',
        'POST /api/products',
        'GET /api/products/:id',
        'PUT /api/products/:id',
        'DELETE /api/products/:id'
      ],
      cart: [
        'GET /api/cart',
        'POST /api/cart/add',
        'PUT /api/cart/update/:productId',
        'DELETE /api/cart/remove/:productId',
        'DELETE /api/cart/clear',
        'POST /api/cart/sync'
      ]
      
    }
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Order API: http://localhost:${PORT}/api/orders`);
  console.log(`💳 Payment API: http://localhost:${PORT}/api/payments`);
  console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.log('🚨 UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.log('🚨 UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

export default app;