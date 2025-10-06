import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../models/Product";
import { IUser } from "../models/User";
import cloudinary from "../config/cloudinary";
import fs from "fs";
import { testCloudinary } from "../config/cloudinary";
import path from "path";

interface AuthRequest extends Request {
  user?: IUser;
}

// Helper function to generate thumbnail URL (simple approach)
const generateThumbnailUrl = (originalUrl: string): string => {
  if (originalUrl.includes("cloudinary.com")) {
    // For Cloudinary: add resize parameter for thumbnail
    return originalUrl.replace("/upload/", "/upload/w_300,h_300,c_fill/");
  } else {
    // For local files: same URL for now (we'll handle resizing later)
    return originalUrl;
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    console.log("=== CREATE PRODUCT DEBUG START ===");
    console.log("📋 Request details:");
    console.log("- User ID:", req.user?._id);
    console.log("- User role:", req.user?.role);
    console.log("- Vendor verified:", req.user?.vendorVerified);

    const { name, description, price, stockQuantity, category } = req.body;

    const generateSKU = () => {
      const prefix = "ART";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const timestamp = Date.now().toString().slice(-4);
      return `${prefix}${randomNum}${timestamp}`;
    };

    console.log("🔍 Parsed fields:");
    console.log("- Name:", name);
    console.log("- Price:", price);
    console.log("- Category:", category);

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Name, price, and category are required",
      });
    }

    // Vendor verification
    if (req.user?.role !== "vendor") {
      return res.status(403).json({
        message: "Only vendors can create products",
      });
    }

    if (!req.user.vendorVerified) {
      return res.status(403).json({
        message: "Please complete vendor verification before creating products",
      });
    }

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        message: "Invalid category ID format",
      });
    }

    console.log("✅ All validations passed");

    // Upload images to Cloudinary
    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];
    const thumbnailUrls: string[] = [];

    if (files && files.length > 0) {
      console.log("🌅 Starting image upload...");

      const cloudinaryAvailable = await testCloudinary();

      if (!cloudinaryAvailable) {
        console.log("⚠️ Cloudinary not available - using local file paths");

        for (const file of files) {
          const filename = path.basename(file.path);
          const imageUrl = `http://localhost:5000/uploads/${filename}`;
          const thumbnailUrl = imageUrl; // Same URL for now

          imageUrls.push(imageUrl);
          thumbnailUrls.push(thumbnailUrl);
          console.log(`📁 Image: ${imageUrl}`);
        }
      } else {
        // Upload to Cloudinary with thumbnail generation
        for (const file of files) {
          try {
            console.log(`📤 Uploading: ${file.originalname}`);

            // Upload original image
            const originalResult = await cloudinary.uploader.upload(file.path, {
              folder: "products",
            });

            // Create thumbnail version
            const thumbnailResult = await cloudinary.uploader.upload(
              file.path,
              {
                folder: "products/thumbnails",
                transformation: [
                  { width: 300, height: 300, crop: "fill" },
                  { quality: "auto" },
                  { format: "webp" },
                ],
              }
            );

            imageUrls.push(originalResult.secure_url);
            thumbnailUrls.push(thumbnailResult.secure_url);
            console.log(`✅ Original: ${originalResult.secure_url}`);
            console.log(`✅ Thumbnail: ${thumbnailResult.secure_url}`);

            // Clean up temp file
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (uploadError: any) {
            console.error("❌ Cloudinary upload failed:", uploadError);
            // Fallback to local path
            const filename = path.basename(file.path);
            const imageUrl = `http://localhost:5000/uploads/${filename}`;
            imageUrls.push(imageUrl);
            thumbnailUrls.push(imageUrl); // Same URL as fallback
          }
        }
      }
    }

    // Prepare product data with thumbnails
    const productData = {
      sku: generateSKU(),
      name: name.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity) || 0,
      category: new mongoose.Types.ObjectId(category),
      vendor: req.user._id,
      images: imageUrls,
      thumbnails: thumbnailUrls,
      primaryImage: imageUrls[0] || "", // Set first image as primary
      status: "active" as const,
    };

    console.log("💾 Product data to save:", {
      ...productData,
      images: productData.images.length,
      thumbnails: productData.thumbnails.length,
    });

    // Create product in database
    const product = await ProductModel.create(productData);
    console.log("✅ Database save successful. Product ID:", product._id);

    // Populate references
    const populatedProduct = await ProductModel.findById(product._id)
      .populate("category", "name")
      .populate("vendor", "name email businessName");

    console.log("🎉 PRODUCT CREATION COMPLETED SUCCESSFULLY");

    res.status(201).json({
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (err: any) {
    console.error("💥 CREATE PRODUCT ERROR:", err.message);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(
        (error: any) => error.message
      );
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Product with this name already exists" });
    }

    res.status(500).json({
      message: "Server error while creating product",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getVendorProducts = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const products = await ProductModel.find({ vendor: req.user._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err: any) {
    console.error("Get vendor products error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      req.user?.role !== "admin" &&
      product.vendor.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await ProductModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err: any) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id)
      .populate("category", "name")
      .populate("vendor", "name email businessName");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (err: any) {
    console.error("Get product by ID error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Authorization check
    if (
      req.user?.role !== "admin" &&
      product.vendor.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      name,
      description,
      price,
      stockQuantity,
      category,
      status,
      imagesToRemove,
    } = req.body;

    // Update fields if provided
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (stockQuantity !== undefined)
      product.stockQuantity = parseInt(stockQuantity);
    if (category !== undefined)
      product.category = new mongoose.Types.ObjectId(category);
    if (status !== undefined) product.status = status;

    // Handle image removal
    if (imagesToRemove) {
      const imagesToRemoveArray = Array.isArray(imagesToRemove)
        ? imagesToRemove
        : [imagesToRemove];
      product.images = product.images.filter(
        (image) => !imagesToRemoveArray.includes(image)
      );
      product.thumbnails = product.thumbnails.filter(
        (thumb, index) => !imagesToRemoveArray.includes(product.images[index])
      );
    }

    // Handle new images
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const newImageUrls: string[] = [];
      const newThumbnailUrls: string[] = [];

      for (const file of files) {
        try {
          // Upload to Cloudinary
          const originalResult = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });

          const thumbnailResult = await cloudinary.uploader.upload(file.path, {
            folder: "products/thumbnails",
            transformation: [
              { width: 300, height: 300, crop: "fill" },
              { quality: "auto" },
            ],
          });

          newImageUrls.push(originalResult.secure_url);
          newThumbnailUrls.push(thumbnailResult.secure_url);
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error("Error uploading new image:", uploadError);
          // Fallback to local
          const filename = path.basename(file.path);
          const imageUrl = `http://localhost:5000/uploads/${filename}`;
          newImageUrls.push(imageUrl);
          newThumbnailUrls.push(imageUrl);
        }
      }

      // Add new images to existing ones
      product.images = [...product.images, ...newImageUrls];
      product.thumbnails = [...product.thumbnails, ...newThumbnailUrls];
    }

    // Update primary image if needed
    if (product.images.length > 0 && !product.primaryImage) {
      product.primaryImage = product.images[0];
    }

    await product.save();

    const updatedProduct = await ProductModel.findById(product._id)
      .populate("category", "name")
      .populate("vendor", "name email");

    res
      .status(200)
      .json({ message: "Product updated", product: updatedProduct });
  } catch (err: any) {
    console.error("Update product error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllActiveProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.find({ status: "active" })
      .populate("category", "name")
      .populate("vendor", "name businessName")
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err: any) {
    console.error("Get all active products error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
