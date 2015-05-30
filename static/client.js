var app = angular.module('joggingApp', ['ui.bootstrap']);

app.controller('mainCtrl', function ($scope, $http) {
    console.log("mainCtrl");

    $scope.name = "Test user";

    $scope.entries = [
        {date: Date.now(), distance: 10.2, time: 20.3},
        {date: new Date(1995, 11, 17), distance: 7.2, time: 2.3}
    ];

    $scope.startDate = null;
    $scope.endDate = null;

    $scope.clearDate = function(){
        $scope.startDate = null;
        $scope.endDate = null;
    };

    $scope.getDates = function(){
        startDate = $scope.startDate;
        endDate = $scope.endDate;

        console.log("startDate:" + startDate);
        res = [];

        for (i =0; i < $scope.entries.length; i++){
            d = $scope.entries[i].date;
            startOk = (startDate != null && startDate < d) || (startDate == null);
            endOk = (endDate != null && endDate > d) || (endDate == null);

            if (startOk && endOk)
                res.push($scope.entries[i]);
            else
                console.log("do not push:" + d);
        }

        return res;
    }

});
