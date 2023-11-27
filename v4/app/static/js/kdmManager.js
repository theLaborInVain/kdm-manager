"use strict";

var app = angular.module('kdmManager', ['ngAnimate']);

// avoid clashes with jinja2
app.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{a');
    $interpolateProvider.endSymbol('a}');
}]);

// HTML insertion
app.filter(
    'trustedHTML', function($sce) { return $sce.trustAsHtml; }
);

app.filter('attributeFilter', function() {
    // filters a dictionary, e.g. in an ng-options/ng-repeat on a key/value
    //  pair. Use it like this to only get items where
    //  the 'sub_type' attr === 'settlement_event':
    //      ng-options="
    //          handle as dict.selector_text for (handle, dict) in
    //          settlement.game_assets.events |
    //          attributeFilter:'sub_type':'settlement_event'
    //      "

    return function(dict, key, value) {
        var filtered = {};
        angular.forEach(dict, function(item) {
            if (item[key] === value) {filtered[item.handle] = item};
        });
        return filtered;
    };
});

// allows the use of contentEditable divs as text inputs
app.directive("contenteditable", function() {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {

      function read() {
        ngModel.$setViewValue(element.html());
      }

      ngModel.$render = function() {
        element.html(ngModel.$viewValue || "");
      };

      element.bind("blur keyup change", function() {
        scope.$apply(read);
      });
    }
  };
});

// filter a list of objects down to ones that have a single attribute
//	regardless of that attribute's value
app.filter('hasAttribute', function() {
  return function(assets, attribute) {
    var filtered = [];
    angular.forEach(assets, function(asset) {
        if (asset[attribute] !== undefined) {
            filtered.push(asset);
        };
    });
    return filtered;
  };
});

