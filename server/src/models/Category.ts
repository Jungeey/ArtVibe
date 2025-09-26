// server/src/models/Category.ts
import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string; // optional
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String }, // add this line
  },
  { timestamps: true }
);

export default model<ICategory>('Category', categorySchema);
