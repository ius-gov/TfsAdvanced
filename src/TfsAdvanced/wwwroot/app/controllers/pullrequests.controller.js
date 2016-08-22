﻿angular.module('TFS.Advanced')
    .controller('PullRequestsController',
    [
        '$scope', '$q', '$interval', '$notification', '$filter', 'pullrequestsService', 'ProjectService',
        function ($scope, $q, $interval, $notification, $filter, pullrequestsService, ProjectService) {
            'use strict';

            $scope.SelectedProject = "-1";
            $scope.pullRequests = [];
            $scope.RawPullRequests = [];
            $scope.IsLoading = true;

            
            $scope.load = function () {
                pullrequestsService.get()
                    .then(function (data) {
                        $scope.RawPullRequests = data;
                        filterPullRequests(data)
                        $scope.IsLoading = false;
                    });
            };


            $scope.load();

            ProjectService.GET.success(function (data) {
                $scope.projects = [{"id": "-1", "name": "Any"}].concat(data);
                console.log(data);
            });

            function filterPullRequests(data)
            {
                console.log("Filter");
                var prs = $filter('orderBy')(data, "creationDate");
                $scope.pullRequests = $filter('filter')(prs, function (record) {
                    console.log("Filtering Record:", record.repository.project.id, " to ", $scope.SelectedProject);
                    return $scope.SelectedProject === "-1" || $scope.SelectedProject == record.repository.project.id;
                });
            }
            


            $interval($scope.load, 1000);

            $scope.UpdateSelectedProject = function () {
                filterPullRequests($scope.RawPullRequests);
            };

        }
    ]);