const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

// We load the Models
require("./users//models/User");
require("./posts//models/Post");
require("./products//models/Product");
require("./products/models/ProductRent.js");
const authRouter = require("./auth/auth.routes");
const usersRouter = require("./users/users.routes");
const postsRouter = require("./posts/posts.routes");
const productsRouter = require("./products/products.routes");
const healthcheck = require("./routes/health-check.routes");
require("dotenv").config();
const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");

    if (req.method === "OPTIONS") {
        return res.send(200);
    } else {
        if (process.env.NODE_ENV != "test") {
            console.log(req.originalUrl);
        }
        return next();
    }
});
// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json({limit: '10mb'}));
// DB Config
// const localUrl = "mongodb://localhost:27017/shareallDb";
const db = process.env.MONGO_URI;
// Connect to MongoDB
if (process.env.NODE_ENV != "test") {
    mongoose
        .connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => console.log("MongoDB successfully connected"))
        .catch(err => console.log(err));


}



// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/", healthcheck);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/products", productsRouter);

app.get("/favicon.ico", (req, res) => {
    res.end();
    console.log("favicon requested");
    return;
});
const port = process.env.PORT || 5000;

app.listen(port, () => {
    if (process.env.NODE_ENV != "test") {
        console.log(`Server up and running on port ${port} !`);
    }
});
