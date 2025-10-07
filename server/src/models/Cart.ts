import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

export interface ICartItem {
  product: IProduct['_id'];
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface ICart extends Document {
  user: IUser['_id'];
  items: ICartItem[];
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema: Schema = new Schema({
  product: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 100
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  name: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
  }
});

const cartSchema: Schema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  total: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  itemCount: { 
    type: Number, 
    default: 0,
    min: 0 
  }
}, { 
  timestamps: true 
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.itemCount = this.items.reduce((sum: number, item: ICartItem) => sum + item.quantity, 0);
  this.total = this.items.reduce((sum: number, item: ICartItem) => sum + (item.price * item.quantity), 0);
  next();
});

cartSchema.index({ user: 1 });

export default mongoose.model<ICart>('Cart', cartSchema);