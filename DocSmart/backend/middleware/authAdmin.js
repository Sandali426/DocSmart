import jwt from "jsonwebtoken";

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ 
                success: false, 
                message: "Not Authorized. Login Again." 
            });
        }

        // Get token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify admin credentials
        if (decoded.email !== process.env.ADMIN_EMAIL || decoded.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied. Admins Only." 
            });
        }

        // Attach admin details to request
        req.admin = decoded;
        next();
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: "Session expired. Please login again." 
            });
        }
        res.status(403).json({ 
            success: false, 
            message: "Invalid Token." 
        });
    }
};

export default authAdmin;