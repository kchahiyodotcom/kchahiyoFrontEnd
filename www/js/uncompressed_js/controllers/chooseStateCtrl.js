app.controller('chooseStateCtrl', ['$scope','$state','kchahiyoServices','userAuthServices','$stateParams','configs','$rootScope',
  function ($scope, $state, kchahiyoServices, userAuthServices, $stateParams, configs, $rootScope) {
    $rootScope.$broadcast("loadingStarted");
    var country = configs.country();
    console.log(country);

    $scope.stateChanged = function (stateName) {
      console.log(stateName);
      localStorage.setItem('state', stateName);
      $state.go('chooseCity', { stateName: stateName });
    };

    kchahiyoServices
      .getStatesByCountry(country)
        .then(function (success) {
               $rootScope.$broadcast("loadingCompleted");
                $scope.states = success.data;
                $scope.dataLoaded = true;
              });
  }
])
