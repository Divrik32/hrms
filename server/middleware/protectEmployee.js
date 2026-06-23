import jwt from "jsonwebtoken";

export const protectEmployee = ( req, res, next ) => {
  try {
    let token;
    // 1. Authorization header
    if ( req.headers.authorization?.startsWith("Bearer ")){
        token = req.headers.authorization.split(" ")[1];
    }
    // 2. Cookie
    if ( !token && req.cookies?.employeeToken ){
        token = req.cookies.employeeToken;
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }
    const decoded = jwt.verify( token, "secretkey" );
    req.user = {
      _id: decoded.id,
      role: decoded.role,
      companyId: decoded.companyId,
      departmentId: decoded.departmentId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};