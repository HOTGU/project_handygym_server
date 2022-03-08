import express from "express";
import {
    refresh,
    signin,
    signup,
    logintest,
    logout,
    update,
    mePosts,
} from "../controllers/userController.js";
import { onlyUser, userAvatarMulter } from "../middleware.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.post("/refresh", refresh);
userRouter.post("/logout", onlyUser, logout);
userRouter.get("/me/posts", onlyUser, mePosts);
userRouter.post("/update", onlyUser, userAvatarMulter, update);
userRouter.post("/logintest", onlyUser, logintest);

export default userRouter;
