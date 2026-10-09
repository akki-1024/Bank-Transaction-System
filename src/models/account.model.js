const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        // indexing for fast searching
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either be ACTIVE, FROZEN or CLOSED",
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
        default: "INR"
    }
}, {
    timestamps: true
});

// Compound index if creating index more than one field
accountSchema.index({ user: 1, status: 1 });

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;