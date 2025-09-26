
import express from "express";
import type { Express, RequestHandler } from "express";
import cartRouter from "./routes/cart.js";
import { router as userRouter } from "./routes/users.js";
import { router as productsRouter } from "./routes/products.js";

const port: number = Number(process.env.PORT!);
const app: Express = express();

const logger: RequestHandler = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

app.use("/", logger);
app.use(express.json());

// Endpoints
app.use("/api/products", productsRouter);
app.use("/api/users", userRouter);
app.use("/api/cart", cartRouter);

// start
app.listen(port, () => {
    console.log("Server is listening on " + port);
});
