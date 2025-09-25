import express, { Router } from "express";
import { db } from "../data/db.js";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
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
                "#pk": "pk" 
            },
            ExpressionAttributeValues: {
                ":pk": { S: "USER" }
            }
        });
        const result = await db.send(command);
        let parseResult = UserSchema.safeParse(result.Items);
        console.log("Query result:", result.Items);
        res.status(200).json(result.Items);
    } catch (error) {
        console.error("DynamoDB error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});



export {router};