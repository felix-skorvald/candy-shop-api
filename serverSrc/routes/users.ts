import express, { Router, type Response } from "express";
import { db } from "../data/db.js";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { UserSchema } from "../data/zod.js";
import { QueryCommand } from "@aws-sdk/client-dynamodb";

const router: Router = express.Router();

type UserParam = {
    userId: string;
    name: string;
};

const myTable = "CandyShop";

//Scan
// router.get("/", async (req, res) => {
//     try {
//         console.log("Fetching users from DynamoDB...");
//         const command = new ScanCommand({
//             TableName: myTable,
//         });
//         const result = await db.send(command);
//         console.log("Scan result:", result.Items);
//         res.status(200).json(result.Items);
//     } catch (error) {
//         console.error("DynamoDB error:", error);
//         res.status(500).json({ message: "Something went wrong"});
//     }
// });

//GetUsers
router.get("/", async (req, res) => {
    try {
        console.log("Querying users from DynamoDB...");
        const command = new QueryCommand({
            TableName: myTable,
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "pk",
            },
            ExpressionAttributeValues: {
                ":pk": { S: "USER" },
            },
        });
        const result = await db.send(command);
        //Här används inte parseResult / Felix
        // let parseResult = UserSchema.safeParse(result.Items);
        console.log("Query result:", result.Items);
        res.status(200).json(result.Items);
    } catch (error) {
        console.error("DynamoDB error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

//Get USER med id
router.get("/:id", async (req, res: Response) => {
    const userId = req.params.id;

    const params = {
        TableName: myTable,
        Key: {
            pk: "USER",
            sk: `USER#${userId}`,
        },
    };

    try {
        const command = new GetCommand(params);
        const { Item } = await db.send(command);

        if (!Item) {
            return res.status(404).json({ message: "User not found." });
        }

        const parsedUser = UserSchema.safeParse(Item);

        if (!parsedUser.success) {
            console.error("Data validation error:", parsedUser.error);
            return res.status(500).json({ message: "Invalid user data." });
        }

        return res.status(200).json(parsedUser.data);
    } catch (error) {
        console.error("DynamoDB error:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
});

//POST api/users/

router.post("/", async (req, res: Response) => {
    try {
        const { userId, name } = req.body;

        
        const userInput = {
            pk: "USER",
            sk: `USER#${userId}`,
            name,
        };

        
        const validation = UserSchema.safeParse(userInput);
        
        if (!validation.success) {
            console.error("Validation error:", validation.error);
            return res.status(400).json({ 
                message: "Invalid user data", 
                errors: validation.error 
            });
        }

        
        const params = {
            TableName: myTable,
            Item: {
                ...validation.data,
                userId,
            },
            ConditionExpression: "attribute_not_exists(sk)", // Prevent overwriting existing user
        };

        const command = new PutCommand(params);
        await db.send(command);

        console.log(`User created successfully: ${userId}`);
        return res.status(201).json({
            message: "User created successfully",
            user: {
                userId,
                name,
            },
        });
    } catch (error: any) {
        console.error("DynamoDB error:", error);
        if (error.name === "ConditionalCheckFailedException") {
            return res.status(409).json({ message: "User with this ID already exists" });
        }
        return res.status(500).json({ message: "Something went wrong" });
    }
});

export { router };
