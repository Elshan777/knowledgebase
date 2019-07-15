const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const port = 3000;
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const config = require('./config/database')

// connect mongoose to db
mongoose.connect(config.database);
let db = mongoose.connection;

// check db connection 
db.once('open', function() {
    console.log('Connected to mongodb');
    
});

// check for db errors
db.on('error', function(err){
    console.log(err);
    
});

// init app
const app = express();

// bring in models
let Article = require('./models/article');

// Load view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser
app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));


// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));

//  Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

// Passport config
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// Home route
app.get('/', function(req, res) {
    Article.find({}, function(error, articles) {
        if(error) {console.log(error);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            }); 
        }
    });
});
// Route files
let articles = require('./routes/articles');
app.use('/articles', articles);

let users = require('./routes/users');
app.use('/users', users);

// Start Server
app.listen(port, function() {
    console.log('Server starded on port '+port);
    
});