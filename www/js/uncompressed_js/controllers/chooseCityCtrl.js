app.controller('chooseCityCtrl', ['$scope', '$state', '$stateParams', 'kchahiyoServices', 'configs', '$rootScope',
   function ($scope, $state, $stateParams, kchahiyoServices, configs, $rootScope) {
     //$rootScope.$broadcast("loadingStarted");
     $scope.searchText = "";
    $scope.cityChanged = function (cityName) {
      localStorage.setItem('city', cityName);
      $state.go('tab.dash');
    };

    $scope.stateName = $stateParams.stateName;
    $scope.city = {};

    var country = configs.country();
    console.log(configs.geoDivision[country].indexOf("state"));
    if(configs.geoDivision[country].indexOf("state") != -1){

      kchahiyoServices
        .getCitiesByState($scope.stateName)
        .then(function (success) {
                //$rootScope.$broadcast("loadingCompleted");
                $scope.counties = success.data;
                $scope.loaded = true;
              });
    }else{
      kchahiyoServices
        .getCitiesByCountry(country)
        .then(function(success){
                    $rootScope.$broadcast("loadingCompleted");
                    $scope.counties = success.data;
                }, function (error){
                    alert(error.data);
                    console.error(error.data);
                    console.error(error.status);
                });
    }
  }
])
