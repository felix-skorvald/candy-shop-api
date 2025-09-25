import express, { Router } from "express";
import type { Request, Response } from "express";
import { GetCommand, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../data/db.js";

const router: Router = express.Router();

router.get('/:productId', async (req: Request, res: Response) => {
	try {
		const productId = req.params.productId;
		
		const result = await db.send(new GetCommand({
			TableName: "CandyShop",
			Key: {
				pk: "PRODUCT",
				sk: `PRODUCT#${productId}`
			}
		}));
		
		if (result.Item) {
			res.json(result.Item);
		} else {
			res.status(404).json({ error: "Product not found" });
		}
		
	} catch (error) {
		console.error("Error fetching single product:", error);
		res.status(500).json({ message: 'Could not fetch product', error: String(error) });
	}
});
//all products
router.get('/', async (req: Request, res: Response) => {
	try {
		const result = await db.send(new QueryCommand({
			TableName: "CandyShop",
			KeyConditionExpression: "pk = :pk",
			ExpressionAttributeValues: {
				":pk": "PRODUCT"
			}
		}));
		
		if (result.Items) {
			res.json(result.Items);
		} else {
			res.json([]);
		}
		
	} catch (error) {
		console.error("Error fetching all products:", error);
		res.status(500).json({ message: 'Could not fetch products', error: String(error) });
	}
});

//update product
router.put('/:productId', async (req: Request, res: Response) => {
	try {
		const productId = req.params.productId;
		
		const product = {
			pk: "PRODUCT",
			sk: `PRODUCT#${productId}`,
			productId,
			name: req.body.name,
			price: req.body.price,
			description: req.body.description || "",
			category: req.body.category || "general",
			imageUrl: req.body.imageUrl || "",
			updatedAt: new Date().toISOString()
		};
		
		await db.send(new PutCommand({
			TableName: "CandyShop",
			Item: product
		}));
		
		res.status(200).json(product);
		
	} catch (error) {
		console.error("Error updating product:", error);
		res.status(500).json({ message: 'Could not update product', error: String(error) });
	}
});

export { router };