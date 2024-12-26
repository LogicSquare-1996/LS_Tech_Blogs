module.exports = (agenda) => {
  agenda.define("demo", async (job) => {
    try {
      job.remove()
    } catch (error) {
      console.log(`Agenda => ${error}`)
      job.remove()
    }
  })
}
