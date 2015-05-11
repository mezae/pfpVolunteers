'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'meanww';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate', 'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'ui.utils', 'btford.socket-io'];

    // Add a new vertical module
    var registerModule = function(moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('letters');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'modules/core/views/home.html'
            })
            .state('confirm', {
                url: '/settings/profile/first',
                templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'modules/users/views/authentication/signin.client.view.html'
            })
            .state('admin', {
                url: '/admin',
                templateUrl: 'modules/letters/views/command.html'
            });
    }
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$location', '$modal', 'Authentication',
    function($scope, $location, $modal, Authentication) {
        $scope.authentication = Authentication;
        $scope.isAdmin = $scope.authentication.user.username === 'AAA';

        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function() {
            $scope.isCollapsed = false;
        });

        $scope.showTutorial = function() {
            if ($location.path() === '/admin') {
                $modal.open({
                    templateUrl: 'modules/core/views/adminTutorial.html',
                    controller: 'AdminModalController',
                    backdrop: 'static'
                });
            } else if ($location.path() === '/admin/email') {
                $modal.open({
                    templateUrl: 'modules/core/views/emailTutorial.html',
                    controller: 'ModalInstanceCtrl',
                    backdrop: 'static'
                });
            } else if ($location.path().indexOf('/admin/email/') >= 0) {
                $modal.open({
                    templateUrl: 'modules/core/views/etemplateTutorial.html',
                    controller: 'ModalInstanceCtrl',
                    backdrop: 'static'
                });
            } else if ($location.path().indexOf('agency') >= 0) {
                var template = $scope.isAdmin ? 'modules/core/views/reviewTutorial.html' : 'modules/core/views/agencyTutorial.html';
                $modal.open({
                    templateUrl: template,
                    controller: 'ModalInstanceCtrl',
                    backdrop: 'static'
                });
            } else {
                $modal.open({
                    size: 'sm',
                    templateUrl: 'modules/core/views/noTutorial.html',
                    controller: 'ModalInstanceCtrl'
                });
            }
        };

        if (!$scope.isAdmin && $scope.authentication.user.status === 0) $scope.showTutorial();
    }
])

.controller('AdminModalController', ['$scope', '$modalInstance', '$filter', 'Authentication', 'Users',

    function($scope, $modalInstance, $filter, Authentication, Users) {

        function init() {
            $scope.user = Authentication.user;
            $scope.dueDate = $filter('date')($scope.user.due, 'MM/dd/yy');
        }

        $scope.saveDueDate = function() {
            $scope.user.due = $scope.dueDate;
            var user = new Users($scope.user);
            user.$update(function(response) {
                Authentication.user = response;
                init();
            }, function(response) {
                console.log(response.data.message);
            });
        };

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.minDate = new Date();

        $scope.dateOptions = {
            showWeeks: false
        };

        $scope.exit = function() {
            $modalInstance.close();
        };

        init();

    }
])

.controller('ModalInstanceCtrl', ['$scope', '$filter', '$modalInstance', 'Agencies',
    function($scope, $filter, $modalInstance, Agencies) {
        Agencies.query(function(users) {
            var admin = _.find(users, {
                'username': 'AAA'
            });
            $scope.dueDate = $filter('date')(admin.due, 'fullDate');
        });

        $scope.ok = function() {
            $modalInstance.close();
        };
    }
]);
'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location', 'Authentication',
    function($scope, $location, Authentication) {
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
    }
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('core').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

'use strict';

// Allows user to download csv file
angular.module('letters').config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|chrome-extension):/);
}]);
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
'use strict';
/* global _: false */

