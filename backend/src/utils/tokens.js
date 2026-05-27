import jwt from "jsonwebtoken";

export function generateAccessToken(userId,email){
    return jwt.sign(
        {userId , email},
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h'}
    )
}

export function generateRefreshToken(userId){
    return jwt.sign(
        {userId},
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d'}
    )
}