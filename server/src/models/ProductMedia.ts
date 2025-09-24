import mongoose, { Schema, Document, Types } from 'mongoose';
import { IProduct } from './Product';

export interface IProductMedia extends Document {
  product: IProduct['_id'];
  type: 'image' | 'video';
  url: string;
  altText?: string;
  createdAt: Date;
}

const productMediaSchema = new Schema<IProductMedia>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    altText: { type: String, maxlength: 150 },
  },
  { timestamps: true }
);

export default mongoose.model<IProductMedia>('ProductMedia', productMediaSchema);
