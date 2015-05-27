var app = angular.module('joggingApp', []);

app.controller('mainCtrl', function ($scope, $http) {
    console.log("mainCtrl");

    $scope.name = "Test user";

    $scope.entries = [
        {date: Date.now(), distance: 10.2, time: 20.3},
        {date: new Date(1995, 11, 17), distance: 7.2, time: 2.3}
    ];
});
