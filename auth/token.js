import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const createAccessToken = (user) => {
    return jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256", // 암호화 알고리즘
        expiresIn: "30m", // 유효기간
    });
};

export const createRefreshToken = (user) => {
    return jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256", // 암호화 알고리즘
        expiresIn: "14d", // 유효기간
    });
};
