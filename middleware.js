import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import multerS3 from "multer-s3-transform";
import aws from "aws-sdk";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

let s3 = new aws.S3({
    accessKeyId: process.env.AWS_S3_ACCESS,
    secretAccessKey: process.env.AWS_S3_SECRET,
    region: process.env.AWS_S3_REGION,
});

// const userAvatarUpload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: process.env.AWS_S3_BUCKET_NAME,
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         acl: "public-read",
//         key: (req, file, cb) => {
//             cb(null, `user_avatar/${Date.now()}_${file.originalname}`);
//         },
//     }),
// });
const userAvatarUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        shouldTransform: true,
        transforms: [
            {
                id: "resized",
                key: function (req, file, cb) {
                    cb(null, `user_avatar/${Date.now()}_${file.originalname}`);
                },
                transform: function (req, file, cb) {
                    cb(null, sharp().resize(100, 100));
                },
            },
        ],
        acl: "public-read",
    }),
});
export const userAvatarMulter = userAvatarUpload.single("avatar");

export const onlyUser = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split("Bearer ")[1];
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (user) {
            req.userId = user._id;
            next();
        } else {
            return res.status(401).json({ message: "auth token does not verify" });
        }
    } else {
        return res.status(401).json({ message: "auth token does not exists" });
    }
};

export const onlyPro = async (req, res, next) => {
    const { userId } = req;
    try {
        console.log(2);
        const user = await User.findById(userId);
        console.log(user.isPro);
        if (!user.info)
            return res
                .status(400)
                .json({ message: "프로 프로필이 있어야 이용가능합니다" });
    } catch (error) {
        console.log(error);
    }
};
