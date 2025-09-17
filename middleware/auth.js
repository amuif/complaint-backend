const jwt = require('jsonwebtoken');

// JWT Middleware for Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    req.admin = user; // For backward compatibility
    next();
  });
};

// Role-based Access Middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    next();
  };
};

// City/SubCity Access Control Middleware
const restrictToLocation = (req, res, next) => {
  const admin = req.user;

  // SuperAdmin: Access to everything
  if (admin.role === 'SuperAdmin') {
    return next();
  }

  // SubCityAdmin: Access only to their specific subcity
  if (admin.role === 'SubCityAdmin') {
    req.cityFilter = admin.city;
    req.subcityFilter = admin.subcity;
    return next();
  }

  // Department Admin: Access to their department across all locations
  if (admin.role === 'Admin') {
    req.departmentFilter = admin.department;
    return next();
  }

  next();
};

// Helper function to build location-based where conditions
const buildLocationFilter = (req) => {
  const filters = {};

  if (req.cityFilter) {
    filters.city = req.cityFilter;
  }

  if (req.subcityFilter) {
    filters.subcity = req.subcityFilter;
  }

  if (req.departmentFilter) {
    // Department filter can be applied to department fields
    filters.department = req.departmentFilter;
  }

  return filters;
};

module.exports = {
  authenticateToken,
  restrictTo,
  restrictToLocation,
  buildLocationFilter,
};
