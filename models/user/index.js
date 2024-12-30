const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const randomstring = require("randomstring")

const mailer = require("../../lib/mail")

const UserSchema = new mongoose.Schema({

  username: {
    type: String,
    // unique: true
  },

  password: {
    type: String,
    required: true
  },

  firstName: String,

  lastName: String,

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

  socialId: String,

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

  forgotpassword: {
    requestedAt: { type: Date, default: null },
    token: { type: String, default: null },
    expiresAt: { type: Date, default: null }
  },
  otp: { type: String }, // OTP for email verification
  otpCreatedAt: { type: Date },
  isVerified: { type: Boolean, default: false }, // Email verification status
})


UserSchema.pre("validate", function (next) {
  if (this.isNew) {
    if (this.password === undefined || this.password === null) {
      this.generatedPassword = randomstring.generate(8) // for usage in post save hook to send welcome email
      this.password = this.generatedPassword
    }
  }
  return next()
})

// Hash & save user's password:
UserSchema.pre("save", async function (next) {
  const user = this
  if (this.isModified("password") || this.isNew) {
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
// eslint-disable-next-line prefer-arrow-callback
UserSchema.post("save", function (doc) {
  if (doc.generatedPassword !== undefined) {
    try {
      mailer("welcome", {
        to: doc.email,
        subject: "Welcome!!!",
        locals: { email: doc.email, password: doc.generatedPassword, name: `${doc.firstName} ${doc.lastName}` }
      });
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  }
});


UserSchema.virtual("name.full").get(function () {
  const first = (this.firstName === undefined || this.firstName === null)
    ? ""
    : this.firstName
  const last = (this.lastName === undefined || this.lastName === null)
    ? ""
    : ` ${this.lastName}`
  return `${first}${last}`
})

UserSchema.virtual("name.full").set(function (v) {
  this.firstName = v.substr(0, v.indexOf(" "))
  this.lastName = v.substr(v.indexOf(" ") + 1)
})


UserSchema.set("timestamps", true)
UserSchema.set("toJSON", { virtuals: true })
UserSchema.set("toObject", { virtuals: true })

// UserSchema.set("discriminatorKey", "userType")

module.exports = mongoose.model("User", UserSchema)

