import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'vendor' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'suspended';
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  businessName?: string;
  businessLicense?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  vendorVerified?: boolean;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: Date;
  businessDescription?: string;
  taxId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// -------------------- Schema --------------------
const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] 
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user','vendor','admin'], default: 'user' },
  phone: { type: String, match: [/^\+?[\d\s\-()]+$/, 'Please enter a valid phone number'] },
  address: { type: String, maxlength: 255 },

  // Vendor-specific fields (conditionally required)
  businessName: { type: String, required: function() { return this.role === 'vendor'; }, trim: true, maxlength: 100 },
  businessLicense: { type: String, required: function() { return this.role === 'vendor'; }, unique: true, sparse: true },
  website: { type: String, match: [/^https?:\/\/.+\..+$/, 'Please enter a valid website URL'] },
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
  },
  vendorVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['pending','approved','suspended'], default: 'pending' },
  verificationNotes: String,
  verifiedAt: Date,
  businessDescription: { type: String, maxlength: 500 },
  taxId: { type: String, match: [/^[A-Z0-9]{9,15}$/, 'Please enter a valid tax ID'] },
}, { timestamps: true });

// -------------------- Middleware --------------------

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// -------------------- Model --------------------
const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;
