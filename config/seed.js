/**
 * Populate DB with seed data on server start if admin account does not exist
 */

'use strict';

var chalk = require('chalk');
var User = require('../app/models/user.server.model.js');
var Event = require('../app/models/event.server.model.js');

console.log('here');
User.count({
    'username': 'AAA'
}, function(err, exists) {
    if (!exists) {
        User.create({
            name: 'Elmer Meza',
            contingent: 'M',
            gender: 'M',
            school: 'Prep9',
            grade: '9',
            address: '328 W 71st St',
            city: 'New York',
            state: 'NY',
            zip: '10457',
            cell: '9175249089',
            phone: '7185380649',
            emergency_name: 'Joel Meza',
            emergency_phone: '7185380648',
            email: 'emeza@prepforprep.org',
            volunteering: '',
            translation: '',
            provider: 'local',
            role: 'admin',
            username: 'admin',
            password: 'wwadmin15'
        }, {
            name: 'Elmer Meza',
            contingent: 'M',
            gender: 'M',
            school: 'Prep9',
            grade: '9',
            address: '328 W 71st St',
            city: 'New York',
            state: 'NY',
            zip: '10457',
            cell: '9175249089',
            phone: '7185380649',
            emergency_name: 'Joel Meza',
            emergency_phone: '7185380648',
            email: 'emeza@prepforprep.org',
            volunteering: '',
            translation: '',
            provider: 'local',
            username: 'emeza@test.com',
            password: 'demo2015',
        }, function() {
            Event.find({}, function() {
                Event.create({
                    date: '05/02/15'
                }, {
                    date: '05/10/15'
                });
                console.log(chalk.green('Finished populating DB with seed data'));
            });

        });
    }
});