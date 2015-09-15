'use strict';

// Setting up route
angular.module('letters').config(['$stateProvider',
    function($stateProvider) {
        // Letters state routing
        $stateProvider.
        state('command', {
            url: '/admin/volunteers',
            templateUrl: 'modules/letters/views/command.html'
        }).
        state('cc-events', {
            url: '/admin/events',
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
        state('summary', {
            url: '/admin/user/:agencyId/summary',
            templateUrl: 'modules/users/views/settings/volunteer-summary.client.view.html'
        }).
        state('agTracking', {
            url: '/user/:agencyId',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
        });
    }
]);