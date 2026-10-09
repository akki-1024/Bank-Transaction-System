const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");

/**  
 * - THIS IS JS DOC COMMENT - ye function mai hover kro ayega niche
 * - user register controller
 * - POST /api/auth/register
*/
async function userRegisterController(req, res) {
    const { email, password, name } = req.body;

    const isExists = await userModel.findOne({
        email
    });

    if (isExists) {
        // 422 - Unprocessable Content
        return res.status(422).json({
            message: "User already exists with this email",
            status: "failed"
        });
    }

    const user = await userModel.create({
        email,
        password,
        name
    });

    const token = jwt.sign({
        userId: user._id
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    res.cookie("jwt_token", token);

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });

    // await emailService.sendRegistrationEmail(user.email, user.name);
}


/**  
 * - THIS IS JS DOC COMMENT - ye function mai hover kro ayega niche
 * - user login controller
 * - POST /api/auth/login
*/
async function userLoginController(req, res) {

    const { email, password } = req.body;

    // select("-password") to remove - select: false, so its default
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        return res.status(401).json({
            message: "Email or password is invalid"
        })
    }
    
    console.log("user", user)

    // custom method
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
        return res.status(401).json({
            message: "Email or password is invalid"
        })
    }

    const token = jwt.sign({
        userId: user._id
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    res.cookie("jwt_token", token);

    res.status(200).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
}

module.exports = { userRegisterController, userLoginController };