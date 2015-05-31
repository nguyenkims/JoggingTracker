var app = angular.module('joggingApp', ['ngRoute', 'ui.bootstrap', 'ngStorage']);

debug = true;

var cl = function (msg) {
    if (debug)
        console.log(msg);
};

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
    $scope.token = $localStorage.token;
    $scope.username = $localStorage.username;

    if ($scope.token === undefined || $scope.username === undefined) {
        $location.path('/login');
        return;
    }

    // todo: check the validity of token

    $scope.entries = [];
    $scope.startDate = null;
    $scope.endDate = null;

    var h = window.btoa($scope.token + ':' + 'uselesspassword');
    $http.defaults.headers.common['Authorization'] = 'Basic ' + h;

    initEntries();

    function initEntries() {
        cl("init entries");
        $("body").addClass("loading");
        $http.get("/entry/all").
            success(function (data, status, headers) {
                $("body").removeClass("loading");
                cl(data.data);
                $scope.entries = data.data;
            }).
            error(function (data, status, headers) {
                $("body").removeClass("loading");
                alert("Getting all entries fails with this error:" + data.error);
            });
    }

    $scope.addEntry = function () {
        var entry = {
            date: $scope.date,
            distance: $scope.distance,
            time: $scope.time
        };

        $("body").addClass("loading");
        $http.post("/entry/create",
            {date: entry.date.getTime(), distance: entry.distance, time: entry.time}).
            success(function (data, status, headers) {
                entry.id = data.id;
                $scope.entries.push(entry);
                $("body").removeClass("loading");
            }).
            error(function (data, status, headers) {
                alert("Adding entry fails with this error:" + data.error);
                cl('error.' + data);
                $("body").removeClass("loading");
            });

    };

    $scope.deleteEntry = function (entry) {
        $("body").addClass("loading");
        $http.post("/entry/delete", {id: entry.id}).
            success(function (data, status, headers) {
                // remove from local entries
                for (var i = 0; i < $scope.entries.length; i++) {
                    if ($scope.entries[i].id === entry.id) {
                        $scope.entries.splice(i, 1);
                    }
                }
                $("body").removeClass("loading");
            }).
            error(function (data, status, headers) {
                alert("Deleting entry fails with this error:" + data.error);
                cl('error.' + data);
                $("body").removeClass("loading");
            });
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


    $scope.clearDate = function () {
        $scope.startDate = null;
        $scope.endDate = null;
    };

    $scope.getDates = function () {
        startDate = $scope.startDate;
        endDate = $scope.endDate;

        var res = [];

        for (i = 0; i < $scope.entries.length; i++) {
            d = $scope.entries[i].date;
            startOk = (startDate != null && startDate < d) || (startDate == null);
            endOk = (endDate != null && endDate > d) || (endDate == null);

            if (startOk && endOk)
                res.push($scope.entries[i]);
            else
                cl("do not push:" + d);
        }

        return res;
    }

});

app.controller('loginCtrl', function ($scope, $http, $location, $localStorage) {
    cl("loginCtrl");

    $scope.error_message = "";

    $scope.goToRegister = function () {
        $location.path('/register');
    };

    $scope.login = function () {
        cl("log user:" + $scope.username);
        $http.post("/user/token", {username: $scope.username, password: $scope.password}).
            success(function (data, status, headers) {
                cl(data.token);
                $localStorage.token = data.token;
                $localStorage.username = data.username;

                // go to main page
                $location.path('/main');
            }).
            error(function (data, status, headers) {
                $scope.error_message = data.error;
            });
    }
});

app.controller('registerCtrl', function ($scope, $http, $location, $localStorage) {
    $scope.error_message = "";

    $scope.goToLogin = function () {
        $location.path('/login');
    };

    $scope.register = function () {
        cl("register user:" + $scope.username);
        $http.post("/user/create", {username: $scope.username, password: $scope.password}).
            success(function (data, status, headers) {
                cl(data.token);
                $localStorage.token = data.token;
                $localStorage.username = data.username;

                // go to main page
                $location.path('/main');
            }).
            error(function (data, status, headers) {
                $scope.error_message = data.error;
            });
    }
});
