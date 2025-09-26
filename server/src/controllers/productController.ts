import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../models/Product";
import { IUser } from "../models/User";
import cloudinary from "../config/cloudinary";
import fs from "fs";
import { testCloudinary } from "../config/cloudinary";

interface AuthRequest extends Request {
  user?: IUser;
}

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    console.log("=== CREATE PRODUCT DEBUG START ===");
    console.log("📋 Request details:");
    console.log("- User ID:", req.user?._id);
    console.log("- User role:", req.user?.role);
    console.log("- Vendor verified:", req.user?.vendorVerified);
    console.log("- Headers:", req.headers);

    console.log("📦 Request body fields:");
    console.log("- Body keys:", Object.keys(req.body));
    console.log("- Raw body:", req.body);

    const { name, description, price, stockQuantity, category } = req.body;

    const generateSKU = () => {
      const prefix = "ART";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const timestamp = Date.now().toString().slice(-4);
      return `${prefix}${randomNum}${timestamp}`;
    };

    console.log("🔍 Parsed fields:");
    console.log("- Name:", name, "(type:", typeof name, ")");
    console.log("- Price:", price, "(type:", typeof price, ")");
    console.log("- Category:", category, "(type:", typeof category, ")");
    console.log("- Description:", description);
    console.log("- Stock quantity:", stockQuantity);

    // Check if files are received
    console.log("📸 Files info:");
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      console.log("- Number of files:", files.length);
      files.forEach((file, index) => {
        console.log(`  File ${index + 1}:`, {
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: file.path,
        });
      });
    } else {
      console.log("- No files received");
    }

    // Validation
    if (!name || !price || !category) {
      console.log("❌ Validation failed - missing fields");
      console.log("- Name provided:", !!name);
      console.log("- Price provided:", !!price);
      console.log("- Category provided:", !!category);
      return res.status(400).json({
        message: "Name, price, and category are required",
      });
    }

    // Vendor verification
    if (req.user?.role !== "vendor") {
      console.log("❌ Access denied - user is not a vendor");
      return res.status(403).json({
        message: "Only vendors can create products",
      });
    }

    if (!req.user.vendorVerified) {
      console.log("❌ Access denied - vendor not verified");
      return res.status(403).json({
        message: "Please complete vendor verification before creating products",
      });
    }

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(category)) {
      console.log("❌ Invalid category ID format:", category);
      return res.status(400).json({
        message: "Invalid category ID format",
      });
    }

    console.log("✅ All validations passed");

    // Upload images to Cloudinary
    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];

    // In your createProduct function, update the image upload section:
    if (files && files.length > 0) {
      console.log("🌅 Starting image upload to Cloudinary...");

      // Test Cloudinary first
      const cloudinaryAvailable = await testCloudinary();

      if (!cloudinaryAvailable) {
        console.log(
          "⚠️ Cloudinary not available - saving with local image paths"
        );
        // Save local file paths temporarily
        files.forEach((file) => {
          imageUrls.push(`http://localhost:5000/uploads/${file.filename}`);
        });
      } else {
        // Upload to Cloudinary
        for (const file of files) {
          try {
            console.log(`📤 Uploading: ${file.originalname}`);
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products",
            });
            imageUrls.push(result.secure_url);
            console.log(`✅ Upload successful: ${result.secure_url}`);

            // Clean up temp file
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log(`🧹 Temp file deleted: ${file.path}`);
            }
          } catch (uploadError: any) {
            console.error("❌ Cloudinary upload failed:", uploadError);
            // Fallback to local path
            imageUrls.push(`http://localhost:5000/uploads/${file.filename}`);
            console.log(
              `🔄 Using local path as fallback: /uploads/${file.filename}`
            );
          }
        }
      }
    }

    // Prepare product data
    const productData = {
      sku: generateSKU(),
      name: name.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity) || 0,
      category: new mongoose.Types.ObjectId(category),
      vendor: req.user._id,
      images: imageUrls,
      status: "active" as const,
    };

    console.log(
      "💾 Product data to save:",
      JSON.stringify(productData, null, 2)
    );

    // Create product in database
    console.log("💾 Saving to database...");
    const product = await ProductModel.create(productData);
    console.log("✅ Database save successful. Product ID:", product._id);

    // Populate references
    console.log("🔍 Populating references...");
    const populatedProduct = await ProductModel.findById(product._id)
      .populate("category", "name")
      .populate("vendor", "name email businessName");

    console.log("🎉 PRODUCT CREATION COMPLETED SUCCESSFULLY");
    console.log("=== CREATE PRODUCT DEBUG END ===");

    res.status(201).json({
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (err: any) {
    console.error("💥 CREATE PRODUCT ERROR DETAILS:");
    console.error("=== ERROR START ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Full error object:", JSON.stringify(err, null, 2));

    if (err.errors) {
      console.error("Validation errors:");
      Object.keys(err.errors).forEach((key) => {
        console.error(`- ${key}:`, err.errors[key].message);
      });
    }

    console.error("Stack trace:", err.stack);
    console.error("=== ERROR END ===");

    // Specific error handling
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(
        (error: any) => error.message
      );
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid data format",
      });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      if (field === "sku") {
        return res.status(400).json({
          message: "SKU generation conflict. Please try again.",
        });
      }
      return res.status(400).json({
        message: "Product with this name already exists",
      });
    }

    res.status(500).json({
      message: "Server error while creating product",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
export const getVendorProducts = async (req: AuthRequest, res: Response) => {
  try {
    console.log("Fetching vendor products for user:", req.user?._id);

    if (req.user?.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const products = await ProductModel.find({ vendor: req.user._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    console.log(`Found ${products.length} products for vendor`);

    res.status(200).json({ products });
  } catch (err: any) {
    console.error("Get vendor products error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Deleting product ${id} for user:`, req.user?._id);

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
    console.log("Product deleted successfully");
    res.status(200).json({ message: "Product deleted" });
  } catch (err: any) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("Fetching product by ID:", id);

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
    console.log(`Updating product ${id} for user:`, req.user?._id);
    console.log("Request body:", req.body);
    console.log("Files:", req.files);

    const product = await ProductModel.findById(id);
    if (!product) {
      console.log("Product not found:", id);
      return res.status(404).json({ message: "Product not found" });
    }

    // Authorization check
    if (
      req.user?.role !== "admin" &&
      product.vendor.toString() !== req.user?._id.toString()
    ) {
      console.log("Unauthorized update attempt");
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
      console.log("Images to remove:", imagesToRemoveArray);

      product.images = product.images.filter(
        (image) => !imagesToRemoveArray.includes(image)
      );

      // Optionally delete from Cloudinary (you might want to implement this)
      // for (const imageUrl of imagesToRemoveArray) {
      //   // Extract public_id from Cloudinary URL and delete
      // }
    }

    // Handle new images
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      console.log(`Adding ${files.length} new images`);
      const newImageUrls: string[] = [];
      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
          newImageUrls.push(result.secure_url);
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error("Error uploading new image:", uploadError);
        }
      }
      // Add new images to existing ones
      product.images = [...product.images, ...newImageUrls];
    }

    await product.save();

    // Populate before sending response
    const updatedProduct = await ProductModel.findById(product._id)
      .populate("category", "name")
      .populate("vendor", "name email");

    console.log("Product updated successfully");
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
    console.log("Fetching all active products");
    const products = await ProductModel.find({ status: "active" })
      .populate("category", "name")
      .populate("vendor", "name businessName")
      .sort({ createdAt: -1 });

    console.log(`Found ${products.length} active products`);
    res.status(200).json({ products });
  } catch (err: any) {
    console.error("Get all active products error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
