import joi from "joi";
import { userGender, userRole } from "../../DB/models/user.model";
import { generalRules } from "../../../utils/generalRule";

export const signupSchema = {
  body: joi
    .object({
      name: joi.string().alphanum().min(3).max(5).required(),
      email: generalRules.email.required(),
      age: joi.number().min(18).max(60).integer().positive().required(),
      password: generalRules.password,
      cPassword: joi.string().valid(joi.ref("passw ord")).required(),
      gender: joi.valid(userGender.male, userGender.female).insensitive(),
      role: joi.valid(userRole.user, userRole.admin).insensitive(),
      id: generalRules.id.custom(customId).required(),
      phone: joi.string().required(),
    })
    .with("password", "cPassword"),
  query: joi.object({
    flag: joi.number().required(),
  }),
  headers: generalRules.headers.required(),
};
