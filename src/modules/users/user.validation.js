import joi from "joi";
import { userGender, userRole } from "../../DB/models/user.model.js";
import { generalRules } from "../../utils/generalRule.js";

export const signupSchema = {
  body: joi.object({
    name: joi.string().min(3).max(30).required(),
    email: generalRules.email.required(),
    age: joi.number().min(18).max(60).integer().positive().required(),
    password: generalRules.password,
    cPassword: joi.string().valid(joi.ref("password")).required(),
    // gender: joi.valid(userGender.male, userGender.female),
    role: joi.valid(userRole.user, userRole.admin),
    // id: generalRules.id,
    phone: joi.string().required(),
  }),
  //   .with("password", "cPassword"),
  // query: joi.object({
  //   flag: joi.number(),
  // }),
  // headers: generalRules.headers,
};
