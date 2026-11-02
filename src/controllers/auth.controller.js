const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const emailService = require("../services/email.service");
const jwt = require("jsonwebtoken");

/** 
* user register controller
* - POST /api/auth/register
*/
async function userRegisterController(req, res){

    const {email, password, name} = req.body;

    const isExists = await userModel.findOne({
        email
    });

    if(isExists){
        return res.status(422).json({
            message: "User already exists",
            status: "failed"
        });
    }

    const user = await userModel.create({
        email, password, name
    });

    // ok now give token to mark it as it is authenticated
    
    const token = jwt.sign({
            userId: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "3d"
        }
    )

    // set token in cookie
    res.cookie("token", token);

    res.status(201).json({
        message: "User registered successfully",
        status: "success",
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        }, 
        token
    });

    // Email send after response because kyu wait krana user ko
    await emailService.sendRegistrationEmail(user.email, user.name);
}

/**
 * user login controller
 * - POST /api/auth/login
 */
async function userLoginController(req, res){
    
    const {email, password} = req.body;

    const user = await userModel.findOne({email}).select("+password");

    if(!user){
        return res.status(401).json({
            message: "Email or password is invalid"
        });
    }

    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword){
        return res.status(401).json({
            message: "Email or password is invalid"
        })
    }

    const token = jwt.sign({
            userId: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "3d"
        }
    )

    // set token in cookie
    res.cookie("token", token);

    res.status(200).json({
        message: "User logged in successfully",
        status: "success",
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        }, 
        token
    });
}

async function userLogoutController(req, res){

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(400).json({
            message: "Token not found"
        });
    }

    await tokenBlacklistModel.create({
        token
    })

    // clear token
    // req.cookie("token", "");
    req.clearCookie("token");

    res.status(200).json({
        message: "User logged out successfully"
    });

}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}; 