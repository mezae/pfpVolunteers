'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
    return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
    name: {
        type: String,
        default: '',
    },
    contingent: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
        default: '',
    },
    school: {
        type: String,
        default: '',
    },
    grade: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    zip: {
        type: Number,
        default: '',
    },
    cell: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    emergency_name: {
        type: String,
        default: '',
    },
    emergency_phone: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        trim: true,
        default: '',
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    volunteering: {
        type: String,
        default: '',
    },
    translation: {
        type: String,
        default: '',
    },
    username: {
        type: String,
        unique: 'testing error message',
        required: 'Please fill in a username',
        trim: true
    },
    password: {
        type: String,
        default: '',
        validate: [validateLocalStrategyPassword, 'Password should be longer']
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    role: {
        type: String,
        default: 'user'
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
    if (this.password && this.password.length > 6 && this.password.length < 88) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne({
        username: possibleUsername
    }, function(err, user) {
        if (!err) {
            if (!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

module.exports = mongoose.model('User', UserSchema);