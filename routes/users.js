const express = require('express');
const router = express.Router();    
const bcrypt = require('bcryptjs');
const passport = require('passport');
// bring in User models
let User = require('../models/user');

//Register form
router.get('/register', function(req, res) {
    res.render('register');
});


// Register post
router.post('/register', function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password2 is required').equals(req.body.password);

    let errors = req.validationErrors();

    if(errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        // hash the password
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                    
                } else {
                    newUser.password = hash;
                    newUser.save(function(err) {
                        if(err) throw err;
                        req.flash('success', 'You are now registered');
                        res.redirect('/users/login');
                    });
                }
            });
        });
    }

});

// Login process
router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Login form
router.get('/login', function(req, res) {
    res.render('login');
});

// Logout
router.get('/logout', function(req, res) {
    req.logOut();
    req.flash('succes', 'You are logged out!');
    res.redirect('/users/login')

});

module.exports = router;