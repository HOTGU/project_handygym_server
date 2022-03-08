import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import addressRouter from "./routes/addressRouter.js";
import emailRouter from "./routes/emailRouter.js";
import proRouter from "./routes/proRotuer.js";

const app = express();

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/address", addressRouter);
app.use("/email", emailRouter);
app.use("/pro", proRouter);

export default app;
