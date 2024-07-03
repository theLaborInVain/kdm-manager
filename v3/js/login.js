var app = angular.module('login', []);

app.controller("globalController", function($scope, $http) {

    $scope.loadURL = function(destination) {
        // allows us to use ng-click to re-direct to URLs
        window.location = destination;
    };

    $scope.getElement = function(elementId) {
        var element = document.getElementById(elementId);
        if (element === null) {
            console.error("Could not find HTML element '" + elementId + "'");
            return false
        } 
        return element
    };

    $scope.hideControls = function(elementId) {
        var controls = $scope.getElement(elementId);
        if (controls) {
            controls.classList.add('hidden');
        };
    };

    $scope.showControls = function(elementId) {
        var controls = $scope.getElement(elementId);
        if (controls) {
            controls.classList.remove('hidden');
        };
    };

    $scope.showSignInControls = function() {
        $scope.hideControls('help_controls');
        $scope.hideControls('new_user_controls');
        $scope.showControls('sign_in_controls');
        document.getElementById("signInEmail").focus()
    };    

    $scope.showNewUserControls = function() {
        $scope.hideControls('sign_in_controls');
        $scope.hideControls('help_controls');
        $scope.showControls('new_user_controls');
        document.getElementById("newUserEmail").focus()
    };    

    $scope.showHelpControls = function() {
        $scope.showControls('help_controls');
        document.getElementById("resetPasswordEmail").focus()
    };    

    $scope.loading = function(action) {
        if (action === undefined) {
            $scope.hideControls('sign_in_controls');
            $scope.hideControls('new_user_controls');
            $scope.hideControls('help_controls');
            $scope.showControls('loading_spinner');
        } else {
            $scope.hideControls('loading_spinner');
            $scope.showControls('sign_in_controls');
        };
    };


    $scope.legacySignIn = function(un, pw) {
        // signs into the legacy webapp by emulating a form POST
        var form = document.createElement("form");
        form.method = "POST";
        form.action = "/";   

        var username = document.createElement("input"); 
        var password = document.createElement("input"); 

        username.name = 'login';
        username.value = un;
        username.classList.add('hidden');
        form.appendChild(username);

        password.name = 'password';
        password.value = pw;
        password.classList.add('hidden');
        form.appendChild(password);  

        document.body.appendChild(form);
        form.submit();

    };

    $scope.signIn = function(signInEmail, signInPassword) {
        // authenticates via the API and then hands off to the legacy app to
        // authenticate there.
        $scope.loading();
        var data = {username: signInEmail, password: signInPassword};
        $http({
            method: 'POST',
            url: $scope.apiURL + "login",
            data: data
        }).then(function successCallback(response) {
                var r = response.data;
                console.log("Authentication successful! Initiating legacy webapp sign-in...");
                $scope.legacySignIn(signInEmail, signInPassword);
            }, function errorCallback(response) {
                console.error("signIn() method failed!");
                console.error("Response was: " + response.data + "; status was: " + response.status);
                $scope.loading('off');
                if (response.status === -1) {
                    console.error("API is unavailable or unreachable!");
                    $scope.showControls('api_unavailable');
                } else {
                    $scope.showControls('sign_in_error');
                };
            }
        );
    };

    $scope.setLatestRelease = function() {
        // sets $scope.latestRelease
        var reqURL = $scope.apiURL + 'releases/latest';
        console.time(reqURL);
        $http({
            method:'POST',
            url: reqURL,
            data: {'platform': 'kdm-manager.com'},
        }).then(
            function successCallback(response) {
                $scope.latestRelease = response.data;
                $scope.latestRelease.versionString =
                    $scope.latestRelease.version.major + "." +
                    $scope.latestRelease.version.minor + "." +
                    $scope.latestRelease.version.patch;
                console.info('Latest published release is: ' +
                    $scope.latestRelease.versionString
                );
                console.timeEnd(reqURL);
            }, function errorCallback(response) {
                console.error('Could not retrieve release info!');
                console.error(response);
                console.timeEnd(reqURL);
            }
        );
    };

    $scope.initSignIn = function() {
        // pressing "enter" while focusing on the "password" input submits
        // the sign in "form" (which isn't a form).
        console.info('Initializing signInPassword element...');
        var pw_input = document.getElementById("signInPassword");
        pw_input.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("signInButton").click();
            }
        });
    };

    $scope.init = function(apiURL) {
        console.info('Initializing globalController...');
        $scope.apiURL = apiURL;

        var statURL = $scope.apiURL + 'stat';
        console.time(statURL);
        $http({
            method:'GET',
            url: statURL,
        }).then(
            function successCallback(response) {
                $scope.apiStat = response.data;
                console.info(
                    'Connected to KDM API v' + $scope.apiStat.meta.api.version
                );
                console.timeEnd(statURL);
            }, function errorCallback(response) {
                $scope.apiStat = false;
                console.error('Could not stat API!');
                console.error(response);
                console.timeEnd(statURL);
            }
        );

    };

});


