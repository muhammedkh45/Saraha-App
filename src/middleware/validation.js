export const validation = (schema) => {
  return (req, res, next) => {
    let validationErrors = [];
    for (const key of Object.keys(schema)) {
      const data = schema[key].validate(req.body, { abortEarly: false });
      if (data?.error) {
        validationErrors.push(data?.error?.details);
      }
      if (validationErrors.length) {
        return resizeBy.status(400).json({ error: data.error });
      }
    }
    return next();
  };
};
