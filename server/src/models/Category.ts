import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: ICategory['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, maxlength: 300 },
    parent: { type: Schema.Types.ObjectId, ref: 'Category' }, // For subcategories
  },
  { timestamps: true }
);

// Generate slug automatically if missing
categorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').substring(0, 100);
  }
  next();
});

export default mongoose.model<ICategory>('Category', categorySchema);
