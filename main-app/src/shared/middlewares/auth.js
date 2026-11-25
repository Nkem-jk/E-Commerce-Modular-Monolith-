const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const prisma = require("../config/db");
const permissions = require("../config/permissions");

function authenticate(req,res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';

    next(new AppError(message, 401));
  }
}

function authorizeSelf(paramName = 'userId') {
  return (req, res, next) => {
    if (Number(req.params[paramName]) !== req.user.id) {
      return next(new AppError('You can only access your own data', 403));
    }
    next();
  }
}

function authorize(permission) {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { roleName: true },
      });

      const allowed = permissions[user?.roleName] ?? [];

      if (!allowed.includes(permission)) {
        return next(new AppError("You do not have permission to do this", 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { authenticate, authorizeSelf, authorize };

