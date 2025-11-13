const jwt = require('jsonwebtoken');

/**
 * optionalAuth middleware: if Authorization header with Bearer token is present,
 * verify it and attach req.user = payload. If no header is present, continue
 * without error. If token is invalid, continue without attaching user but log.
 */
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    // no token provided - continue as anonymous
    return next();
  }

  const token = auth.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
  } catch (err) {
    console.warn('optionalAuth: invalid token, continuing as anonymous');
  }
  return next();
};

module.exports = optionalAuth;
