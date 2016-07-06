
var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    mdbClient = require('mongodb').MongoClient,
    assert = require('assert');

var url = 'mongodb://localhost:27017/video';

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true })); 

// Handler for internal server errors
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error_template', { error: err });
}

//default page to add an entry
app.get('/', function(req, res, next) {
    res.render('addmovie', {});
});

//shows a list of movies
app.get('/list', function(req, res, next) {
    mdbClient.connect(url, function(err, db) {
    
        assert.equal(null, err);
        console.log("Successfully connected to server for list");
        
        db.collection('movies').find({}).toArray(function(err, docs) {
    
            res.render('listmovies', {movies: docs});
    
            db.close();
        });
    
        console.log("Retrieved list");
    });
});

app.post('/add_movie', function(req, res, next) {
    var title = req.body.title;
    var year = req.body.year;
    var imdb = req.body.imdb;
    
    if ( title == ''
        ||  year == ''
        ||  imdb == '')
    {
        next('Invalid entry, at least one field is blank!');
    }
    else {
        mdbClient.connect(url, function(err, db){
            assert.equal(null, err);
            console.log("Successfully connected to server for insert");
    
            db.collection('movies').insertOne({"title":title,"year":year,"imdb":imdb}, function(err, r){
                assert.equal(null,err);
                console.log("Inserted entry with _id: " + r.insertedId);
                
                db.close();
                res.render('success',{"title":title, "year":year, "imdb":imdb});
            });
        });
    }
});

app.use(errorHandler);

var server = app.listen(8080, function() {
    var port = server.address().port;
    console.log('Express server listening on port %s.', port);
});
