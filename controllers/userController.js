import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../auth/token.js";
import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

export const signup = async (req, res) => {
    const {
        body: { email, nickname, password, password1 },
    } = req;
    try {
        const userExists = await User.exists({ email });
        if (userExists)
            return res
                .status(400)
                .json({ errorLocation: "email", message: "이메일이 존재합니다." });
        if (password !== password1)
            return res
                .status(400)
                .json({ errorLocation: "password1", message: "비밀번호가 틀립니다." });
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            email,
            nickname,
            password: hashedPassword,
            avatar: "",
        });
        res.status(200).json({ message: "회원가입 성공" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const signin = async (req, res) => {
    const {
        body: { email, password },
    } = req;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({
                errorLocation: "email",
                message: "이메일로 가입된 유저가 없습니다.",
            });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            return res.status(400).json({
                errorLocation: "password",
                message: "비밀번호가 틀립니다.",
            });
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        await RefreshToken.create({ token: refreshToken, userId: user._id });

        res.status(200).json({
            userInfo: { avatar: user.avatar, id: user._id, nickname: user.nickname },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "refresh token does not exists" });
    }
    try {
        const existingToken = await RefreshToken.exists({ token: refreshToken });
        if (!existingToken) {
            return res.status(401).json({ message: "refresh token does not verify " });
        }

        const userId = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        if (userId) {
            const newAccessToken = createAccessToken(userId);
            if (!req.cookies.user) {
                const userInfo = await User.findById(userId);
                res.status(200).json({
                    accessToken: newAccessToken,
                    userInfo,
                });
            }
            res.status(200).json({
                accessToken: newAccessToken,
            });
        }
    } catch (error) {
        console.log(error);
    }
};

export const mePosts = async (req, res) => {
    const { userId } = req;
    try {
        const posts = await Post.find({ creator: userId }).populate("creator");
        res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: "뭔가 오류가 생겼습니다" });
    }
};

export const update = async (req, res) => {
    const {
        body: { nickname },
        file,
        userId,
    } = req;
    try {
        // throw Error();
        const user = await User.findByIdAndUpdate(
            userId,
            {
                nickname,
                avatar: file?.transforms[0]?.location,
            },
            { new: true }
        );
        res.status(200).json({
            user: {
                id: user._id,
                nickname: user.nickname,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "프로필 수정에 실패했습니다" });
    }
};

export const logintest = (req, res) => {
    console.log(req.userId);
    console.log("로그인 함");
};

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    // if (!refreshToken) {
    //     return res.status(401).json({ message: "refresh token does not exists" });
    // }
    try {
        await RefreshToken.findOneAndDelete({
            $or: [{ token: refreshToken }, { userId: req.userId }],
        });

        return res.status(200).json({ ok: true });
    } catch (error) {
        return res.status(500).json(error);
    }
};
