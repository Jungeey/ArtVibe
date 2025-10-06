import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product';

export interface IOrder extends Document {
  pidx: string;
  transactionId: string;
  product: IProduct['_id'];
  quantity: number;
  totalAmount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  pidx: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  transactionId: { 
    type: String,
    index: true
  },
  product: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  customerInfo: {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true 
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index for better query performance
OrderSchema.index({ pidx: 1, transactionId: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ product: 1, status: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);