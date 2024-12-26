module.exports = async (agenda) => {
  // Cron job for calculating months of experience of a candidate
  await agenda.cancel({ name: "demo" })
  await agenda.create("demo")
    .repeatEvery("1 day")
    .schedule("11:59pm")
    .save()
}
