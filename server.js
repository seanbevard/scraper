/*Required Dependancies*/
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

/*Required models*/
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

/*Initialize Express*/
var app = express();

/*Use Morgan/Body parser*/
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

/*Setup static public folder*/
app.use(express.static(process.cwd() + "/public"));

/*Configure Mongoose DB connection*/
mongoose.connect("mongodb://heroku_wbsdrv2w:hlao9ah0prlqkfb66nd9ptteqe@ds143191.mlab.com:43191/heroku_wbsdrv2w");
var db = mongoose.connection;

/*Send Mongoose errors to Console*/
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

/*Log message when successfully connected to Mongoose DB*/
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

/*Setup Handlebars*/
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

/*Import routes and give the server access to them.*/
var routes = require("./controllers/scraper_controller.js");
app.use("/", routes);

app.set('port', process.env.PORT);
app.listen(app.get('port'), () => {
    console.log(`Express app listening`);
});