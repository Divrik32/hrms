import jwt from "jsonwebtoken";

export const protectSuperAdmin = (req, res, next) => {
  try {
     const token = req.cookies.token;
     console.log(token);
     
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, "secretkey");
    console.log(decoded);

    if (decoded.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};