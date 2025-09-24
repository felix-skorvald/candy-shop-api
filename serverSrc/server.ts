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

// Endpoints
//exempel
app.use("/products,ROUTERa);

//start

app.listen(port, () => {
    console.log("Server is listening on " + port);
});
