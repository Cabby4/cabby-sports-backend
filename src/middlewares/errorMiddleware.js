
const errorHandler = (err, req, res, next) => {

  console.error(err.stack || err.message);

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong on the server."
        : err.message,
  });
  
};

module.exports = {
  errorHandler,
};
