'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Event Schema
 */
var EventSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: ''
    },
    shift: {
        type: String,
        default: null
    },
    volunteers: {
        type: Array,
        default: []
    },
    totalHours: {
        type: Number,
        default: ''
    },
    updated: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Event', EventSchema);