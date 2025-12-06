import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, No token provided" });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = await User.findById(decode.userId).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, User not found" });
        }

        next();

    } catch (error) {
        console.error('Error in protectRoute Middleware: ', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}