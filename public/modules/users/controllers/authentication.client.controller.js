'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
    function($scope, $http, $location, Authentication) {
        $scope.user = Authentication.user;

        function redirect(user) {
            if (user.role === 'admin') {
                $location.path('/admin');
            } else {
                $location.path('/user/' + user._id);
            }
        }

        // If user is signed in then redirect back home
        if ($scope.user) redirect($scope.user);

        $scope.signin = function(form) {
            $http.post('/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                Authentication.user = response;
                // And redirect to appropriate page
                redirect(response);
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.signup = function() {
            $http.post('/auth/signup', $scope.credentials).success(function(response) {
                console.log('profile created');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

    }
]);