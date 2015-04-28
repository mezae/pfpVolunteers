'use strict';
/* global _: false */

angular.module('letters').controller('EventsController', ['$scope', '$stateParams', '$location', '$filter', '$timeout', 'Authentication', 'Events', 'Agencies', 'Users', 'socket',
    function($scope, $stateParams, $location, $filter, $timeout, Authentication, Events, Agencies, Users, socket) {
        $scope.user = Authentication.user;

        if (!$scope.user) $location.path('/');

        $scope.adminView = $scope.user.role === 'admin';

        var allUsers = null;
        $scope.calculateHours = function() {
            $scope.eventTotal = 0;
            for (var i = 0; i < $scope.currentEvent.volunteers.length; i++) {
                $scope.eventTotal += $scope.currentEvent.volunteers[i].hours;
            }
        };

        //Helps initialize page by finding the appropriate letters
        $scope.find = function() {
            Agencies.query({}, function(users) {
                allUsers = users;
                $scope.users = _.filter(users, function(u) {
                    return u.first_name !== '' && u.role !== 'admin';
                });
                socket.syncUpdates('users', allUsers);
            });

            Events.get({
                eventId: $stateParams.eventId
            }, function(event) {
                $scope.currentEvent = event;
                $scope.calculateHours();
            });
        };

        $scope.addVolunteer = function() {
            $scope.newVolunteer = true;
        };

        $scope.cancel = function() {
            $scope.newVolunteer = false;
            $scope.newVol = null;
        };

        $scope.save = function() {
            $scope.volProfile = $scope.users[$scope.volProfile];
            $scope.volProfile.hours += $scope.newVol.hours;
            $scope.newVol.name = $scope.volProfile.first_name + ' ' + $scope.volProfile.last_name;
            $scope.currentEvent.volunteers.push($scope.newVol);
            $scope.users = _.filter($scope.users, function(user) {
                return user.first_name + ' ' + user.last_name !== $scope.newVol.name;
            });

            Events.update($scope.currentEvent, function(response) {
                $scope.newVol = null;
                $scope.newVolunteer = false;
                $scope.currentEvent = response;
                $scope.calculateHours();

                Agencies.update($scope.volProfile, function(response) {
                    $scope.volProfile = null;
                });
            });
        };

        $scope.deleteVolunteer = function(index) {
            var oldVol = $scope.currentEvent.volunteers.splice(index, 1);
            var newVol = _.find(allUsers, function(users) {
                return users.first_name + ' ' + users.last_name === oldVol[0].name;
            });

            Events.update($scope.currentEvent, function(response) {
                newVol.hours -= oldVol[0].hours;
                $scope.currentEvent = response;
                $scope.calculateHours();

                Agencies.update(newVol, function(response) {
                    $scope.users.push(response);
                });

            });
        };

        //Helps clean up sloppy user input
        function cleanText(text, priority) {
            if ((text === text.toLowerCase() || text === text.toUpperCase()) && priority === 1) {
                return text.replace(/\w\S*/g, function(txt) {
                    return _.capitalize(txt);
                });
            } else if (text === text.toUpperCase()) {
                return text.toLowerCase();
            } else {
                return text;
            }
        }

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('users');
        });

    }
]);