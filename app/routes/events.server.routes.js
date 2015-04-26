'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    events = require('../../app/controllers/events.server.controller');

module.exports = function(app) {
    // Article Routes
    app.route('/events')
        .get(users.requiresLogin, events.index)
        .post(users.requiresLogin, events.create);

    app.route('/events/:eventId')
        .get(users.requiresLogin, events.read)
        .put(users.requiresLogin, events.update)
        .delete(users.requiresLogin, events.delete);

    // Finish by binding the article middleware
    app.param('eventId', events.eventByID);
};