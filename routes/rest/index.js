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
const profile = require("./profile")
//Blogs Routes
const blogs = require("./blogs")
const interactions = require("./interactions")
const history = require("./history")
const notifications = require("./notifications")

router.post("/login", login.post) // UNAUTHENTICATED
router.post("/signup", signup.post) // UNAUTHENTICATED
router.post('/verify', signup.verify)
router.post('/resendOTP', signup.resendOTP)
router.post('/google', login.googleLogin)
router.post("/forgotpassword", forgotpassword.startWorkflow) // UNAUTHENTICATED; AJAX
router.post("/resetpassword", forgotpassword.resetPassword) // UNAUTHENTICATED; AJAX

router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

router.get("/awstempcreds", login.getAwsKey)  //For AWS S3 upload

// User Profile Routes
router.get("/user/me", profile.getCurrentUser)
router.put("/user/me", profile.updateCurrentUser)
router.put("/user/profile-picture", profile.getProfilePictureUploadUrl)
router.get("/user/profile/:id", profile.getPublicUserProfile)
router.get("/user/history", profile.getUserHistory)

// Get user by ID
router.get("/user/:id", users.get)

//Blogs Routes
router.post("/createBlog",blogs.post)
router.post("/blogs",blogs.getBlogs)
router.get("/blog/:id", blogs.getblog)
router.post("/updateBlog/:id",blogs.updateBlog)
router.get("/deleteBlog/:id",blogs.deleteBlog)
router.put('/blog/publish/:id',blogs.publishDraftBlog)
router.get("/blogs/drafts",blogs.getDraftBlogs)
router.get("/blogs/authors", blogs.getAuthors)

//Bookmarks route
router.post("/blog/bookmark/:id", blogs.bookMarkAndUnbookMark)
router.get("/blogs/bookmarks/", blogs.getAllBookmarks)


//Blog Interactions Routes
router.post("/post/interaction/:id", interactions.postInteraction)
router.get("/post/likes/:id",interactions.getLikes)           // id is BlogId
router.post("/post/comments/:id",interactions.getComments)   // id is BlogId
router.post("/post/replies/:id", interactions.getReplies)     //id of comment
router.put("/post/comment/like/:id", interactions.likeCommentOrReply) //Like a comment or Reply.
router.delete("/post/unlike/:id", interactions.postUnlike)
router.put("/post/update/comment/:id",interactions.updateComment)
router.delete('/post/deleteinteraction/:id',interactions.deleteInteraction)



//History Routes
router.post("/search/history", history.searchHistory)

//Notification Routes
router.post("/notifications", notifications.getUserNotifications)
router.put("/notifications/read/:id", notifications.markNotificationAsRead)
router.put("/notifications/read-all", notifications.markAllNotificationsAsRead)
router.post("/notifications/unread-count", notifications.getUnreadNotificationCount)

module.exports = router
