import { Router, type Request, type Response } from "express";
import { QueryCommand, ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../data/db.js";
import { CartSchema } from "../data/zod.js"; 

const router = Router();

// GET /api/cart 
router.get("/", async (req: Request, res: Response) => {
    try {
        const command = new ScanCommand({
            TableName: "CandyShop",
            FilterExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": "CART"
            },
        });

    const result = await db.send(command);
    return res.status(200).json(result.Items ?? []);
  } catch (error: any) {
    console.error("Error fetching all carts:", error.message);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// GET /api/cart/:userId 
router.get("/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const command = new QueryCommand({
            TableName: "CandyShop",
            KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
            ExpressionAttributeValues: {
                ":pk": "CART",
                ":sk": `USER#${userId}#PRODUCT#?????`,
            },
        });

    const result = await db.send(command);
    return res.status(200).json(result.Items ?? []);
  } catch (error: any) {
    console.error("Error fetching user cart:", error.message);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// POST /api/cart 
router.post("/", async (req: Request, res: Response) => {
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

    return res.status(201).json({ message: "Item added to cart", ...parsed });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    console.error("Error adding item to cart:", error.message);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// DELETE /api/cart/:userId/:productId 
router.delete("/:userId/:productId", async (req: Request, res: Response) => {
  const { userId, productId } = req.params;

  if (!userId || !productId) {
    return res.status(400).json({ message: "userId and productId are required" });
  }

  try {
    const command = new DeleteCommand({
      TableName: "CandyShop",
      Key: {
        pk: "CART",
        sk: `USER#${userId}#PRODUCT#${productId}`,
      },
    });

    await db.send(command);

    return res.status(200).json({ message: "Item deleted from cart", userId, productId });
  } catch (error: any) {
    console.error("Error deleting item from cart:", error.message);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// PUT /api/cart/:userId/:productId 
router.put("/:userId/:productId", async (req: Request, res: Response) => {
  const { userId, productId } = req.params;

  try {
    const parsed = CartSchema.pick({ amount: true }).parse({
      amount: req.body.amount,
    });

    const command = new PutCommand({
      TableName: "CandyShop",
      Item: {
        pk: `CART`,
        sk: `USER#${userId}#CART#${productId}`,
        userId,
        productId,
        amount: parsed.amount,
      },
    });

    await db.send(command);

    return res.status(200).json({ message: "Cart item updated", userId, productId, amount: parsed.amount });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    console.error("Error updating cart item:", error.message);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

export default router;
