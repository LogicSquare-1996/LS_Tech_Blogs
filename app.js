const createError = require('http-errors');
const express = require('express');
const mongoose = require("mongoose")
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors")
const helmet = require("helmet")
require("dotenv").config()

const agenda = require("./agenda")
require("./agenda/agenda_jobs")(agenda)

const restRouter = require('./routes/rest');
const webRouter = require('./routes/web');
const adminRouter = require('./routes/admin');

const app = express();

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== "development") {
  app.use(helmet())
}

app.use(cors())

// Database setup
mongoose.Promise = global.Promise

// mongoose.createConnection(process.env.MONGODB_CONNECTION_STRING).asPromise();
// mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', webRouter);
app.use(`/api/v${process.env.API_VERSION}`, restRouter);
app.use(`/admin/v${process.env.API_VERSION}`, adminRouter);

// Agenda
agenda.on("ready", async () => {
  console.log("Agenda starting -_-")
  await agenda.start()
  console.log("Agenda started ^_^")
  // cron initiator
  // eslint-disable-next-line global-require
  const cronJobs = require("./agenda/cron-jobs")
  await cronJobs(agenda)
})

async function graceful() {
  await agenda.stop()
  console.log("\nAgenda stoped ^o^")
  process.exit(0)
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
