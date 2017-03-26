app.controller('chooseCountryCtrl', ['$scope', '$state', 'configs', '$ionicSlideBoxDelegate', '$ionicPlatform', 'userAuthServices', '$timeout',
  function($scope, $state, configs, $ionicSlideBoxDelegate, $ionicPlatform, userAuthServices, $timeout){
    var country = configs.country();
    $scope.selectedCountry = country;

    $scope.countrySelected = function(country){
      var nextPage = configs.geoDivision[country][0];
      var state = "choose"+ nextPage[0].toUpperCase() + nextPage.substring(1);
      localStorage.setItem("country", country);
      console.log(country);
      $state.go(state);
    };

    $scope.slideHasChanged = function($index){
      country = configs.flags[$index];
      $scope.selectedCountry = country;
      localStorage.setItem("country", country);
    };

    if (userAuthServices.isSetStateAndCity() === true) {
      var location = userAuthServices.getStateAndCity();
      $state.go('tab.dash');
      return;
    }

    var flagIndex = function(){
      return configs.flags.indexOf(country);
    };

    $ionicPlatform
      .ready()
      .then(function(success){
          $ionicSlideBoxDelegate.slide(flagIndex());
        }, function(error){
          console.log(error);
        }
    );
  }
])
