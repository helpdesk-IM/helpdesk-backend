const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "You are not authenticated" });
        }

        const token = authHeader.split(' ')[1]; // Extract the token

        jwt.verify(token, process.env.AUTH, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Invalid token" });
            }
            req.user = user; // Attach decoded user data to the request
            next();
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = verifyToken;


const verifyUser = (req, res, next) => { 
    verifyToken(req, res, () => { 
        if (req.user.id === req.params.id || req.user.role === 'user') {
            return next();
        } else {
            return res.status(403).json({ error: "You are not authorized" });
        }
    });
};

const verifyAdmin = (req, res, next) => { 
    verifyToken(req, res, () => { 
        if (req.user.role === 'admin') {
            return next();
        } else {
            return res.status(403).json({ error: "You are not authorized" });
        }
    });
};

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "You are not authenticated" });
    }

    const token = authHeader.split(' ')[1]; // Extract token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user; // Store user info in request
        next(); // Move to next function
    });
};
module.exports = { verifyAdmin, verifyUser, authMiddleware };
