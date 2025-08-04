import bcrypt from "bcryptjs";
export const compare = async ({plainText, cipherText})=>{
    return bcrypt.compareSync(plainText, cipherText);
}