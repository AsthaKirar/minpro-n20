require("./config/db.config")
const express = require('express');
const app = express();
const userModel = require("./models/user.model");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")
const expressSession = require("express-session")

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "hjagshkncbhjakskzbchkj"
}));
app.use(flash());



// Define the route for the root path
app.get("/", function(req, res) {
    res.render("welcome");
});
app.get("/profile", isLoggedIn,async function (req, res) {
    let user = await userModel.findOne({ username: req.user.username });

    res.render("profile",{user});
});


app.get("/register", function(req, res) {
    res.render("register", { error: req.flash("error")[0] });

});
app.post("/register",  async function(req, res) {
    let { username,  password } = req.body
    let user = await userModel.findOne({ username });
    if (user) {
        req.flash("error", "account already exists, please login.");
        return res.redirect("/register");
    }

    bcrypt.genSalt(10,function(err,salt){
        console.log(salt)
        bcrypt.hash(password,salt,async function(err,hash){
            console.log(hash)
             await userModel.create({
                username,
                password:hash,
            })
            const token = jwt.sign({ username },"screte");
            res.cookie("token",token)
            res.redirect("/profile");

            
        })
    })
    
});
app.get("/login", function(req, res) {
    res.render("login", { error: req.flash("error")[0] });

});


app.post("/login",async function(req, res) {
    let { username,  password } = req.body
    let user = await userModel.findOne({ username });
    if (!user) {
        req.flash("error", "username or password is incorrect.");
        return res.redirect("/login");
    }
    bcrypt.compare(password,user.password, function(err,result){
        if(result){
            let token = jwt.sign({username},screte)
            res.cookie("token",token)
            res.redirect("/profile");

            res.send(loggedin);
        }
        else {
            req.flash("error", "username or password is incorrect.")
            res.redirect("/login");
        }

    })

});
app.get("/logout",function(req,res){
    res.cookie("token","");
    res.redirect("/login")
})

function isLoggedIn(req,res,next){
    if(!req.cookies.token)return res.redirect("/login")
        jwt.verify(req.cookies.token,"screte",function(err,decoded){
    if(err){
        res.cookie("token","");
        return res.redirect("/login")
    }
    else{
        req.user = decoded;
        next();
    }
    })
}
// Start the server on port 3000
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
