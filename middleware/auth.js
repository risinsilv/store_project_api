const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send('Invalid or expired token.');
        }

        // Attach the decoded user information to the request object
        req.user = user;
        next(); // Pass control to the next middleware or route handler
    });
};

// Middleware to check if the user is an admin
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied. Admins only.');
    }
    next(); // Pass control to the next middleware or route handler
};

module.exports = { authenticateToken, authorizeAdmin };