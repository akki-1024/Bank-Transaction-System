const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");

const authMiddleware = async (req, res, next) => {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message: "Unauthroized access, token is missing"
        });
    }


    const isBlacklistedToken = await tokenBlacklistModel.findOne({
        token
    });

    if(isBlacklistedToken){
        return res.status(401).json({
            message: "Token is invalid"
        });
    }

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        // const user = await userModel.findById(decoded.userId).select(-password); => select(-password) not required as password: select - false on schema  
        const user = await userModel.findById(decoded.userId); 

        req.user = user;

        next();

    } catch(err){
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        });
    }

}

const authSystemUser = async (req, res, next) => {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        });
    }

    const isBlacklistedToken = await tokenBlacklistModel.findOne({
        token
    });

    if(isBlacklistedToken){
        return res.status(401).json({
            message: "Token is invalid"
        });
    }

    try{
        const decoded = jwt.verify(process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser");

        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden access, Not a system user"
            });
        }

        req.user = user;

        return next();
    } catch(err){
        // Token is invalid or expired
        return res.status(401).json({
            message: "Unauthoized access, token is invalid"
        });
    }

}

module.exports = {authMiddleware, authSystemUser};