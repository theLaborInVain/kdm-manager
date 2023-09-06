app.controller("dashboardController", function($scope, $rootScope, $http) {

    $scope.scratch = {};

    $scope.initializeDashboard = function(user_oid) {
        // this places an object called 'dashboard' in the main namespace;
        // this was formerly user.dashboard in the v3 app and works nearly
        // identically!

		$scope.dashboard = {
            requestedOids: [],  // a list of OIDs we've requested
            retrievedOids: [],  // a list of OIDs we've gotten back
            settlements: {},  // a dict of JSON objects; keys are OIDs
        };

        var reqUrl = $rootScope.APIURL + 'user/dashboard/' + user_oid;
        console.time(reqUrl);

        $http.get(reqUrl, $rootScope.CONFIG).then(
            function successCallback(response) {
                $scope.dashboard.user = response.data.dashboard;
                $scope.addSettlementsToDashboard();	// now that we have the list
                console.timeEnd(reqUrl);
            }, function errorCallback(response) {
                console.error('Could not retrieve dashboard for ' + user_oid);
                console.timeEnd(reqUrl);
            }
        );

    }

    $scope.addSettlementsToDashboard = function() {
        // requires $scope.dashboard; uses it to retrieve settlement data from
        // the API to insert into the $scope.dashboard.campaigns, etc. lists
        // this spins off multiple calls to the getSettlementSummary() method

        if ($scope.dashboard === undefined) {
            throw "$scope.dashboard is undefined!";
            return false;
        };

        $scope.dashboard.settlementsRetrieved = 0;
        $scope.dashboard.settlementsRequired = (
            $scope.dashboard.user.campaigns.length + 
            $scope.dashboard.user.settlements.length
        );

		// now, for 'campaigns' and 'settlements' under $scope.dashboard.user,
		// iterate through them and spin off a bunch of retrievals
		var listOfAttribs = ['campaigns', 'settlements']
		for (var i = 0; i < listOfAttribs.length; i++) {
			var attrib = listOfAttribs[i];
			$scope.dashboard[attrib] = [];
			for (var j = 0; j < $scope.dashboard.user[attrib].length; j++) {
				var settlement = $scope.dashboard.user[attrib][j];
				$scope.getSettlementSummary(
					settlement,					// object/dict
					$scope.dashboard[attrib],	// $scope.dashboard.campaigns
				);
			};
		}

		// finally, handling for users who have zero of their own settlements
        if ($scope.dashboard.user.settlements.length === 0) {
//	        $scope.rollUp('campaignsDiv');   // this will hide it, because it's visible on-load
            $scope.rollUp('settlementsDiv');
        };

    };

    $scope.getSettlementSummary = function(s_dict, dest_list) {
        // pass in a settlement dictionary as 's_dict'; we retrieve it from the
        // API and append it to 'dest_list', which has to exist before we start

        var s_id = s_dict._id.$oid;

        // track the ones we've requested and skip if we've already got a
        // pending request
        if ($scope.dashboard.requestedOids.indexOf(s_id) !== -1) {
            $scope.dashboard.settlementsRequired -= 1;
            return true;
        };
        $scope.dashboard.requestedOids.push(s_id)

		var reqUrl = $rootScope.APIURL + 'settlement/get_summary/' + s_id;
		console.time(reqUrl);
		$http.get(reqUrl, $rootScope.CONFIG).then(
            function successCallback(response) {
                $scope.dashboard.settlements[s_id] = response.data;
                $scope.dashboard.retrievedOids.push(s_id);
                $scope.dashboard.settlementsRetrieved += 1;
                console.timeEnd(reqUrl);
            }, function errorCallback(response) {
                console.error('Could not get settlement summary! ' + s_id);
                console.error(response);
                $scope.dashboard.settlements[s_id] = {error: response.data};
                $scope.dashboard.settlementsRetrieved += 1;
                console.timeEnd(reqUrl);
            }
        );

    };


    //
    //  system panel
    //

    $scope.updatePassword = function() {
		// updates a user's password and logs them out;
        if ($scope.scratch.password === $scope.scratch.password_again) {
            $rootScope.updateCurrentUser(
                'update_password',
                {'password': $scope.scratch.password},
            );
            $scope.scratch.saved_password = true;
            $scope.scratch.password = undefined;
            $scope.scratch.password_again = undefined;
            $scope.flashCapsuleAlert('Exit', true);
            $scope.loadURL('/logout');
        } else {
            console.error('pw match fail');
        };

    };


    //
    //  world
    //
    $scope.setWorld = function(force) {
        // sets $rootScope.world from the API

		$scope.world = undefined;

        var reqUrl = $rootScope.APIURL + 'world';
        console.time(reqUrl);

        $http.get(reqUrl).then(
            function successCallback(response) {
                $scope.world = response.data.world;
                console.timeEnd(reqUrl);
            },
            function errorCallback(response) {
                console.error("Could not retrieve world info!");
                console.error(response);
                console.timeEnd(reqUrl);
            }
        );
	};

    //
    //  alerts / notifications
    //

    $scope.setNotifications = function() {
        // uses the $rootScope.currentUser and main module methods to determine
        // the contents of $scope.scratch.activeNotifications

        $scope.scratch.activeNotifications = [];

        $rootScope.setApiAlerts().then(
            function successCallback(response) {
                var apiAlerts = response.data;

                for (var i = 0; i < apiAlerts.length; i++) {
                    var apiAlert = apiAlerts[i];
                    if (!$rootScope.currentUser.notifications[apiAlert._id.$oid]) {
                        $scope.scratch.activeNotifications.push(apiAlert);
                    };
                };

            }, function errorCallback(response) {
                console.error('Could not set user notifications!');
            }
        );
        
    };

    $scope.clearActiveNotifications = function() {
        // marks all notifications in the $scope.scratch.activeNotifications
        //  as dismissed; updates the user in the API

        var notificationIdList = [];
        for (var i = 0; i < $scope.scratch.activeNotifications.length; i++) {
            var notification = $scope.scratch.activeNotifications[i];
            notification.checked = true;
            notificationIdList.push(notification._id.$oid);
        };

        $rootScope.updateCurrentUser(
            'set_notifications',
            {'notifications': notificationIdList}
        ).then(
            function successCallback(response){
                $scope.setNotifications();
            }, function errorCallback(response) {
                console.error('Failed to update user; cannot clear notifications!');
            }
        );
    };

});
