const { verifySession } = require('../lib/supabase-auth');

/**
 * Middleware to verify user authentication
 * Extracts JWT token from Authorization header and verifies it
 * Attaches user object to req.user if valid
 */
async function authenticateUser(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid authorization token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify session
    const { user, error } = await verifySession(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Your session has expired or is invalid. Please sign in again.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred while verifying your session'
    });
  }
}

/**
 * Optional authentication middleware
 * Verifies token if present, but doesn't require it
 * Useful for endpoints that have different behavior for logged-in vs anonymous users
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { user } = await verifySession(token);

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    console.error('Optional auth error:', error);
    next();
  }
}

module.exports = {
  authenticateUser,
  optionalAuth
};
