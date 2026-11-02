const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    fromAccount: {
        type: mongoose.Schema.ObjectId,
        ref: "account",
        required: [true, "Transaction must be associated with a from account"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.ObjectId,
        ref: "account",
        required: [true, "Transaction must be associated with a to account"],
        index: true
    },
    status: {
        type: String,
        enum:{
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status can be either PENDING, COMPLETED, FAILED or REVERSED"
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Minimum amount can be 0"]
    },
    // generated at client side and must be unique
    idempotencyKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    }
}, {
    timestamps: true
});

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;