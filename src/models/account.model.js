const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

// user ka account model

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        // index for fast searching as there will be million users and a user can have multiple acconts
        index: true
        // behind the scene B+ tree data structure kaam krta h indexing mai
    },
    status: {
        type: String,
        // ACTIVE => using
        // FROZEN => cannot be used in this state but not closed
        // CLOSED => closed will not use in future
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN or CLOSED"
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required for creating an account"],
        default: "INR"
    },
    // balance nhi hota h mtlb direct field nhi hoti woh calculate hoti h transaction ledger se
}, {
    timestamps: true
});

// compound index create kiya h user or status pe, do field mai ek sath index create krte h usko bolte h compound index
accountSchema.index({user: 1, status: 1});

accountSchema.methods.getBalance = async function(){

    const balanceData = await ledgerModel.aggregate([
        { $match: {account: this._id} },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }
            }
        }
    ]);

    // if no ledger found
    if(balanceData.length === 0){
        return 0;
    }

    return balanceData[0].balance;
}

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;