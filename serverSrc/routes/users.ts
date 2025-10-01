import express, { Router, type Response, type Request } from "express";
import { db } from "../data/db.js";
import { DeleteCommand, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserSchema } from "../data/zod.js";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import type { IdParam } from "../data/types.js";

const router: Router = express.Router();

type UserParam = {
    userId: string;
    name: string;
};

// For updates, all fields are optional
type UpdateUserParam = Partial<UserParam>;

const myTable = "CandyShop";


//Get ALL Users
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
        console.log("Query result:", result.Items);
        res.status(200).json(result.Items);
    } catch (error) {
        console.error("DynamoDB error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

//Get USER med id
router.get("/:id", async (req: Request<IdParam>, res: Response) => {
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
      
        const { userId, name } = req.body as UserParam;

        
        const userInput: UserParam & { pk: string; sk: string } = {
            userId,
            name,
            pk: "USER",
            sk: `USER#${userId}`,
        };

        // Validate with Zod schema
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
            Item: validation.data,
            ConditionExpression: "attribute_not_exists(sk)", // Prevent overwriting existing user
        };

        const command = new PutCommand(params);
        await db.send(command);

        console.log(`User created successfully: ${userId}`);
        return res.status(201).json({
            message: "User created successfully",
            user: { userId, name },
        });
    } catch (error: any) {
        console.error("DynamoDB error:", error);
        if (error.name === "ConditionalCheckFailedException") {
            return res.status(409).json({ message: "User with this ID already exists" });
        }
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// PUT api/users/:id

router.put("/:id", async (req, res: Response) => {
  const userId = req.params.id;
  const body = req.body as UpdateUserParam;

  // Make sure at least one field is provided
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ message: "At least one field is required to update." });
  }

  try {
    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const exprAttrNames: Record<string, string> = {};
    const exprAttrValues: Record<string, any> = {};

    if (body.name !== undefined) {
      updateExpressions.push("#name = :name");
      exprAttrNames["#name"] = "name";
      exprAttrValues[":name"] = body.name;
    }

    const params = {
      TableName: myTable,
      Key: {
        pk: "USER",
        sk: `USER#${userId}`,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
      ConditionExpression: "attribute_exists(sk)", // must exist
      ReturnValues: "ALL_NEW" as const,
    };

    const command = new UpdateCommand(params);
    const result = await db.send(command);

    return res.status(200).json({
      message: "User updated successfully",
      user: result.Attributes,
    });
  } catch (error: any) {
    console.error("DynamoDB error:", error);
    if (error.name === "ConditionalCheckFailedException") {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(500).json({ message: "Something went wrong." });
  }
});


// DELETE /api/users/:id

router.delete("/:id", async (req, res: Response) => {
  const userId = req.params.id;

  const params = {
    TableName: myTable,
    Key: {
      pk: "USER",
      sk: `USER#${userId}`,
    },
    ReturnValues: "ALL_OLD" as const, // return deleted item
  };

  try {
    const command = new DeleteCommand(params);
    const result = await db.send(command);

    if (!result.Attributes) {
      return res.status(404).json({ message: "User not found." });
    }

    const parsedUser = UserSchema.safeParse(result.Attributes);

    if (!parsedUser.success) {
      console.error("Data validation error:", parsedUser.error);
      return res.status(500).json({ message: "Invalid user data." });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      user: parsedUser.data,
    });
  } catch (error) {
    console.error("DynamoDB error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
});



export { router };
