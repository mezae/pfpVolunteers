'use strict';
/* global _: false */

angular.module('letters').controller('EventsController', ['$scope', '$stateParams', '$location', '$filter', '$timeout', 'Authentication', 'Events', 'Agencies', 'Users',
    function($scope, $stateParams, $location, $filter, $timeout, Authentication, Events, Agencies, Users) {
        $scope.user = Authentication.user;

        if (!$scope.user) $location.path('/');

        $scope.adminView = $scope.user.role === 'admin';

        //Helps initialize page by finding the appropriate letters
        $scope.find = function() {
            Agencies.query({}, function(users) {
                $scope.users = _.filter(users, function(u) {
                    return u.name !== '' && u.role !== 'admin';
                });
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
            $scope.currentEvent.volunteers.push($scope.newVol);
            $scope.users = _.filter($scope.users, function(u) {
                return u.name !== $scope.newVol.name;
            });

            Events.update($scope.currentEvent, function(response) {
                $scope.newVol = null;
                $scope.newVolunteer = false;
                $scope.currentEvent = response;

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

        //Allows admin to delete an existing letter and shift everything up
        //Allows user to clear the current slot
        $scope.clearForm = function(selected) {
            if ($scope.adminView) {
                selected.$remove(function(response) {
                    Events.query({
                        username: $stateParams.articleId + $scope.currentTab.title.charAt(0),
                        limit: $scope.recipients.length
                    }, function(letters) {
                        $scope.recipients = letters;
                    });
                }, function(errorResponse) {
                    console.log('Remove Failed');
                });
            } else {
                $scope.current.name = '';
                $scope.current.age = '';
                $scope.current.gender = '';
                $scope.current.gift = '';
                $scope.current.$update();
            }
        };

        //Helps to show user appropriate age range of each recipient type
        function updateForm(form) {
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
            $scope.current = $scope.recipients[currentIndex];
            if (currentIndex % 10 === 9) {
                $location.hash(currentIndex + 1);
                $anchorScroll();
            }

            var limit = 50;
            if (currentIndex % limit === limit - 15 && $scope.recipients.length < $scope.currentTab.content) {
                $scope.loadMore(currentIndex + 15);
            }
        }

        //Allow user to see/edit the next record if current letter is valid
        $scope.goToNext = function(form) {
            if (isValidLetter(form)) {
                if (currentIndex < $scope.recipients.length - 1) {
                    currentIndex++;
                    updateForm(form);
                } else {
                    $scope.alert = {
                        active: true,
                        type: 'info',
                        msg: 'You just entered the last letter on this page.'
                    };
                }
            }
        };

        //Allow user to see the record they selected if current letter is valid
        $scope.goToSelected = function(selected, form) {
            if (isValidLetter(form) && !form.$invalid) {
                currentIndex = selected;
                updateForm(form);
            }
        };

        //Make form more user-friendly, make required fields glow
        $scope.isUsed = function(form) {
            if ($scope.current.name) {
                $scope.blankName = false;
                form.age.$setTouched();
                form.gender.$setTouched();
                form.gift.$setTouched();
            } else {
                form.$setUntouched();
            }
        };


        //Helps update/add recipient record
        function addRecipient(form) {
            $scope.current.name = cleanText($scope.current.name, 1).trim();
            $scope.current.gender = $scope.current.gender.toUpperCase();
            $scope.current.gift = cleanText($scope.current.gift, 2);

            //update Agency status
            if ($scope.currentAgency.status === 0) {
                $scope.currentAgency.status = 1;
                var user = new Users($scope.currentAgency);
                user.$update(function(response) {
                    $scope.currentAgency = response;
                });
            }

            $scope.current.$update();
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
    }
]);