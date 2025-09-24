import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface IProduct extends Document {
  // Basic Info
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;

  // Pricing
  price: number;
  comparePrice?: number;
  costPrice?: number;
  taxRate: number;

  // Inventory
  stockQuantity: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  lowStockAlert: number;

  // Categorization
  category: Types.ObjectId;
  subcategory?: Types.ObjectId;
  tags: string[];
  brand?: string;

  // Media
  images: string[];
  videos: string[];
  thumbnail?: string;

  // Vendor Info
  vendor: IUser['_id'];
  vendorSku?: string;

  // Variants
  hasVariants: boolean;
  variants?: {
    size?: string[];
    color?: string[];
    material?: string[];
    style?: string[];
  };
  parentProduct?: Types.ObjectId; // For variants
  variantProducts: Types.ObjectId[];

  // Shipping
  weight: number;
  dimensions: { length: number; width: number; height: number };
  shippingClass?: string;
  freeShipping: boolean;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  metaKeywords: string[];

  // Status
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  publishedAt?: Date;

  // Analytics
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;

  // Reviews
  averageRating: number;
  reviewCount: number;

  // Digital product
  isDigital: boolean;
  digitalFile?: string;
  downloadLimit?: number;
  downloadExpiry?: number;

  // Subscription product
  isSubscription: boolean;
  subscriptionInterval?: 'day' | 'week' | 'month' | 'year';
  subscriptionPeriod?: number;

  // Methods
  isLowStock(): boolean;
  inStock(): boolean;
}

const productSchema = new Schema<IProduct>(
  {
    // ------------------- Basic Info -------------------
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    shortDescription: { type: String, maxlength: 300 },
    sku: { type: String, required: true, unique: true, uppercase: true },

    // ------------------- Pricing -------------------
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },

    // ------------------- Inventory -------------------
    stockQuantity: { type: Number, default: 0, min: 0 },
    trackQuantity: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    lowStockAlert: { type: Number, default: 5 },

    // ------------------- Categorization -------------------
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: String, lowercase: true }],
    brand: { type: String, trim: true },

    // ------------------- Media -------------------
    images: [{ type: String }],
    videos: [{ type: String }],
    thumbnail: { type: String },

    // ------------------- Vendor -------------------
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendorSku: { type: String },

    // ------------------- Variants -------------------
    hasVariants: { type: Boolean, default: false },
    variants: {
      size: [{ type: String }],
      color: [{ type: String }],
      material: [{ type: String }],
      style: [{ type: String }],
    },
    parentProduct: { type: Schema.Types.ObjectId, ref: 'Product' },
    variantProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

    // ------------------- Shipping -------------------
    weight: { type: Number, default: 0 },
    dimensions: { length: { type: Number, default: 0 }, width: { type: Number, default: 0 }, height: { type: Number, default: 0 } },
    shippingClass: { type: String },
    freeShipping: { type: Boolean, default: false },

    // ------------------- SEO -------------------
    seoTitle: { type: String, maxlength: 60 },
    seoDescription: { type: String, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    metaKeywords: [{ type: String, lowercase: true }],

    // ------------------- Status -------------------
    status: { type: String, enum: ['draft', 'active', 'inactive', 'out_of_stock'], default: 'draft' },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date },

    // ------------------- Analytics -------------------
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },

    // ------------------- Reviews -------------------
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // ------------------- Digital Product -------------------
    isDigital: { type: Boolean, default: false },
    digitalFile: { type: String, required: function () { return this.isDigital; } },
    downloadLimit: { type: Number },
    downloadExpiry: { type: Number },

    // ------------------- Subscription -------------------
    isSubscription: { type: Boolean, default: false },
    subscriptionInterval: { type: String, enum: ['day', 'week', 'month', 'year'], required: function () { return this.isSubscription; } },
    subscriptionPeriod: { type: Number },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ------------------- Virtuals -------------------
productSchema.virtual('discountPercentage').get(function (this: IProduct) {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

productSchema.virtual('inStock').get(function (this: IProduct) {
  if (!this.trackQuantity) return true;
  if (this.allowBackorder) return true;
  return this.stockQuantity > 0;
});

// ------------------- Indexes -------------------
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: -1, status: 1 });

// ------------------- Pre-save Middleware -------------------
productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').substring(0, 100);
  }

  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// ------------------- Methods -------------------
productSchema.methods.isLowStock = function () {
  return this.trackQuantity && this.stockQuantity <= this.lowStockAlert;
};

export default mongoose.model<IProduct>('Product', productSchema);
