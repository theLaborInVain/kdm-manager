app.controller('newSettlementController', function($scope, $rootScope, $http) {

    //
    //  methods
    //

    $scope.setNewSettlementName = function() {
        // settlement name is captured in a div, which doesn't work with
        // ng-model. thus and so, we do this instead.
        var newName = document.getElementById('newSettlementName').innerHTML;
        $scope.newSettlement.name = newName;
        if (newName === "") {
            $scope.newSettlement.name = null;
        };        
    };

    $scope.toggleAttrib = function(type, handle) {
        // elements such as 'macros' and 'expansions' are lists; this is a
        // generic method for 'toggling' an item on or off of those lists
        var index = $scope.newSettlement[type].indexOf(handle);
        if (index == -1) {
            $scope.newSettlement[type].push(handle);
        } else {
            $scope.newSettlement[type].splice(index, 1);
        };
    };


    $scope.createSettlement = function() {
        // the main event: this is where we submit the request to the API's
        // /new/settlement endpoint and then simulate a HTML form POST to
        // change the view

        console.time('createSettlement()');

        // do UI stuff
        $scope.showFullPageLoader();

        // get auth header
        //var config = {"headers": {"Authorization": $scope.jwt}};
        var config = {
            "headers": {
                "Authorization": $scope.jwt,
                'API-Key': $scope.api_key
            }
        };

        // create the URL and do the POST
        var url = $scope.api_url + "new/settlement";
        var creationPromise = $http.post(url, $scope.newSettlement, config); 

        creationPromise.success(function(data, status, headers, config) {
            var newSettlementId = data.sheet._id.$oid;
            $scope.postForm('view_campaign', newSettlementId);
            console.timeEnd('createSettlement()');
        });
        creationPromise.error(function(data, status, headers, config) {
            console.error('New settlement creation failed!');
            $rootScope.showAPIerrorModal(data, config.url, true);
            console.timeEnd('createSettlement()');
            console.error(data);
        });
    };
});
