import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { ICategory } from './Category';

export interface IProduct extends Document {
  sku: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  status: 'active' | 'unlisted';
  // Enhanced media fields
  images: string[];          // Original images (backward compatible)
  thumbnails: string[];      // Thumbnail versions
  primaryImage: string;      // Main display image
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
    slug: {
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
    
    // Simple media enhancement
    images: [{ type: String }],      // Original image URLs
    thumbnails: [{ type: String }],  // Thumbnail URLs (same order as images)
    primaryImage: { type: String },  // Main image URL
    
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Auto-generate SKU and slug
productSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate SKU
    if (!this.sku) {
      const generateSKU = () => {
        const prefix = "ART";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const timestamp = Date.now().toString().slice(-4);
        return `${prefix}${randomNum}${timestamp}`;
      };
      this.sku = generateSKU();
    }
    
    // Generate slug
    if (!this.slug && this.name) {
      const baseSlug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      this.slug = `${baseSlug}-${randomSuffix}`;
    }
    
    // Set primary image as first image
    if (this.images && this.images.length > 0 && !this.primaryImage) {
      this.primaryImage = this.images[0];
    }
  }
  next();
});

export default mongoose.model<IProduct>('Product', productSchema);