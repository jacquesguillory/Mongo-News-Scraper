// requirements
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Requiring all models
var db = require("./models");



var PORT = 3000;

var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Set mongoose to leverage built in JavaScript ES6 Promises
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/hockeyDB";
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});


// Routes
// Scraping /r/hockey for hockey news
app.get("/scrape", function (req, res){
    axios.get("https://www.reddit.com/r/fantasyfootball/").then(function(response){
        console.log(response);
        var $ = cheerio.load(response.data);

        let completeCount = 0;
        const total = $("p.title").length;
        $("p.title").each(function(i, element){
            var result = {};

            result.title = $(this).find("a").text();
            result.link = $(this).children().attr("href");
        
            // Creating new article
            db.Article.create(result).then(function(dbArticle){
                completeCount++;
                if (completeCount === total) {
                    res.redirect("/");
                }
            }).catch(function(err){
                res.json(err);
            });
            console.log(result);
            
        });
    });
});

app.get("/articles", function(req, res){
    db.Article.find({}).then(function(dbArticle){
        res.send(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});

app.get("/articles/:id", function(req, res){
    db.Article.findOne({_id: req.params.id}).populate("note").then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});

app.post("/articles/:id", function(req, res){
    db.Note.create(req.body).then(function(dbNote){
        return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
    }).then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});





// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});