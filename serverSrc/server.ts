import express from "express";
import type { Express, Request, RequestHandler, Response } from "express";


const port: number = Number(process.env.PORT!);
const app: Express = express();

const logger: RequestHandler = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

app.use("/", logger);
app.use(express.json());

// Import routers
import { router as productsRouter } from "./routes/products.js";
// import { router as usersRouter } from "./routes/users.js";
// import { router as cartRouter } from "./routes/cart.js";

// Endpoints
app.use("/api/products", productsRouter);
// app.use("/api/users", usersRouter);
// app.use("/api/cart", cartRouter);

//start

app.listen(port, () => {
    console.log("Server is listening on " + port);
});
