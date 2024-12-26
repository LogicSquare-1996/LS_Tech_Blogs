const axios = require("axios")

module.exports = {
  sendNotification(playerIds = [], title = "", msg, data = {}, button = false) {
    if (playerIds.length === 0) {
      return "NO DEVICES"
    }
    playerIds.forEach((deviceId) => {
      const sendData = {
        app_id: process.env.ONESIGNAL_APPID,
        headings: {
          en: title
        },
        contents: {
          en: msg
        },
        include_player_ids: [deviceId],
        data // additional payload, if any
      }
      if (button === true) {
        sendData.buttons = [{
          id: "no",
          text: "Reject"
        }, {
          id: "yes",
          text: "accept"
        }]
      }
      axios.post(process.env.ONESIGNAL_BASE_URL, sendData, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
        }
      }).then((response) => {
        console.log("OneSignal Success: ", response.data)
      }).catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log("OneSignal Error: ", error.response.data)
          // reject(error.response.status);
          // reject(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log("OneSignal Error: ", error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("OneSignal Error: ", new Error(error.message))
        }
        console.log("OneSignal Error: ", error.config)
      })
    })
    return "OK" // no waiting!
  }
}