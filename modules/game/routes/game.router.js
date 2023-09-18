var express = require("express");
var router = express.Router();
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const disconnect = require("../../../lib/auth").disconnect;
const passport = require("passport");
const User = require("../../../models/user");


/* GET game page. */
router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("../views/game", {user: req.userObj});
    } else {
        res.redirect("/login");
    }
});

router.get("/logout", disconnect);

module.exports = router;
