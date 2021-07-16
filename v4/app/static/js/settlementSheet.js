"use strict";

app.controller("settlementSheetController", function($scope, $rootScope, $http) {


    $scope.loadSettlementEventLogLy = function(ly, destinationObj) {
        // sets $scope.settlementEventLog; don't call this on settlement init:
        // it's a bit of a fatty, in terms of API response

        var reqUrl = $rootScope.APIURL + 'settlement/get_event_log' + '/' + $scope.settlement.sheet._id.$oid;
        console.time(reqUrl);

        var promise = $http.post(reqUrl, {'ly': ly}, $rootScope.CONFIG);

        promise.then(
            function successCallback(response) {
                console.timeEnd(reqUrl);
                destinationObj[ly] = response.data;
            },
            function errorCallback(response) {
                console.error('Unable to retrieve settlement event log!');
                console.error(response);
                console.timeEnd(reqUrl);
            }
        );

    };

    $scope.loadStorage = function(reload) {
        // load settlement storage!

        // remove and reload if if requested
        if (reload === true) {
            $scope.settlementStorage = undefined;
        };

        // load it here

        if ($scope.settlementStorage === undefined) {
            var reqUrl = $rootScope.APIURL + 'settlement/get_storage/' + $scope.settlement.sheet._id.$oid;
            console.time(reqUrl);

            var promise = $http.get(reqUrl, $rootScope.CONFIG);
            promise.then(
                function(payload) {
                    $scope.settlementStorage = payload.data;
                   // $scope.refreshRollups();
                },
                function(errorPayload) {
                    console.error("Could not retrieve settlement storage from API!" + errorPayload);
                }
            );
        };
    };

}); // settlementSheetController ends
