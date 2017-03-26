kchahiyoServices.service('geoServices', ['$window',
  function($window){
    this.resetGeoParameters = function(){
      console.log('here in resetGeoParameters');
      if($window.localStorage.getItem('country') != null){
        $window.localStorage.removeItem('country');
      }
      if($window.localStorage.getItem('stateName') != null){
        $window.localStorage.removeItem('stateName');
      }
      if($window.localStorage.getItem('cityName') != null){
        $window.localStorage.removeItem('cityName');
      }
    }
}])
