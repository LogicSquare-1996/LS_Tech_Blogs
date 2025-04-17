const express = require("express")
const router = express.Router()
const expressJwt = require("express-jwt")
const checkJwt = expressJwt({ secret: process.env.SECRET, algorithms: ['HS256'] }) // the JWT auth check middleware

const users = require("./users")
const blogs = require("./blogs")
const dashboard = require("./dashboard")
const broadcast = require("./broadcast")

router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

// User routes
router.get("/user/:id", users.get)
router.get("/users", users.getAllUsers)
router.put("/user/:id/role", users.updateUserRole)

// Dashboard routes
router.get("/dashboard/stats", dashboard.getDashboardStats)

// Blog routes
router.get("/blogs", blogs.getAllBlogs)
router.delete("/blogs/:id", blogs.deleteBlog)
router.get("/comments", blogs.getAllComments)
router.delete("/comments/:id", blogs.deleteComment)

// Broadcast routes
router.post("/broadcast", broadcast.sendBroadcast)
router.get("/broadcasts", broadcast.getAllBroadcasts)
router.get("/exports/:type", broadcast.exportData)

module.exports = router
