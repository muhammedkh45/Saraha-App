import userModel from "../../DB/models/user.model.js";
import dotenv from "dotenv";
import path from "node:path";
import { userRole } from "../../DB/models/user.model.js";
import { eventEmitter } from "../../utils/TokenandSend.js";
import { generateToken, verifyToken } from "../../utils/token/index.js";
import { hash, compare } from "../../utils/Hash/index.js";
import { encrypt, decrypt } from "../../utils/encrypt/index.js";

dotenv.config({ path: path.resolve("src/config/.env") });

export const signUp = async (req, res, next) => {
  const { name, email, password, phone, age, gender, role } = req.body;
  const user = await userModel.findOne({ email });
  if (user) throw new Error("Email already exists.", { cause: 409 });
  const hashed = await hash({
    plainText: password,
    saltRounds: +process.env.SALT_ROUNDS,
  });
  const ciphertext = await encrypt({
    plainText: phone,
    signature: process.env.JWT_SECRET,
  });

  eventEmitter.emit("sendEmail", {
    data: {
      email: email,
      attemptsLeft: 5,
      timeToReattempts: 0,
    },
  });
  const userData = {
    name,
    email,
    password: hashed,
    phone: ciphertext,
    age,
  };
  if (gender) userData.gender = gender;
  if (role) userData.role = role;
  await userModel.create(userData);
  return res.status(201).json({
    message:
      "User added successfully. and Verification code was sent to you email",
  });
};
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, isConfimed: true });
  if (!user) {
    throw new Error("invalid email or password.", { cause: 409 });
  }
  const match = await compare({
    plainText: password,
    cipherText: user.password,
  });
  if (!match) {
    throw new Error("invalid email or password.", { cause: 409 });
  }
  const accessToken = await generateToken({
    payload: { id: user._id, email: email },
    Signature:
      user.role === userRole.user
        ? process.env.JWT_USER_SECRET
        : process.env.JWT_ADMIN_SECRET,
    options: { expiresIn: "1h" },
  });

  const refreshToken = await generateToken({
    payload: { id: user._id, email: email },
    Signature:
      user.role === userRole.user
        ? process.env.JWT_USER_SECRET_REFRESH
        : process.env.JWT_ADMIN_SECRET_REFRESH,
  });
  return res.status(200).json({
    message: "Login Successfull",
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};
export const updateLoggedInUser = async (req, res, next) => {
  const { name, email, age } = req.body;
  if (await userModel.findOne({ email })) {
    throw new Error("Email already Exist", { cause: 409 });
  }
  await userModel.updateOne(
    { _id: req.user._id },
    { name: name, email: email, age: age }
  );
  return res.status(201).json({ message: "User updated" });
};
export const deleteLoggedInUser = async (req, res, next) => {
  await userModel.deleteOne(req.user._id);
  return res.status(201).json({ message: "User deleted" });
};
export const getProfile = async (req, res, next) => {
  const phone = await decrypt({
    cipheredText: req.user.phone,
    secertKey: process.env.JWT_SECRET,
  });
  const password = "";
  return res.status(200).json({ ...req.user._doc, phone, password });
};
export const confirmEmail = async (req, res, next) => {
  try {
    const verficationToken = req.params.verficationToken;
    if (!verficationToken) {
      throw new Error("Token missing", { cause: 401 });
    }

    const decoded = await verifyToken({
      payload: verficationToken,
      Signature: process.env.JWT_SECRET,
    });

    const { code } = req.body;
    let user = await userModel.findOne({
      email: decoded.email,
      isConfimed: false,
    });
    if (!user) {
      throw new Error("User not found or already verified.", { cause: 404 });
    }
    if (user.timeToReattempts !== 0 && user.timeToReattempts > Date.now()) {
      const minutesLeft = Math.ceil(
        (user.timeToReattempts - Date.now()) / 60000
      );
      throw new Error(`Try to reattempt after ${minutesLeft} minutes`, {
        cause: 401,
      });
    }
    if (user.code.toString() !== code.toString()) {
      if (user.attemptsLeft <= 1) {
        const lockoutTime = Date.now() + 5 * 60 * 1000;
        await userModel.updateOne(
          { email: decoded.email },
          { attemptsLeft: 5, timeToReattempts: lockoutTime }
        );
        const minutesLeft = Math.ceil((lockoutTime - Date.now()) / 60000);
        throw new Error(`Try to reattempt after ${minutesLeft} minutes`, {
          cause: 401,
        });
      } else {
        await userModel.updateOne(
          { email: decoded.email },
          { $inc: { attemptsLeft: -1 } }
        );
        throw new Error(
          `Try to reattempt, you have ${user.attemptsLeft - 1} attempts left`,
          { cause: 401 }
        );
      }
    }
    await userModel.updateOne(
      { email: decoded.email },
      {
        isConfimed: true,
        $unset: { timeToReattempts: "", attemptsLeft: "", code: "" },
      }
    );
    return res.status(200).json({ message: "User confirmed successfully" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token", { cause: 401 });
    } else if (error.name === "TokenExpiredError") {
      const refreshToken = req.params.refreshToken;
      if (!refreshToken) {
        throw new Error("Refresh Token missing", { cause: 401 });
      }
      const decoded = await verifyToken({
        payload: refreshToken,
        Signature: process.env.JWT_SECRET_REFRESH,
      });
      const email = decoded.email;
      eventEmitter.emit("sendEmail", { data: { email } });
      await userModel.updateOne({ email: email });
      throw new Error(
        "Code was expired and New code is sent to your Email, please check your inbox",
        { cause: 401 }
      );
    } else {
      console.log(error);

      throw new Error(error.message, { cause: error.cause });
    }
  }
};
