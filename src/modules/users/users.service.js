import {
  userModel,
  userProviders,
  userRole,
} from "../../DB/models/user.model.js";
import { eventEmitter } from "../../utils/TokenandSend.js";
import { generateToken, verifyToken } from "../../utils/token/index.js";
import { hash, compare } from "../../utils/Hash/index.js";
import { encrypt, decrypt } from "../../utils/encrypt/index.js";
import { nanoid } from "nanoid";
import revokeTokenModel from "../../DB/models/revoke-token.model.js";
import generateVerificationCode from "../../utils/generateVerficationCode.js";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../../utils/cloudinary/index.js";

export const signUp = async (req, res, next) => {
  if (!req?.file) throw new Error("File is required", { cause: 401 });
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

  // eventEmitter.emit("sendEmail", {
  //   data: {
  //     email: email,
  //     attemptsLeft: 5,
  //     timeToReattempts: 0,
  //   },
  // });
  const uploaded = await cloudinary.uploader
    .upload(req?.file?.path, {
      folder: "SarahaApp/users",
      use_filename: true,
      resource_type: "auto",
    })
    .then((result) => console.log(result));
  const userData = {
    name,
    email,
    password: hashed,
    phone: ciphertext,
    age,
    image: req.file.path,
  };
  if (gender) userData.gender = gender;
  if (role) userData.role = role;
  await userModel.create(userData);
  return res.status(201).json({
    message:
      "User added successfully. and Verification code was sent to you email",
    uploaded,
  });
};
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, isConfimed: true });
  if (!user) {
    throw new Error("invalid email or password. || or may be not confirmed", {
      cause: 409,
    });
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
    options: { expiresIn: "1h", jwtid: nanoid() },
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
export const loginWithGmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const client = new OAuth2Client();
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.WEB_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    }
    const { email, email_verified, picture, name } = await verify();
    let user = await userModel.findOne({ email });
    if (!user) {
      user = await userModel.create({
        name,
        email,
        isConfimed: email_verified,
        image: picture,
        providor: userProviders.google,
      });
    } else {
      throw new Error("Email already exits.", { cause: 409 });
    }
    if (user.provider !== userProviders.google) {
      throw new Error("Please login on system ", { cause: 401 });
    }
    const accessToken = await generateToken({
      payload: { id: user._id, email: email },
      Signature:
        user.role === userRole.user
          ? process.env.JWT_USER_SECRET
          : process.env.JWT_ADMIN_SECRET,
      options: { expiresIn: "1h", jwtid: nanoid() },
    });

    const refreshToken = await generateToken({
      payload: { id: user._id, email: email },
      Signature:
        user.role === userRole.user
          ? process.env.JWT_USER_SECRET_REFRESH
          : process.env.JWT_ADMIN_SECRET_REFRESH,
    });
    res.status(200).json({ message: "Loged in successfully" });
  } catch (error) {
    throw new Error(error.message, { cause: error.cause || 500 });
  }
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

export const logout = async (req, res, next) => {
  try {
    const revokeToken = await revokeTokenModel.create({
      tokenId: req.decoded.jti,
      expireAt: req.decoded.exp,
    });
    res.status(200).json({ message: "Success", decoded: req.decoded });
  } catch (error) {
    throw new Error(error.message, { cause: 500 });
  }
};
export const refreshToken = async (req, res, next) => {
  try {
    const accessToken = await generateToken({
      payload: { id: req.user._id, email: req.user.email },
      Signature:
        req.user.role === userRole.user
          ? process.env.JWT_USER_SECRET
          : process.env.JWT_ADMIN_SECRET,
      options: { expiresIn: "1h", jwtid: nanoid() },
    });

    const refreshToken = await generateToken({
      payload: { id: req.user._id, email: req.user.email },
      Signature:
        req.user.role === userRole.user
          ? process.env.JWT_USER_SECRET_REFRESH
          : process.env.JWT_ADMIN_SECRET_REFRESH,
    });
    return res.status(200).json({
      message: "Request Successfull",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    throw new Error(error.message, { cause: 500 });
  }
};
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!compare({ plainText: oldPassword, cipherText: req.user.password })) {
      throw new Error("password not correct", { cause: 401 });
    }
    req.user.password = await hash({
      plainText: newPassword,
      saltRounds: +process.env.SALT_ROUNDS,
    });
    await req.user.save();
    return res.status(200).json({ message: "password updated Successfully" });
  } catch (error) {
    throw new Error(error.message, { cause: error.cause || 500 });
  }
};
export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) throw new Error("user not exists.", { cause: 404 });
    const code = generateVerificationCode();
    eventEmitter.emit("forgetPassword", {
      data: {
        email: email,
        code: code,
      },
    });
    user.otp = await hash({
      plainText: code,
      saltRounds: +process.env.SALT_ROUNDS,
    });
    await user.save();
    res.status(200).json({ message: "Success" });
  } catch (error) {
    throw new Error(error.message, { cause: error.cause || 500 });
  }
};
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await userModel.findOne({ email, otp: { $exists: true } });
    if (!user) throw new Error("user not exists.", { cause: 404 });
    if (!(await compare({ plainText: otp, cipherText: user?.otp })))
      throw new Error("Invalid OTP", { cause: 401 });
    const hashed = await hash({
      plainText: newPassword,
      saltRounds: +process.env.SALT_ROUNDS,
    });
    await userModel.updateOne(
      { email },
      {
        password: hashed,
        $unset: { otp: "" },
      }
    );
    res.status(200).json({ message: "Success" });
  } catch (error) {
    throw new Error(error.message, { cause: error.cause || 500 });
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const { age, gender, phone, email, name } = req.body;
    if (name) req.user.name = name;
    if (gender) req.user.gender = gender;
    if (age) req.user.age = age;
    if (phone) {
      req.user.phone = await encrypt({
        plainText: phone,
        signature: process.env.JWT_SECRET,
      });
    }
    if (email) {
      const user = await userModel.findOne({ email });
      if (user) throw new Error("user Already exists", { cause: 409 });
      eventEmitter.emit("sendEmail", {
        data: {
          email: email,
          attemptsLeft: 5,
          timeToReattempts: 0,
        },
      });
      req.user.email = email;
      req.user.isConfimed = false;
    }
    await req.user.save();
    res.status(200).json({ message: "Success" });
  } catch (error) {
    throw new Error(error.message, { cause: error.cause || 500 });
  }
};
export const freezeProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id && req.user.role !== userRole.admin) {
      throw new Error("you can not freeze this account", { cause: 401 });
    }
    const user = await userModel.updateOne(
      {
        _id: id || req.user._id,
        isDeleted: { $exists: false },
      },
      {
        isDeleted: true,
        deletedBy: req.user._id,
      },
      {
        $inc: { __v: 1 },
      }
    );
    res.status(200).json({ message: "Success" });
  } catch (error) {
    throw new Error(error.message, { cause: error.cause || 500 });
  }
};
export const unFreezeProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id && req.user.role !== userRole.admin) {
      throw new Error("you can not freeze this account", { cause: 401 });
    }
    const user = await userModel.updateOne(
      {
        _id: id || req.user._id,
        isDeleted: { $exists: true },
      },
      {
        $unset: { isDeleted: "" },
        $unset: { deletedBy: "" },
      },
      {
        $inc: { __v: 1 },
      }
    );
    res.status(200).json({ message: "Success" });
  } catch (error) {
    throw new Error(error.message, { cause: error.cause || 500 });
  }
};

//oAuth2.0 >> google , facebook
// clientId >> frontend , backend
