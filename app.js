require("./config/db.config")
const express = require('express');
const app = express();
const userModel = require("./models/user.model");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


// Define the route for the root path
app.get("/", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {
    const { username, email, password } = req.body
    bcrypt.genSalt(10,function(err,salt){
        console.log(salt)
        bcrypt.hash(password,salt,async function(err,hash){
            console.log(hash)
            const user = await userModel.create({
                username,
                email,
                password:hash,
            })
            const token = jwt.sign({ email },"screte");
            res.cookie("token",token)
            res.send(user);
        })
    })
    
});
app.get("/login", function(req, res) {
    res.render("login");
});


app.post("/login",async function(req, res) {
    let { username, email, password } = req.body
    let user = await userModel.findOne({ username });
    if(!user) return res.send("inccorect username or password");
    bcrypt.compare(password,user.password, function(err,result){
        if(result){
            let token = jwt.sign({email},screte)
            res.cookie("token",token)
            res.send(loggedin);
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
