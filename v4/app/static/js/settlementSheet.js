"use strict";

app.controller("settlementSheetController", function($scope, $rootScope, $http) {

    //
    //  Settlement Sheet tab
    //

    $scope.setInnovationDeck = function() {
        // POSTs a request to get the innovation deck to the API

        $scope.innovationDeck = undefined;

        var promise = $scope.postJSONtoAPI(
            'settlement','get_innovation_deck', $scope.settlement.sheet._id.$oid,
            {return_type: 'dict'}, false, false, false
        );

        promise.then(
            function(payload) {
                $scope.innovationDeck = payload.data;
                console.log('Innovation deck refreshed successfully!');
            },
            function(errorPayload) {
                console.log("Could not retrieve innovation deck from API!" + errorPayload);
            }
        );
    };


    //
    //  storage applet / tab
    //

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
                    $scope.refreshRollups();
                    console.timeEnd(reqUrl);
                },
                function(errorPayload) {
                    console.error("Could not retrieve settlement storage from API!" + errorPayload);
                    console.timeEnd(reqUrl);
                }
            );
        };
    };

    $scope.refreshRollups = function(storage_repr) {
        // gets the rollups from the API; injects them
        var reqUrl = $rootScope.APIURL + 'settlement/get_storage_rollups/' + $scope.settlement.sheet._id.$oid;
        console.time(reqUrl);

        var promise = $http.get(reqUrl, $rootScope.CONFIG);
        promise.then(
            function(payload) {
                for (var i = 0; i < $scope.settlementStorage.length; i++) {
                    var storage_repr = $scope.settlementStorage[i];
                    var update_dict = payload.data[storage_repr.storage_type];
                    for (const key in update_dict) {
                        let value = update_dict[key];
                        if (update_dict.hasOwnProperty(key)) {
                            storage_repr[key] = update_dict[key];
                        };
                    };
                };
                console.timeEnd(reqUrl);
            },
                function(errorPayload) {
                console.error("Failed to reload storage rollups! " + errorPayload);
                console.timeEnd(reqUrl);
            }
        );

    }


    //
    //  Event Log tab
    //

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