app.controller('rootScopeController', function($scope, $rootScope, $http, $timeout) {

    // primary init starts here; auth/token methods follow

    $scope.init = function(apiUrl, apiKey, requestEndpoint, user) {

        $rootScope.APIURL = apiUrl;
        $rootScope.APIKEY = apiKey;
        $rootScope.VIEW = requestEndpoint;
		$rootScope.USER = user;

		// this is the main init() call for the WHOLE APPLICATION, so we go a
		// bunch of critical stuff here, in terms of setting variables in the
		// uppermost $scope, etc.

		// first, get the JWT from the cookie (if present) and inject it into
		// the root scope, since all requests use it; create the CONFIG constant

		$scope.setJwtFromCookie();
		$rootScope.CONFIG = {
			'headers': {
				'Authorization': $rootScope.JWT,
				'API-Key': apiKey,
			}
		}


		// now, reach out to the API and get that into the root scope

        var statURL = $rootScope.APIURL + 'stat';
        console.time(statURL);

        $http({
            method:'GET',
            url: statURL,
            headers: $rootScope.CONFIG.headers
        }).then(
            function successCallback(response) {
                $rootScope.apiStat = response.data;
                console.timeEnd(statURL);
                console.info(
                    'KDM API v' + $rootScope.apiStat.meta.api.version + ' @ ' + $rootScope.APIURL
                );

                // now that the API is alive, set a few things
                $rootScope.setKingdomDeath();
                $rootScope.setCurrentUser();

            }, function errorCallback(response) {
                $rootScope.apiStat = false;
                console.error('Could not stat API!');
                console.error(response);
                console.timeEnd(statURL);

                // finally, if we can't stat the API on a non-login/-logout type
                // of view, then we shit-can the whole thing and log the user
                // out: this protects us from trying to load a view when the API
                // is gone for whatever reason
                if ($rootScope.VIEW === 'login' || $rootScope.VIEW == 'logout') {
                    console.warn('Not attempting automatic log-out...');
                } else {
                    console.error('Logging out...');
                    $scope.flashCapsuleAlert('Exit', true);
                    $rootScope.loadURL("/logout");
                };

            }
        );

    };

    

    $rootScope.setJwtFromCookie = function() {

        // skip this if we're looking at the login screen
        if ($scope.VIEW === 'login') {return true};

		// injects the JWT into the root scope
        var cname = "kdm-manager_token";
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i < ca.length; i++) {
        	var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf('kdm-manager_token=') == 0) {
                $rootScope.sessionOID = c.substring('kdm-manager_token='.length, c.length);
            };
            if (c.indexOf(name) == 0) {
                $rootScope.JWT = c.substring(name.length, c.length);
                return true;
            };
        };

		// if we're still here, we've got problems
        console.error("Could not set JWT from cookie!");
        console.error(decodedCookie);
        $rootScope.JWT = null;
    };


    //
    //  API methods and methods related to refreshing the view start here
    //


    //
    //  UI/UX reusable JS section starts here
    //

    // aesthetic and UX prettiness stuff
    $rootScope.toTitle = function(str) {
        str = str.replace(/_/g, ' ');
        str = str.replace(/ and /g, ' & ');
        str = str.toLowerCase().split(' ');

        // turn it into a list to iterate it
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }

        // turn it back into a string now
        var norm_str = str.join(' ');

        // post processing/vanity stuff
        norm_str = norm_str.replace(/Xp/g, 'XP');
        norm_str = norm_str.replace(/Of/g, 'of');
        norm_str = norm_str.replace(/ The/g, ' the');
        return norm_str;
    };


	// alerts and pop-ups
    $rootScope.flashCapsuleAlert = function(alertType, hold) {
        // we're going to show it, so add it to visible

        $rootScope.ngCapsuleAlert = {};
        $rootScope.ngCapsuleAlert.letter = alertType.substring(0,1);
        $rootScope.ngCapsuleAlert.text = alertType;
        $rootScope.ngCapsuleAlert.style = 'blue';

        if (alertType === 'Error') {
            $rootScope.ngCapsuleAlert.style = 'pink';
        } else if (alertType === 'Exit') {
            $rootScope.ngCapsuleAlert.style = 'black';
        };

        if (hold) {
            $scope.ngShow('capsuleAlertFlasher');
        } else {
            $scope.ngFlash('capsuleAlertFlasher', 700);
        };
    };


    // ngVisible, ngHide, ngShow

    $rootScope.ngVisible = {}

    $rootScope.ngGetElement = function(elementId) {
        // get an element from the page or die screaming about it
        var err_slug = "ngGetElement('" + elementId + "') ";
        try {
            var element = document.getElementById(elementId);
        } catch(err) {
            console.error(err);
        };
        if (element === null || element === undefined) {
            console.warn(err_slug + " is " + element + "!");
            throw 'ngGetElement() failed!'
        };
        return element;
    };

    $rootScope.ngShow = function(elementId) {
        // for legacy compatibility: wait until the $digest finishes, then
        // get the element (it won't be present until the $digest is updated
        // after the ngVisible change above);
        var eWatch = $scope.$watch(
            function() {
                $rootScope.ngVisible[elementId] = true;
                return document.getElementById(elementId)
            },
            function(newValue, oldValue, scope) {
                if (oldValue !== newValue) {
                    newValue.classList.remove('hidden');
                    eWatch(); // unbind it
                }
            }
        )
    };

    $rootScope.ngHide = function(elementId, lazy, swallowErrors) {
        // if lazy is boolean, we ignore the HTML and just force the element
        // to undef
        if (lazy) {
//            console.warn("Lazy ngHide for '" + elementId + "'");
            $rootScope.ngVisible[elementId] = undefined;
        } else {
            try {
                var element = $rootScope.ngGetElement(elementId);
                element.classList.add('hidden');
            } catch(err) {
                if (!swallowErrors) {
                    throw err;
                };
            };
        };
        $rootScope.ngVisible[elementId] = false;
    }

    $rootScope.ngShowHide = function(elementId) {
        // supersedes showHide(), which is deprecated
        // toggles an element in and out of $rootScope.ngVisible, which is
        //  an arry of UI elements that are true or false

        if ($rootScope.ngVisible[elementId] === true) {
            $rootScope.ngHide(elementId);
        } else {
            $rootScope.ngShow(elementId);
        };

    };

    $rootScope.ngFlash = function(elementId, duration) {
        // shows an element; sleeps for 'duration'; takes the element out of
        // ngVisible list.
        // works a bit like ngShow(), but uses $timeout to sleep for 'duration'
        // before updating the ngVisible dict
        if (duration === undefined) {
            duration = 3000;
        };

        // create a dictionary for flash watchers -OR- return if we're already
        // flashing/watching this element...
        if ($scope.eVisibleWatch === undefined) {
            $scope.eVisibleWatch = {}
        } else if ($scope.eVisibleWatch[elementId]) {
            return true;
        };

        $scope.eVisibleWatch[elementId] = $scope.$watch(
            function() {
                $rootScope.ngVisible[elementId] = true;
                return document.getElementById(elementId)
            },
            function(newValue, oldValue, scope) {
                if (oldValue !== newValue) {
                    newValue.classList.remove('hidden');
                    $timeout(
                        function() {
                            $rootScope.ngVisible[elementId] = false;
                            $scope.eVisibleWatch[elementId](); // unbind it
                            delete $scope.eVisibleWatch[elementId];
                        },
                        duration
                    );
                }
            }
        );

    };


	//
    // tabs!
	//
    $rootScope.tabsObject = {   // set object defaults
        previousTab: 0,
        activeTab: 0,
        minTab: 0,
    };

    $rootScope.getPrevNextTab = function() {
        var output = {}
        for (var i = 0; i < $scope.tabsObject.tabs.length; i++) {
            var tab = $scope.tabsObject.tabs[i];
            if ($scope.tabsObject.activeTab === tab.id) {
                output.previous = $scope.tabsObject.tabs[i - 1]
                output.current = tab;
                output.next = $scope.tabsObject.tabs[i + 1]
            }
        };
        return output
    };
    $rootScope.changeTab = function(destination) {
        // figures out if we're going up (right) or down (left) in tab order
        // and briefly displays an element with an arrow, indicating that
        // we're moving in that direction

        // set defaults
        if ($scope.tabsObject.previousTab === undefined) {
            console.error(
                '$scope.tabsObject.previousTab is not set! Defaulting to zero...'
            );
            $scope.tabsObject.previousTab = 0;
        }

        var p = $rootScope.getPrevNextTab()

        if (destination === 'previous') {
            if (p.previous === undefined) {
                destination = $scope.tabsObject.activeTab
            } else {
                destination = p.previous.id;
            };
        } else if (destination === 'next') {
            if (p.next === undefined) {
                destination = $scope.tabsObject.activeTab
            } else {
                destination = p.next.id;
            };
        } else if (destination === undefined) {
            destination = 666;
        }

        // sanity check destination
        if (destination < $scope.tabsObject.minTab) {
            destination = $scope.tabsObject.minTab
        };

        $scope.tabsObject.activeTab = destination;

        // now determine direction
        var direction = 'right';
        if (destination < $scope.tabsObject.previousTab) {
            direction = 'left';
        } else if (destination === $scope.tabsObject.previousTab) {
            direction = null;
        };

        if (direction === 'right') {
            $scope.ngFlash('tabNavArrowRight', 300);
        } else if (direction === 'left') {
            $scope.ngFlash('tabNavArrowLeft', 300);
        } else {
            $scope.ngFlash('tabNavArrowNull', 300);
        };

        // now, leave a var in scope so we know
        $scope.tabsObject.previousTab = destination;
    };


	//
    // roll up/down starts here
	//

    $rootScope.ngRolledUp = {};
    $rootScope.getRollDownContainer = function(e_id) {
        var e = document.getElementById(e_id);
        if (e === null) {
            console.error("roll-down element '" + e_id + "' does not exist!");
            return;
        };
        return e
    };
    $rootScope.rollUp = function(e_id) {
        var e = $rootScope.getRollDownContainer(e_id);

        if (e.classList.contains('rolled_up') == true) {
            e.classList.remove('rolled_up');
            $rootScope.ngRolledUp[e_id] = false;
        } else {
            e.classList.add('rolled_up');
            $rootScope.ngRolledUp[e_id] = true;
        };
    };
    $rootScope.ngRollDown = function(e_id) {
        // forces an element into the down position
        var e = $rootScope.getRollDownContainer(e_id);
        e.classList.remove('rolled_up');
        $rootScope.ngRolledUp[e_id] = false;
    }
    $rootScope.ngRollUp = function(e_id) {
        // forces an element into the up position
        var e = $rootScope.getRollDownContainer(e_id);
        e.classList.add('rolled_up');
        $rootScope.ngRolledUp[e_id] = true;
    }
    $rootScope.ngRoll = function(activeElementId, rollGroup=[]) {
        // the preferred roll-up/roll-down method; this toggles roll status of
        // 'e_id' and rolls up all the members of 'rollGroup', which should be
        // a list. The idea here is that one element is the focus, and the
        // others are hidden 

        if (rollGroup === []) {
            console.warn("ngRoll() -> 'rollGroup' list is empty!");
        };

        for (var i = 0; i < rollGroup.length; i++) {
            // force roll-up all elements in the group we're not currently
            //  working on...
            if (rollGroup[i] !== activeElementId) {
                var inactiveElementId = rollGroup[i];
                $rootScope.ngRollUp(inactiveElementId);
            };
        };

        // now figure out whether we want to roll it up or down. use the same
        //  evaluation we do in the HTML templates, e.g. whether it explicitly
        //  has a 'false' in the ngRolledUp dict
        if ($rootScope.ngRolledUp[activeElementId] === false) {
            $rootScope.ngRollUp(activeElementId);
        } else {
            $rootScope.ngRollDown(activeElementId);
        };

    };


    //
    //  browsing and navigation helpers
    //
    $rootScope.loadURL = function(destination) {
        console.warn('Refactor code to use loadUrl() instead!');
        $rootScope.loadUrl(destination);
    };
    $rootScope.loadUrl = function(destination) {
       // allows us to use ng-click to re-direct to URLs
        window.location = destination;
    };




	// angular debugger
    document.addEventListener ("keydown", function (zEvent) {
        if (zEvent.ctrlKey  &&  zEvent.altKey  &&  zEvent.key === "d") {  // case sensitive
            var e = document.getElementById('ngDebugWindow')
            if ($rootScope.NGDEBUG === true) {
                e.classList.add('hidden')
                console.warn('Debug mode disabled!')
                $rootScope.NGDEBUG = undefined;
            } else {
                e.classList.remove('hidden')
                console.warn('Debug mode enabled!')
                $rootScope.NGDEBUG = true;
            };
        };
    } );



    //
    //  API methods below - this is where the magic happens
    //

    $rootScope.createSettlement = function(newSettlementObject) {
        // creates a new settlement

        var url = $rootScope.APIURL + 'new/settlement';
        var promise = $http.post(url, newSettlementObject, $rootScope.CONFIG);

		promise.then(
			function successCallback(response) {
				console.timeEnd(url);
                $scope.loadURL('/settlement/' + response.data.sheet._id.$oid);
			},
			function errorCallback(response) {
                console.error('createSettlement() failed!');
                if (response.data) {
                    console.error(response.data);
                    $rootScope.ngHide('fullPageLoader', false, true);
                    $rootScope.ngShow('apiErrorModal');
                    $rootScope.apiError = {
                        'status': response.status,
                        'response': response.data,
                    };
                } else {
                    console.error(response);
                };
				console.timeEnd(url);
			}	
		);
    };


    $rootScope.createSurvivor = function(newSurvivorObject) {
        // creates a new survivor; does a bunch of UI work


        // 1.) construct the POST; do the post
        var url = $rootScope.APIURL + 'new/survivor';
        //var promise = $http.post(url, newSurvivor, $rootScope.CONFIG);
        var promise = $rootScope.postJSONtoAPI(
            'survivor', 'new', false,
            newSurvivorObject,
            true, true, true
        )
        // 2.) hide controls (takes the newSurvivorObject out of scope);
        //  show the loader and wait
        $rootScope.ngHide('newSurvivorCreationControls');
        $rootScope.ngShow('newSurvivorCreationLoader');

        // 3. ) process success/failure
        promise.then(
            function(payload) {
                $rootScope.ngHide('newSurvivorCreationLoader');
                if (!newSurvivorObject.newSurvivors) {
                    newSurvivorObject.newSurvivors = [];
                };
                $rootScope.ngShow('newSurvivorCreateAnotherButton');
                newSurvivorObject.newSurvivors.push(payload.data);
            },
            function(errorPayload) {
                $rootScope.ngHide('newSurvivorCreationLoader');
                $rootScope.ngHide('newSurvivorModal');
                //postJSONtoAPI() should show the full tab API error at this point
            }
        );

    };

    $rootScope.updateSurvivorSheet = function(newSheet) {
        // overwrites a survivor sheet in the current scope with 'newSheet'
        var targetOid = newSheet._id.$oid
        var survivors = $scope.settlement.user_assets.survivors;
        for (var i = 0; i < survivors.length; i++) {
            if (survivors[i].sheet._id.$oid === targetOid) {
                survivors[i].sheet = newSheet
                $scope.$apply();
                console.info('Survivor sheet updated successfully!');
                return true;
            };
        };
        console.error('Survivor sheet could not be updated!');
    };


    $rootScope.postJSONtoAPI = function(
			collection, action, objectOid,
			jsonObj = {},
			reinit = true,
			showAlert = true,
			updateSheet = false,
		) 
		{
		// welcome to the new version of postJSONtoAPI()!
		// This workhorse method has been broken into components and refactored
		// for readability. It behaves differently to the original/legacy
		// implementation, so proceed with caution!

        // sanity check!
        if (collection == 'user') {
            window.alert('postJSONtoAPI() cannot be used to update the user!\nUse updateCurrentUser() instead!');
            return false;
        };

		// first, if we're doing on-screen alerts, show the small loader
	    if (showAlert) {
            $scope.ngFlash('cornerSpinner', 500);
        };

		// sanity checks
		const requiredArgs = [collection, action, objectOid, jsonObj]
		requiredArgs.forEach(function (arg, index) {
			if (arg === undefined) {
				throw 'postJSONtoAPI() -> Required variable is undefined!';
			};
		});

		// echo the call back to the log
		if ($scope.NGDEBUG) {
			var methodDesc = $scope.argsToString([
				collection, action, objectOid, jsonObj, reinit, showAlert, updateSheet
			])
    	    console.info('postJSONtoAPI' + methodDesc);
		};

        // always serialize on response, regardless of asset type
        jsonObj.serialize_on_response = true;

        // create the URL and do the POST; special carve-out for 'new'
        var endpoint = collection + "/" + action + "/" + objectOid; 
        if ( (objectOid === false) && (action === 'new') ) {
            console.info('Creating new ' + collection + '...');
            endpoint = 'new/' + collection;
        };
        var url = $rootScope.APIURL + endpoint;

		console.time(endpoint);
        var promise = $http.post(url, jsonObj, $rootScope.CONFIG);

		promise.then(
			function successCallback(response) {
//                console.warn('reinit: ' + reinit + ', showAlert: ' + showAlert + ', updateSheet: ' + updateSheet);
                if (reinit) { $rootScope.initializeSettlement($scope.settlement.sheet._id.$oid) };
				if (showAlert) { $rootScope.flashCapsuleAlert('Saved') };
                if (updateSheet) { 
                    // wait for the DOM to finish being updated; then hit it again
                    $timeout(function(){
                        if (collection === 'settlement') {
                            $scope.settlement.sheet = response.data.sheet;
                        } else if (collection === 'survivor') {
                            $timeout(function(){
                                $scope.updateSurvivorSheet(response.data.sheet)
                            }, 500)
                        };
                    });
                };
				console.timeEnd(endpoint);
			},
			function errorCallback(response) {

                $rootScope.flashCapsuleAlert('Error');

                // revert the sheet on failure
                console.error('postJSONtoAPI() failed! Re-initializing...');
                $rootScope.initializeSettlement($scope.settlement.sheet._id.$oid);

                // show the error, end the call
                if (response.data) {
                    console.error(response.data);
                    // hand-off 403's to the alerter when a user isn't allowed to
                    //  make changes to the settlement
                    if (response.status === 403) {
                        $rootScope.ngShow('accessDeniedModal');
                    } else {
                        $rootScope.ngShow('apiErrorModal');
                        $rootScope.apiError = {
                            'status': response.status,
                            'response': response.data,
                        };
                    };

                } else {
                    console.error('API did not return an HTTP response! Got this instead:');
                    console.error(response);
                    $rootScope.ngShow('apiErrorModal');
                    $rootScope.apiError = {
                        'status': 666,
                        'response': 'The KD:M API returned the following:' + JSON.stringify(response),
                    };
                };
				console.timeEnd(endpoint);

			}	
		);

		return promise;

	}; // end of postJSONtoAPI()!


    //
    // initializeSettlement
    //

    $rootScope.initializeSettlement = function(settlementOID) {

        // the legacy/v3 way of initializing a settlement with a mind to 
        // presenting the user a version of the serialized settlement
		// appropriate for the current $rootScope.VIEW
		// 'requestPath' is something like /settlement/<oid>

		if (!settlementOID) {
			throw "intitializeSettlement() requires 'settlementOID' arg!";
		};


        var getAction = 'get'
        if ($rootScope.VIEW === 'campaign_summary') {
            getAction = 'get_campaign';
        };

		var reqURL = $rootScope.APIURL + 'settlement/' + getAction + '/' + settlementOID;
		console.time(reqURL);

        var promise = $http.get(reqURL, $rootScope.CONFIG);

		promise.then(
			function successCallback(response) {
                $scope.settlement = response.data;
                $scope.settlement.currentUser = {}; // for the decoration later
                console.timeEnd(reqURL);
                $rootScope.ngHide('fullPageLoader', false, true);
                $rootScope.decorateSettlement();
			},
			function errorCallback(response) {
                console.error('Could not retrieve settlement from API!');
                console.error(response);
                console.timeEnd(reqURL);
				if (response.status === 401 || response.status === 403) {
        			window.location = '/unauthorized/' + response.status;
				}
			}	
		);

    }; // initializeSettlement end

    // initialized settlement special sauce
    $rootScope.decorateSettlement = function() {
        // tunes up $scope.settlement to have some special stuff
        $rootScope.setSettlementCurrentUserFavorites();
    };

    $rootScope.setSettlementCurrentUserFavorites = function() {
        if ($scope.currentUser !== undefined) {
           $scope.settlement.currentUser.favoriteSurvivors = $scope.currentUser.favorite_survivors.filter(item => $scope.settlement.user_assets.survivor_oids_list.includes(item))
        };
    };

    // set methods
    $rootScope.setApiAlerts = function() {
        // gets all of Kingdom Death from the API; hangs it on 
        // $rootScope.kingdomDeath; returns its promise (so that other
        // methods can wait for it and then take action).

        var reqURL = $rootScope.APIURL + 'get/notifications';
        console.time(reqURL);
        
        var apiAlertsPromise = $http.get(reqURL, $rootScope.CONFIG);
        apiAlertsPromise.then(
            function successCallback(response) {
                $scope.apiAlerts = response.data;
                console.timeEnd(reqURL);
            }, function errorCallback(response) {
                console.error('Could not retrieve API alerts!');
                console.error(response);
                console.timeEnd(reqURL);
            }
        );

        return apiAlertsPromise
    };


    $rootScope.setCurrentUser = function() {
        // sets the current_user (from flask) to rootScope.currentUser

        // first, bail if this is the login screen
        if ($scope.VIEW == 'login') {return true};

        var reqURL = $rootScope.APIURL + 'user/get/' + $rootScope.USER;
        console.time(reqURL);
        
        $http.get(
            reqURL,
            $rootScope.CONFIG
        ).then(
            function successCallback(response) {
                $rootScope.currentUser = response.data.user;
                console.timeEnd(reqURL);
            }, function errorCallback(response) {
                console.error('Could not set $rootScope.currentUser!');
                console.error(response);
                console.timeEnd(reqURL);
            }
        );
    };

    $rootScope.updateCurrentUser = function(method, updateJson) {
        // updates the current user via 'method'; POSTs 'updateJson' as the payload

        var reqURL = $rootScope.APIURL + 'user/' + method + '/' + $rootScope.USER;
        console.time(reqURL);
        console.info(updateJson);        
        var userUpdatePromise = $http.post(
            reqURL,
            updateJson,
            $rootScope.CONFIG
        )
        
        userUpdatePromise.then(
            function successCallback(response) {
                $rootScope.currentUser = response.data.user;
                console.info('Updated user successfully!');
                console.timeEnd(reqURL);
                $rootScope.flashCapsuleAlert('Saved');
            }, function errorCallback(response) {
                console.error('Could not update currentUser!');
                console.error(response);
                console.timeEnd(reqURL);
            }
        );

        return userUpdatePromise;
    };


    $rootScope.verifyEmail = function() {
        var reqURL = $rootScope.APIURL + 'user/send_verification_email/' + $rootScope.USER;
        console.time(reqURL);
        
        var promise = $http.post(
            reqURL,
            {value: true},
            $rootScope.CONFIG
        )
    };


    $rootScope.setKingdomDeath = function() {
        // gets all of Kingdom Death from the API; hangs it on 
        // $rootScope.kingdomDeath

        var reqURL = $rootScope.APIURL + 'kingdom_death';
        console.time(reqURL);
        
        $http.get(
            reqURL,
            $rootScope.CONFIG
        ).then(
            function successCallback(response) {
                $rootScope.kingdomDeath = response.data;
                console.timeEnd(reqURL);
            }, function errorCallback(response) {
                console.error('Could not set $rootScope.kingdomDeath!');
                console.error(response);
                console.timeEnd(reqURL);
            }
        );
    };

    $rootScope.setSettlementMacros = function() {
        // sets $rootScope.settlementMacros

        var reqURL = $rootScope.APIURL + 'game_asset/macros';
        console.time(reqURL);
        
        $http({
            method:'GET',
            url: reqURL,
        }).then(
            function successCallback(response) {
                $rootScope.settlementMacros = response.data;
                console.timeEnd(reqURL);
            }, function errorCallback(response) {
                console.error('Could not set $rootScope.settlementMacros!');
                console.error(response);
                console.timeEnd(reqURL);
            }
        );
    };


    $rootScope.setLatestRelease = function(force) {
        // sets $rootScope.latestRelease; present in the upper-most scope since
        // various views might call for it (for whatever dumbass reasons)

		if ($rootScope.latestRelease !== undefined && force !== true) {
			console.warn('Latest release already set!');
			return true
		};

        var reqURL = $rootScope.APIURL + 'releases/latest';
        console.time(reqURL);

        $http({
            method:'POST',
            url: reqURL,
            data: {'platform': 'kdm-manager.com'},
        }).then(
            function successCallback(response) {
                $rootScope.latestRelease = response.data;
                $rootScope.latestRelease.versionString =
                    $rootScope.latestRelease.version.major + "." +
                    $rootScope.latestRelease.version.minor + "." +
                    $rootScope.latestRelease.version.patch;
                console.timeEnd(reqURL);
                console.info('Latest published release is: ' +
                    $rootScope.latestRelease.versionString
                );
            }, function errorCallback(response) {
                $rootScope.latestRelease = 'UNKNOWN';
                console.error('Could not retrieve release info!');
                console.error(response);
                console.timeEnd(reqURL);
            }
        );
    };

    
    $scope.setWebappHelp = function() {
        // sets $scope.webappHelp to be our help JSON from the v4 app

        var reqURL = '/assets/help';
        console.time(reqURL);
        
        $http({
            method:'GET',
            url: reqURL,
        }).then(
            function successCallback(response) {
                $scope.webappHelp = response.data;
                console.timeEnd(reqURL);
            }, function errorCallback(response) {
                console.error('Could not retrieve webapp help!');
                console.error(response);
                console.timeEnd(reqURL);
            }
        );
    };

    // nav and control methods, i.e. that need to be accessible everywhere

    $rootScope.submitErrorReport = function(content) {
        // hits the API's /report_error endpoint
		
        var reqURL = $rootScope.APIURL + 'report_error';
		console.time(reqURL);

        var promise = $http.post(reqURL, {'value': content}, $rootScope.CONFIG);

		promise.then(
			function successCallback(response) {
                $scope.ngHide('reportErrorForm');
                $scope.ngShow('reportErrorConfirmation');
                console.timeEnd(reqURL);
			},
			function errorCallback(response) {
                console.error('Failed to POST error report to API!');
                console.error(response);
                console.timeEnd(reqURL);
				if (response.status === 401 || response.status === 403) {
        			window.location = '/unauthorized/' + response.status;
				} else {
                    $scope.ngHide('reportErrorForm');
                    $scope.ngShow('reportErrorFailure');
                };
			}	
		);
        
    };




	//
	//	utilities / junk
	//

    $rootScope.range  = function(count) {
        // functions like python range() i.e. like this:
        //  In [1]: range(3)
        //  Out[1]: [0, 1, 2]
        var output = [];
        for (var i = 0; i < count; i++) {
            output.push(i)
        }
        return output;
    };

    $rootScope.sortObjectsByDate = function(list, dateKey) {
        if (typeof list === 'object') {
            console.warn('Object list is an object! Attempting to fix...');
            var objectKeys = Object.keys(list);

            // now make list from scratch;
            var newList = [];
            for (var i = 0; i < objectKeys.length; i++) {
                var objectKey = objectKeys[i]
                newList.push(list[objectKey]);
            };
            console.warn('Created list of ' + newList.length + ' objects...');
            list = newList;
        };

        // make sure we have dateKey in each item before we sort
        for(var i = 0, size = list.length; i < size ; i++){
            var item = list[i];
            if (item[dateKey] === undefined) {
                console.warn(`${item.handle} has no ${dateKey} value!`);
                console.warn(`Setting ${item.handle}.${dateKey} to ${Date()}!`);
                item[dateKey] = {};
                item[dateKey].$date = new Date();
            }
        }

        return list.sort(
            function(a, b) {
                return b[dateKey].$date - a[dateKey].$date;
            }
        ).reverse();
    }

    $rootScope.toTitle = function(str) {
        // converts a string to a KD-style title; useful for handles, etc.
        str = str.replace(/_/g, ' ');
        str = str.replace(/ and /g, ' & ');
        str = str.toLowerCase().split(' ');

        // turn it into a list to iterate it
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }

        // turn it back into a string now
        var norm_str = str.join(' ');

        // post processing/vanity stuff
        norm_str = norm_str.replace(/Xp/g, 'XP');
        return norm_str;
    };

	$rootScope.argsToString = function(argList) {
		// takes a list of arguments, turns their values into a str
		var output = '(';
		argList.forEach(function (arg, index) {
			output += "'" + arg + "'";
			if (index !== argList.length -1) {
				output += ', ';
			};
		});
        output += ')';
		return output;
	};

    $rootScope.dumpJSONtoTab = function(jsonToDump) {
        var output = JSON.stringify(jsonToDump, null, 2);
        var x = window.open()
        x.document.open();
        x.document.write(`<pre>${output}</pre>`);
        x.document.close();
    };

    $rootScope.toggleArrayItem = function(list, item) {
        // pushes 'item' onto 'list' if not present; splices it out if
        // present

        if (list === undefined) {
            throw "toggleArrayItem() requires 'list' to be defined!"
        };

        var index = list.indexOf(item);
        var result = null;
        if (index === -1) {
            list.push(item);
            result = 'add';
        } else {
            list.splice(index, 1);
            result = 'rm';
        };

        return result;
    };

    $rootScope.assetArrayToList = function(assetArray) {
        // returns a list based on an asset array, e.g. rules, gear, etc.
        const keyValueArray = Object.keys(assetArray).map(key => (
            assetArray[key]
        ));
        return keyValueArray;
    };


    // JS method injection; angular and unleaded
    $rootScope.objectKeys = Object.keys;
    $rootScope.ngCopy = angular.copy;
    $rootScope.ngEquals = angular.equals;
    $rootScope.ngNumber = Number;
    $rootScope.ngObject = Object;
    $rootScope.ngString = String;

});
