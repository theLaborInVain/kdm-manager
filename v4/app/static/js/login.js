app.controller("loginController", function($scope, $http, $rootScope) {

    $scope.checkApiKey = function() {

        $scope.validApiKey = true;

        var checkURL = $rootScope.APIURL + 'check_api_key';
        console.time(checkURL);

        $http({
            method: 'GET',
            url: checkURL,
            headers: $rootScope.CONFIG.headers
        }).then(
            function successCallback(response) {
                console.timeEnd(checkURL);
                console.info(
                    'Valid API key in use! ' + JSON.stringify(response.data)
                );
            }, function errorCallback(response) {
                $scope.validApiKey = false;
                console.error('Could not verify API key!');
                console.error(response);
                console.timeEnd(checkURL);
            }
        );

    };


    $scope.requestPasswordReset = function() {
		// sends a request to the API; shows a message if successful
		// OR failed

		$scope.ngHide('requestPasswordResetContainer');
        $scope.ngHide('requestPasswordResetDefaultMessage')
        $scope.ngShow('lanternLoading');

        var reqURL = $scope.APIURL + 'reset_password/request_code';
        console.time(reqURL);

        $http({
            method: 'POST',
            url: $scope.APIURL + "reset_password/request_code",
        	data: {'username': $scope.resetPasswordRequest.email},
        }).then(
			function successCallback(response) {
                console.warn('Password reset request was successful!');
                $scope.resetPasswordRequest.successful = true;
                $scope.ngHide('lanternLoading');
				console.timeEnd(reqURL);
            }, function errorCallback(response) {
                $scope.resetPasswordRequest.badEmail = $scope.resetPasswordRequest.email;
                $scope.ngHide('lanternLoading');
				$scope.ngShow('requestPasswordResetContainer');
				$scope.ngShow('requestPasswordResetErrorMessage');
				console.error('Password reset request was rejected!');
                console.error(response);
				console.timeEnd(reqURL);
            }
        ); 
    };

});
