app.controller('DashCtrl', ['$scope','$state','configs','kchahiyoServices','$ionicLoading','$rootScope','geoServices',
  function ($scope, $state, configs, kchahiyoServices, $ionicLoading, $rootScope, geoServices) {

    $rootScope.$broadcast("loadingStarted");

    $scope.chooseCountry = function(){
      geoServices.resetGeoParameters();
      $state.go('chooseCountry');
    };

    if ($scope.state === '' || $scope.city === '') {
      $state.go('chooseCountry');
      return;
    }

    kchahiyoServices.getPostCatagories()
      .then(function(success){
          $rootScope.$broadcast('loadingCompleted');
          $scope.catagoryNames = success.catagories;
          $scope.getDashboardIconName = function(catagoryName){
            return success.catagoryObject[catagoryName].iconName;
          };

          $scope.getCatagoryPageHref = function(catagoryName){
              return success.catagoryObject[catagoryName].href;
          };
        });

    $scope.getBreadCrumb = function(){
      var breadCrumb = " ", country = configs.country();
      configs.geoDivision[country].forEach(function(item){
        breadCrumb += localStorage.getItem(item) + ", ";
      });

      return breadCrumb.substring(0, breadCrumb.length-2);
    };
}])
