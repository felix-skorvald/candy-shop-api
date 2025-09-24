import express from "express";
import type { Express, Request, RequestHandler, Response } from "express";
import cartRouter from "./routes/cart.js";


const port: number = Number(process.env.PORT!);
const app: Express = express();

const logger: RequestHandler = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

app.use("/", logger);
app.use(express.json());

// Endpoints
app.use("api/products", (DINROUTER) );
app.use("api/users", (DINROUTER);
app.use("/api/cart", cartRouter);

//start

app.listen(port, () => {
    console.log("Server is listening on " + port);
});
