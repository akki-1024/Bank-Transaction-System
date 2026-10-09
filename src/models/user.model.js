const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email is not valid'],
        unique: [true, "Email already exists"]
    },
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password atleast have 6 characters"],
        select: false // User ko jb fetch kroge toh password nhi ayega jb tk explicitly na mango
    }
}, {
    timestamps: true
});

// User ka data save hone se phle chalega
userSchema.pre("save", async function(){ // agr async hoga to next nhi hoga
    
    if(!this.isModified("password")){
        // return next();
        return;
    }

    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;

    // next();
})

// Compare krne ke liye
userSchema.methods.comparePassword = async function(password){
    // this - refers to user document
    console.log('password, this', password)
    console.log('password, this', this)
    return await bcrypt.compare(password, this.password);
}

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;