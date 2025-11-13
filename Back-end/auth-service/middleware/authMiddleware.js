// auth-service/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const verifyAuth = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  
  console.log('[authMiddleware] Verifying request to:', req.path);
  console.log('[authMiddleware] Authorization header present:', !!auth);
  
  if (!auth || !auth.startsWith('Bearer ')) {
    console.log('[authMiddleware] Missing or malformed Authorization header');
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }

  const token = auth.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
  
  console.log('[authMiddleware] Token length:', token.length);
  console.log('[authMiddleware] Using JWT_SECRET:', jwtSecret.substring(0, 5) + '...');

  try {
    const payload = jwt.verify(token, jwtSecret);
    console.log('[authMiddleware] Token verified successfully for user:', payload.email);
    // payload expected to contain { id, email, role }
    req.user = payload;
    next();
  } catch (err) {
    console.error('[authMiddleware] JWT verification failed:', err.message);
    console.error('[authMiddleware] Error name:', err.name);
    
    // Provide more specific error messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expiredAt: err.expiredAt });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    } else if (err.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token not active yet' });
    }
    
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyAuth;