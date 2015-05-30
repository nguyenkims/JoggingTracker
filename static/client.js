var app = angular.module('joggingApp', ['ngRoute', 'ui.bootstrap', 'ngStorage']);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/main', {
                templateUrl: 'main.html',
                controller: 'mainCtrl'
            }).
            when('/login', {
                templateUrl: 'login.html',
                controller: 'loginCtrl'
            }).
            otherwise({
                redirectTo: '/main'
            });
    }]);

app.controller('mainCtrl', function ($scope, $http) {
    console.log("mainCtrl");
    console.log("token from root=" + $scope.token);

    $scope.name = "Test user";

    $scope.entries = [
        {id: 1, date: new Date(), distance: 10.2, time: 20.3},
        {id: 2, date: new Date(1995, 11, 17), distance: 7.2, time: 2.3}
    ];

    $scope.addEntry = function () {
        entry = {
            date: $scope.date,
            distance: $scope.distance,
            time: $scope.time
        };
        $scope.entries.push(entry);
    };

    $scope.deleteEntry = function (entry) {
        for (var i = 0; i < $scope.entries.length; i++) {
            if ($scope.entries[i].id === entry.id)
                $scope.entries.splice(i, 1);
        }
    };

    $scope.makeEntryEditable = function (entry) {
        if (entry.writable === undefined || !entry.writable) {
            entry.writable = true;
            entry.editModeText = "Update";
        } else {
            entry.writable = false;
            entry.editModeText = "Edit";
        }
    };

    $scope.startDate = null;
    $scope.endDate = null;

    $scope.clearDate = function () {
        $scope.startDate = null;
        $scope.endDate = null;
    };

    $scope.getDates = function () {
        startDate = $scope.startDate;
        endDate = $scope.endDate;

        console.log("startDate:" + startDate);
        res = [];

        for (i = 0; i < $scope.entries.length; i++) {
            d = $scope.entries[i].date;
            startOk = (startDate != null && startDate < d) || (startDate == null);
            endOk = (endDate != null && endDate > d) || (endDate == null);

            if (startOk && endOk)
                res.push($scope.entries[i]);
            else
                console.log("do not push:" + d);
        }

        return res;
    }

});

app.controller('loginCtrl', function ($scope, $http, $location, $rootScope, $localStorage) {
    console.log("loginCtrl");

    $scope.error_message = "";

    $scope.login = function () {
        console.log("log user:" + $scope.username + ";pass:" + $scope.password);
        $http.post("/user/token", {username: $scope.username, password: $scope.password}).
            success(function (data, status, headers) {
                console.log(data.token);
                $localStorage.token = data.token;
                $rootScope.token = data.token;
                // go to main page
                $location.path('/main');
            }).
            error(function (data, status, headers) {
                $scope.error_message = data.error;
            });
    }
});
