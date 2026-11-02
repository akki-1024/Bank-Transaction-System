const express = require("express");

const authenticationMiddleware = require("../middlewares/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */
router.post("/", authenticationMiddleware.authMiddleware, transactionController.createTransaction);

/**
 * - POST /api/transactions/systems/initial-funds
 * - Create initial funds transaction from system user
 */
router.post("/system/initial-funds", authenticationMiddleware.authSystemUser, transactionController.createInitialFundsTransaction);

module.exports = router;