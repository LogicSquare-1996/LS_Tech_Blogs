const redis = require("redis");

const client = redis.createClient({
  legacyMode: true,
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  password: process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD !== 'your_redis_password_if_any' ? process.env.REDIS_PASSWORD : undefined
});

client.connect().catch((err) => {
  console.log('Redis connection error:', err);
  // Don't exit the process on connection error, just log it
  // process.exit(1);
});

client.on('error', (err) => {
  console.log('Redis client error:', err);
});

client.on('connect', () => {
  console.log('Redis client connected');
});

module.exports = {
  storeOTP: (email, otp, expiry = 600) => {
    return new Promise((resolve, reject) => {
      client.setEx(`otp:${email}`, expiry, otp, (err, reply) => {
        if (err) {
          console.log('Error storing OTP:', err);
          reject(err);
        } else {
          console.log(`OTP stored for email: ${email}`);
          resolve(reply);
        }
      });
    });
  },

  getOTP: (email) => {
    return new Promise((resolve, reject) => {
      client.get(`otp:${email}`, (err, otp) => {
        if (err) {
          console.log('Error getting OTP:', err);
          reject(err);
        } else {
          console.log(`OTP retrieved for email: ${email}`);
          resolve(otp);
        }
      });
    });
  },

  deleteOTP: (email) => {
    return new Promise((resolve, reject) => {
      client.del(`otp:${email}`, (err, reply) => {
        if (err) {
          console.log('Error deleting OTP:', err);
          reject(err);
        } else {
          console.log(`OTP deleted for email: ${email}`);
          resolve(reply);
        }
      });
    });
  }
};
