'use strict';
/* global _: false */

angular.module('letters').controller('CommandCenterController', ['$scope', '$window', '$state', '$http', '$location', '$filter', 'Authentication', 'Agencies', 'Events', 'Users', 'socket',
    function($scope, $window, $state, $http, $location, $filter, Authentication, Agencies, Events, Users, socket) {
        $scope.user = Authentication.user;
        if (!$scope.user) $location.path('/').replace();
        if ($location.search()) $scope.query = $location.search();

        $scope.needToUpdate = false; //helps hide sidebar when it's not needed
        $scope.alert = {
            active: false,
            type: '',
            msg: ''
        };

        $scope.viewUsers = function() {
            $scope.radioModel = 'users';
            $state.go('command', {}, {
                notify: false
            });
        };

        $scope.viewEvents = function() {
            $scope.radioModel = 'events';
            $state.go('cc-events', {}, {
                notify: false
            });
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
            $scope.radioModel = 'users';
            Agencies.query({}, function(users) {
                $scope.partners = users;
                socket.syncUpdates('users', $scope.partners);
            });

            Events.query({}, function(events) {
                $scope.events = events;
                socket.syncUpdates('events', $scope.events);
            });

            if ($state.current.url === '/admin/events') $scope.viewEvents();
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
                    var required_fields = ['First Name', 'Last Name', 'Gender', 'Cont.', 'Email', 'Email2', 'Emergency Contact', 'Emergency Contact Phone', 'Emergency Phone 2', 'Translating', 'Notes', 'Total hours'];
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
                        var gender_col = headers.indexOf('Gender');
                        var cont_col = headers.indexOf('Cont.');
                        var email_col = headers.indexOf('Email');
                        var email2_col = headers.indexOf('Email2');
                        var emcontact_col = headers.indexOf('Emergency Contact');
                        var emphone_col = headers.indexOf('Emergency Contact Phone');
                        var emphone2_col = headers.indexOf('Emergency Phone 2');
                        var trans_col = headers.indexOf('Translating');
                        var notes_col = headers.indexOf('Notes');
                        var hours_col = headers.indexOf('Total hours');

                        var allUsers = _.map($scope.partners, function(users) {
                            return (users.first_name.trim() + ' ' + users.last_name.trim()).trim();
                        });

                        _.forEach(rows, function(row) {
                            var record = row.split(',');
                            if (!_.includes(allUsers, (record[fname_col].trim() + ' ' + record[lname_col].trim()).trim())) {
                                var newPartner = {
                                    username: record[email_col].trim(),
                                    first_name: record[fname_col].trim(),
                                    last_name: record[lname_col].trim(),
                                    gender: record[gender_col],
                                    contingent: record[cont_col],
                                    email: record[email_col].trim(),
                                    email2: record[email2_col].trim(),
                                    emergency_contact: record[emcontact_col].trim(),
                                    emergency_phone: record[emphone_col].trim(),
                                    emergency_phone2: record[emphone2_col].trim(),
                                    translating: record[trans_col].trim(),
                                    notes: record[notes_col].trim(),
                                    hours: parseFloat(record[hours_col], 10),
                                    submitted: true
                                };
                                signup(newPartner);
                                allUsers.push(newPartner.first_name + ' ' + newPartner.last_name);
                            } else {
                                var updated_partner = _.filter($scope.partners, function(user) {
                                    return (user.first_name.trim() + ' ' + user.last_name.trim()).trim() === (record[fname_col].trim() + ' ' + record[lname_col].trim()).trim();
                                })[0];
                                updated_partner.hours += parseFloat(record[hours_col], 10);
                                Agencies.update(updated_partner);
                            }
                        });
                        $scope.alert = {
                            active: true,
                            type: 'success',
                            msg: 'Your csv file was uploaded successfully.'
                        };
                    }
                } else {

                    var required_fields = ['First Name', 'Last Name', 'Total hours'];
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
                        var hours_col = headers.indexOf('Total hours');

                        for (var i = 0; i < rows.length; i++) {
                            rows[i] = rows[i].split(',');
                        }

                        var first_event = hours_col + 1;
                        var last_event = headers.length - 1;
                        for (var e = first_event; e <= last_event; e++) {
                            $scope.event = {
                                date: headers[e],
                                volunteers: []
                            };
                            for (var user = 0; user < rows.length; user++) {
                                var yourHours = parseFloat(rows[user][e], 10);
                                if (yourHours > 0) {
                                    $scope.event.volunteers.push({
                                        name: (rows[user][fname_col].trim() + ' ' + rows[user][lname_col].trim()).trim(),
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
            socket.unsyncUpdates('events');
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

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.dateOptions = {
            showWeeks: false
        };

    }
]);