/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var events = require('../models/event.server.model');

exports.register = function(socket) {
    events.schema.post('save', function(doc) {
        onSave(socket, doc);
    });
    events.schema.post('remove', function(doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('events:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('events:remove', doc);
}