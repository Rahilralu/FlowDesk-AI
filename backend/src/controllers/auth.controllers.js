import { loginUser,refreshAccessToken,logoutUser } from "../services/auth.services.js";

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password is required" });
    }
    try {
        const { access_token, refresh_token } = await loginUser({ email, password });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.cookie('csrfToken', 'abc123', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ accessToken: access_token });
    } catch (err) {
        res.status(401).json({ error: err.message }); 
    }
}

export const refresh = async (req,res) =>{
    const token = req.cookies?.refresh_token;
    if(!token){
        return res.status(400).json({ error:"No refresh token"})
    }
    const { access_token,refresh_token } = await refreshAccessToken(token);

    res.cookie('refresh_token',refresh_token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite:'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({accessToken: access_token})
}

export const logout = async (req,res) =>{
    const token = req.cookies?.refresh_token;
    if(token) await logoutUser(token);

    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    });
    res.status(200).json({ success : true });
}