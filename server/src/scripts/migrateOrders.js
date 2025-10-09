const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User'); // Your user model

const migrateOrders = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/your-database');
    
    const orders = await Order.find({ user: { $exists: false } });
    
    console.log(`Found ${orders.length} orders without user reference`);
    
    for (const order of orders) {
      // Find user by email from customerInfo
      const user = await User.findOne({ email: order.customerInfo.email });
      
      if (user) {
        order.user = user._id;
        await order.save();
        console.log(`✅ Updated order ${order._id} with user ${user.email}`);
      } else {
        console.log(`❌ No user found for email: ${order.customerInfo.email}`);
      }
    }
    
    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateOrders();