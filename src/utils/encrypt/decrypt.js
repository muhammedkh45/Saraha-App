import CryptoJS from "crypto-js";
export const decrypt = async ({ cipheredText, secertKey }) => {
  return CryptoJS.AES.decrypt(cipheredText, secertKey).toString(
    CryptoJS.enc.Utf8
  );
};
