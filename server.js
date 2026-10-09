require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/db");

connectToDB();

app.listen(process.env.PORT, () => {
    console.log(`Server started at ${process.env.PORT}`);
});