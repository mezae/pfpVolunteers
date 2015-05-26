'use strict';
/* global _: false */

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', '$stateParams', 'Users', 'Agencies', 'Authentication', 'Events',
    function($scope, $http, $location, $stateParams, Users, Agencies, Authentication, Events) {
        $scope.user = Authentication.user;

        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        $scope.currentUser = Agencies.get({
            agencyId: $stateParams.agencyId
        });

        $scope.viewVolunteerSummary = function() {
            $location.path('/admin/user/' + $stateParams.agencyId + '/summary');
        };

        // Update a user profile
        $scope.updateUserProfile = function(isValid) {
            if (isValid) {
                $scope.success = $scope.error = null;

                Agencies.update($scope.currentUser);

            } else {
                $scope.submitted = true;
            }
        };

        // Change user password
        $scope.changeUserPassword = function() {
            $scope.success = $scope.error = null;

            $http.post('/users/password', $scope.passwordDetails).success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);