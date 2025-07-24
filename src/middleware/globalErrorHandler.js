const globalErrorHandler = (err, req, res, next) => {
  res
    .status(error.cause)
    .json({ message: err.message, stack: err.stack, error: err });
};
export default globalErrorHandler;
