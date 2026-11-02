const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// THIS IS JS DOC COMMENT  
/**
 *  POST / api/auth/register 
*/
router.post("/register", authController.userRegisterController)

/**
 * POST /api/auth/login
 */
router.post("/login", authController.userLoginController)

/**
 * GET /api/auth/login
 */
router.get("/logout", authController.userLogoutController)

module.exports = router;