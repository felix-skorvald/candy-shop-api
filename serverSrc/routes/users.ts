import express, { Router, type Request, type Response } from "express";
import { db } from "../data/db.js";
import { DeleteCommand, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserSchema } from "../data/zod.js";
import { QueryCommand } from "@aws-sdk/lib-dynamodb"
import type { IdParam, User, CreateUserBody, CreateUserResponse, UpdateUserResponse, DeleteUserResponse, ErrorResponse } from "../data/types.js"

const router: Router = express.Router();
const myTable = "CandyShop";



type UpdateUserBody = Partial<Pick<User, "name">>;


// Get ALL users
router.get(
  "/",
  async (req: Request, res: Response<User[] | ErrorResponse>) => {
    try {
      console.log("Querying users from DynamoDB...");
      const command = new QueryCommand({
        TableName: myTable,
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: { "#pk": "pk" },
        ExpressionAttributeValues: { ":pk": "USER" },
      });
      
      const result = await db.send(command);
      return res.status(200).json((result.Items ?? []) as User[]);
    } catch (error) {
      console.error("DynamoDB error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
);

// Get user by id
router.get(
  "/:id",
  async (req: Request<IdParam>, res: Response<User | ErrorResponse>) => {
    const userId = req.params.id;
    
    const params = {
      TableName: myTable,
      Key: { pk: "USER", sk: `USER#${userId}` },
    };
    
    try {
      const command = new GetCommand(params);
      const { Item } = await db.send(command);
      
      if (!Item) {
        return res.status(404).json({ message: "User not found." });
      }
      
      const parsedUser = UserSchema.safeParse(Item);
      if (!parsedUser.success) {
        return res.status(500).json({ message: "Invalid user data." });
      }
      
      return res.status(200).json(parsedUser.data as User);
    } catch (error) {
      console.error("DynamoDB error:", error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
);

// Create user
router.post(
  "/",
  async (
    req: Request<{}, CreateUserResponse | ErrorResponse, CreateUserBody>,
    res: Response<CreateUserResponse | ErrorResponse>
  ) => {
    try {
      const { userId, name } = req.body;
      
      const userInput: User = {
        userId,
        name,
        pk: "USER",
        sk: `USER#${userId}`,
      };
      
      const validation = UserSchema.safeParse(userInput);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: validation.error,
        });
      }
      
      const params = {
        TableName: myTable,
        Item: validation.data,
        ConditionExpression: "attribute_not_exists(sk)",
      };
      
      const command = new PutCommand(params);
      await db.send(command);
      
      return res.status(201).json({
        message: "User created successfully",
        user: { userId, name },
      });
    } catch (error: any) {
      console.error("DynamoDB error:", error);
      if (error.name === "ConditionalCheckFailedException") {
        return res.status(409).json({ message: "User with this ID already exists" });
      }
      return res.status(400).json({ message: "Something went wrong" });
    }
  }
);

// Update user
router.put(
  "/:id",
  async (
    req: Request<IdParam, UpdateUserResponse | ErrorResponse, UpdateUserBody>,
    res: Response<UpdateUserResponse | ErrorResponse>
  ) => {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    
    if (!req.body) {
      return res.status(400).json({ message: "Request body is required." });
    }
    
    const { name } = req.body;
    
    if (name === undefined) {
      return res.status(400).json({ message: "Name is required to update." });
    }
    
    try {
      const params = {
        TableName: myTable,
        Key: { pk: "USER", sk: `USER#${userId}` },
        UpdateExpression: "SET #name = :name",  
        ExpressionAttributeNames: { "#name": "name" }, 
        ExpressionAttributeValues: { ":name": name },
        ConditionExpression: "attribute_exists(sk)",
        ReturnValues: "ALL_NEW" as const,
      };
      
      const command = new UpdateCommand(params);
      const result = await db.send(command);
      
      return res.status(200).json({
        message: "User updated successfully",
        user: result.Attributes as User,
      });
    } catch (error: any) {
      console.error("DynamoDB error:", {
        name: error.name,
        message: error.message,
        type: error.__type,
        code: error.code  
      });
      
      if (error.name === "ConditionalCheckFailedException") {
        return res.status(404).json({ message: "User not found." });
      } else if (error.name === "ValidationException" || error.__type?.includes("ValidationException")) {
        return res.status(400).json({ message: error.message || "Invalid request parameters" });
      } else {
        return res.status(500).json({ message: "Something went wrong." });
      }
    }
  }
);

// Delete user
router.delete(
  "/:id",
  async (
    req: Request<IdParam, DeleteUserResponse | ErrorResponse>,
    res: Response<DeleteUserResponse | ErrorResponse>
  ) => {
    const userId = req.params.id;
    
    const params = {
      TableName: myTable,
      Key: { pk: "USER", sk: `USER#${userId}` },
      ReturnValues: "ALL_OLD" as const,
    };
    
    try {
      const command = new DeleteCommand(params);
      const result = await db.send(command);
      
      if (!result.Attributes) {
        return res.status(404).json({ message: "User not found." });
      }
      
      const parsedUser = UserSchema.safeParse(result.Attributes);
      if (!parsedUser.success) {
        return res.status(500).json({ message: "Invalid user data." });
      }
      
      return res.status(200).json({
        message: "User deleted successfully",
        user: parsedUser.data as User,
      });
    } catch (error) {
      console.error("DynamoDB error:", error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
);

export { router };