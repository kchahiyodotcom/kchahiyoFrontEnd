kchahiyoServices.factory('googleMapFactory', ['$q','$window',
  function($q, $window){
    var loaded = false;
    var deferred = $q.defer();

    $window.initMap = function(){
      if(!loaded){
        loaded = true;
        console.log('loaded googleMapFactory');
        deferred.resolve(document.getElementsByClassName('pac-container'));
      }
    };

    var tag = document.createElement('script');
    tag.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAZv-6hTAT3JfRWLaWiGvadnYvpsjR3DeU&libraries=places&callback=initMap";
    tag.async = true;
    var lastScriptTag = document.getElementsByTagName('script')[0];
    lastScriptTag.parentNode.appendChild(tag);
    return {
      load: deferred.promise
    };
}])
