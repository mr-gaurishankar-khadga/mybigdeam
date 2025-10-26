const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  console.log('Auth middleware - Headers:', req.headers);
  const authHeader = req.header('Authorization') || req.headers['authorization'] || '';
  console.log('Auth middleware - Auth header:', authHeader);
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'gshankar@$%@lsdhglhf';
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Decoded:', decoded);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log('Auth middleware - Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken };


