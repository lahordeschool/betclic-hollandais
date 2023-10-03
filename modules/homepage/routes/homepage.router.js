var express = require("express");
var router = express.Router();
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const disconnect = require("../../../lib/auth").disconnect;
const passport = require("passport");
const User = require("../../../models/user");

module.exports = function (io) {
  const router = express.Router();

  /* GET home page. */
  router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
      res.redirect("/hub");
    } else {
      res.redirect("/login");
    }
  });

  router.get("/logout", disconnect);

  return router;
};
