'use strict';

// Setting up route
angular.module('letters').config(['$stateProvider',
    function($stateProvider) {
        // Letters state routing
        $stateProvider.
        state('command', {
            url: '/admin:status',
            templateUrl: 'modules/letters/views/command.html'
        }).
        state('adminSettings', {
            url: '/admin/settings',
            templateUrl: 'modules/letters/views/settings.html'
        }).
        state('events', {
            url: '/admin/event/:eventId',
            templateUrl: 'modules/letters/views/events.html'
        }).
        state('tracking', {
            url: '/admin/user/:agencyId',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
        }).
        state('agTracking', {
            url: '/user/:agencyId',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
        }).
        state('email', {
            url: '/admin/email',
            templateUrl: 'modules/letters/views/emails.html'
        }).
        state('etemplate', {
            url: '/admin/email/:template',
            templateUrl: 'modules/letters/views/etemplate.html'
        }).
        state('email-success', {
            url: '/admin/emails/success',
            templateUrl: 'modules/letters/views/esent.html'
        });
    }
]);