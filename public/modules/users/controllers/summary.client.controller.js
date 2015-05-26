'use strict';
/* global _: false */

angular.module('users').controller('SummaryController', ['$scope', '$http', '$location', '$stateParams', 'Users', 'Agencies', 'Authentication', 'Events',
    function($scope, $http, $location, $stateParams, Users, Agencies, Authentication, Events) {
        $scope.user = Authentication.user;

        $scope.find = function() {
            // If user is not signed in then redirect back home
            if (!$scope.user || $scope.user.role === 'user') $location.path('/');

            Agencies.get({
                agencyId: $stateParams.agencyId
            }, function(user) {
                $scope.currentUser = user;

                $scope.relatedEvents = Events.query({}, function() {
                    $scope.relatedEvents = _.filter($scope.relatedEvents, function(event) {
                        return _.find(event.volunteers, {
                            'name': $scope.currentUser.first_name + ' ' + $scope.currentUser.last_name
                        });
                    });

                    $scope.relatedEvents = _.map($scope.relatedEvents, function(event) {
                        event.volunteers = _.find(event.volunteers, {
                            'name': $scope.currentUser.first_name + ' ' + $scope.currentUser.last_name
                        });
                        return event;
                    });
                });

            });
        };

        $scope.viewContactInfo = function() {
            $location.path('/admin/user/' + $stateParams.agencyId);
        };

    }
]);