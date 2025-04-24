const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const randomstring = require("randomstring")

const mailer = require("../../lib/mail")

const UserSchema = new mongoose.Schema({

  _bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],

  username: {
    type: String,
    // unique: true
  },

  password: {
    type: String
  },

  name:{
    first: String,
    last: String,
  },


  email: {
    type: String,
    lowercase: true,
    // unique: true,
  },

  accountType: {
    type: String,
    enum: ["google", "email", "fb"],
    default: "email"
  },

  social: [{ // social media links
    name: {
      type: String,
      enum: ["facebook", "instagram", "twitter", "tiktok", "youtube", "snapchat"]
    },
    username: {
      type: String
    },
    socialId: {
      type: String
    },
    accountUrl: String
  }],

  phone: {
    type: String
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  githubProfile: {
    type: String
  },
  profileImage: {
    type: String
  },
  role: {
    type: String,
    enum: ["employee", "admin"],
    default: "employee"
  },
  isActive: {
    type: Boolean,
    default: false
  },

  isTopContributor: {
    type: Boolean,
    default: false
  },

  forgotpassword: {
    requestedAt: { type: Date, default: null },
    token: { type: String, default: null },
    expiresAt: { type: Date, default: null }
  },

  otp: { type: String }, // OTP for email verification

  otpCreatedAt: { type: Date },

  isVerified: { type: Boolean, default: false }, // Email verification status

  googleId: { type: String },


})


// UserSchema.pre("validate", function (next) {
//   if (this.isNew) {
//     if (this.password === undefined || this.password === null) {
//       this.generatedPassword = randomstring.generate(8) // for usage in post save hook to send welcome email
//       this.password = this.generatedPassword
//     }
//   }
//   return next()
// })

// Hash & save user's password:
UserSchema.pre("save", async function (next) {
  const user = this
  if ((this.isModified("password") || this.isNew) && this.password) {
    try {
      user.password = await bcrypt.hash(user.password, +process.env.SALT_ROUNDS || 10)
    } catch (error) {
      return next(error)
    }
  }
  return next()
})







// compare two passwords:
UserSchema.methods.comparePassword = async function (pw) {
  try {
    const isMatch = await bcrypt.compare(pw, this.password)
    if (isMatch === false) throw new Error("Please check your credentials and try again")
  } catch (error) {
    throw error // rethrow
  }
}

// compare OTP:
UserSchema.methods.compareOTP = async function (otp) {
  try {
    if (!this.otp) return false;
    const isMatch = await bcrypt.compare(otp, this.otp)
    return isMatch
  } catch (error) {
    throw error // rethrow
  }
}
// eslint-disable-next-line prefer-arrow-callback
// UserSchema.post("save", function (doc) {
//   if (doc.generatedPassword !== undefined) {
//     try {
//       mailer("welcome", {
//         to: doc.email,
//         subject: "Welcome!!!",
//         locals: { email: doc.email, password: doc.generatedPassword, name: `${doc.first} ${doc.last}` }
//       });
//     } catch (error) {
//       console.error("Error sending welcome email:", error);
//     }
//   }
// });


UserSchema.virtual("name.full").get(function () {
  const first = (this.name.first === undefined || this.name.first === null)
    ? ""
    : this.name.first
  const last = (this.name.last === undefined || this.name.last === null)
    ? ""
    : ` ${this.name.last}`
  return `${first} ${last}`
})

UserSchema.virtual("name.full").set(function (v) {
  this.name.first = v.substr(0, v.indexOf(" "))
  this.name.last = v.substr(v.indexOf(" ") + 1)
})


UserSchema.set("timestamps", true)
UserSchema.set("toJSON", { virtuals: true })
UserSchema.set("toObject", { virtuals: true })

// UserSchema.set("discriminatorKey", "userType")

module.exports = mongoose.model("User", UserSchema)

