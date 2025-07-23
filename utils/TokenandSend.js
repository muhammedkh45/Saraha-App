import generateVerificationCode from "./generateVerficationCode.js"
import { emailVerficationCodetemp } from "../service/VerficationEmail.js"
import { sendEmail } from "../service/sendemail.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

const TokenandSend = async (email)=>{
   try {
        const code = generateVerificationCode()
        const verficationToken = jwt.sign({email},process.env.JWT_SECRET,{expiresIn:'2m'})
        const refreshToken = jwt.sign({email},process.env.JWT_SECRET_REFRESH)
        const html = emailVerficationCodetemp(code,`http://localhost:3000/users/verify/${verficationToken}/${refreshToken}`)
        const isSent = await sendEmail({to:email,html:html})
        if(!isSent){
            return false;
        }
        return code;
   } catch (error) {
        return false;
   }
}
export default TokenandSend