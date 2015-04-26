'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Event = mongoose.model('Event'),
    User = mongoose.model('User'),
    async = require('async'),
    _ = require('lodash');

/**
 * Create a event
 */
exports.create = function(req, res) {
    var event = new Event(req.body);

    event.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(event);
        }
    });
};

/**
 * Show the current event
 */
exports.read = function(req, res) {
    res.json(req.event);
};

/**
 * Update a event
 */
exports.update = function(req, res) {
    var event = req.event;

    event = _.assign(event, req.body);
    event.updated = event.name ? Date.now() : '';

    event.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(event);
        }
    });
};

/**
 * Delete an event
 */
exports.delete = function(req, res) {
    var event = req.event;
    var user = event.track.substring(0, 4);
    var index = Number(event.track.substring(4));

    event.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            Event.find({
                'track': {
                    $regex: '^' + user
                }
            }).sort('track').exec(function(err, letters) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    _.forEach(_.range(index - 1, letters.length), function(num) {
                        letters[num].track = user + _.padLeft(num + 1, 3, '0');
                        letters[num].save(function(err) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                        });
                    });
                }
            });
            return res.status(200).send({
                message: 'remaining tracking labels updated'
            });
        }
    });
};

/**
 * List of Events
 */
exports.index = function(req, res) {
    if (req.query.start) {
        User.find({
            'status': 5,
            'updated': {
                $gte: new Date(req.query.start).setHours(0),
                $lt: new Date(req.query.end).setHours(24)
            }
        }).exec(function(err, users) {
            var reviewed = _.pluck(users, 'username');
            reviewed = _.map(reviewed, function(u) {
                return new RegExp('^' + u, 'i');
            });
            var query = {
                'track': {
                    $in: reviewed
                },
                'name': {
                    $ne: ''
                }
            };

            Event.find(query, '-__v -_id -created -updated').sort('track').exec(function(err, letters) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.json(letters);
                }
            });
        });
    } else {
        var query = req.query.username ? {
            'track': {
                $regex: '^' + req.query.username
            }
        } : '';

        var offset = req.query.offset ? req.query.offset : '';
        var limit = req.query.limit ? req.query.limit : '';

        Event.find(query, '-created').sort('track').skip(offset).limit(limit).exec(function(err, letters) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(letters);
            }
        });
    }
};

/**
 * Event middleware
 */
exports.eventByID = function(req, res, next, id) {
    Event.findOne({
        _id: id
    }, '-created').exec(function(err, event) {
        if (err) return next(err);
        if (!event) return next(new Error('Failed to load event ' + id));
        req.event = event;
        next();
    });
};