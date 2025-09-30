import { Router, type Request, type Response } from "express";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../data/db.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const command = new ScanCommand({
            TableName: "CandyShop",
            FilterExpression: "begins_with(sk, :sk)",
            ExpressionAttributeValues: {
                ":sk": "CART#",
            },
        });

        const result = await db.send(command);
        return res.status(200).json(result.Items ?? []);
    } catch (error: any) {
        console.error(" Error fetching all carts:", error.message);
        return res
            .status(500)
            .json({ message: "Something went wrong", error: error.message });
    }
});

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
        return res.status(200).json(result.Items ?? []);
    } catch (error: any) {
        console.error(" Error fetching user cart:", error.message);
        return res
            .status(500)
            .json({ message: "Something went wrong", error: error.message });
    }
});

export default router;
