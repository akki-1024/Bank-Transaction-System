const express = require("express");
const authenticationMiddleware = require("../middlewares/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */
router.post("/", authenticationMiddleware.authMiddleware, accountController.createAccountController);

/**
 * - GET /api/accounts/
 * - Get all user accounts
 * - Protected Route
 */
router.get("/", authenticationMiddleware.authMiddleware, accountController.getUserAccounts);

/**
 * - GET /api/accounts/balance/:accountId
 * - Get user account balance
 * - Protected Route
 */
router.get("/:accountId", authenticationMiddleware.authMiddleware, accountController.getUserAccountBalance);



module.exports = router;