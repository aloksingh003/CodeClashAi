const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getCookieValue = (cookieHeader, cookieName) => {
  const cookieItem = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${cookieName}=`));

  if (!cookieItem) return null;

  return decodeURIComponent(
    cookieItem.slice(cookieName.length + 1)
  );
};

const socketAuth = async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Authentication required"));
    }

    const token = getCookieValue(cookieHeader, "token");

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("User no longer exists"));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error(`Socket authentication error: ${error.message}`);
    next(new Error("Invalid or expired token"));
  }
};

module.exports = socketAuth;