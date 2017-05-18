/*require dependencies and initialize router*/
var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var router = express.Router();

/*Require Models*/
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");
router.get('/', function(req, res, next) {
    res.render('index');
});

/*
Scrape Route!
*/
router.get("/scrape", function(req, res) {
    /*Get the whole page and load it into Cheerio, mate.*/
    request("https://www.mlssoccer.com/news", function(error, response, html) {
        var $ = cheerio.load(html);
        $(".node-title").each(function(i, element) {
            var result = {};
            /*save the article title and URL from each one found
            on the page*/
            result.title = $(this).children("a").text();
            /*Hardcoded the domain because each HREF tag doesn't have it.
            todo:  find a better way to do this*/
            result.link = "https://www.mlssoccer.com" + $(this).children("a").attr("href");
            /*Using article model to create a new entry*/
            var entry = new Article(result);
            /*Save this entry to the Database.*/
            entry.save(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
        });
    });
    /*Once scrape is complete, refresh root*/
    res.redirect('/');
});

/*
Get ALL Articles Route.
*/
router.get("/articles", function(req, res) {
    /*Find all articles*/
    Article.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        }
        /* If no error, send back all articles in JSON format */
        else {
            res.json(doc);
        }
    });
});

/*
Get SINGLE Article Route.
*/
router.get("/articles/:id", function(req, res) {
    /*Match in DB based on id*/
    Article.findOne({ "_id": req.params.id })
        /*load the notes for this article*/
        .populate("note")
        .exec(function(error, doc) {
            if (error) {
                console.log(error);
            }
            /*If no errors, send the article back in JSON format.*/
            else {
                res.json(doc);
            }
        });
});

/*
Post route to post a new Note for a specific article
*/
router.post("/articles/:id", function(req, res) {
    var newNote = new Note(req.body);

    /*Save the note we just created to the DB
    by finding the article ID and updating the note*/
    newNote.save(function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        /*Send the response even though we dont' use it*/
                        res.send(doc);
                    }
                });
        }
    });
});

/*
Delete ALL articles and notes!
*/
router.get('/delete-all', function(req, res) {
    Article.remove({}, function(err) {
        if (err) {
            console.log("Error: " + err)
        } else {
            console.log("All articles deleted sucessfully!");
        }
    });
    Note.remove({}, function(err) {
        if (err) {
            console.log("Error: " + err)
        } else {
            console.log("All notes delete sucessfully!");
            res.redirect('/');
        }
    });
});

/*
Delete a single article and it's associated note
*/
router.get("/delete/:id", function(req, res) {

    Article.remove({"_id": req.params.id}, function(err) {
        if (err) {
            console.log("Error: " + err)
        } else {
            console.log("This article deleted sucessfully!");
            res.redirect('/');
        }
    });

});
/*Export routes for server.js to use.*/
module.exports = router;
