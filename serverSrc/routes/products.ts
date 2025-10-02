import express, { Router } from "express";
import type { Request, Response } from "express";
import { GetCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../data/db.js";
import { productsData } from "../data/candyProducts.js";
import { ProductSchema } from "../data/zod.js";

const router: Router = express.Router();

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

//single product
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
		
		if (!result.Item) {
			return res.status(404).json({ message: "Product not found" });
		}
		
		const parsedProduct = ProductSchema.safeParse(result.Item);
		if (!parsedProduct.success) {
			return res.status(500).json({ message: "Invalid product data" });
		}
		
		return res.status(200).json(parsedProduct.data);
		
	} catch (error) {
		console.error("Error fetching single product:", error);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

// Create new product 
router.post('/', async (req: Request, res: Response) => {
	try {
		const product = {
			pk: "PRODUCT",
			sk: `PRODUCT#${req.body.productId}`,
			productId: String(req.body.productId), 
			name: req.body.name,
			price: Number(req.body.price), 
			image: req.body.image,
			AmountInStock: Number(req.body.AmountInStock) 
		};
		
		const validation = ProductSchema.safeParse(product);
		if (!validation.success) {
			return res.status(400).json({ 
				message: "Invalid product data", 
				errors: validation.error 
			});
		}
		
		await db.send(new PutCommand({
			TableName: "CandyShop",
			Item: product
		}));
		
		res.status(201).json(product);
		
	} catch (error) {
		console.error("Error creating product:", error);
		res.status(500).json({ message: 'Could not create product', error: String(error) });
	}
});

// Seed all products from cansdyProducts.ts
router.post('/seed', async (req: Request, res: Response) => {
	try {
		const results = [];
		const errors = [];
		for (const productData of productsData) {
			try {
				const product = {
					pk: "PRODUCT",
					sk: `PRODUCT#${productData.productId}`,
					productId: String(productData.productId),
					name: productData.name,
					price: Number(productData.price),
					image: productData.image,
					AmountInStock: Number(productData.AmountInStock)
				};
				await db.send(new PutCommand({
					TableName: "CandyShop",
					Item: product
				}));
				results.push(product);
			} catch (error) {
				errors.push({ product: productData.name, error: String(error) });
			}
		}
		res.status(201).json({
			message: `Seeded ${results.length} products`,
			successCount: results.length,
			errorCount: errors.length,
			errors
		});
	} catch (error) {
		res.status(500).json({ message: 'Could not seed products', error: String(error) });
	}
});

//update product
router.put('/:productId', async (req: Request, res: Response) => {
	try {
		const { productId } = req.params;
		
		const allowedFields = ['name', 'price', 'image', 'AmountInStock'];
    const updateFields = [];
	const ExpressionAttributeNames: Record<string, string> = {};
	const ExpressionAttributeValues: Record<string, any> = {};

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				updateFields.push(`#${field} = :${field}`);
				ExpressionAttributeNames[`#${field}`] = field;
				ExpressionAttributeValues[`:${field}`] = req.body[field];
			}
		}

		if (updateFields.length === 0) {
			return res.status(400).json({ message: 'No fields to update.' });
		}

		const UpdateExpression = "SET " + updateFields.join(", ");

		const result = await db.send(new UpdateCommand({
			TableName: "CandyShop",
			Key: {
				pk: "PRODUCT",
				sk: `PRODUCT#${productId}`
			},
			UpdateExpression: UpdateExpression,
			ExpressionAttributeNames: ExpressionAttributeNames,
			ExpressionAttributeValues: ExpressionAttributeValues,
			ReturnValues: "ALL_NEW"
		}));
		
		res.status(200).json({ message: `Product ${productId} updated.`, updated: result.Attributes });
	} catch (error) {
		console.error("Error updating product:", error);
		res.status(500).json({ message: 'Could not update product', error: String(error) });
	}
});

//delete product
router.delete('/:productId', async (req: Request, res: Response) => {
	try {
		const productId = req.params.productId;
		const result = await db.send(new DeleteCommand({
			TableName: "CandyShop",
			Key: {
				pk: "PRODUCT",
				sk: `PRODUCT#${productId}`
			},
			ReturnValues: "ALL_OLD"
		}));

		if (!result.Attributes) {
			return res.status(404).json({ message: `Product ${productId} not found.` });
		}

		return res.status(200).json({
			message: `Product ${productId} deleted successfully`,
			product: result.Attributes,
		});
	} catch (error) {
		console.error("Error deleting product:", error);
		return res.status(500).json({ message: 'Could not delete product', error: String(error) });
	}
});

export { router };