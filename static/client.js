var app = angular.module('joggingApp', ['ngRoute', 'ui.bootstrap', 'ngStorage']);

debug = true;

// console.log
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

    const dayMilli = 86400000; // number of milliseconds per day

    $scope.entries = [];
    $scope.startDate = null;
    $scope.endDate = null;
    $scope.format = 'yyyy-MM-dd';
    $scope.stats = [];

    var h = window.btoa($scope.token + ':' + 'uselesspassword');
    $http.defaults.headers.common['Authorization'] = 'Basic ' + h;

    initEntries();

    $scope.openStartDate = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.startDateOpened = true;
    };

    $scope.openEndDate = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.endDateOpened = true;
    };

    function initEntries() {
        cl("init entries");
        $("body").addClass("loading");
        $http.get("/entry/all").
            success(function (data) {
                $("body").removeClass("loading");
                cl(data.data);
                $scope.entries = data.data;
                $scope.computeStats();
            }).
            error(function (data) {
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
                $scope.computeStats();
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
                $scope.computeStats();
                $("body").removeClass("loading");
            }).
            error(function (data, status, headers) {
                alert("Deleting entry fails with this error:" + data.error);
                cl('error.' + data);
                $("body").removeClass("loading");
            });
    };

    var oldEntryTime = null;

    $scope.makeEntryEditable = function (entry) {
        if (entry.writable === undefined || !entry.writable) {
            entry.writable = true;
            entry.editModeText = "Update";
            oldEntryTime = entry.time;
        } else {
            entry.writable = false;
            entry.editModeText = "Edit";

            // update the entry in server
            $http.post("/entry/changetime", {id: entry.id, time: entry.time}).
                success(function (data, status, headers) {
                    $("body").removeClass("loading");
                    $scope.computeStats();
                }).
                error(function (data, status, headers) {
                    alert("updating error :(. Please check your Internet connection. Use old value instead");
                    entry.time = oldEntryTime;
                    oldEntryTime = null;
                    cl('error.' + data);
                    $("body").removeClass("loading");
                });
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
            var d = $scope.entries[i].date;
            var startOk = (startDate != null && startDate < d) || (startDate == null);
            var endOk = (endDate != null && endDate > d) || (endDate == null);

            if (startOk && endOk)
                res.push($scope.entries[i]);
            else
                cl("do not push:" + d);
        }

        res = res.sort(function (i1, i2) {
            return i1.date > i2.date ? 1 : -1;
        });

        return res;
    };

    // return the week index starting from 1/1/1970
    function getWeekIndex(date) {
        var firstSunday = new Date(3 * dayMilli); // 1/1/1970 is thursday
        if (date >= firstSunday)
            return Math.floor((date - firstSunday) / (7 * dayMilli)) + 1;
        else
            return 0;
    }

    // return the Sunday corresponding to the week index. Special case:
    // for the first week, return 1/1/1970 even if it is not a Sunday
    function getFirstDay(weekIndex) {
        if (weekIndex == 0)
            return new Date(0); // return 1/1/1970 even if it is not Sunday
        else
            return new Date(3 * dayMilli + (weekIndex - 1) * 7 * dayMilli);
    }

    // return the Saturday corresponding to the week index
    function getLastDay(weekIndex) {
        if (weekIndex == 0)
            return new Date(2 * dayMilli); // return 3/1/1970 (saturday)
        else
            return new Date(3 * dayMilli + (weekIndex - 1) * 7 * dayMilli + 6 * dayMilli);
    }

    // return the week statistics
    $scope.computeStats = function () {
        var dict = {}; // (week_index, [entry])
        var res = [];
        for (var i = 0; i < $scope.entries.length; i++) {
            cl("handle:" + $scope.entries[i]);
            var weekIndex = getWeekIndex($scope.entries[i].date);
            if (!(weekIndex in dict)) {
                dict[weekIndex] = [];
            }
            dict[weekIndex].push($scope.entries[i]);
        }

        for (var weekIndex in dict) {
            var totalDistance = 0, totalTime = 0, nbEntries = 0;
            for (var i = 0; i < dict[weekIndex].length; i++) {
                totalDistance += dict[weekIndex][i].distance;
                totalTime += dict[weekIndex][i].time;
                nbEntries += 1;
            }

            // calculate this week statistics
            var stat = {
                startDate: getFirstDay(weekIndex),
                endDate: getLastDay(weekIndex),
                averageSpeed: totalDistance / totalTime,
                averageDistance: totalDistance / nbEntries
            };
            res.push(stat);
        }
        $scope.stats = res;
    };
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
