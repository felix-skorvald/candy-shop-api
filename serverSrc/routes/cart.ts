
import { Router } from "express";
import type { Request, Response } from "express";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../data/db.js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const command = new QueryCommand({
      TableName: "CandyShop",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "CART#",
      },
    });

    const result = await db.send(command);
    res.status(200).json(result.Items || []);
  } catch (error: any) {
    console.error("Error:", error.message, error.stack); 
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

export default router;