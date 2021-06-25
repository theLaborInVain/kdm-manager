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

}); // settlementSheetController ends