angular.module('letters').controller('CommandCenterController', ['$scope', '$window', '$modal', '$http', '$location', '$filter', 'Authentication', 'Agencies', 'Events', 'Users', 'socket',
    function($scope, $window, $modal, $http, $location, $filter, Authentication, Agencies, Events, Users, socket) {
        $scope.user = Authentication.user;
        if (!$scope.user) $location.path('/').replace();
        if ($location.search()) $scope.query = $location.search();

        $scope.radioModel = 'users';
        $scope.needToUpdate = false; //helps hide sidebar when it's not needed
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        $scope.updateURL = function(undo) {
            if (undo) $scope.query.status = null;
            if ($scope.query.status) {
                $location.search('status', $scope.query.status);
            } else {
                $location.search('status', null);
            }
        };

        $scope.find = function() {
            $scope.query = '';
            Agencies.query({}, function(users) {
                $scope.partners = users;
                socket.syncUpdates('users', $scope.partners);
            });

            Events.query({}, function(events) {
                $scope.events = events;
            });
        };

        //Allows user to add create new accounts, consider moving to backend
        function signup(credentials) {
            $http.post('/auth/signup', credentials).success(function(response) {
                console.log('new partner created');
            }).error(function(response) {
                $scope.error = response.message;
            });
        }

        $scope.fileInfo = function(element) {
            $scope.$apply(function() {
                $scope.file = element.files[0];
                if ($scope.file) {
                    if ($scope.file.name.split('.')[1].toUpperCase() !== 'CSV') {
                        alert('Must be a csv file!');
                        $scope.file = null;
                        return;
                    }
                }
            });
        };

        //Allow user to upload file to add partners in bulk
        //Makes sure CSV file includes required fields, otherwise lets user which fields are missing
        $scope.handleFileSelect = function() {
            var file = $scope.file;
            var reader = new FileReader();
            reader.onload = function(file) {
                var content = file.target.result;
                var rows = content.split(/[\r\n|\n]+/);
                var headers = rows.shift();

                if ($scope.radioModel === 'users') {
                    var required_fields = ['First Name', 'Last Name', 'Cont.', 'Email', 'Emergency Contact Phone', 'Translating', 'Notes', 'Total hours'];
                    var missing_fields = [];

                    _.forEach(required_fields, function(field) {
                        if (!_.includes(headers, field)) {
                            missing_fields.push(field);
                        }
                    });

                    if (missing_fields.length) {
                        $scope.alert = {
                            active: true,
                            type: 'danger',
                            msg: 'Your csv file could not be uploaded. It is missing the following columns: ' + missing_fields.join(', ') + '.'
                        };
                    } else {
                        headers = headers.split(',');
                        var fname_col = headers.indexOf('First Name');
                        var lname_col = headers.indexOf('Last Name');
                        var cont_col = headers.indexOf('Cont.');
                        var email_col = headers.indexOf('Email');
                        var emphone_col = headers.indexOf('Emergency Contact Phone');
                        var trans_col = headers.indexOf('Translating');
                        var notes_col = headers.indexOf('Notes');
                        var hours_col = headers.indexOf('Total hours');

                        _.forEach(rows, function(row) {
                            var record = row.split(',');
                            if (!_.includes($scope.partners, record[email_col])) {
                                var newPartner = {
                                    username: record[email_col],
                                    first_name: record[fname_col],
                                    last_name: record[lname_col],
                                    contingent: record[cont_col],
                                    email: record[email_col],
                                    emergency_phone: record[emphone_col],
                                    translating: record[trans_col],
                                    notes: record[notes_col],
                                    hours: parseFloat(record[hours_col], 10),
                                    submitted: true
                                };
                                signup(newPartner);
                            }
                        });
                        $scope.alert = {
                            active: true,
                            type: 'success',
                            msg: 'Your csv file was uploaded successfully.'
                        };
                    }
                } else {

                    var required_fields = ['First Name', 'Last Name', 'Email', 'Total hours'];
                    var missing_fields = [];

                    _.forEach(required_fields, function(field) {
                        if (!_.includes(headers, field)) {
                            missing_fields.push(field);
                        }
                    });

                    if (missing_fields.length) {
                        $scope.alert = {
                            active: true,
                            type: 'danger',
                            msg: 'Your csv file could not be uploaded. It is missing the following columns: ' + missing_fields.join(', ') + '.'
                        };
                    } else {
                        headers = headers.split(',');
                        var fname_col = headers.indexOf('First Name');
                        var lname_col = headers.indexOf('Last Name');
                        var email_col = headers.indexOf('Email');
                        var hours_col = headers.indexOf('Total hours');



                        for (var i = 0; i < rows.length; i++) {
                            rows[i] = rows[i].split(',');
                        }

                        var first_event = hours_col + 1;
                        var last_event = headers.length - 1;
                        for (var e = first_event; e <= last_event; e++) {
                            $scope.event = {
                                date: null,
                                volunteers: []
                            };
                            $scope.event.date = headers[e];
                            for (var user = 0; user < rows.length; user++) {
                                var yourHours = parseFloat(rows[user][e], 10);
                                if (yourHours > 0) {
                                    $scope.event.volunteers.push({
                                        name: rows[user][fname_col] + ' ' + rows[user][lname_col],
                                        hours: yourHours
                                    });
                                }
                            }
                            $scope.save();
                        }

                        $scope.alert = {
                            active: true,
                            type: 'success',
                            msg: 'Your csv file was uploaded successfully.'
                        };
                    }

                }
            };
            reader.readAsText(file);
            $scope.needToUpdate = false;
            $scope.file = null;
        };

        //Allows user to add/update a partner
        $scope.save = function() {
            $scope.alert.active = false;

            if ($scope.radioModel === 'users') {
                if ($scope.isNewAgency) {
                    if (_.find($scope.partners, {
                        'username': $scope.partner.username
                    })) {
                        $scope.alert = {
                            active: true,
                            type: 'danger',
                            msg: $scope.partner.username + ' already exists. Please edit the existing copy to avoid duplicates.'
                        };
                    } else {
                        signup($scope.partner);
                    }
                } else {
                    Agencies.update($scope.partner);
                }
            } else {
                if ($scope.isNewAgency) {
                    Events.save($scope.event, function() {
                        console.log('great!');
                    });

                } else {
                    Events.update($scope.event);
                }
            }
            $scope.hideSidebar();

        };

        //Allow user to delete selected partner and all associated recipients
        $scope.deleteBox = function(selected) {
            var box_name, box_api;
            if ($scope.radioModel === 'users') {
                box_name = selected.username;
                box_api = '/agency/';
            } else {
                box_name = $filter('date')(selected.date, 'shortDate');
                box_api = '/events/';
            }

            var confirmation = $window.prompt('Please type DELETE to remove ' + box_name + '.');
            if (confirmation === 'DELETE') {
                $http.delete(box_api + selected._id);
            }
        };

        //Show current state of partner that user wants to edit
        $scope.showSidebar = function(selected) {
            $scope.isNewAgency = selected ? false : true;
            $scope.event = selected;
            $scope.needToUpdate = true;
        };

        $scope.hideSidebar = function() {
            $scope.partner = null;
            $scope.needToUpdate = false;
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('users');
        });

        $scope.writeServiceLetter = function(student_id) {
            $http.get('/agency/' + student_id + '/pdf', {
                responseType: 'arraybuffer'
            }).success(function(data) {
                var file = new Blob([data], {
                    type: 'application/pdf'
                });
                var fileURL = $window.URL.createObjectURL(file);
                $window.open(fileURL);
            });
        };

    }
]);
'use strict';

