const jwt = require("jsonwebtoken")
const axios = require("axios")
const { STS } = require("aws-sdk")

const User = require("../../../models/user")


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_EMAILS = ['logic-square.com', 'mbera829@gmail.com'];

module.exports = {
  /**
   *
   * @api {post} /login 4.0 User login
   * @apiName userLogin
   * @apiGroup Auth
   * @apiVersion  4.0.0
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
        isAdmin: user.isAdmin,
        role: user.role
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
   *
   * @api {get} /awstempcreds 5.0 login user get temporary aws key
   * @apiName GetAwsKey
   * @apiGroup Auth
   * @apiVersion  1.0.0
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiSuccessExample {type} Success-Response:
      {
        "error": false,
        "AccessKeyId": "ASIASNKPOZCACSWCVJPE",
        "SecretAccessKey": "f24Hso6+okCfeKZaqVM8dYxvT0puEOmKuEZVdIZ/",
        "SessionToken": "FwoGZXIvYXdzEF8aDJASmdZoWJj+lXCjtSJqdzhlJ7bJ9igMImED3xJ9uHKGoJzzM9Kx7iFzW97T+JCKf30hG5gvNwPAV1LaiG3Xp7jLOswS5jKhgXqsse4x5dMAp6YxF1QC++b+LRoaAiGOWEP6bxfhgJHUbLImcSOQYTYtN8CwzktWIyizzsnxBTIotfjCyhl7/bz+0oQau5HtZa7KWIro5NQeLDWmmXxOP6UWtZhmeVRTmw==",
        "Expiration": "2020-01-30T06:18:43.000Z"
      }
   *
   *
   */
  
  async getAwsKey(req, res) {
    try {
      const sts = new STS({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET })
      const { Credentials } = await sts.getSessionToken().promise()
      // CORS:
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Request-Method", "*")
      res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT")
      // res.setHeader("Access-Control-Allow-Headers", "*")
      res.setHeader("Access-Control-Allow-Headers", "authorization, origin, x-requested-with, x-http-method-override, content-type, Overwrite, Destination, Depth, User-Agent, Translate, Range, Content-Range, Timeout, X-File-Size, If-Modified-Since, X-File-Name, Cache-Control, Location, Lock-Token")
      if (req.method === "OPTIONS") {
        res.writeHead(200)
        return res.end()
      }

      return res.json({
        error: false,
        S3BucketName: process.env.AWS_BUCKET_NAME,
        S3Region: process.env.AWS_BUCKET_REGION,
        ...Credentials
      })
    } catch (err) {
      console.log("==> ERR generating temp AWS creds: ", err)
      return res.status(500).json({ error: true, reason: err.message })
    }
  },

  /**
   * Sign in with Google account
   * @api {post} /google-signin 5.0 Google signin
   * @apiName googleSignin
   * @apiGroup Auth
   * @apiVersion  5.0.0
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