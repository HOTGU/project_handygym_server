import express from "express";
import { get, register } from "../controllers/proController.js";
import { onlyPro, onlyUser } from "../middleware.js";

const proRouter = express.Router();

proRouter.get("/get", onlyUser, onlyPro, get);
proRouter.post("/register", onlyUser, register);

export default proRouter;
