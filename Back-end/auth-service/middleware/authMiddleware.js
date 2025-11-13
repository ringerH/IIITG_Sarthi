// auth-service/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const verifyAuth = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }

  const token = auth.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';

  try {
    const payload = jwt.verify(token, jwtSecret);
    // payload expected to contain { id, email, role }
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message || err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyAuth;