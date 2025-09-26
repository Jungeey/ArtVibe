import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { ICategory } from './Category';

export interface IProduct extends Document {
  sku: string;
  slug: string; // ADD THIS
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  status: 'active' | 'unlisted';
  images: string[];
  category: ICategory['_id'];
  vendor: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema: Schema = new Schema(
  {
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    slug: { // ADD THIS FIELD
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true
    },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'unlisted'], default: 'active' },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// ADD SLUG GENERATION (from name)
productSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate SKU if not provided
    if (!this.sku) {
      const generateSKU = () => {
        const prefix = 'ART';
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const timestamp = Date.now().toString().slice(-4);
        return `${prefix}${randomNum}${timestamp}`;
      };
      this.sku = generateSKU();
    }
    
    // Generate slug from name
    if (!this.slug && this.name) {
      const baseSlug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Add random string to ensure uniqueness
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      this.slug = `${baseSlug}-${randomSuffix}`;
    }
  }
  next();
});

export default mongoose.model<IProduct>('Product', productSchema);