const Agenda = require("agenda")

const agenda = new Agenda({ db: { address: process.env.MONGODB_CONNECTION_STRING, collection: "agendaJobs" } })

require("./agenda_jobs")(agenda)

module.exports = agenda
