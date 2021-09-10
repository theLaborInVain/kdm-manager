"use strict";

app.controller("survivorSheetController", function($scope, $rootScope, $http) {


    // name methods

    $scope.initSurvivorNameObject = function() {

        $scope.survivorNameObject = {'first': null, 'middle': null, 'last': null};

        var nameList = $scope.survivor.sheet.name.split(' ');
        for(var i = nameList.length - 1; i >= 0; i--) {
            if(nameList[i] === undefined) {
                nameList.splice(i, 1);
            } else if (nameList[i] === null) {
                nameList.splice(i, 1);
            }
        }

        // first name
        $scope.survivorNameObject.first = nameList[0];

        // middle name
        $scope.survivorNameObject.middle = undefined;
        if (nameList.length > 2) {
            $scope.survivorNameObject.middle = nameList.slice(1, nameList.length - 1).join(' ')
        };

        // last name
        $scope.survivorNameObject.last = undefined;
        if (nameList.length > 1) {
            $scope.survivorNameObject.last = nameList[nameList.length - 1]
        };

    };

    $scope.randomSurvivorName = function() {
        // sets the first name to a random name based on sex
        $scope.initSurvivorNameObject();
        $scope.survivorNameObject.first = $scope.randomNames[$scope.survivor.sheet.sex][Math.floor(Math.random() * $scope.randomNames[$scope.survivor.sheet.sex].length)];
        $scope.renderSurvivorName();
    };

    $scope.randomSurvivorSurname = function() {
        // sets the last name to a random name
        $scope.initSurvivorNameObject();
        $scope.survivorNameObject.last = $scope.randomSurnames[Math.floor(Math.random() * $scope.randomSurnames.length)];
        $scope.renderSurvivorName();
    };

    
    $scope.renderSurvivorName = function() {
        // dumps the $scope.survivorNameObject to $scope.survivor.sheet.name as
        // a str with .trim()
        var nameList = [];
        nameList.push($scope.survivorNameObject.first);
        nameList.push($scope.survivorNameObject.middle);
        nameList.push($scope.survivorNameObject.last);
        $scope.survivor.sheet.name = nameList.join(" ");
    };


    $scope.revertSurvivorName = function() {
        $scope.survivor.sheet.name = $scope.scratch.survivorOriginalName;
        console.warn('Survivor name reverted to original!');
    };


    // helpers and backgrounders

    $scope.setRandomNames = function() {
        var namesReqUrl = $rootScope.APIURL + 'get_random_names/' + 50;
        var namesPromise = $http.get(namesReqUrl, $rootScope.CONFIG);
        console.time(namesReqUrl);

        namesPromise.then(
            function(payload) {
                $scope.randomNames = payload.data;
                console.timeEnd(namesReqUrl);
            },
                function(errorPayload) {
                console.error("Failed to get random names!");
                console.error(errorPayload);
                console.timeEnd(namesReqUrl);
            }
        );

        var surnamesReqUrl = $rootScope.APIURL + 'get_random_surnames/' + 50;
        var surnamesPromise = $http.get(surnamesReqUrl, $rootScope.CONFIG);
        console.time(surnamesReqUrl);

        surnamesPromise.then(
            function(payload) {
                $scope.randomSurnames = payload.data;
                console.timeEnd(surnamesReqUrl);
            },
                function(errorPayload) {
                console.error("Failed to get random surnames!");
                console.error(errorPayload);
                console.timeEnd(surnamesReqUrl);
            }
        );


    };


    $scope.init = function() {
        console.warn('Initializing Survivor Sheet controller...');
        $scope.setRandomNames();
    };

    $scope.init();


}); // survivorSheetController ends
