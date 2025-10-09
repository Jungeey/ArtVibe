import { Response } from "express";
import Order from "../models/Order";
import { AuthRequest } from "../middleware/auth";

export const getUserOrders = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { page = 1, limit = 10, status, paymentStatus } = req.query;

        console.log("📦 Fetching orders for user ID:", req.user?.id);

        // Use user ID instead of email for filtering
        const filter: any = {
            user: req.user!.id,
        };

        if (status && status !== "all") filter.status = status;
        if (paymentStatus && paymentStatus !== "all")
            filter.paymentStatus = paymentStatus;

        const orders = await Order.find(filter)
            .populate("product", "name price images primaryImage description vendor")
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));

        const total = await Order.countDocuments(filter);

        console.log(`✅ Found ${orders.length} orders for user ${req.user?.email}`);

        // Transform orders with proper populated fields
        const transformedOrders = orders.map(order => {
            const orderAny = order as any;
            return {
                _id: order._id,
                pidx: order.pidx,
                transactionId: order.transactionId,
                user: orderAny.user ? {
                    _id: orderAny.user._id,
                    name: orderAny.user.name,
                    email: orderAny.user.email
                } : null,
                product: orderAny.product ? {
                    _id: orderAny.product._id,
                    name: orderAny.product.name,
                    price: orderAny.product.price,
                    images: orderAny.product.images,
                    primaryImage: orderAny.product.primaryImage,
                    description: orderAny.product.description,
                    vendor: orderAny.product.vendor
                } : null,
                quantity: order.quantity,
                totalAmount: order.totalAmount,
                customerInfo: order.customerInfo,
                shippingAddress: order.shippingAddress, // ADDED: Include shipping address
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        });

        res.json({
            success: true,
            orders: transformedOrders,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        console.error("❌ Get orders error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch orders",
        });
    }
};

export const getOrderById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("product", "name price images primaryImage description vendor")
            .populate("user", "name email");

        if (!order) {
            res.status(404).json({
                success: false,
                error: "Order not found",
            });
            return;
        }

        // Use type assertion for user comparison
        const orderAny = order as any;

        // Check if order belongs to the user using user ID
        if (orderAny.user?._id?.toString() !== req.user!.id) {
            res.status(403).json({
                success: false,
                error: "Access denied",
            });
            return;
        }

        // Transform order with proper populated fields
        const transformedOrder = {
            _id: order._id,
            pidx: order.pidx,
            transactionId: order.transactionId,
            user: orderAny.user ? {
                _id: orderAny.user._id,
                name: orderAny.user.name,
                email: orderAny.user.email
            } : null,
            product: orderAny.product ? {
                _id: orderAny.product._id,
                name: orderAny.product.name,
                price: orderAny.product.price,
                images: orderAny.product.images,
                primaryImage: orderAny.product.primaryImage,
                description: orderAny.product.description,
                vendor: orderAny.product.vendor
            } : null,
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            customerInfo: order.customerInfo,
            shippingAddress: order.shippingAddress, // ADDED: Include shipping address
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        res.json({
            success: true,
            order: transformedOrder,
        });
    } catch (error) {
        console.error("❌ Get order error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch order",
        });
    }
};

export const cancelOrder = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({
                success: false,
                error: "Order not found",
            });
            return;
        }

        // Check ownership using user ID
        if (order.user.toString() !== req.user!.id) {
            res.status(403).json({
                success: false,
                error: "Access denied",
            });
            return;
        }

        // UPDATED: Only allow cancellation for confirmed and processing orders
        const cancellableStatuses = ['confirmed', 'processing'];
        if (!cancellableStatuses.includes(order.status)) {
            res.status(400).json({
                success: false,
                error: "Order can only be cancelled while in confirmed or processing status",
            });
            return;
        }

        // UPDATED: Set status to cancelled
        order.status = "cancelled";
        order.cancellationReason = reason;
        await order.save();

        console.log(`✅ Order ${order._id} cancelled by user ${req.user?.email}`);

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("❌ Cancel order error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to cancel order",
        });
    }
};

export const requestRefund = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({
                success: false,
                error: "Order not found",
            });
            return;
        }

        // Check ownership using user ID
        if (order.user.toString() !== req.user!.id) {
            res.status(403).json({
                success: false,
                error: "Access denied",
            });
            return;
        }

        // UPDATED: Only allow refund for delivered orders
        if (order.status !== "delivered") {
            res.status(400).json({
                success: false,
                error: "Refund can only be requested for delivered orders",
            });
            return;
        }

        // UPDATED: Set both status and paymentStatus to refunded
        order.status = "refunded";
        order.paymentStatus = "refunded";
        order.refundReason = reason;
        await order.save();

        console.log(
            `✅ Refund requested for order ${order._id} by user ${req.user?.email}`
        );

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("❌ Refund request error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to process refund request",
        });
    }
};