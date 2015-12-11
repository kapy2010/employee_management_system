// CALL THE PACKAGES
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');

// connect to the database
mongoose.connect(config.database);

// APP CONFIGURATION
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,\
Authorization');
  next();
});

// log all requests to console
app.use(morgan('dev'));

// set static files location
app.use(express.static(__dirname + '/public'));

// API ROUTES
var apiRouter = require('./app/routes/api')(app, express);
app.use('/api', apiRouter);

// send users to frontend
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// START THE SERVER
app.listen(config.port);
console.log('Server running on 127.0.0.1:' + config.port);
