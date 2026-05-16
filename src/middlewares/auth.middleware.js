const UserModel = require('../models/user.model');
const apiError = require('../utils/apiError');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, _, next) => {
     try {
        const token = req?.cookies?.accessToken || req.headers?.authorization?.split(' ')[1];
        if (!token) {
            throw new apiError(401, 'No token provided');
        }
        
        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error('[Auth] JWT verification failed:', jwtError.message);
            throw new apiError(401, 'Invalid token');
        }
        
        // Find the user
        const user = await UserModel.findById(decoded.id).select('-password -refreshToken');
        if (!user) {
            throw new apiError(404, 'User not found');
        }
        req.user = user;
        next();
     } catch (error) {
        if (error instanceof apiError) {
            throw error;
        }
        console.error('[Auth] Unexpected error:', error.message);
        throw new apiError(401, 'Invalid token');
     }
})

module.exports = authMiddleware;