import { Request, Response } from 'express';
import UserModel from '../models/User';
import ProductModel from '../models/Product';

// -------------------- Get vendors by status --------------------
export const getPendingVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await UserModel.find({ role: 'vendor', verificationStatus: 'pending' });
    res.status(200).json(vendors);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getVerifiedVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await UserModel.find({ role: 'vendor', verificationStatus: 'approved' });
    res.status(200).json(vendors);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSuspendedVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await UserModel.find({ role: 'vendor', verificationStatus: 'suspended' });
    res.status(200).json(vendors);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- Vendor actions with product management --------------------
export const verifyVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await UserModel.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.verificationStatus = 'approved';
    vendor.vendorVerified = true;
    await vendor.save();

    // Reactivate vendor's products (set status to active)
    await ProductModel.updateMany(
      { vendor: vendor._id },
      { $set: { status: 'active' } }
    );

    const reactivatedCount = await ProductModel.countDocuments({
      vendor: vendor._id,
      status: 'active'
    });

    console.log(`Vendor ${vendor._id} verified. Reactivated ${reactivatedCount} products.`);

    res.status(200).json({ 
      message: 'Vendor verified successfully',
      reactivatedProducts: reactivatedCount
    });
  } catch (err: any) {
    console.error('Verify vendor error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const suspendVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await UserModel.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.verificationStatus = 'suspended';
    vendor.vendorVerified = false;
    await vendor.save();

    // Unlist all vendor's products (set status to unlisted)
    const result = await ProductModel.updateMany(
      { vendor: vendor._id },
      { $set: { status: 'unlisted' } }
    );

    console.log(`Vendor ${vendor._id} suspended. Unlisted ${result.modifiedCount} products.`);

    res.status(200).json({ 
      message: 'Vendor suspended successfully',
      unlistedProducts: result.modifiedCount
    });
  } catch (err: any) {
    console.error('Suspend vendor error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const reactivateVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await UserModel.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.verificationStatus = 'approved';
    vendor.vendorVerified = true;
    await vendor.save();

    // Reactivate vendor's products (set status to active)
    const result = await ProductModel.updateMany(
      { vendor: vendor._id },
      { $set: { status: 'active' } }
    );

    console.log(`Vendor ${vendor._id} reactivated. Reactivated ${result.modifiedCount} products.`);

    res.status(200).json({ 
      message: 'Vendor reactivated successfully',
      reactivatedProducts: result.modifiedCount
    });
  } catch (err: any) {
    console.error('Reactivate vendor error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- Additional vendor management functions --------------------
export const getVendorProducts = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    
    const vendor = await UserModel.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const products = await ProductModel.find({ vendor: vendorId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        businessName: vendor.businessName,
        verificationStatus: vendor.verificationStatus
      },
      products
    });
  } catch (err: any) {
    console.error('Get vendor products error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getVendorStats = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    
    const vendor = await UserModel.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const totalProducts = await ProductModel.countDocuments({ vendor: vendorId });
    const activeProducts = await ProductModel.countDocuments({ 
      vendor: vendorId, 
      status: 'active' 
    });
    const unlistedProducts = await ProductModel.countDocuments({ 
      vendor: vendorId, 
      status: 'unlisted' 
    });

    res.status(200).json({
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        businessName: vendor.businessName,
        verificationStatus: vendor.verificationStatus
      },
      stats: {
        totalProducts,
        activeProducts,
        unlistedProducts
      }
    });
  } catch (err: any) {
    console.error('Get vendor stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
};