angular.module('letters')

.controller('EmailsController', ['$scope', '$modal', '$http', '$stateParams', '$location', '$filter', 'Authentication', 'Agencies', 'Articles', 'Users',
	function($scope, $modal, $http, $stateParams, $location, $filter, Authentication, Agencies, Articles, Users) {
		$scope.user = Authentication.user;

		if (!$scope.user) $location.path('/');

		$scope.etemplate = $filter('filter')($scope.user.acceptance, {title: $stateParams.template})[0];
		var templateIndex = $scope.user.acceptance.indexOf($scope.etemplate);
		$scope.needToUpdate = false;

		//Send e-mail based on template
		$scope.sendEmail = function() {
			$scope.error = null;
			$scope.saveTemplate();
			$http.post('/accept', $scope.user.acceptance[templateIndex]).success(function(response) {
				$location.path('/admin/emails/success');
			}).error(function(response) {
				$scope.error = response.data.message;
			});
		};

		//Create new template or save existing template
		$scope.saveTemplate = function() {
			$scope.success = $scope.error = null;
			if(templateIndex > -1) {
				$scope.user.acceptance[templateIndex] = $scope.etemplate;
			}
			else {
				$scope.user.acceptance.push($scope.etemplate);
			}

			var user = new Users($scope.user);
			user.$update(function(response) {
				$scope.user = response;
				$scope.success = true;
				if($location.path() === '/admin/email') {
					$scope.hideSidebar();
				}
			}, function(response) {
				$scope.error = response.data.message;
			});
		};

		//Show current state of template that user wants to edit
		$scope.showSidebar = function(selected) {
			$scope.etemplate = selected;
			templateIndex = $scope.user.acceptance.indexOf($scope.etemplate);
			$scope.needToUpdate = true;
		};

		//Hide sidebar and clear variables
		$scope.hideSidebar = function() {
			$scope.etemplate = null;
			templateIndex = null;
			$scope.needToUpdate = false;
		};

		//Allow user to delete selected partner and all associated recipients
		$scope.deleteAgency = function(selected) {
			var confirmation = prompt('Please type DELETE to remove the ' + selected.title + ' template.');
			if(confirmation === 'DELETE') {
				$scope.user.acceptance.splice($scope.user.acceptance.indexOf(selected), 1);
				var user = new Users($scope.user);
				user.$update(function(response) {
					$scope.user = response;
					$scope.success = true;
				}, function(response) {
					$scope.error = response.data.message;
				});
			}
		};

}]);
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
'use strict';
/* global _: false */

