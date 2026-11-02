const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({

    account: {
        type: mongoose.Schema.ObjectId,
        ref: "account",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true, // single source of truth can be modified or deleted
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for ledger entry"],
        immutable: true, // single source of truth can be modified or deleted
    },
    transaction: {
        type: mongoose.Schema.ObjectId,
        ref: "transaction",
        required: [true, "Ledger must be associated with a transaction"],
        index: true,
        immutable: true, // single source of truth can be modified or deleted
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"],
            message: "Type can be either CREDIT or DEBIT",
        },
        required: [true, "Ledger type is required"],
        immutable: true, // single source of truth can be modified or deleted
    }
});

function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

// UPDATE operations
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("replaceOne", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

// DELETE operations
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;