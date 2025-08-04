const globalErrorHandler = (err, req, res, next) => {
  res
    .status(err.cause||500)
    .json({ message: err.message || "Error occurred", stack: err.stack, error: err });
};
export default globalErrorHandler;