angular.module('letters').controller('myController', ['$scope', '$window', '$modal', '$location', '$filter', '$http', 'Authentication', 'Users', 'Events',
    function($scope, $window, $modal, $location, $filter, $http, Authentication, Users, Events) {
        $scope.user = Authentication.user;
        if (!$scope.user) $location.path('/').replace();

        $scope.startDate = null;
        $scope.endDate = null;

        $scope.calendar = {
            opened: {},
            dateFormat: 'MM/dd/yyyy',
            dateOptions: {
                showWeeks: false
            },
            open: function($event, calID) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.calendar.opened[calID] = true;
            }
        };

        //Helps create a downloadable csv version of the tracking form
        $scope.downloadCSV = function() {
            $scope.error = null;
            $scope.total = null;
            if ($scope.startDate && $scope.endDate) {
                if ($scope.startDate > $scope.endDate) {
                    $scope.error = 'Start date must come before or be equal to end date.';
                } else {
                    var headers = ['track', 'type', 'name', 'age', 'gender', 'gift'];
                    headers.push('flagged');
                    var csvString = headers.join(',') + '\r\n';
                    var Recipients = Events.query({
                        start: $scope.startDate,
                        end: $scope.endDate
                    }, function() {
                        $scope.total = Recipients.length;
                        _.forEach(Recipients, function(letter) {
                            var type = letter.track.charAt(3);
                            letter.type = type === 'C' ? 'child' : (type === 'T' ? 'teen' : 'senior');
                            _.forEach(headers, function(key) {
                                var line = letter[key];
                                if (key === 'gift' && _.indexOf(letter[key], ',')) {
                                    line = '"' + letter[key] + '"';
                                }
                                csvString += line + ',';
                            });
                            csvString += '\r\n';
                        });

                        var date = $filter('date')(new Date(), 'MM-dd');
                        $scope.fileName = ('WishesToSF_' + date + '.csv');
                        var blob = new Blob([csvString], {
                            type: 'text/csv;charset=UTF-8'
                        });
                        $scope.url = $window.URL.createObjectURL(blob);
                    });
                }
            } else {
                $scope.error = 'Please enter a start date and an end date.';
            }

        };

        $scope.reset = function() {
            $http.get('/users/reset').success(function(response) {
                // If successful we assign the response to the global user model
                Authentication.user = response;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);
'use strict';
/* global d3: false */

angular.module('letters').directive('activity', function() {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function(scope, elem) {
            var element = elem[0];
            var margin = {
                    top: 20,
                    right: 30,
                    bottom: 40,
                    left: 40
                },
                width = element.clientWidth - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            scope.$watch('data', function(data) {
                if (data) {
                    var parseDate = d3.time.format('%Y-%m-%d').parse;
                    var formatTime = d3.time.format('%B %e'); // Format tooltip date / time

                    data.forEach(function(d) {
                        d.date = parseDate(d.date);

                    });

                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .ticks(d3.time.week, 1)
                        .tickFormat(d3.time.format('%m/%d'))
                        .orient('bottom');

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .ticks(5)
                        .tickFormat(d3.format('d'))
                        .tickSubdivide(0)
                        .orient('left');

                    var div = d3.select('body')
                        .append('div') // declare the tooltip div 
                        .attr('class', 'timeTooltip') // apply the 'tooltip' class
                        .style('opacity', 0); // set the opacity to nil

                    var line = d3.svg.line()
                        .x(function(d) {
                            return x(d.date);
                        })
                        .y(function(d) {
                            return y(d.count);
                        });

                    x.domain(d3.extent(data, function(d) {
                        return d.date;
                    }));
                    y.domain(d3.extent(data, function(d) {
                        return d.count;
                    }));

                    var chart = d3.select(element).append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    chart.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(xAxis)
                        .selectAll('text')
                        .style('text-anchor', 'end')
                        .attr('dx', '-.8em')
                        .attr('dy', '.15em')
                        .attr('transform', function(d) {
                            return 'rotate(-65)';
                        });

                    chart.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    chart.append('text')
                        .attr('transform', 'rotate(-90)')
                        .attr('y', 0 - margin.left)
                        .attr('x', 0 - (height / 2))
                        .attr('dy', '1em')
                        .style('text-anchor', 'middle')
                        .text('# of Wishes Added');

                    chart.append('path')
                        .datum(data)
                        .attr('class', 'line')
                        .attr('d', line);

                    chart.selectAll('dot')
                        .data(data.filter(function(d) {
                            return d.count > 0;
                        }))
                        .enter().append('circle')
                        .attr('class', 'circle')
                        .attr('r', 3.5)
                        .attr('cx', function(d) {
                            return x(d.date);
                        })
                        .attr('cy', function(d) {
                            return y(d.count);
                        })

                    // Tooltip stuff after this
                    .on('mouseover', function(d) {
                        div.transition()
                            .duration(500)
                            .style('opacity', 0);
                        div.transition()
                            .duration(200)
                            .style('opacity', 0.8);
                        div.html(
                            formatTime(d.date) +
                            '<br/>Wishes Added: ' + d.count)
                            .style('left', (d3.event.pageX) + 'px')
                            .style('top', (d3.event.pageY - 28) + 'px');
                    })

                    .on('mouseout', function(d) {
                        div.transition()
                            .duration(1000)
                            .style('opacity', 0);
                    });
                }
            }, true);
        }
    };
});
'use strict';

//Letters service used for communicating with the agencies REST endpoints
angular.module('letters').factory('Agencies', ['$resource',
    function($resource) {
        return $resource('agency/:agencyId', {
            agencyId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);


// angular.module('2meanApp')
//     .factory('User', function($resource) {
//         return $resource('/api/users/:id/:controller', {
//             id: '@_id'
//         }, {
//             changePassword: {
//                 method: 'PUT',
//                 params: {
//                     controller: 'password'
//                 }
//             },
//             updateProfile: {
//                 method: 'PUT',
//                 params: {
//                     controller: 'profile'
//                 }
//             },
//             get: {
//                 method: 'GET',
//                 params: {
//                     id: 'me'
//                 }
//             }
//         });
//     });
'use strict';
/* global d3: false */

angular.module('letters').directive('donut', ['$location',
    function($location) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            link: function(scope, elem) {
                var element = elem[0];
                var width = element.clientWidth,
                    height = 320,
                    radius = Math.min(width, height) / 2,
                    outerRadius = height / 2 - 20,
                    innerRadius = outerRadius / 2;

                function arcTween(arc, outerRadius, delay) {
                    return function() {
                        d3.select(this)
                            .transition()
                            .delay(delay)
                            .attrTween('d', function(d) {
                                var i = d3.interpolate(d.outerRadius, outerRadius);
                                return function(t) {
                                    d.outerRadius = i(t);
                                    return arc(d);
                                };
                            });
                    };
                }

                scope.$watch('data', function(data) {
                        if (data) {

                            var color = d3.scale.ordinal()
                                .range(['#cd4d52', '#cd884d', '#85c739', '#4d92cd', '#7b39c7']);

                            var pie = d3.layout.pie()
                                .padAngle(0.01)
                                .sort(null)
                                .value(function(d) {
                                    return d.count;
                                });

                            var arc = d3.svg.arc()
                                .padRadius(outerRadius)
                                .innerRadius(innerRadius);

                            var div = d3.select('body')
                                .append('div') // declare the tooltip div 
                                .attr('class', 'donutTooltip') // apply the 'tooltip' class
                                .style('opacity', 0); // set the opacity to nil

                            var svg = d3.select(element).append('svg')
                                .attr('width', width)
                                .attr('height', height);

                            var chart = svg.append('g')
                                .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 - 20) + ')');

                            data.forEach(function(d) {
                                d.count = +d.count;
                            });

                            var g = chart.selectAll('.arc')
                                .data(pie(data))
                                .enter().append('g')
                                .attr('class', 'arc');

                            g.append('path')
                                .each(function(d) {
                                    d.outerRadius = outerRadius - 10;
                                })
                                .attr('d', arc)
                                .style('fill', function(d) {
                                    return color(d.data.status);
                                })
                                .style('cursor', 'pointer')
                                .on('mouseover', function(d) {
                                    d3.select(this)
                                        .transition()
                                        .delay(0)
                                        .attrTween('d', function(d) {
                                            var i = d3.interpolate(d.outerRadius, outerRadius - 2);
                                            return function(t) {
                                                d.outerRadius = i(t);
                                                return arc(d);
                                            };
                                        });
                                    div.transition()
                                        .duration(0)
                                        .style('opacity', 0);
                                    div.transition()
                                        .duration(200)
                                        .style('opacity', 0.8);
                                    div.html(
                                        d.data.name + ': ' + d.data.count)
                                        .style('left', (d3.event.pageX + 14) + 'px')
                                        .style('top', (d3.event.pageY + 14) + 'px');

                                })
                                .on('mousemove', function() {
                                    div
                                        .style('left', (d3.event.pageX + 10) + 'px')
                                        .style('top', (d3.event.pageY + 16) + 'px');
                                })
                                .on('mouseout', function(d) {
                                    d3.select(this)
                                        .transition()
                                        .delay(100)
                                        .attrTween('d', function(d) {
                                            var i = d3.interpolate(d.outerRadius, outerRadius - 10);
                                            return function(t) {
                                                d.outerRadius = i(t);
                                                return arc(d);
                                            };
                                        });
                                    div.transition()
                                        .duration(1000)
                                        .style('opacity', 0);
                                })
                                .on('click', function(d) {
                                    //$location.path('/admin');
                                    window.location.href = '/#!/admin?status=' + d.data.status;
                                });

                            g.append('text')
                                .attr('transform', function(d) {
                                    return 'translate(' + arc.centroid(d) + ')';
                                })
                                .attr('dy', '.35em')
                                .style('text-anchor', 'middle')
                                .text(function(d) {
                                    return d.data.percent;
                                });

                            chart.append('text')
                                .attr('class', 'donutTitle')
                                .style('text-anchor', 'middle')
                                .text('Progress');

                            var legendContainer = svg.append('g')
                                .attr('transform', 'translate(10,' + (height - 30) + ')');

                            var legend = legendContainer.append('g')
                                .attr('class', 'legend');

                            var series = legend.selectAll('.series')
                                .data(pie(data));

                            var seriesEnter = series.enter()
                                .append('g')
                                .attr('class', 'series');

                            seriesEnter.append('circle')
                                .style('fill', function(d, i) {
                                    return color(d.data.status);
                                })
                                .attr('r', 5);

                            seriesEnter.append('text')
                                .style('fill', 'black')
                                .text(function(d) {
                                    return d.data.name;
                                })
                                .attr('text-anchor', 'start')
                                .attr('dy', '.32em')
                                .attr('dx', '8');

                            var ypos = 5,
                                newxpos = 35,
                                maxwidth = 0,
                                xpos;
                            series
                                .attr('transform', function(d, i) {
                                    var length = legendContainer.selectAll('text')[0][i].getComputedTextLength() + 28;
                                    xpos = newxpos;

                                    if (width < xpos + length) {
                                        newxpos = xpos = 35;
                                        ypos += 20;
                                    }

                                    newxpos += length;
                                    if (newxpos > maxwidth) maxwidth = newxpos;

                                    return 'translate(' + xpos + ',' + ypos + ')';
                                });
                        }
                    },
                    true);
            }
        };
    }
]);
'use strict';

//Letters service used for communicating with the letters REST endpoints
angular.module('letters').factory('Events', ['$resource',
    function($resource) {
        return $resource('events/:eventId', {
            eventId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
/* global io */
/* global _: false */
'use strict';

angular.module('letters')
    .factory('socket', ['socketFactory',
        function(socketFactory) {

            // socket.io now auto-configures its connection when we ommit a connection url
            var ioSocket = io('', {
                // Send auth token on connection, you will need to DI the Auth service above
                // 'query': 'token=' + Auth.getToken()
                path: '/socket.io-client'
            });

            var socket = socketFactory({
                ioSocket: ioSocket
            });

            return {
                socket: socket,

                /**
                 * Register listeners to sync an array with updates on a model
                 *
                 * Takes the array we want to sync, the model name that socket updates are sent from,
                 * and an optional callback function after new items are updated.
                 *
                 * @param {String} modelName
                 * @param {Array} array
                 * @param {Function} cb
                 */
                syncUpdates: function(modelName, array, cb) {
                    cb = cb || angular.noop;

                    /**
                     * Syncs item creation/updates on 'model:save'
                     */
                    socket.on(modelName + ':save', function(item) {
                        var oldItem = _.find(array, {
                            _id: item._id
                        });
                        var index = array.indexOf(oldItem);
                        var event = 'created';

                        // replace oldItem if it exists
                        // otherwise just add item to the collection
                        if (oldItem) {
                            array.splice(index, 1, item);
                            event = 'updated';
                        } else {
                            array.push(item);
                        }

                        cb(event, item, array);
                    });

                    /**
                     * Syncs removed items on 'model:remove'
                     */
                    socket.on(modelName + ':remove', function(item) {
                        var event = 'deleted';
                        _.remove(array, {
                            _id: item._id
                        });
                        cb(event, item, array);
                    });
                },

                /**
                 * Removes listeners for a models updates on the socket
                 *
                 * @param modelName
                 */
                unsyncUpdates: function(modelName) {
                    socket.removeAllListeners(modelName + ':save');
                    socket.removeAllListeners(modelName + ':remove');
                }
            };
        }
    ]);
'use strict';
/* global d3: false */

angular.module('letters').directive('donutChart', function() {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function(scope, elem) {
            var element = elem[0];
            var margin = {
                    top: 20,
                    right: 30,
                    bottom: 30,
                    left: 55
                },
                width = element.clientWidth - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            scope.$watch('data', function(data) {
                if (data) {
                    var y = d3.scale.ordinal()
                        .domain(data.map(function(d) {
                            return d.name;
                        }))
                        .rangeRoundBands([height, 0], 0.05);

                    var x = d3.scale.linear()
                        .domain([0, d3.max(data, function(d) {
                            return d.value;
                        })])
                        .range([0, width]);

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left');

                    var chart = d3.select(element).append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    chart.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    chart.selectAll('.bar')
                        .data(data)
                        .enter().append('rect')
                        .attr('class', 'bar')
                        .attr('y', function(d) {
                            return y(d.name);
                        })
                        .attr('width', function(d) {
                            return x(d.value);
                        })
                        .attr('height', y.rangeBand());

                    chart.selectAll('.btext')
                        .data(data)
                        .enter().append('text')
                        .attr('class', 'btext')
                        .attr('x', function(d) {
                            return x(d.value) - 3;
                        })
                        .attr('y', function(d) {
                            return y(d.name) + (y.rangeBand() / 2);
                        })
                        .attr('dy', '.35em')
                        .text(function(d) {
                            return d.value;
                        });
                }
            }, true);
        }
    };
});
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
    function($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        //         $httpProvider.interceptors.push(['$rootScope', '$q', '$cookieStore', '$location',
        //             function($rootScope, $q, $cookieStore, $location) {
        //                 return {
        //                     // Add authorization token to headers
        //                     request: function(config) {
        //                         config.headers = config.headers || {};
        //                         if ($cookieStore.get('token')) {
        //                             config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        //                         }
        //                         return config;
        //                     },

        //                     // Intercept 401s and redirect you to login
        //                     responseError: function(response) {
        //                         if (response.status === 401) {
        //                             $location.path('/login');
        //                             // remove any stale tokens
        //                             $cookieStore.remove('token');
        //                             return $q.reject(response);
        //                         } else {
        //                             return $q.reject(response);
        //                         }
        //                     }
        //                 };
        //             }
        //         ]);
        //     }
        // ]);

        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
            function($q, $location, Authentication) {
                return {
                    responseError: function(rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;

                                // Redirect to signin page
                                $location.path('signin');
                                break;
                            case 403:
                                // Add unauthorized behaviour 
                                break;
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function($stateProvider) {
        // Users state routing
        $stateProvider.
        state('profile', {
            url: '/settings/profile/edit',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
        }).
        state('password', {
            url: '/settings/password',
            templateUrl: 'modules/users/views/settings/change-password.client.view.html'
        }).
        state('signin', {
            url: '/signin',
            templateUrl: 'modules/users/views/authentication/signin.client.view.html'
        }).
        state('forgot', {
            url: '/password/forgot',
            templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
        }).
        state('reset-invalid', {
            url: '/password/reset/invalid',
            templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
        }).
        state('reset-success', {
            url: '/password/reset/success',
            templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
        }).
        state('reset', {
            url: '/password/reset/:token',
            templateUrl: 'modules/users/views/password/reset-password.client.view.html'
        });
    }
]);
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
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
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

        $scope.radioModel = 'users';



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
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

    function() {
        var _this = this;

        _this._data = {
            user: window.user
        };

        return _this._data;

        //     var currentUser = {};
        //     //if ($cookieStore.get('token')) {
        //     currentUser = Users.get();
        //     //}

        //     return {

        //         /**
        //          * Authenticate user and save token
        //          *
        //          * @param  {Object}   user     - login info
        //          * @param  {Function} callback - optional
        //          * @return {Promise}
        //          */
        //         login: function(user, callback) {
        //             console.log(user);
        //             var cb = callback || angular.noop;
        //             var deferred = $q.defer();

        //             $http.post('/auth/signin', user).
        //             success(function(data) {
        //                 console.log(data);
        //                 //$cookieStore.put('token', data.token);
        //                 currentUser = Users.get();
        //                 deferred.resolve(data);
        //                 return cb();
        //             }).
        //             error(function(err) {
        //                 this.logout();
        //                 deferred.reject(err);
        //                 return cb(err);
        //             }.bind(this));

        //             return deferred.promise;
        //         },

        //         /**
        //          * Delete access token and user info
        //          *
        //          * @param  {Function}
        //          */
        //         logout: function() {
        //             //$cookieStore.remove('token');
        //             currentUser = {};
        //         },

        //         /**
        //          * Create a new user
        //          *
        //          * @param  {Object}   user     - user info
        //          * @param  {Function} callback - optional
        //          * @return {Promise}
        //          */
        //         createUser: function(user) {
        //             //                var cb = callback || angular.noop;

        //             return Users.save(user).$promise;
        //         },

        //         /**
        //          * Change password
        //          *
        //          * @param  {String}   oldPassword
        //          * @param  {String}   newPassword
        //          * @param  {Function} callback    - optional
        //          * @return {Promise}
        //          */
        //         changePassword: function(oldPassword, newPassword, callback) {
        //             var cb = callback || angular.noop;

        //             return Users.changePassword({
        //                 id: currentUser._id
        //             }, {
        //                 oldPassword: oldPassword,
        //                 newPassword: newPassword
        //             }, function(user) {
        //                 return cb(user);
        //             }, function(err) {
        //                 return cb(err);
        //             }).$promise;
        //         },

        //         updateProfile: function(user, callback) {
        //             var cb = callback || angular.noop;

        //             return Users.updateProfile({
        //                 id: user._id
        //             }, function(user) {
        //                 return cb(user);
        //             }, function(err) {
        //                 return cb(err);
        //             }).$promise;
        //         },

        //         /**
        //          * Gets all available info on authenticated user
        //          *
        //          * @return {Object} user
        //          */
        //         getCurrentUser: function() {
        //             return currentUser;
        //         },

        //         /**
        //          * Check if a user is logged in
        //          *
        //          * @return {Boolean}
        //          */
        //         isLoggedIn: function() {
        //             return currentUser.hasOwnProperty('role');
        //         },

        //         /**
        //          * Waits for currentUser to resolve before checking if user is logged in
        //          */
        //         isLoggedInAsync: function(cb) {
        //             if (currentUser.hasOwnProperty('$promise')) {
        //                 currentUser.$promise.then(function() {
        //                     cb(true);
        //                 }).catch(function() {
        //                     cb(false);
        //                 });
        //             } else if (currentUser.hasOwnProperty('role')) {
        //                 cb(true);
        //             } else {
        //                 cb(false);
        //             }
        //         },

        //         /**
        //          * Check if a user is an admin
        //          *
        //          * @return {Boolean}
        //          */
        //         isAdmin: function() {
        //             return currentUser.role === 'admin';
        //         },

        //         /**
        //          * Get auth token
        //          */
        //         // getToken: function() {
        //         //     return $cookieStore.get('token');
        //         // }
        //     };
        // }
    }
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
    function($resource) {
        return $resource('users', {}, {
            update: {
                method: 'PUT'
            }
        });
    }
]);