const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
        index: true,
        immutable: true // single source of truth, cannot be modified
    },
    amount: {
        type: Number,
        required: true,
        immutable: true // cannot be modified
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: true,
        index: true,
        immutable: true // cannot be modified
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"],
            message: "Type can be either CREDIT or DEBIT"
        },
        required: true,
        immutable: true // cannot be modified
    },
});

function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}

ledgerSchema.pre("updateOne", preventLedgerModification);         // ek document update hone se pehle
ledgerSchema.pre("updateMany", preventLedgerModification);        // kai documents update hone se pehle
ledgerSchema.pre("deleteOne", preventLedgerModification);         // ek document delete hone se pehle
ledgerSchema.pre("deleteMany", preventLedgerModification);        // kai documents delete hone se pehle
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);  // dhundo aur update karne se pehle
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);  // dhundo aur delete karne se pehle
ledgerSchema.pre("findOneAndReplace", preventLedgerModification); // dhundo aur replace karne se pehle
ledgerSchema.pre("replaceOne", preventLedgerModification);        // ek document poora replace hone se pehle

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;