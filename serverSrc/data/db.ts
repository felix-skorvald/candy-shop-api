import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const accessKey = process.env.ACCESS_KEY_ID || "";
const secret = process.env.SECRET_ACCESS_KEY || "";

const client: DynamoDBClient = new DynamoDBClient({
    region: "eu-north-1",
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secret,
    },
});

export const db: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);
