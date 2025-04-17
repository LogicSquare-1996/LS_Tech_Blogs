const express = require("express")
const router = express.Router()
const expressJwt = require("express-jwt")
const checkJwt = expressJwt({ secret: process.env.SECRET, algorithms: ['RS256'] }) // the JWT auth check middleware

const users = require("./users")

router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

router.get("/user/:id", users.get)

module.exports = router
