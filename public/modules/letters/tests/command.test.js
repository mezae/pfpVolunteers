// 'use strict';

// (function() {
//     // Articles Controller Spec
//     describe('ArticlesController', function() {
//         // Initialize global variables
//         var ArticlesController,
//             scope,
//             $httpBackend,
//             $stateParams,
//             $location,
//             windowMock;

//         // The $resource service augments the response object with methods for updating and deleting the resource.
//         // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
//         // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
//         // When the toEqualData matcher compares two objects, it takes only object properties into
//         // account and ignores methods.
//         beforeEach(function() {
//             jasmine.addMatchers({
//                 toEqualData: function(util, customEqualityTesters) {
//                     return {
//                         compare: function(actual, expected) {
//                             return {
//                                 pass: angular.equals(actual, expected)
//                             };
//                         }
//                     };
//                 }
//             });
//         });

//         // Then we can start by loading the main application module
//         beforeEach(module(ApplicationConfiguration.applicationModuleName));

//         // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
//         // This allows us to inject a service but then attach it to a variable
//         // with the same name as the service.
//         beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _$window_) {
//             // Set a new global scope
//             scope = $rootScope.$new();

//             // Point global variables to injected services
//             $stateParams = _$stateParams_;
//             $httpBackend = _$httpBackend_;
//             $location = _$location_;

//             windowMock = {
//                 prompt: function(msg) {
//                     return 'DELETE';
//                 }
//             };

//             // Initialize the Articles controller.
//             ArticlesController = $controller('ArticlesController', {
//                 $scope: scope,
//                 $window: windowMock
//             });
//         }));

//         it('$scope.find() should create an array with at least one user object fetched from XHR', inject(function(Agencies) {
//             // Create sample article using the Articles service
//             var sampleUser = new Agencies({
//                 _id: '525a8422f6d0f87f0e407a33',
//                 username: 'AAA',
//                 agency: 'American Astronauts Agency',
//                 contact: 'Elmer Meza',
//                 email: 'meza.elmer@gmail.com',
//                 children: 14,
//                 teens: 12,
//                 seniors: 0
//             });

//             // Create a sample articles array that includes the new article
//             var sampleUsers = [sampleUser];

//             // Set GET response
//             $httpBackend.expectGET('agency').respond(sampleUsers);

//             // Run controller functionality
//             scope.find();
//             $httpBackend.flush();

//             // Test scope value
//             expect(scope.partners).toEqualData(sampleUsers);
//         }));

//         it('$scope.saveAgency() should not save agency if code is not unique', inject(function(Agencies) {
//             // Create sample article using the Articles service
//             var sampleUser = new Agencies({
//                 _id: '525a8422f6d0f87f0e407a33',
//                 username: 'AAA',
//                 agency: 'American Astronauts Agency',
//                 contact: 'Elmer Meza',
//                 email: 'meza.elmer@test.com',
//                 children: 14,
//                 teens: 12,
//                 seniors: 0
//             });

//             // Create a sample articles array that includes the new article
//             var sampleUsers = [sampleUser];

//             // Set GET response
//             $httpBackend.expectGET('agency').respond(sampleUsers);

//             // Run controller functionality
//             scope.find();
//             $httpBackend.flush();

//             scope.showSidebar();

//             scope.partner = {
//                 _id: '525a8422f6d0f87f0e407a33',
//                 username: 'AAA',
//                 agency: 'Arcs And Agents',
//                 contact: 'Nelly Meza',
//                 email: 'arcs15@test.com',
//                 children: 300,
//                 teens: 50,
//                 seniors: 0
//             };

//             scope.saveAgency();

//             // Test scope value
//             expect(scope.alert.msg).toEqualData('AAA already exists. Please edit the existing copy to avoid duplicates.');
//         }));

//         it('$scope.saveAgency() should not update agency if letters total is 0', inject(function(Agencies) {
//             // Create sample article using the Articles service
//             var sampleUser = new Agencies({
//                 _id: '525a8422f6d0f87f0e407a33',
//                 username: 'AAA',
//                 agency: 'American Astronauts Agency',
//                 contact: 'Elmer Meza',
//                 email: 'meza.elmer@gmail.com',
//                 children: 14,
//                 teens: 12,
//                 seniors: 0
//             });

//             // Create a sample articles array that includes the new article
//             var sampleUsers = [sampleUser];

//             // Set GET response
//             $httpBackend.expectGET('agency').respond(sampleUsers);

//             // Run controller functionality
//             scope.find();
//             $httpBackend.flush();

//             scope.showSidebar(scope.partners[0]);

//             scope.partner.children = 0;
//             scope.partner.teens = 0;
//             scope.saveAgency();

//             // Test scope value
//             expect(scope.alert.msg).toEqualData('A tracking form must include at least one letter.');
//         }));

