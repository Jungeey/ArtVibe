import mongoose, { Schema, Document, Types } from 'mongoose';
import { IProduct } from './Product';

// User interface for population
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

// Shipping address interface
export interface IShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  pidx: string;
  transactionId: string;
  product: IProduct['_id'];
  user: Types.ObjectId;
  quantity: number;
  totalAmount: number;
  
  // Customer Information
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Shipping Information
  shippingAddress: IShippingAddress;
  
  // Order Status Flow (Simplified realistic flow)
  status: 'confirmed' | 'processing' | 'ready_to_ship' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
  
  // Payment Status (Simplified - only completed or refunded)
  paymentStatus: 'completed' | 'refunded';
  
  // Shipping Information
  shipping: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
  };
  
  // Timeline for order tracking
  timeline: {
    orderedAt: Date;
    confirmedAt?: Date;
    processingAt?: Date;
    readyToShipAt?: Date;
    shippedAt?: Date;
    outForDeliveryAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
  };
  
  // Additional fields
  notes?: string;
  cancellationReason?: string;
  refundReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// For populated order (when user and product are populated)
export interface IOrderPopulated extends Omit<IOrder, 'user' | 'product'> {
  user: IUser;
  product: IProduct;
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
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
  
  // Customer Information
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
  
  // Shipping Address
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Nepal' },
    phone: { type: String, required: true }
  },
  
  // Order Status Flow (Simplified)
  status: { 
    type: String, 
    enum: [
      'confirmed',        // Payment successful, order confirmed
      'processing',       // Items being packed
      'ready_to_ship',    // Ready for pickup by delivery partner
      'shipped',          // With delivery partner
      'out_for_delivery', // On the way to customer
      'delivered',        // Successfully delivered
      'cancelled',        // Order cancelled
      'refunded',         // Refund processed
      'failed'           // Delivery failed/returned
    ],
    default: 'confirmed' // Start with confirmed since payment is done
  },
  
  // Payment Status (Simplified)
  paymentStatus: {
    type: String,
    enum: ['completed', 'refunded'],
    default: 'completed'
  },
  
  // Shipping Information
  shipping: {
    carrier: { type: String },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date }
  },
  
  // Timeline for order tracking
  timeline: {
    orderedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date, default: Date.now },
    processingAt: { type: Date },
    readyToShipAt: { type: Date },
    shippedAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date }
  },
  
  // Additional fields
  notes: { type: String },
  cancellationReason: { type: String },
  refundReason: { type: String }
}, {
  timestamps: true
});

// Indexes for better query performance
OrderSchema.index({ pidx: 1, transactionId: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ product: 1, status: 1 });
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });
OrderSchema.index({ 'shipping.trackingNumber': 1 });

// Auto-update timeline when status changes
OrderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'processing':
        this.timeline.processingAt = now;
        break;
      case 'ready_to_ship':
        this.timeline.readyToShipAt = now;
        break;
      case 'shipped':
        this.timeline.shippedAt = now;
        this.shipping.shippedAt = now;
        break;
      case 'out_for_delivery':
        this.timeline.outForDeliveryAt = now;
        break;
      case 'delivered':
        this.timeline.deliveredAt = now;
        this.shipping.deliveredAt = now;
        break;
      case 'cancelled':
        this.timeline.cancelledAt = now;
        break;
      case 'refunded':
        // Refunded status update
        break;
      case 'failed':
        // Failed status update
        break;
    }
  }
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);