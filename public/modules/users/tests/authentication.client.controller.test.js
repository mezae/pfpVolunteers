'use strict';

(function() {
    // Authentication controller Spec
    describe('AuthenticationController', function() {
        // Initialize global variables
        var AuthenticationController,
            scope,
            $httpBackend,
            $stateParams,
            $location;

        beforeEach(function() {
            jasmine.addMatchers({
                toEqualData: function(util, customEqualityTesters) {
                    return {
                        compare: function(actual, expected) {
                            return {
                                pass: angular.equals(actual, expected)
                            };
                        }
                    };
                }
            });
        });

        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName));

        // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
        // This allows us to inject a service but then attach it to a variable
        // with the same name as the service.
        beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
            // Set a new global scope
            scope = $rootScope.$new();

            // Point global variables to injected services
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;

            // Initialize the Authentication controller
            AuthenticationController = $controller('AuthenticationController', {
                $scope: scope
            });
        }));


        it('$scope.signin() should login with a correct user and password', function() {
            // Test expected GET request
            $httpBackend.when('POST', '/auth/signin').respond(200, {
                username: 'Fred',
                role: 'admin'
            });

            scope.signin();
            $httpBackend.flush();

            // Test scope value
            expect(scope.user).toEqual({
                username: 'Fred',
                role: 'admin'
            });
        });

        it('$scope.signin() should login and redirect admin to command center', function() {
            // Test expected GET request
            $httpBackend.when('POST', '/auth/signin').respond(200, {
                username: 'Fred',
                role: 'admin'
            });

            scope.signin();
            $httpBackend.flush();

            expect($location.url()).toEqual('/admin');
        });

        it('$scope.signin() should login and redirect user to form', function() {
            // Test expected GET request
            $httpBackend.when('POST', '/auth/signin').respond(200, {
                _id: 'adsfsadf2425sdaf',
                username: 'Fred',
                role: 'user'
            });

            scope.signin();
            $httpBackend.flush();

            expect($location.url()).toEqual('/user/adsfsadf2425sdaf');
        });

        it('$scope.signin() should fail to log in with nothing', function() {
            // Test expected POST request
            $httpBackend.expectPOST('/auth/signin').respond(400, {
                'message': 'Missing credentials'
            });

            scope.signin();
            $httpBackend.flush();

            // Test scope value
            expect(scope.error).toEqual('Missing credentials');
        });

        it('$scope.signin() should fail to log in with wrong credentials', function() {
            // Foo/Bar combo assumed to not exist
            scope.user = 'Foo';
            scope.credentials = 'Bar';

            // Test expected POST request
            $httpBackend.expectPOST('/auth/signin').respond(400, {
                'message': 'Unknown user'
            });

            scope.signin();
            $httpBackend.flush();

            // Test scope value
            expect(scope.error).toEqual('Unknown user');
        });
    });
}());