app.controller("newUserController", function($scope, $http) {
    $scope.register = function(api_url) {
        $scope.loading();
        if ($scope.newUserPassword !== $scope.newUserPasswordAgain) {
            $scope.showControls('pw_match_error');
            $scope.loading('off');
            $scope.showNewUserControls();
            return
        } else if ($scope.newUserEmail === undefined) {
            $scope.showControls('new_user_error');
            $scope.loading('off');
            var error_div = document.getElementById('new_user_error_alert');
            error_div.innerHTML = 'Please enter a valid email address!';
            $scope.showNewUserControls();
            return
        };
        // if we're still here after validation, attempt to register:
        var data = {username: $scope.newUserEmail, password: $scope.newUserPassword};
//        console.log(data);
        $http({
            method: 'POST',
            url: api_url + "new/user",
            data: data,
        }).then(function successCallback(response) {
                var r = response.data;
//                console.log(r);
                $scope.legacySignIn($scope.newUserEmail, $scope.newUserPassword);
                return
            }, function errorCallback(response) {
                var r = response.data;
                console.error(r);
                $scope.loading('off');
                var error_div = document.getElementById('new_user_error_alert');
                error_div.innerHTML = r;
                $scope.showControls('new_user_error');
            }
        );
    };
});

app.controller("resetPasswordController", function($scope, $http) {
    $scope.loading = function(action) {
        if (action === undefined) {
            $scope.hideControls('reset_password_controls');
            $scope.showControls('loading_spinner');
        } else {
            $scope.hideControls('loading_spinner');
            $scope.showControls('reset_password_controls');
        };
    };
    $scope.reset = function(api_url) {
        $scope.loading();
        if ($scope.newPassword !== $scope.newPasswordAgain) {
            $scope.showControls('pw_match_error');
            $scope.loading('off');
            $scope.showNewUserControls();
            return
        };
        var un = document.getElementById('resetPasswordEmail').value;
        var r_code = document.getElementById('recoveryCode').value;
        data = {
            'username': un,
            'password': $scope.newPassword,
            'recovery_code': r_code,
            'app_url': 'https://kdm-manager.com', 
        }
        $http({
            method: 'POST',
            url: api_url + "reset_password/reset",
            data: data,
        }).then(function successCallback(response) {
                $scope.legacySignIn(un, $scope.newPassword);
            }, function errorCallback(response) {
                var r = response;
                console.error(r);
                var error_div = document.getElementById('help_error_alert');
                error_div.innerHTML = r.data;
                $scope.showControls('help_error');
                $scope.loading('off');
                return
            }
        );
    };
});

app.controller("helpController", function($scope, $http) {
    $scope.resetRequest = {};
    $scope.resetPassword = function(api_url) {
        $scope.loading();
        data = {
            'username': $scope.resetRequest.resetPasswordEmail,
            'app_url': 'https://kdm-manager.com'
        };
        $http({
            method: 'POST',
            url: api_url + "reset_password/request_code",
            data: data
        }).then(function successCallback(response) {
                $scope.loading('off');
                var r = response.data;
                var success_p = document.getElementById('successMessage');
                success_p.innerHTML = 'An email containing further instructions has been sent to <b>' + $scope.resetRequest.resetPasswordEmail + '</b>.';
                $scope.showControls('help_success');
                return
            }, function errorCallback(response) {
                $scope.loading('off');
                var r = response;
                console.error(r);
                console.error(r.status);
                var error_div = document.getElementById('help_error_alert');
                error_div.innerHTML = r.data;
                $scope.showControls('help_error');
                return
            }
        );
    };
});




