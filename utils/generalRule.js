import { Types } from "mongoose";
export const customId = (value, helper) => {
  const data = Types.ObjectId.isValid(value);
  return data ? value : helper.message("InValid Id");
};
export const generalRules = {
  id: joi.string().custom(customId),
  email: joi.string().email({ tlds: { allow: ["com", "org"] } }),
  password: joi.string().required(),
  headers: joi.object({
    authorization: joi.string().required(),
    host: joi.string().required(),
    "accept-encoding": joi.string().required(),
    "content-type": joi.string().required(),
    "content-length": joi.string().required(),
    connection: joi.string().required(),
    "user-agent": joi.string().required(),
    accept: joi.string().required(),
    "cache-control": joi.string().required(),
    "postman-token": joi.string().required(),
  }),
};
