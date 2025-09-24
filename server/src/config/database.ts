import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('❌ MONGODB_URI not found in environment variables');
      console.log('💡 Server running without database connection');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`🗄️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('❌ Database connection failed:', (error as Error).message);
    console.log('💡 Server running without database connection');
    // Don't exit process, let server run without DB
  }
};

export default connectDB;