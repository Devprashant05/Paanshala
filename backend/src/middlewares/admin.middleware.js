// middlewares/admin.middleware.js
export const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

// New: permission-specific middleware factory
export const requirePermission = (permission) => (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    // Empty permissions array = super admin, has all access
    const permissions = req.user.permissions || [];
    if (permissions.length === 0 || permissions.includes(permission)) {
        return next();
    }

    return res.status(403).json({
        message: `Access denied. You don't have permission to access: ${permission}`,
    });
};
