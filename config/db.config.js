const mongoose = require("mongoose");
async function connectionDb(){
    await mongoose.connect("mongodb://127.0.0.1:27017/mongodbN20");
    console.log("connect to db")
}
connectionDb();
module.exports = mongoose.connection;