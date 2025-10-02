
import { Router, type Request, type Response } from "express";
import {
  QueryCommand,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "../data/db.js";
import { CartSchema } from "../data/zod.js";
import { z } from "zod";

const router = Router();

/**
 * --------------------
 * Types & Interfaces
 * --------------------
 */
export interface CartObject {
  pk: string;
  sk: string;
  userId: string;
  productId: string;
  amount: number;
}

export type MessageResponse = { message: string };

export type ValidationErrorResponse = {
  message: string;
  errors: z.ZodIssue[];
};

/**
 * GET /api/cart
 * Body: none
 * Response: 200 OK <CartObject[]>
 */
router.get(
  "/",
  async (_req: Request, res: Response<CartObject[] | MessageResponse>) => {
    try {
      const command = new ScanCommand({
        TableName: "CandyShop",
        FilterExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": "CART",
        },
      });

      const result = await db.send(command);
      return res.status(200).json((result.Items as CartObject[]) ?? []);
    } catch (error: any) {
      console.error("Error fetching all carts:", error.message);
      return res
        .status(500)
        .json({ message: "Something went wrong" });
    }
  }
);

/**
 * GET /api/cart/:userId
 * Body: none
 * Response: 200 OK <CartObject[]>
 */
router.get(
  "/:userId",
  async (req: Request, res: Response<CartObject[] | MessageResponse>) => {
    const { userId } = req.params;

    try {
      const command = new QueryCommand({
        TableName: "CandyShop",
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
        ExpressionAttributeValues: {
          ":pk": "CART",
          ":sk": `USER#${userId}#PRODUCT#`,
        },
      });

      const result = await db.send(command);
      return res.status(200).json((result.Items as CartObject[]) ?? []);
    } catch (error: any) {
      console.error("Error fetching user cart:", error.message);
      return res
        .status(500)
        .json({ message: "Something went wrong" });
    }
  }
);

/**
 * POST /api/cart
 * Body: { userId: string, productId: string, amount: number }
 * Response: 201 Created <CartObject> | 400 ValidationErrorResponse
 */
router.post(
  "/",
  async (
    req: Request,
    res: Response<CartObject | ValidationErrorResponse | MessageResponse>
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
        TableName: "CandyShop",
        Item: parsed,
      });

      await db.send(command);
      return res.status(201).json(parsed);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.issues,
        });
      }
      console.error("Error adding item to cart:", error.message);
      return res
        .status(500)
        .json({ message: "Something went wrong" });
    }
  }
);

/**
 * DELETE /api/cart/:userId/:productId
 * Body: none
 * Response: 200 OK <MessageResponse>
 */
router.delete(
  "/:userId/:productId",
  async (req: Request, res: Response<MessageResponse>) => {
    const { userId, productId } = req.params;

    try {
      const command = new DeleteCommand({
        TableName: "CandyShop",
        Key: {
          pk: "CART",
          sk: `USER#${userId}#PRODUCT#${productId}`,
        },
      });

      await db.send(command);
      return res
        .status(200)
        .json({ message: "Item deleted from cart" });
    } catch (error: any) {
      console.error("Error deleting item from cart:", error.message);
      return res
        .status(500)
        .json({ message: "Something went wrong" });
    }
  }
);

/**
 * PUT /api/cart/:userId/:productId
 * Body: { amount: number }
 * Response: 200 OK <CartObject> | 400 ValidationErrorResponse
 */
/**
 * PUT /api/cart/:userId/:productId
 * Body: { amount: number }
 * Response: 200 OK <CartObject> | 400 ValidationErrorResponse
 */
router.put(
  "/:userId/:productId",
  async (
    req: Request,
    res: Response<CartObject | ValidationErrorResponse | MessageResponse>
  ) => {
    const { userId, productId } = req.params;

    try {
      // فقط amount از body ولیدیت میشه
      const parsed = CartSchema.pick({ amount: true }).parse({
        amount: req.body.amount,
      });
const userId = String(req.params.userId);
const productId = String(req.params.productId);

const updatedItem: CartObject = {
  pk: "CART",
  sk: `USER#${userId}#PRODUCT#${productId}`,
  userId,
  productId,
  amount: parsed.amount,
};


      const command = new PutCommand({
        TableName: "CandyShop",
        Item: updatedItem,
      });

      await db.send(command);
      return res.status(200).json(updatedItem);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.issues,
        });
      }
      console.error("Error updating cart item:", error.message);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
);

export default router;
