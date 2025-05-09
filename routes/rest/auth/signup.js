const User = require("../../../models/user");
const otpGenerator = require("otp-generator");
const mail = require("../../../lib/mail");
const redis = require("../../../lib/redis");
const moment = require("moment");

module.exports = {
  /**
 * @api {post} /signup 1.0 User Signup
 * @apiName UserSignup
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiPermission Public
 * 
 * @apiDescription This endpoint allows users to sign up for the blog platform. It validates user input, generates an OTP for email verification, sends the OTP to the user's email, and creates the user in the database with a pending verification status.
 *
 * @apiParam {String} email The user's email address.
 * @apiParam {String} phone The user's phone number.
 * @apiParam {Object} name The user's name.
 * @apiParam {String} name.first The user's first name.
 * @apiParam {String} name.last The user's last name (optional).
 * @apiParam {String} password The user's password.
 * @apiParam {String} rePassword The confirmation of the user's password.
 * 
 * @apiParamExample {json} Request-Example:
 * {
 *   "email": "johndoe@example.com",
 *   "phone": "1234567890",
 *   "name": {
 *     "first": "John",
 *     "last": "Doe"
 *   },
 *   "password": "password123",
 *   "rePassword": "password123"
 * }
 *
 * @apiSuccess {Boolean} error Indicates the success of the operation (false if successful).
 * @apiSuccess {String} message A success message indicating that the signup was successful and OTP has been sent.
 * @apiSuccess {Object} user The newly created user's information (excluding sensitive data like OTP and password).
 * @apiSuccess {String} user.email The user's email address.
 * @apiSuccess {String} user.phone The user's phone number.
 * @apiSuccess {Object} user.name The user's name.
 * @apiSuccess {String} user.name.first The user's first name.
 * @apiSuccess {String} user.name.last The user's last name (optional).
 * 
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "error": false,
 *   "message": "Signup successful! Please verify your email.",
 *   "user": {
 *     "email": "johndoe@example.com",
 *     "phone": "1234567890",
 *     "name": {
 *       "first": "John",
 *       "last": "Doe"
 *     }
 *   }
 * }
 * 
 * @apiError {Boolean} error Indicates the failure of the operation (true if failed).
 * @apiError {String} reason A message describing the reason for the failure.
 * 
 * @apiErrorExample {json} Error-Response (Missing Email):
 * {
 *   "error": true,
 *   "reason": "Missing mandatory field `email`"
 * }
 * 
 * @apiErrorExample {json} Error-Response (Password Mismatch):
 * {
 *   "error": true,
 *   "reason": "Password does not match"
 * }
 * 
 * @apiErrorExample {json} Error-Response (Internal Server Error):
 * {
 *   "error": true,
 *   "reason": "An unexpected error occurred."
 * }
 */

  async post(req, res) {
    try {
      const { username, email, phone, name, password, rePassword } = req.body;

      // Validate input fields
      const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: true, reason: "User already exists" });
      }

      if (!username) {
        return res
          .status(400)
          .json({ error: true, reason: "Missing mandatory field `username`" });
      }
      if (!email) {
        return res
          .status(400)
          .json({ error: true, reason: "Missing mandatory field `email`" });
      }

      // Validate email domain
      const allowedDomains = ['@logic-square.com','@gmail.com'];
      const allowedSpecificEmails = ['mbera829@gmail.com'];
      const emailDomain = email.substring(email.lastIndexOf("@"));
      if (
        !allowedDomains.includes(emailDomain) &&
        !allowedSpecificEmails.includes(email)
      ) {
        return res
          .status(400)
          .json({ error: true, reason: "Invalid email domain or email address! Only @logic-square.com is allowed" });
      }

      const phoneRegex = /^[0-9]{10}$/; // Regex for 10 digits
      if (!phoneRegex.test(phone)) {
        return res
          .status(400)
          .json({ error: true, reason: "Phone number must be a 10-digit numeric value." });
      }

      if (!name || !name.first) {
        return res
          .status(400)
          .json({ error: true, reason: "Please specify First Name!" });
      }
      if (password.length < 6 || password.length > 20) {
        return res
          .status(400)
          .json({ error: true, reason: "Password must be between 6 to 20 characters!" });
      }
      if (password !== rePassword) {
        return res
          .status(400)
          .json({ error: true, reason: "Password does not match" });
      }

      // Generate OTP using otp-generator
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
      });

      // Store OTP in Redis
      await redis.storeOTP(email, otp, 300); // 5 min seconds expiry

      // Store user data temporarily in Redis
      const userData = {
        email,
        phone,
        password,
        name,
        username,
        isVerified: false
      };
      await redis.storeOTP(`${email}:data`, JSON.stringify(userData), 60);

      try {
        await mail("send-otp", {
          to: email,
          subject: "Verify your Email",
          locals: {
            userName: `${name.first} ${name.last || ''}`.trim(),
            email: email,
            otp: otp,
          },
        });
      } catch (mailErr) {
        console.log("==> Mail sending Error: ", mailErr);
        throw new Error("Failed to send OTP to your email! Please Retry Later.");
      }

      return res.json({
        error: false,
        message: "Signup successful! Please verify your email.",
        user: {
          email,
          phone,
          name,
          username,
          isVerified: false
        }
      });
    } catch (err) {
      return res.status(500).json({ error: true, reason: err.message });
    }
  },

  /**
   * Verify user's email
   * @api {post} /verify 2.0 Verify user's email
   * @apiName verifyEmail
   * @apiGroup Auth
   * @apiVersion  2.0.0
   * @apiPermission Public
   *
   * @apiParam  {String} email user's email
   * @apiParam  {String} otp One Time Password (OTP) sent to user's email
   *
   * @apiSuccess (200) {json} name description
   *
   * @apiParamExample  {json} Request-Example:
   * {
   *     "email" : "myEmail@logic-square.com",
   *     "otp" : "123456"
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "error" : false,
   *     "message" : "Email verified successfully!"
   * }
   *
   */
  async verify(req, res) {
    try {
      const { email, otp } = req.body;

      // Validate input fields
      if (!email || !otp) {
        return res
          .status(400)
          .json({ error: true, reason: "Missing mandatory fields" });
      }

      // Get stored OTP from Redis
      const storedOTP = await redis.getOTP(email);
      if (!storedOTP) {
        return res
          .status(400)
          .json({ error: true, reason: "OTP expired or invalid" });
      }

      // Verify OTP
      if (storedOTP !== otp) {
        return res
          .status(400)
          .json({ error: true, reason: "Invalid OTP" });
      }

      // Get stored user data
      const userDataStr = await redis.getOTP(`${email}:data`);
      if (!userDataStr) {
        return res
          .status(400)
          .json({ error: true, reason: "Signup session expired" });
      }

      const userData = JSON.parse(userDataStr);

      // Create user
      const user = await User.create({
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        name: userData.name,
        username: userData.username,
        isVerified: true,
        isActive: true
      });

      // Clean up Redis data
      await redis.deleteOTP(email);
      await redis.deleteOTP(`${email}:data`);

      return res.json({
        error: false,
        message: "Email verified successfully!",
        user: {
          email: user.email,
          phone: user.phone,
          name: user.name,
          username: user.username,
          isVerified: true
        }
      });
    } catch (err) {
      return res.status(500).json({ error: true, reason: err.message });
    }
  },

  /**
   * @api {post} /resendOTP 3.0 Resend OTP for Email Verification
   * @apiName resendOTP
   * @apiGroup Auth
   * @apiVersion  3.0.0
   * @apiPermission Public
   *
   * @apiDescription This endpoint allows users to resend OTP for email verification
   *  in case the previous OTP has expired or has been lost.
   *
   * @apiParam {String} email The user's email address.
   *
   * @apiParamExample  {json} Request-Example:
   * {
   *     "email" : "myEmail@logic-square.com"
   * }
   *
   * @apiSuccess {Boolean} error Indicates the success of the operation (false if successful).
   * @apiSuccess {String} message A success message indicating that the OTP has been resent.
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "error" : false,
   *     "message" : "A new OTP has been sent to your email."
   * }
   *
   * @apiError {Boolean} error Indicates the failure of the operation (true if failed).
   * @apiError {String} reason A message describing the reason for the failure.
   *
   * @apiErrorExample {json} Error-Response (Missing Email):
   * {
   *   "error": true,
   *   "reason": "Missing mandatory field `email`"
   * }
   *
   * @apiErrorExample {json} Error-Response (No pending verification found):
   * {
   *   "error": true,
   *   "reason": "No pending verification found for this email. Please register again."
   * }
   *
   * @apiErrorExample {json} Error-Response (Internal Server Error):
   * {
   *   "error": true,
   *   "reason": "An unexpected error occurred."
   * }
   */
  

async resendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: true,
        reason: "Missing mandatory field `email`",
      });
    }

    // Get temp user data from Redis
    const userDataStr = await redis.getOTP(`${email}:data`);
    if (!userDataStr) {
      return res.status(400).json({
        error: true,
        reason: "No pending verification found for this email. Please register again.",
      });
    }

    const userData = JSON.parse(userDataStr);

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Store new OTP in Redis (set with 10 min expiry or same as data)
    await redis.storeOTP(email, otp, 600); // 600 sec = 10 min

    // Re-store user data to refresh expiry (optional but recommended)
    await redis.storeOTP(`${email}:data`, JSON.stringify(userData), 600);

    // Send OTP email
    try {
      await mail("send-otp", {
        to: email,
        subject: "Verify your Email",
        locals: {
          userName: userData.name?.full || "User",
          email: email,
          otp: otp,
        },
      });
    } catch (mailErr) {
      console.log("==> Mail sending Error: ", mailErr);
      throw new Error("Failed to send OTP to your email! Please retry later.");
    }

    return res.json({
      error: false,
      message: "OTP resent successfully!",
    });

  } catch (err) {
    return res.status(500).json({ error: true, reason: err.message });
  }
},

};
