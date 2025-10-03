import { Router, type Request, type Response } from "express";
import {
    QueryCommand,
    ScanCommand,
    PutCommand,
    DeleteCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "../data/db.js";
import { CartSchema } from "../data/zod.js";
import type { IdParam, ErrorResponse } from "../data/types.js";
import z from "zod";

const router = Router();

const myTable = "CandyShop";

export type CartItem = z.infer<typeof CartSchema>;

interface IdParamUserProduct {
    userId: string;
    productId: string;
}

const PostCartSchema = z.object({
    productId: z.string().min(1).max(50),
    userId: z.string().min(1).max(50),
    amount: z.number().nonnegative().max(9999),
});

type PostCartItem = z.infer<typeof PostCartSchema>;

const UpdateCartSchema = z.object({
    amount: z.number().nonnegative().max(9999),
});

type UpdateCartItem = z.infer<typeof UpdateCartSchema>;

const CartArraySchema = z.array(CartSchema);

type CartItemArray = z.infer<typeof CartArraySchema>;

interface DeleteResponse {
    message: string;
    userId: string;
    productId: string;
}

interface UpdateResponse {
    message: string;
    parsed: {
        amount: number;
    };
}

// GET /api/cart, kanske inte behövs
router.get(
    "/",
    async (req: Request, res: Response<CartItemArray | ErrorResponse>) => {
        try {
            const command = new ScanCommand({
                TableName: myTable,
                FilterExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "CART",
                },
            });

            const result = await db.send(command);

            const items: CartItem[] = CartArraySchema.parse(result.Items ?? []);

            return res.status(200).json(items);
        } catch (error: any) {
            console.error("Error fetching all carts:", error.message);
            return res.status(500).json({
                message: "Something went wrong",
                errors: error.message,
            });
        }
    }
);

// GET /api/cart/:userId
router.get(
    "/:id",
    async (
        req: Request<IdParam>,
        res: Response<CartItemArray | ErrorResponse>
    ) => {
        const { id } = req.params;

        try {
            const command = new QueryCommand({
                TableName: myTable,
                KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
                ExpressionAttributeValues: {
                    ":pk": "CART",
                    ":sk": `USER#${id}#PRODUCT#`,
                },
            });

            const result = await db.send(command);

            const items: CartItem[] = CartArraySchema.parse(result.Items ?? []);

            if (items.length === 0) {
                return res.status(404).json({
                    message: "No cart items found for this user",
                });
            }

            return res.status(200).json(items);
        } catch (error: any) {
            console.error("Error fetching user cart:", error.message);
            return res.status(500).json({
                message: "Something went wrong",
                errors: error.message,
            });
        }
    }
);

// POST /api/cart
router.post(
    "/",
    async (
        req: Request<PostCartItem>,
        res: Response<CartItem | ErrorResponse>
    ) => {
        try {
            const parsed = CartSchema.parse({
                pk: "CART",
                sk: `USER#${req.body.userId}#PRODUCT#${req.body.productId}`,
                userId: req.body.userId,
                productId: req.body.productId,
                amount: req.body.amount,
            });

            const command = new PutCommand({
                TableName: myTable,
                Item: parsed,
            });

            await db.send(command);

            return res
                .status(201)
                .json({ message: "Item added to cart", ...parsed });
        } catch (error: any) {
            if (error.errors) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.errors,
                });
            }
            console.error("Error adding item to cart:", error.message);
            return res.status(500).json({
                message: "Something went wrong",
                errors: error.message,
            });
        }
    }
);

// DELETE /api/cart/:userId/:productId
router.delete(
    "/:userId/:productId",
    async (
        req: Request<IdParamUserProduct>,
        res: Response<DeleteResponse | ErrorResponse>
    ) => {
        const { userId, productId } = req.params;

        if (!userId || !productId) {
            return res
                .status(400)
                .json({ message: "userId and productId are required" });
        }

        try {
            const command = new DeleteCommand({
                TableName: myTable,
                Key: {
                    pk: "CART",
                    sk: `USER#${userId}#PRODUCT#${productId}`,
                },
            });

            await db.send(command);

            return res
                .status(200)
                .json({ message: "Item deleted from cart", userId, productId });
        } catch (error: any) {
            console.error("Error deleting item from cart:", error.message);
            return res.status(500).json({
                message: "Something went wrong",
                errors: error.message,
            });
        }
    }
);

// PUT /api/cart/:userId/:productId  Ändrade till UpdateCommand!!
router.put(
    "/:userId/:productId",
    async (req: Request<IdParamUserProduct, UpdateCartItem>, res: Response) => {
        const { userId, productId } = req.params;

        try {
            const parsed = UpdateCartSchema.parse(req.body);

            const command = new UpdateCommand({
                TableName: myTable,
                Key: {
                    pk: `CART`,
                    sk: `USER#${userId}#PRODUCT#${productId}`,
                },
                UpdateExpression: "SET amount = :newAmount",
                ExpressionAttributeValues: {
                    ":newAmount": parsed.amount,
                },
            });

            await db.send(command);

            return res.status(200).json({
                message: "Cart item updated",
                parsed, // Kanske borde visa Item istället?
            });
        } catch (error: any) {
            if (error.errors) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.errors,
                });
            }
            console.error("Error updating cart item:", error.message);
            return res.status(500).json({
                message: "Something went wrong",
                errors: error.message,
            });
        }
    }
);

export default router;
