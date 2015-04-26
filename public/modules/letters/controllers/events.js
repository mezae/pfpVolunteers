'use strict';
/* global _: false */

angular.module('letters').controller('EventsController', ['$scope', '$stateParams', '$location', '$filter', '$timeout', 'Authentication', 'Events', 'Agencies', 'Users', 'socket',
    function($scope, $stateParams, $location, $filter, $timeout, Authentication, Events, Agencies, Users, socket) {
        $scope.user = Authentication.user;

        if (!$scope.user) $location.path('/');

        $scope.adminView = $scope.user.role === 'admin';

        //Helps initialize page by finding the appropriate letters
        $scope.find = function() {
            Agencies.query({}, function(users) {
                $scope.users = _.filter(users, function(u) {
                    return u.name !== '' && u.role !== 'admin';
                });

                socket.syncUpdates('users', $scope.users);
            });

            Events.get({
                eventId: $stateParams.eventId
            }, function(event) {
                $scope.currentEvent = event;
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
            $scope.volProfile.hours = $scope.newVol.hours;
            $scope.newVol.name = $scope.volProfile.first_name + ' ' + $scope.volProfile.last_name;
            $scope.currentEvent.volunteers.push($scope.newVol);
            $scope.users = _.filter($scope.users, function(u) {
                return u.name !== $scope.newVol.name;
            });

            Events.update($scope.currentEvent, function(response) {
                $scope.newVol = null;
                $scope.newVolunteer = false;
                $scope.currentEvent = response;

                Agencies.update($scope.volProfile, function(response) {
                    $scope.volProfile = null;
                })
            });
        };

        $scope.deleteVolunteer = function(index) {
            $scope.currentEvent.volunteers.splice(index, 1);
            Events.update($scope.currentEvent, function(response) {
                $scope.newVol = null;
                $scope.newVolunteer = false;
                $scope.currentEvent = response;
            });
        }

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