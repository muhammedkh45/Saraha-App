import nodemailer from "nodemailer";
import dotenv from 'dotenv'
dotenv.config();
export const sendEmail = async ({to,subject,html,attachments})=>{
  try {
    const transporter = nodemailer.createTransport({
      port: 587,
      secure: false, 
      service: 'gmail',
      auth: {
          user: "eljendypaint@gmail.com",
          pass: process.env.CLIENT_SECRET,
      },
  });

    const info = await transporter.sendMail({
      from: '"Verify" <eljendypaint@gmail.com>',
      to: to ||"mohamedkh4050@gmail.com",
      subject:subject|| "Verfiy your email ✔",
      html: html, 
      attachments:attachments || []
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
    
}
