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
            when('/register', {
                templateUrl: 'register.html',
                controller: 'registerCtrl'
            }).
            otherwise({
                redirectTo: '/main'
            });
    }]);

app.controller('mainCtrl', function ($scope, $http, $localStorage, $location) {
    console.log("mainCtrl");

    $scope.token = $localStorage.token;
    $scope.username = $localStorage.username;

    console.log("token from root=" + $scope.token);

    var h = window.btoa($scope.token + ':' + 'uselesspassword');
    $http.defaults.headers.common['Authorization'] = 'Basic ' + h;

    $scope.name = "Test user";

    $scope.entries = [
        {id: 1, date: new Date(), distance: 10.2, time: 20.3},
        {id: 2, date: new Date(1995, 11, 17), distance: 7.2, time: 2.3}
    ];

    $scope.addEntry = function () {
        var entry = {
            date: $scope.date,
            distance: $scope.distance,
            time: $scope.time
        };

        $http.post("/entry/create",
            {date: entry.date.getTime(), distance: entry.distance, time: entry.time}).
            success(function (data, status, headers) {
                entry.id = data.id;
                $scope.entries.push(entry);
            }).
            error(function (data, status, headers) {
                console.log('error.' + data);
            });
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

    $scope.logout = function () {
        delete $localStorage.token;
        delete $localStorage.username;
        $location.path('/login');
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

    $scope.goToRegister = function () {
        $location.path('/register');
    };

    $scope.login = function () {
        console.log("log user:" + $scope.username);
        $http.post("/user/token", {username: $scope.username, password: $scope.password}).
            success(function (data, status, headers) {
                console.log(data.token);
                $localStorage.token = data.token;
                $localStorage.username = data.username;

                $rootScope.token = data.token;
                $rootScope.username = data.username;
                // go to main page
                $location.path('/main');
            }).
            error(function (data, status, headers) {
                $scope.error_message = data.error;
            });
    }
});

app.controller('registerCtrl', function ($scope, $http, $location, $rootScope, $localStorage) {
    $scope.error_message = "";

    $scope.goToLogin = function () {
        $location.path('/login');
    };

    $scope.register = function () {
        console.log("register user:" + $scope.username);
        $http.post("/user/create", {username: $scope.username, password: $scope.password}).
            success(function (data, status, headers) {
                console.log(data.token);
                $localStorage.token = data.token;
                $localStorage.username = data.username;

                $rootScope.token = data.token;
                $rootScope.username = data.username;
                // go to main page
                $location.path('/main');
            }).
            error(function (data, status, headers) {
                $scope.error_message = data.error;
            });
    }
});
