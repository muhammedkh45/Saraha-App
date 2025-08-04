import CryptoJS from "crypto-js";
export const encrypt = async ({ plainText, signature } = {}) => {
  return CryptoJS.AES.encrypt(plainText, signature).toString();
};
