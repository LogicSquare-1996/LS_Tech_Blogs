const express = require("express")
const router = express.Router()
const expressJwt = require('express-jwt')
const checkJwt = expressJwt({
    secret: process.env.SECRET,
    algorithms: ["HS256"],
  });  // the JWT auth check middleware

const users = require("./users")
const login = require("./auth")
const signup = require("./auth/signup")
const forgotpassword = require("./auth/password")
//Blogs Routes
const blogs = require("./blogs")

router.post("/login", login.post) // UNAUTHENTICATED
router.post("/signup", signup.post) // UNAUTHENTICATED
router.post('/verify', signup.verify)
router.post('/resendOTP', signup.resendOTP)
router.post('/google', login.googleLogin)
router.post("/forgotpassword", forgotpassword.startWorkflow) // UNAUTHENTICATED; AJAX
router.post("/resetpassword", forgotpassword.resetPassword) // UNAUTHENTICATED; AJAX

router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

router.get("/awstempcreds", login.getAwsKey)  //For AWS S3 upload

router.get("/user/:id", users.get)

router.post("/createBlog",blogs.post)
router.post("/blogs",blogs.getBlogs)
router.get("/blog/:id", blogs.getblog)
router.post("/updateBlog/:id",blogs.updateBlog)
router.post("/deleteBlog/:id",blogs.deleteBlog)
router.put('/blog/publish/:id',blogs.publishDraftBlog)
router.get("/blogs/drafts",blogs.getDraftBlogs)
module.exports = router
