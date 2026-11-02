// Ismai - Server instance create and config server - kon kon se middleware, api
const express = require("express");
const authRouter = require("./routes/auth.route");
const accountRouter = require("./routes/account.route");
const transactionRouter = require("./routes/transaction.route");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res)=>{
    res.send("Ledger service is up and running")
})

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

module.exports = app;