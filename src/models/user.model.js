const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, "Email is invalid"],
        unique: [true, "Email must be unique"]
    },
    name:{
        type: String,
        required: [true, "Name is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password should contain more than 6 characters"],
        select: false
    },
    // for seeding data - allocating funds or creating default ledger
    // DB mai khud se true kr dena
    systemUser:{
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
},{
    timestamps: true
});

// remove next in async function
// userSchema.pre("save", async function(next){
userSchema.pre("save", async function(){
    
    // this refers to document

    if(!this.isModified("password")){
        // return next()
        return
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    // return next();
    return;
});

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;