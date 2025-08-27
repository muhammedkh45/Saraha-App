import { emailVerficationCodetemp } from "../service/VerficationEmail.js";
import { sendEmail } from "../service/sendemail.js";
import { EventEmitter } from "events";
export const eventEmitter = new EventEmitter();
eventEmitter.on("forgetPassword", async ({ data }) => {
  const { email, code } = data;
  try {
    const html = emailVerficationCodetemp(code);
    const isSent = await sendEmail({
      to: email,
      html: html,
      subject: "Forget Password",
    });
    if (!isSent) {
      throw new Error("Error on sending email", { cause: 500 });
    }
  } catch (error) {
    throw new Error("Error occured", { cause: 500 });
  }
});
