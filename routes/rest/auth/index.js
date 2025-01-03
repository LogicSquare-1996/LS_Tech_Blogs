const jwt = require("jsonwebtoken")
const axios = require("axios")

const User = require("../../../models/user")


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_EMAILS = ['logic-square.com', 'mbera829@gmail.com'];

module.exports = {
  /**
   *
   * @api {post} /login User login
   * @apiName userLogin
   * @apiGroup Auth
   * @apiVersion  1.0.0
   * @apiPermission Public
   *
   *
   * @apiParam  {String} handle (mobile / email)
   * @apiParam  {String} password user's password
   *
   * @apiSuccess (200) {json} name description
   *
   * @apiParamExample  {json} Request-Example:
   * {
   *     "handle" : "myEmail@logic-square.com",
   *     "password" : "myNewPassword"
   * }
   *
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "error" : false,
   *     "handle" : "myEmail@logic-square.com",
   *     "token": "authToken.abc.xyz"
   * }
   *
   *
   */
  async post(req, res) {
    try {
      // const { type } = req.params
      const {
        handle,
        password
      } = req.body
      if (handle === undefined || password === undefined) {
        return res.status(400).json({
          error: true,
          reason: "Fields `handle` and `password` are mandatory"
        })
      }
      const user = await User.findOne({
        $or: [{
          email: handle.toLowerCase()
        }, {
          username: handle
        }]
      }).exec()
      if (user === null) throw new Error("User Not Found")
      if (user.isActive === false) throw new Error("User Inactive")
      // check pass
      await user.comparePassword(password)
      // No error, send jwt
      const payload = {
        id: user._id,
        _id: user._id,
        fullName: user.name.full,
        email: user.email,
        username: user.username,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: 3600 * 24 * 30 // 1 month
      })
      return res.json({
        error: false,
        handle,
        token
      })
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      })
    }
  },

  /**
   * Sign in with Google account
   * @api {post} /google-signin Google signin
   * @apiName googleSignin
   * @apiGroup Auth
   * @apiVersion  2.0.0
   * @apiPermission Public
   *
   * @apiParam  {String} idToken Google Authentication token
   * @apiSuccess (200) {json} name description
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "error" : false,
   *     "token": "authToken.abc.xyz",
   *     "user": {
   *       "email": "myEmail@logic-square.com",
   *       "name": "Mr. Jhon Doe",
   *       "picture": "https://lh3.googleusercontent.com/.../photo.jpg"
   *     }
   * }
   *
   */
  async googleLogin(req, res) {
    const { idToken } = req.body;

  try {
    
    // Verify the token with Google
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const { sub, email, email_verified, name, picture } = response.data;    

    // Validate email domain
    const emailDomain = email.split('@')[1] || '';
    if (!ALLOWED_EMAILS.includes(emailDomain) && email !== 'mbera829@gmail.com') {
      return res.status(400).json({ error:true, message: 'Invalid email domain or address' });
    }

    // Check if the email is verified
    if (!email_verified) {
      return res.status(400).json({ error:true, message: 'Email not verified' });
    }
    
    // Check if the user exists in the database
    let user = await User.findOne({ googleId: sub });

    if (!user) {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      // Create a new user if they don't exist
      user = await User.create({
        googleId: sub,
        email,
        firstName: firstName,
        lastName: lastName,
        profileImage: picture,
        isVerified: email_verified,
        isActive: true
      });
    }else {
      // If user exists but was inactive, make them active
      if (!user.isActive) {
          user.isActive = true;
          await user.save();
      }
  }
    // Generate a JWT token
    const payload = {
      id: user._id,
      _id: user._id,
      fullName: user.name.full,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin
    }
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: 3600 * 24 * 30 // 1 month
    })

    res.status(200).json({ error:false, token, user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
  },
}