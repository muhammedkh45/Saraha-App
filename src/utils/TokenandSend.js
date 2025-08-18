import generateVerificationCode from "./generateVerficationCode.js";
import { emailVerficationCodetemp } from "../service/VerficationEmail.js";
import { sendEmail } from "../service/sendemail.js";
import dotenv from "dotenv";
import path from "node:path";
import { generateToken } from "./token/generateToken.js";
import { EventEmitter } from "events";
import {userModel} from "../DB/models/user.model.js";
export const eventEmitter = new EventEmitter();
dotenv.config({ path: path.resolve("src/config/.env") });
eventEmitter.on("sendEmail", async ({ data }) => {
  const { email, attemptsLeft, timeToReattempts } = data;
  try {
    const code = await generateVerificationCode();
    const verficationToken = await generateToken({
      payload: { email },
      Signature: process.env.JWT_SECRET,
      options: {
        expiresIn: "2m",
      },
    });
    const refreshToken = await generateToken({
      payload: { email },
      Signature: process.env.JWT_SECRET_REFRESH,
    });

    const html = emailVerficationCodetemp({
      code,
      verifyPageUrl:`http://localhost:3000/users/verify/${verficationToken}/${refreshToken}`
    }
    );
    const isSent = await sendEmail({ to: email, html: html });
    if (!isSent) {
      throw new Error("Error on sending email", { cause: 500 });
    }
    const user = await userModel.findOne({ email });
    if (user) {
      await userModel.updateOne(
        { email },
        {
          code: code,
          attemptsLeft: attemptsLeft,
          timeToReattempts: timeToReattempts,
        }
      );
    }
  } catch (error) {
    throw new Error("Error occured", { cause: 500 });
  }
});
