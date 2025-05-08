import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// authMiddleware.js
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // First check Authorization header for Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Using token from Authorization header');
    }
    
    // Fall back to cookie if header not present
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
      console.log('Using token from cookies');
    }

    if (!token) {
      console.log('No token found in request', {
        headers: Object.keys(req.headers),
        hasCookies: !!req.cookies,
        cookieKeys: req.cookies ? Object.keys(req.cookies) : []
      });
      return res.status(401).json({ message: 'Not authorized, no token found' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
