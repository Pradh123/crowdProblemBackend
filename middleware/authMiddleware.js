const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

module.exports = (req, res, next) => {

  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

 
  const token = authHeader.replace('Bearer ', '');

  try {
 
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded; 
    next();
  } catch (err) {
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
   
    return res.status(401).json({ message: 'Token verification failed' });
  }
};