//         it('$scope.saveAgency() should save agency if code is unique', inject(function(Agencies) {
//             // Create sample article using the Articles service
//             var sampleUser = new Agencies({
//                 _id: '525a8422f6d0f87f0e407a33',
//                 username: 'AAA',
//                 agency: 'American Astronauts Agency',
//                 contact: 'Elmer Meza',
//                 email: 'meza.elmer@test.com',
//                 children: 14,
//                 teens: 12,
//                 seniors: 0
//             });

//             // Create a sample articles array that includes the new article
//             var sampleUsers = [sampleUser];

//             // Set GET response
//             $httpBackend.expectGET('agency').respond(sampleUsers);

//             // Run controller functionality
//             scope.find();
//             $httpBackend.flush();

//             scope.showSidebar();

//             scope.partner = {
//                 _id: '525a8422f6d0f87f0e407a34',
//                 username: 'WWT',
//                 agency: 'Winter Wishes Team',
//                 contact: 'Nicole Presedo',
//                 email: 'wwt@test.com',
//                 children: 200,
//                 teens: 50,
//                 seniors: 0
//             };

//             $httpBackend.whenPOST('/auth/signup').respond(function(method, url, data, headers) {
//                 var newUser = new Agencies(angular.fromJson(data));
//                 return [200, newUser, {}];
//             });

//             scope.saveAgency();

//             $httpBackend.flush();


//             // Test scope value
//             expect(scope.partners.length).toEqualData(2);
//         }));

//         it('$scope.saveAgency() should update agency', inject(function(Agencies) {
//             // Create sample article using the Articles service
//             var sampleUser = new Agencies({
//                 _id: '525a8422f6d0f87f0e407a33',
//                 username: 'AAA',
//                 agency: 'American Astronauts Agency',
//                 contact: 'Elmer Meza',
//                 email: 'meza.elmer@gmail.com',
//                 children: 14,
//                 teens: 12,
//                 seniors: 0
//             });

//             // Create a sample articles array that includes the new article
//             var sampleUsers = [sampleUser];

//             // Set GET response
//             $httpBackend.expectGET('agency').respond(sampleUsers);

//             // Run controller functionality
//             scope.find();
//             $httpBackend.flush();

//             scope.showSidebar(scope.partners[0]);

//             scope.partner.children = 25;
//             scope.saveAgency();
//             scope.showSidebar(scope.partners[0]);

//             // Test scope value
//             expect(scope.partner.children).toEqualData(25);
//         }));

//         it('$scope.deleteAgency() should not delete agency', inject(function(Agencies) {
//             // Create sample article using the Articles service
//             var sampleUser = new Agencies({
//                 _id: '525a8422f6d0f87f0e407a33',
//                 username: 'AAA',
//                 agency: 'American Astronauts Agency',
//                 contact: 'Elmer Meza',
//                 email: 'meza.elmer@test.com',
//                 children: 14,
//                 teens: 12,
//                 seniors: 0
//             });

//             // Create a sample articles array that includes the new article
//             var sampleUsers = [sampleUser];

//             // Set GET response
//             $httpBackend.expectGET('agency').respond(sampleUsers);

//             // Run controller functionality
//             scope.find();
//             $httpBackend.flush();

//             scope.showSidebar();

//             scope.partner = {
//                 _id: '525a8422f6d0f87f0e407a34',
//                 username: 'WWT',
//                 agency: 'Winter Wishes Team',
//                 contact: 'Nicole Presedo',
//                 email: 'wwt@test.com',
//                 children: 200,
//                 teens: 50,
//                 seniors: 0
//             };

//             $httpBackend.whenPOST('/auth/signup').respond(function(method, url, data, headers) {
//                 var newUser = new Agencies(angular.fromJson(data));
//                 return [200, newUser, {}];
//             });

//             scope.saveAgency();

//             $httpBackend.flush();

//             var old_count = scope.partners.length;

//             $httpBackend.whenDELETE('/agency/525a8422f6d0f87f0e407a34').respond(function(method, url, data, headers) {
//                 console.log(url);
//                 return [200, '', ''];
//             });

//             scope.deleteAgency(scope.partners[1]);

//             windowMock.prompt('delete?');
//             // jasmine.spyOn(window, 'prompt').and.callFake(function() {
//             //     return 'DELETE';
//             // });

//             $httpBackend.flush();

//             console.log(scope.partners);

//             // Test scope value
//             expect(old_count - scope.partners.length).toEqualData(1);
//         }));

//         it('$scope.showSidebar() should make sidebar show up', inject(function(Agencies) {
//             scope.showSidebar();
//             expect(scope.needToUpdate).toEqual(true);
//         }));

//         it('$scope.hideSidebar() should clear selected partner and hide sidebar', inject(function(Agencies) {
//             scope.hideSidebar();
//             expect(scope.partner).toEqual(null);
//             expect(scope.needToUpdate).toEqual(false);
//         }));
//     });
// }());