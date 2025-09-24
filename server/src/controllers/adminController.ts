import { Request, Response } from 'express';
import UserModel from '../models/User';

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

// -------------------- Vendor actions --------------------
export const verifyVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await UserModel.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') return res.status(404).json({ message: 'Vendor not found' });

    vendor.verificationStatus = 'approved';
    vendor.vendorVerified = true;
    await vendor.save();

    res.status(200).json({ message: 'Vendor verified successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const suspendVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await UserModel.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') return res.status(404).json({ message: 'Vendor not found' });

    vendor.verificationStatus = 'suspended';
    vendor.vendorVerified = false;
    await vendor.save();

    res.status(200).json({ message: 'Vendor suspended successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const reactivateVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await UserModel.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') return res.status(404).json({ message: 'Vendor not found' });

    vendor.verificationStatus = 'approved';
    vendor.vendorVerified = true;
    await vendor.save();

    res.status(200).json({ message: 'Vendor reactivated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
