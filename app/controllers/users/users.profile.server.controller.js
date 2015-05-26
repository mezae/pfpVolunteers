'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    Event = mongoose.model('Event');
var fs = require('fs');
var pdf = require('html-pdf');

exports.topdf = function(req, res) {
    var user = req.user;

    var options = {
        filename: './pfpletter.pdf',
        format: 'Letter',
        border: {
            top: '0.5in',
            right: '1in',
            bottom: '1in',
            left: '1in'
        }
    };
    console.log(req.headers.host);
    res.render('templates/pfp-letter', {
        today: (new Date()).toDateString().substring(3),
        firstName: user.first_name,
        lastName: user.last_name,
        totalHours: user.hours,
        hisher: user.gender === 'M' ? 'His' : 'Her',
        himher: user.gender === 'M' ? 'him' : 'her',
        heshe: user.gender === 'M' ? 'He' : 'She'

    }, function(err, html) {
        pdf.create(html, options).toFile(function(err, file) {
            if (err) return console.log(err);
            res.download(file.filename, 'file://' + file.filename);
        });
    });

};

//Allows admin access to all community partner accounts
exports.list = function(req, res) {
    User.find({}, 'first_name last_name hours role submitted').exec(function(err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(users);
        }
    });
};

//Allows admin access to individual community partner accounts
exports.agencyByID = function(req, res, next, id) {
    User.findById(id, '-salt -password -provider -created').exec(function(err, agency) {
        if (err) return next(err);
        if (!agency) return next(new Error('Failed to load article ' + id));
        req.user = agency;
        next();
    });
};

//Shows admin selected community partner account
exports.read = function(req, res) {
    res.json(req.user);
};


//delete extra letters if number of accepted letters has decreased
function deleteExtras(letters, newTotal) {
    var extras = _.pluck(letters.slice(newTotal), 'track');
    Event.remove({
        track: {
            $in: extras
        }
    }, function() {
        console.log('Deleted extra records');
    });
}

//Allows admin to update a community partner account;
//Allows community partner to update their profile info
exports.update = function(req, res) {
    // Init Variables
    var user = req.user;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.role;

    // Merge existing user
    user = _.assign(user, req.body);
    user.updated = Date.now();
    user.submitted = true;

    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(user);
        }
    });
};

//Delete a community partner's account, including all associated letters
exports.delete = function(req, res) {
    var user = req.user;
    if (user.role !== 'admin') {
        user.remove(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                Event.remove({
                    'track': {
                        $regex: '^' + user.username
                    }
                }, function() {
                    console.log('Deleted all of ' + user.agency + '\'s letters');
                });
                res.json(user);
            }
        });
    } else {
        return res.status(400).send({
            message: req.body
        });
    }
};

//Send User
exports.me = function(req, res) {
    res.json(req.user || null);
};

exports.resetData = function(req, res) {
    var user = req.user;
    User.remove({
        'role': {
            $ne: 'admin'
        }
    }, function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            Event.remove({}, function() {
                console.log('Deleted all letters');
            });
            res.json(user);
        }
    });
};