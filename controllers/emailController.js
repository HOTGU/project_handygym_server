import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { emailTransport } from "../auth/emailTransport.js";
dotenv.config();

export const send = async (req, res) => {
    const {
        body: { email },
    } = req;
    try {
        if (!email) return res.status(500).json({ message: "이메일을 입력해주세요" });
        let number = Math.floor(Math.random() * 1000000) + 100000;
        if (number > 1000000) {
            number = number - 100000;
        }

        console.log(number);

        await emailTransport.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: req.body.email,
            subject: "핸디짐에서 보낸 인증번호입니다.", //메일 제목
            text: `인증번호는 ${number}입니다.`,
        });

        res.status(200).json(number);
    } catch (error) {
        return res.status(500).json({ message: "이메일을 다시 확인해주세요" });
    }
};
