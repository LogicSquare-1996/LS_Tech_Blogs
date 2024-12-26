const express = require("express")
const router = express.Router()

const User = require("../../models/user")

/* GET home page. */
router.get("/resetpassword/:token", async (req, res) => {
  try {
    const { token } = req.params
    const now = new Date()
    const user = await User
      .findOne({
        "forgotpassword.token": token,
        "forgotpassword.expiresAt": { $gte: now },
      })
      .select("email isActive")
      .lean()
      .exec()
    if (user === null) throw new Error("Token already used")
    if (user.isActive === false) throw new Error("Try to request a new password reset token")
    return res.render("resetpassword", { handle: user.email, token })
  } catch (error) {
    return res.status(500).send(error.message)
  }
})

module.exports = router
