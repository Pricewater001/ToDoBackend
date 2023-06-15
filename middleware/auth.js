const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    console.log("token arrived to backend", token)
    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET_KEY);
        context.userId = user.userId;
        return;
      } catch (err) {
        throw new Error("Invalid/Expired token");
      }
    }

    throw new Error("Authentication token must be 'Bearer [token]'");
  }

  throw new Error("Authorization header must be provided");
};
