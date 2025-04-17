define({ "api": [
  {
    "type": "get",
    "url": "/user/:id",
    "title": "get user details",
    "name": "userDetails",
    "group": "Admin_User",
    "version": "1.0.0",
    "permission": [
      {
        "name": "User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Users unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "name",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"error\" : false,\n  \"user\" : {\n    \"email\": \"myEmail@logic-square.com\",\n    \"phone\": \"00000000000\",\n    \"name\"  : {\n      \"first\":\"Jhon\",\n      \"last\" :\"Doe\"\n    }\n  }\n}",
          "type": "type"
        }
      ]
    },
    "filename": "routes/admin/users.js",
    "groupTitle": "Admin_User"
  },
  {
    "type": "get",
    "url": "/awstempcreds",
    "title": "6.0 login user get temporary aws key",
    "name": "GetAwsKey",
    "group": "Auth",
    "version": "6.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"error\": false,\n  \"AccessKeyId\": \"\",\n  \"SecretAccessKey\": \"\",\n  \"SessionToken\": \"\",\n  \"Expiration\": \"2020-01-30T06:18:43.000Z\"\n}",
          "type": "type"
        }
      ]
    },
    "filename": "routes/rest/auth/index.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/signup",
    "title": "1.0 User Signup",
    "name": "UserSignup",
    "group": "Auth",
    "version": "1.0.0",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "description": "<p>This endpoint allows users to sign up for the blog platform. It validates user input, generates an OTP for email verification, sends the OTP to the user's email, and creates the user in the database with a pending verification status.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>The user's email address.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone",
            "description": "<p>The user's phone number.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "name",
            "description": "<p>The user's name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name.first",
            "description": "<p>The user's first name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name.last",
            "description": "<p>The user's last name (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The user's password.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rePassword",
            "description": "<p>The confirmation of the user's password.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"email\": \"johndoe@example.com\",\n  \"phone\": \"1234567890\",\n  \"name\": {\n    \"first\": \"John\",\n    \"last\": \"Doe\"\n  },\n  \"password\": \"password123\",\n  \"rePassword\": \"password123\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates the success of the operation (false if successful).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A success message indicating that the signup was successful and OTP has been sent.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>The newly created user's information (excluding sensitive data like OTP and password).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.email",
            "description": "<p>The user's email address.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.phone",
            "description": "<p>The user's phone number.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user.name",
            "description": "<p>The user's name.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.name.first",
            "description": "<p>The user's first name.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.name.last",
            "description": "<p>The user's last name (optional).</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"error\": false,\n  \"message\": \"Signup successful! Please verify your email.\",\n  \"user\": {\n    \"email\": \"johndoe@example.com\",\n    \"phone\": \"1234567890\",\n    \"name\": {\n      \"first\": \"John\",\n      \"last\": \"Doe\"\n    }\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates the failure of the operation (true if failed).</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "reason",
            "description": "<p>A message describing the reason for the failure.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response (Missing Email):",
          "content": "{\n  \"error\": true,\n  \"reason\": \"Missing mandatory field `email`\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response (Password Mismatch):",
          "content": "{\n  \"error\": true,\n  \"reason\": \"Password does not match\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response (Internal Server Error):",
          "content": "{\n  \"error\": true,\n  \"reason\": \"An unexpected error occurred.\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/auth/signup.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/forgotpassword",
    "title": "7.0 Request to get password reset link in mail",
    "name": "forgotPassword",
    "group": "Auth",
    "version": "7.0.0",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "handle",
            "description": "<p>(email)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"handle\" : \"myEmail@logic-square.com\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "name",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"error\" : false,\n    \"handle\" : \"myEmail@logic-square.com\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/auth/password.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/google-signin",
    "title": "5.0 Google signin",
    "name": "googleSignin",
    "group": "Auth",
    "version": "5.0.0",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "idToken",
            "description": "<p>Google Authentication token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "name",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"error\" : false,\n    \"token\": \"authToken.abc.xyz\",\n    \"user\": {\n      \"email\": \"myEmail@logic-square.com\",\n      \"name\": \"Mr. Jhon Doe\",\n      \"picture\": \"https://lh3.googleusercontent.com/.../photo.jpg\"\n    }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/auth/index.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/resendOTP",
    "title": "3.0 Resend OTP for Email Verification",
    "name": "resendOTP",
    "group": "Auth",
    "version": "3.0.0",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "description": "<p>This endpoint allows users to resend OTP for email verification in case the previous OTP has expired or has been lost.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>The user's email address.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"email\" : \"myEmail@logic-square.com\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates the success of the operation (false if successful).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A success message indicating that the OTP has been resent.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"error\" : false,\n    \"message\" : \"A new OTP has been sent to your email.\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates the failure of the operation (true if failed).</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "reason",
            "description": "<p>A message describing the reason for the failure.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response (Missing Email):",
          "content": "{\n  \"error\": true,\n  \"reason\": \"Missing mandatory field `email`\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response (User does not exist):",
          "content": "{\n  \"error\": true,\n  \"reason\": \"User does not exist\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response (Email is already verified):",
          "content": "{\n  \"error\": true,\n  \"reason\": \"Email is already verified\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response (Internal Server Error):",
          "content": "{\n  \"error\": true,\n  \"reason\": \"An unexpected error occurred.\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/auth/signup.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/resetpassword",
    "title": "8.0 Request to set a new password",
    "name": "resetPassword",
    "group": "Auth",
    "version": "8.0.0",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"email\" : \"myEmail@logic-square.com\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "name",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"error\" : false,\n    \"email\" : \"myEmail@logic-square.com\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/auth/password.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/login",
    "title": "4.0 User login",
    "name": "userLogin",
    "group": "Auth",
    "version": "4.0.0",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "handle",
            "description": "<p>(mobile / email)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>user's password</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"handle\" : \"myEmail@logic-square.com\",\n    \"password\" : \"myNewPassword\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "name",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"error\" : false,\n    \"handle\" : \"myEmail@logic-square.com\",\n    \"token\": \"authToken.abc.xyz\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/auth/index.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/verify",
    "title": "2.0 Verify user's email",
    "name": "verifyEmail",
    "group": "Auth",
    "version": "2.0.0",
    "permission": [
      {
        "name": "Public"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>user's email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "otp",
            "description": "<p>One Time Password (OTP) sent to user's email</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"email\" : \"myEmail@logic-square.com\",\n    \"otp\" : \"123456\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "name",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"error\" : false,\n    \"message\" : \"Email verified successfully!\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/auth/signup.js",
    "groupTitle": "Auth"
  },
  {
    "type": "delete",
    "url": "/post/deleteinteraction/:id",
    "title": "7.0.0 Delete Interaction",
    "name": "DeleteInteraction",
    "group": "BlogInteraction",
    "version": "7.0.0",
    "permission": [
      {
        "name": "User (Authenticated with JWT)"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The unique ID of the interaction (comment or reply) to be deleted.</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>false Indicates the request was successful.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message, e.g., &quot;Interaction deleted successfully&quot;.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>true Indicates the request failed.</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message detailing the issue.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -X DELETE \"http://localhost:3000/blog-interactions/12345\" \\\n-H \"Authorization: Bearer <your_jwt_token>\"",
        "type": "curl"
      },
      {
        "title": "Success Response:",
        "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"message\": \"Interaction deleted successfully\"\n}",
        "type": "json"
      },
      {
        "title": "Error Response (Interaction already deleted):",
        "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Interaction has already been deleted\"\n}",
        "type": "json"
      },
      {
        "title": "Error Response (Permission denied):",
        "content": "HTTP/1.1 403 Forbidden\n{\n  \"error\": true,\n  \"message\": \"You cannot delete this reply\"\n}",
        "type": "json"
      }
    ],
    "filename": "routes/rest/interactions.js",
    "groupTitle": "BlogInteraction"
  },
  {
    "type": "post",
    "url": "/post/comments/:id",
    "title": "4.0 Get Top Level Comments for a Blog",
    "name": "GetComments",
    "group": "BlogInteraction",
    "version": "4.0.0",
    "permission": [
      {
        "name": "User (Authenticated with JWT)"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>Page number for pagination.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "10",
            "description": "<p>Number of comments per page.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Status of the request.</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": true,\n  \"message\": \"Server error\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"comments\": [\n    {\n      \"_id\": \"654321abc\",\n      \"content\": \"This is a great blog post!\",\n      \"_createdBy\": {\n        \"username\": \"JohnDoe\",\n        \"profilePicture\": \"https://example.com/profile.jpg\"\n      }\n    }\n  ],\n  \"totalComments\": 5,\n  \"totalPages\": 1,\n  \"currentPage\": 1\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/interactions.js",
    "groupTitle": "BlogInteraction"
  },
  {
    "type": "get",
    "url": "/post/likes/:id",
    "title": "2.0 likes Get Likes for a Blog",
    "name": "GetLikes",
    "group": "BlogInteraction",
    "version": "2.0.0",
    "description": "<p>Retrieve all likes for a specific blog post along with details about the users who liked the post and blog details.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The ID of the blog to retrieve likes for.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"interactions\": [\n    {\n      \"_id\": \"interactionId1\",\n      \"category\": \"like\",\n      \"_createdBy\": {          // User who liked the post\n        \"name\": \"John Doe\",\n        \"email\": \"john.doe@example.com\"\n      },\n      \"_blogId\": {\n        \"title\": \"Sample Blog Title\",\n        \"content\": \"This is the blog content.\",\n        \"_author\": {\n          \"name\": \"Author Name\",\n          \"profileImage\": \"author-profile.jpg\",\n          \"email\": \"author@example.com\"\n        }\n      }\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates if an error occurred.</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message explaining the cause.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Blog Not Found:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Blog not found\"\n}",
          "type": "json"
        },
        {
          "title": "Interactions Not Found:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Interactions not found\"\n}",
          "type": "json"
        },
        {
          "title": "Server Error:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Error message\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/interactions.js",
    "groupTitle": "BlogInteraction"
  },
  {
    "type": "post",
    "url": "/post/replies/:id",
    "title": "5.0.0 Get Replies for a Comment",
    "name": "GetReplies",
    "group": "BlogInteraction",
    "version": "5.0.0",
    "permission": [
      {
        "name": "User (Authenticated with JWT)"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Comment ID whose replies are to be fetched (sent as a URL parameter).</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Number of replies to skip for pagination.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "10",
            "description": "<p>Number of replies to return per request.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Status of the request.</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Mandatory param `id` is missing or invalid\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"replies\": [\n    {\n      \"_id\": \"65d431abc\",\n      \"content\": \"Great point! I completely agree.\",\n      \"_createdBy\": {\n        \"_id\": \"61234abcd\",\n        \"username\": \"JaneDoe\",\n        \"name\": \"Jane Doe\",\n        \"profilePicture\": \"https://example.com/profile.jpg\"\n      },\n      \"_likedBy\": [\n        { \"_id\": \"67890xyz\", \"username\": \"JohnDoe\" }\n      ],\n      \"_blogId\": {\n        \"title\": \"Understanding JavaScript Closures\"\n      }\n    }\n  ],\n  \"totalReplies\": 5,\n  \"totalPages\": 1,\n  \"currentPage\": 1\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/interactions.js",
    "groupTitle": "BlogInteraction"
  },
  {
    "type": "post",
    "url": "/post/comment/like/:id",
    "title": "3.0 Like or Unlike a Comment/Reply",
    "name": "LikeCommentOrReply",
    "group": "BlogInteraction",
    "version": "3.0.0",
    "description": "<p>Allows users to like or unlike a comment or reply on a blog post.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The ID of the comment or reply to like or unlike.</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "like",
            "description": "<p>Set to <code>true</code> to like the comment/reply.</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "unlike",
            "description": "<p>Set to <code>true</code> to unlike the comment/reply.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"message\": \"Liked successfully\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"Comment or reply not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Already liked this comment/reply\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/interactions.js",
    "groupTitle": "BlogInteraction"
  },
  {
    "type": "post",
    "url": "/blog/:id/interaction",
    "title": "1.0 Post Blog Interaction",
    "name": "PostBlogInteraction",
    "group": "BlogInteraction",
    "version": "1.0.0",
    "description": "<p>Handles interactions on a blog post, such as likes and comments (including replies to comments).</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The ID of the blog post.</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates if there was an error (always <code>true</code> for failed requests).</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A descriptive error message.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Missing Mandatory Field (400):",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Missing mandatory field `content` for comment\"\n}",
          "type": "json"
        },
        {
          "title": "Blog Not Found (400):",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Blog not found\"\n}",
          "type": "json"
        },
        {
          "title": "Already Liked (400):",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"You have already liked this blog\"\n}",
          "type": "json"
        },
        {
          "title": "Cannot Like Own Blog (400):",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"You cannot like your own blog\"\n}",
          "type": "json"
        },
        {
          "title": "Parent Comment Not Found (404):",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"Parent comment not found\"\n}",
          "type": "json"
        },
        {
          "title": "Server Error (400):",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Error message from server\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/interactions.js",
    "groupTitle": "BlogInteraction"
  },
  {
    "type": "post",
    "url": "/post/unlike/:id",
    "title": "8.0 Unlike a Post",
    "name": "UnlikePost",
    "group": "BlogInteraction",
    "version": "8.0.0",
    "description": "<p>Allows users to unlike a post.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The ID of the post to unlike.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"message\": \"Unliked successfully\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"Post not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Already unliked this post\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/interactions.js",
    "groupTitle": "BlogInteraction"
  },
  {
    "type": "put",
    "url": "/api/blog/comment/:id",
    "title": "6.0.0. Update a Comment",
    "name": "UpdateComment",
    "group": "BlogInteraction",
    "version": "6.0.0",
    "permission": [
      {
        "name": "User (Authenticated with JWT)"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Comment ID to be updated (sent as a URL parameter).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>The updated comment content.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Status of the request.</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Missing Content:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Missing mandatory field `content`\"\n}",
          "type": "json"
        },
        {
          "title": "Comment Not Found:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"Comment not found\"\n}",
          "type": "json"
        },
        {
          "title": "Server Error:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Internal server error\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"message\": \"Updated successfully\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/interactions.js",
    "groupTitle": "BlogInteraction"
  },
  {
    "type": "post",
    "url": "/createBlog",
    "title": "1.0 Create a New Blog Post",
    "name": "createBlog",
    "group": "Blogs",
    "version": "1.0.0",
    "permission": [
      {
        "name": "Authenticated User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>The title of the blog post (mandatory).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>The content of the blog post (mandatory).</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "tags",
            "description": "<p>An array of tags associated with the blog post (mandatory).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "category",
            "description": "<p>The category of the blog post (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "gitHubLink",
            "description": "<p>A GitHub link associated with the blog post (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "attachments",
            "description": "<p>An array of file URLs for attachments (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "thumbnail",
            "description": "<p>A URL to the thumbnail image of the blog post (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "status",
            "defaultValue": "published",
            "description": "<p>The publication status of the blog (&quot;published&quot; or &quot;draft&quot;).</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Request Example:",
        "content": "{\n  \"title\": \"My First Blog\",\n  \"content\": \"This is the content of the blog.\",\n  \"tags\": [\"Node.js\", \"API\", \"Blog\"],\n  \"category\": \"Technology\",\n  \"gitHubLink\": \"https://github.com/user/repo\",\n  \"attachments\": [\"https://example.com/file1.pdf\"],\n  \"thumbnail\": \"https://example.com/image.jpg\",\n  \"status\": \"published\"\n}",
        "type": "json"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 Created\n{\n  \"message\": \"Blog created successfully\",\n  \"blog\": {\n    \"_id\": \"60f5a13d6b1f0e12345abcde\",\n    \"title\": \"My First Blog\",\n    \"content\": \"This is the content of the blog.\",\n    \"tags\": [\"Node.js\", \"API\", \"Blog\"],\n    \"category\": \"Technology\",\n    \"gitHubLink\": \"https://github.com/user/repo\",\n    \"attachments\": [\"https://example.com/file1.pdf\"],\n    \"thumbnail\": \"https://example.com/image.jpg\",\n    \"status\": \"published\",\n    \"publishedAt\": \"2025-01-21T12:34:56.789Z\",\n    \"_author\": \"60f5a13d6b1f0e12345abcd9\"\n  }\n}",
          "type": "type"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Missing mandatory field `title`\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Blogs"
  },
  {
    "type": "get",
    "url": "/blogs/:id",
    "title": "5.0 Delete Blog (Soft Delete)",
    "name": "deleteBlog",
    "group": "Blogs",
    "version": "5.0.0",
    "permission": [
      {
        "name": "Authenticated User"
      }
    ],
    "description": "<p>This endpoint allows an authenticated user to perform a soft delete of a blog they authored. The blog is marked as deleted but not permanently removed from the database.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The ID of the blog to delete.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Request Example:",
        "content": "DELETE /blogs/60f5a13d6b1f0e12345abcde",
        "type": "json"
      },
      {
        "title": "Request Header Example:",
        "content": "Authorization: Bearer <jwt_token>",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicates whether the operation was successful.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A message confirming the blog was soft-deleted.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"Blog deleted successfully (soft delete)\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates whether an error occurred (always true).</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A descriptive message about the error.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Invalid Blog ID Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Invalid Blog ID\"\n}",
          "type": "json"
        },
        {
          "title": "Blog Not Found Error Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"No Blog Found\"\n}",
          "type": "json"
        },
        {
          "title": "Internal Server Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"An unexpected error occurred\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Blogs"
  },
  {
    "type": "get",
    "url": "/blogs/authors",
    "title": "7.0 Get Distinct Authors",
    "name": "getAuthors",
    "group": "Blogs",
    "version": "7.0.0",
    "permission": [
      {
        "name": "Authenticated User"
      }
    ],
    "description": "<p>This endpoint retrieves a list of distinct authors who have published blogs. The response includes the author's email, full name, and ID.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Request Example:",
        "content": "GET /blogs/authors",
        "type": "json"
      },
      {
        "title": "Request Header Example:",
        "content": "Authorization: Bearer <jwt_token>",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates whether the operation was successful (false if successful).</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "authorsList",
            "description": "<p>List of distinct authors.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "authorsList.email",
            "description": "<p>Author's email address.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "authorsList.name",
            "description": "<p>Author's full name.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "authorsList._id",
            "description": "<p>Author's unique ID.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"authorsList\": [\n    {\n      \"email\": \"alice@example.com\",\n      \"name\": \"Alice Doe\",\n      \"_id\": \"60f5a13d6b1f0e12345abcde\"\n    },\n    {\n      \"email\": \"bob@example.com\",\n      \"name\": \"Bob Smith\",\n      \"_id\": \"60f5a13d6b1f0e12345abcd1\"\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates whether an error occurred (always true).</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A descriptive message about the error.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "NoAuthorsFound Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"No authors found\"\n}",
          "type": "json"
        },
        {
          "title": "InternalServerError Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"An unexpected error occurred\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Blogs"
  },
  {
    "type": "get",
    "url": "/blog/:id",
    "title": "3.0 Get a Specific Blog by ID",
    "name": "getBlogById",
    "group": "Blogs",
    "version": "3.0.0",
    "permission": [
      {
        "name": "Authenticated User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The ID of the blog to retrieve.</p>"
          }
        ]
      }
    },
    "description": "<p>This endpoint retrieves a specific published blog by its ID.</p>",
    "examples": [
      {
        "title": "Request Example:",
        "content": "GET /blog/60f5a13d6b1f0e12345abcde",
        "type": "json"
      },
      {
        "title": "Request Header Example:",
        "content": "Authorization: Bearer <jwt_token>",
        "type": "json"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"blog\": {\n    \"_id\": \"60f5a13d6b1f0e12345abcde\",\n    \"title\": \"My First Blog\",\n    \"content\": \"This is the content of the blog.\",\n    \"tags\": [\"Node.js\", \"API\"],\n    \"category\": \"Technology\",\n    \"gitHubLink\": \"https://github.com/user/repo\",\n    \"attachments\": [\"https://example.com/file1.pdf\"],\n    \"thumbnail\": \"https://example.com/image.jpg\",\n    \"status\": \"published\",\n    \"publishedAt\": \"2025-01-21T12:34:56.789Z\",\n    \"_author\": \"60f5a13d6b1f0e12345abcd9\",\n    \"frequency\": 5\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Blog not found\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Blogs"
  },
  {
    "type": "post",
    "url": "/blogs",
    "title": "2.0 Get Blog Posts with Filters and Pagination",
    "name": "getBlogs",
    "group": "Blogs",
    "version": "2.0.0",
    "permission": [
      {
        "name": "Authenticated User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>The page number to fetch. Default is 1.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "10",
            "description": "<p>The number of blog posts per page. Default is 10.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"recommended\"",
              "\"byDate\""
            ],
            "optional": true,
            "field": "sortBy",
            "defaultValue": "recommended",
            "description": "<p>The sorting method. Options are <code>recommended</code> (based on user history) and <code>byDate</code> (based on creation date).</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "tags",
            "defaultValue": "[",
            "description": "<p>An array of tags to filter blogs by (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "categories",
            "defaultValue": "[",
            "description": "<p>An array of categories to filter blogs by (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "searchQuery",
            "description": "<p>A search query to match blogs by title using a case-insensitive regex (optional).</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Request Example:",
        "content": "{\n  \"page\": 1,\n  \"limit\": 10,\n  \"sortBy\": \"recommended\",\n  \"tags\": [\"Node.js\", \"API\"],\n  \"categories\": [\"Technology\"],\n  \"searchQuery\": \"blog\"\n}",
        "type": "json"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"blogs\": [\n    {\n      \"_id\": \"60f5a13d6b1f0e12345abcde\",\n      \"title\": \"My First Blog\",\n      \"content\": \"This is the content of the blog.\",\n      \"tags\": [\"Node.js\", \"API\"],\n      \"category\": \"Technology\",\n      \"gitHubLink\": \"https://github.com/user/repo\",\n      \"attachments\": [\"https://example.com/file1.pdf\"],\n      \"thumbnail\": \"https://example.com/image.jpg\",\n      \"status\": \"published\",\n      \"publishedAt\": \"2025-01-21T12:34:56.789Z\",\n      \"_author\": \"60f5a13d6b1f0e12345abcd9\",\n      \"frequency\": 5\n    }\n  ]\n}",
          "type": "type"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"Invalid pagination parameters.\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Blogs"
  },
  {
    "type": "get",
    "url": "/blogs/drafts",
    "title": "6.0 Get Draft Blogs",
    "name": "getDraftBlogs",
    "group": "Blogs",
    "version": "6.0.0",
    "permission": [
      {
        "name": "Authenticated User"
      }
    ],
    "description": "<p>This endpoint retrieves a paginated list of draft blogs authored by the authenticated user. Draft blogs are those with a status of &quot;draft&quot;.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>The page number for pagination.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "10",
            "description": "<p>The number of blogs to retrieve per page.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Request Example:",
        "content": "GET /blogs/drafts?page=2&limit=5",
        "type": "json"
      },
      {
        "title": "Request Header Example:",
        "content": "Authorization: Bearer <jwt_token>",
        "type": "json"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"error\": false,\n  \"draftBlogs\": [\n    {\n      \"_id\": \"60f5a13d6b1f0e12345abcde\",\n      \"title\": \"Draft Blog Title\",\n      \"content\": \"This is a draft blog content...\",\n      \"tags\": [\"tag1\", \"tag2\"],\n      \"category\": \"Category Name\",\n      \"status\": \"draft\",\n      \"_author\": {\n        \"email\": \"user@example.com\",\n        \"name\": \"John Doe\",\n        \"profileImage\": \"http://example.com/image.jpg\"\n      },\n      \"createdAt\": \"2024-12-01T12:00:00.000Z\",\n      \"updatedAt\": \"2024-12-02T12:00:00.000Z\"\n    }\n  ],\n  \"totalCount\": 15,\n  \"page\": 2,\n  \"limit\": 5\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates whether an error occurred (always true).</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A descriptive message about the error.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "No Draft Blogs Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"No draft blogs found\"\n}",
          "type": "json"
        },
        {
          "title": "Internal Server Error Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"error\": true,\n  \"message\": \"An unexpected error occurred\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Blogs"
  },
  {
    "type": "post",
    "url": "/blogs/:id",
    "title": "4.0 Update a Blog",
    "name": "updateBlog",
    "group": "Blogs",
    "version": "4.0.0",
    "permission": [
      {
        "name": "Authenticated User"
      }
    ],
    "description": "<p>This endpoint allows an authenticated user to update their blog. The blog must belong to the authenticated user.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The ID of the blog to update.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Request Example:",
        "content": "PUT /blogs/60f5a13d6b1f0e12345abcde\n{\n  \"title\": \"Updated Blog Title\",\n  \"content\": \"Updated blog content\",\n  \"tags\": [\"Node.js\", \"Express\"],\n  \"category\": \"Technology\",\n  \"gitHubLink\": \"https://github.com/user/repo\",\n  \"attachments\": [\"https://example.com/file1.pdf\"],\n  \"thumbnail\": \"https://example.com/image.jpg\",\n  \"status\": \"publish\"\n}",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicates whether the operation was successful (true if successful).</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A success message.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "blog",
            "description": "<p>The updated blog object.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"Blog updated successfully\",\n  \"blog\": {\n    \"_id\": \"60f5a13d6b1f0e12345abcde\",\n    \"title\": \"Updated Blog Title\",\n    \"content\": \"Updated blog content\",\n    \"tags\": [\"Node.js\", \"Express\"],\n    \"category\": \"Technology\",\n    \"gitHubLink\": \"https://github.com/user/repo\",\n    \"attachments\": [\"https://example.com/file1.pdf\"],\n    \"thumbnail\": \"https://example.com/image.jpg\",\n    \"status\": \"published\",\n    \"_author\": \"60f5a13d6b1f0e12345abcd9\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Indicates whether an error occurred (always true).</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A descriptive message about the error.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "BlogNotFound Error Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"Blog not found\"\n}",
          "type": "json"
        },
        {
          "title": "InternalServerError Error Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": true,\n  \"message\": \"An unexpected error occurred\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Blogs"
  },
  {
    "type": "post",
    "url": "/blog/bookmark/:id",
    "title": "1.0 Bookmark/Unbookmark a Blog",
    "name": "BookMarkAndUnbookMark",
    "group": "Bookmarks",
    "version": "1.0.0",
    "permission": [
      {
        "name": "User (Authenticated with JWT)"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Blog ID to bookmark or unbookmark (sent as a URL parameter).</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Status of the request.</p>"
          },
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Error message.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "User Not Found:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"User not found\"\n}",
          "type": "json"
        },
        {
          "title": "Blog Not Found:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"Blog not found\"\n}",
          "type": "json"
        },
        {
          "title": "Server Error:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": true,\n  \"message\": \"Internal server error\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success Response (Bookmarked):",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"Blog bookmarked\",\n  \"bookmarked\": true\n}",
          "type": "json"
        },
        {
          "title": "Success Response (Unbookmarked):",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"Bookmark removed\",\n  \"bookmarked\": false\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Bookmarks"
  },
  {
    "type": "get",
    "url": "/bookmarks",
    "title": "2.0 Get all bookmarked blogs",
    "version": "2.0.0",
    "name": "GetAllBookmarks",
    "group": "Bookmarks",
    "permission": [
      {
        "name": "Authenticated User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "NotFound",
            "description": "<p>No bookmarks found for the user.</p>"
          }
        ],
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "ServerError",
            "description": "<p>Internal server error.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Not Found:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": true,\n  \"message\": \"No bookmarks found\"\n}",
          "type": "json"
        },
        {
          "title": "Server Error:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n  \"error\": true,\n  \"message\": \"Internal server error\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"message\": true,\n  \"blogList\": [\n    {\n      \"_id\": \"60df1c5e2a4a3b001c8e4d12\",\n      \"title\": \"Understanding Node.js\",\n      \"content\": \"Node.js is a JavaScript runtime...\",\n      \"_author\": {\n        \"name\": \"John Doe\",\n        \"email\": \"john@example.com\"\n      }\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/rest/blogs.js",
    "groupTitle": "Bookmarks"
  },
  {
    "type": "get",
    "url": "/user/:id",
    "title": "1.0 get user details",
    "name": "userDetails",
    "group": "User",
    "version": "1.0.0",
    "permission": [
      {
        "name": "User"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>The JWT Token in format &quot;Bearer xxxx.yyyy.zzzz&quot;</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Users unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "name",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"error\" : false,\n  \"user\" : {\n    \"email\": \"myEmail@logic-square.com\",\n    \"phone\": \"00000000000\",\n    \"name\"  : {\n      \"first\":\"Jhon\",\n      \"last\" :\"Doe\"\n    }\n  }\n}",
          "type": "type"
        }
      ]
    },
    "filename": "routes/rest/users.js",
    "groupTitle": "User"
  }
] });
