import jwt from 'jsonwebtoken'
import prisma from '../config/psql.js'
import { generateAccessToken } from '../utils/tokens.js'
import crypto from "crypto"

//Protect routes — Verification with access token is done over here
export const authenticate_token = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({success: false,message:"Invalid or missing authorization header"});
        }

        const token = authHeader.split(" ")[1];
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,decoded) => {
            if(err){
                if(err.name === "TokenExpiredError"){
                    return res.status(401).json({
                        success: false,
                        message: "Token expired",
                        code:"TOKEN_EXPIRED"
                    })
                }
                return res.status(403).json({success: false, message: "Invalid Token"});
            }

            req.user = decoded
            next()
        })
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Server Error"});    
    }
}

// Refresh token validation
export const cookie_validator = async (req,res,next) => {
    try {
        const token = req.cookies?.refresh_token;
        if(!token){
            return res.status(401).json({success: false,message: "No refresh token"})
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const stored = await prisma.refreshToken.findUnique({
            where: { token : tokenHash },
            include: { user : true }
        })

        if(!stored || stored.expiresAt < new Date()){
            return res.status(403).json({success : false,message: "Token revoked or expired"})
        }

        jwt.verify(token,process.env.REFRESH_TOKEN_SECRET, (err) => {
            if(err){
                return res.status(403).json({success : false , message: "Invalid refresh token"});
            }
            const access_token = generateAccessToken(
                stored.user.email
            )

            res.cookie("access_token", access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 15 * 60 * 1000
            })
            req.user = stored.user
            next()
        })
    } catch (err) {
        res.status(500).json({success: false,message: "Server Error"})
    }
}

//Cross site protection
export const csrfMiddleware = (req, res, next) => {
  const csrfCookie = req.cookies?.csrfToken
  const csrfHeader = req.headers["x-csrf-token"]

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ success: false, message: "CSRF token invalid" })
  }
  
  next()
}