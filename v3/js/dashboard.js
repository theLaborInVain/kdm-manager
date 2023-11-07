app.controller("dashboardController", function($scope, $http) {
    // as usual, only initialize it if we need it
    if ($scope.scratch === undefined) {
        $scope.scratch = {};
    };

    //
    // API notifications; get
    //

    // getNotifications
    $scope.getNotifications = function() {
        // sets the API's notifications to $scope.scratch.notifications
        var reqEndpoint = 'get/notifications';
        var notificationPromise = $http.get($scope.api_url + reqEndpoint);
        console.time(reqEndpoint);
        notificationPromise.then(
            function(payload) {
                $scope.scratch.notifications = payload.data;
                console.timeEnd(reqEndpoint);
            },
            function(payload) {
                console.error("[NOTIFICATIONS] API notifications could not be loaded!");
                console.error(payload);
                console.timeEnd(reqEndpoint);
            }
        );
    }

    // parseNotifications; sets some variables in scratch for UI/UX stuff
    $scope.parseNotifications = function() {
        $scope.scratch.kpi_notifications = 0;
        var notifications = $scope.scratch.notifications;
        for (var i = 0; i < notifications.length; i++) {
            var note = notifications[i];
            if (note.sub_type === 'kpi') {
                $scope.scratch.kpi_notifications++;
            }
        }
    }

    // load expansion data
    $scope.loadExpansionAssets = function() {
        // injects the JSON from the API's expansions collection at
        // $scope.expansions; this is repladced by the /kingdom_death endpoint
        // in v4 and SHOULD NOT be ported
        var reqEndpoint = 'game_asset/expansions';
        console.time(reqEndpoint);
        $scope.userPromise.then(
            function(payload){
                var expansion_promise = $http.get($scope.api_url + reqEndpoint);
                expansion_promise.then(
                    function(payload) {
                        $scope.expansions = payload.data;
                        console.timeEnd(reqEndpoint);
                    },
                    function(payload) {
                        console.error("Expansions info could not be retrieved!")
                        console.timeEnd(reqEndpoint);
                    }
                );
            }
        );
    };

    $scope.toggleUserExpansion = function(handle){
        handle_index = $scope.user.user.collection.expansions.indexOf(handle);
        if (handle_index == -1) {
            var action = "add"
        } else {
            var action = "remove"
        };

        if (action == "add") {
            $scope.user.user.collection.expansions.push(handle);
            $scope.postJSONtoAPI('user', 'add_expansion_to_collection', {handle: handle}, false);
        } else {
            $scope.user.user.collection.expansions.splice(handle_index, 1);
            $scope.postJSONtoAPI('user', 'rm_expansion_from_collection', {handle: handle}, false);
        };
    };

    $scope.updatePassword = function(){
        if ($scope.scratch.password == $scope.scratch.password_again) {
            $scope.postJSONtoAPI('user', 'update_password', {password: $scope.scratch.password}, false);
            $scope.scratch.saved_password = true;
            $scope.scratch.password = undefined;
            $scope.scratch.password_again = undefined;
            $scope.legacySignOut($scope.user.user.current_session.$oid);
        } else {
            console.error('pw match fail');
        };
        
    };

	// user preferences start here

    $scope.userPreferences = [
        // each dict is a 'group'
        {
            'name': 'Settlement/Survivor Creation',
            // each item is a preference
            'items': [
                {
					'handle': 'random_names_for_unnamed_assets',
                    "desc": "Let the Manager choose random names for Settlements/Survivors without names?",
                    "affirmative": "Choose randomly",
                    "negative": "Use 'Unknown' and 'Anonymous'",
                    'subscriber_level': 0,
                    'beta': false,
                    'default': true,
                },
				{
					'handle': 'apply_new_survivor_buffs',
			        "desc": "Automatically apply settlement bonuses to new, newborn and current survivors where appropriate?",
        			"affirmative": "Automatically apply",
			        "negative": "Do not apply",
                    'subscriber_level': 0,
                    'default': true,
				},
            ],
        },
		{
			'name': 'Interface',
			'items': [
                {
                    'handle': "show_endeavor_token_controls",
                    "desc": "Show Endeavor Token controls on Campaign Summary view?",
                    "affirmative": "Show controls",
                    "negative": "Hide controls",
                    "subscriber_level": 0,
                    'default': true,
                },
                {
                    'handle': "show_remove_button",
                    "desc": "Show controls for removing Settlements and Survivors?",
                    "affirmative": "Show the Delete button",
                    "negative": "Hide the Delete button",
                    "subscriber_level": 0,
                    'default': false,
                },
                {
                    'handle': "show_ui_tips",
                    "desc": "Display in-line help and user interface tips?",
                    "affirmative": "Show UI tips",
                    "negative": "Hide UI tips",
                    "subscriber_level": 0,
                    'default': true,
                },
                {
                    'handle': "night_mode",
                    "desc": "UI Color Theme:",
                    "affirmative": "Dead Guardian (high contrast)",
                    "negative": "Glowing Center (default)",
                    "subscriber_level": 2,
                    'default': false,
                },
                {
                    'handle': "show_dashboard_alerts",
                    "desc": "Display webapp alerts on the Dashboard?",
                    "name": "Display webapp alerts on the Dashboard?",
                    "affirmative": "Show alerts",
                    "negative": "Hide alerts",
                    "subscriber_level": 2,
                    'default': true,
                },
			],
		},
    ];

    $scope.setPref = function(pref, setting){
        pref.value = setting;
        js_obj = {preferences: [{handle: pref.handle, value: setting}]};
        if ($scope.user.user.preferences[pref.handle] == setting) {
            return true
        };
        $scope.user.user.preferences[pref.handle] = setting;
        $scope.postJSONtoAPI('user','set_preferences',js_obj,false);
    };



});
