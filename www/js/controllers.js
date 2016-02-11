angular.module('starter.controllers', ['filterModule'])

.controller('DashCtrl', function($scope, kchahiyoServices, googleMapFactory) {
 googleMapFactory
      .load
        .then(function(success){
          console.log('successfully loadeed');
        }, function(error){})

 /* kchahiyoServices
    .getPostsByCatagory('Jobs')
      .then(function(success){
        console.log(success.data);
      }, function(error){

      })

  // tested successfully, inserts posts into database 
  // only if there is a match in 'user table' for the given
  //'email' and 'password'

  kchahiyoServices.insertPost('nishchal.pandeya@mavs.uta.edu',               // email,
                                  'pandey',                                 // password,
                                  'awesome title',                          // title,
                                  'awesome content',                        // content,
                                  'Jobs',                                   // catagory,
                                  'mall',                                   // sub_catagory,
                                  '75062',                                  // post_zip,
                                  'Dallas',                                 // post_city,
                                  'dallas / fort worth');                   // post_near_city)
  */
})

.controller('ChatsCtrl', function($scope,$stateParams,kchahiyoServices, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  var catagory = $stateParams.catagory;

  kchahiyoServices
    .getPostsByCatagory(catagory)
      .then(function(success){
        $scope.posts = success.data;
        console.log(success.data);
      }, function(error){

      })
  /*$scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };*/
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  /*$scope.settings = {
    enableFriends: true
  };*/

  var map = new google.maps.Map(document.getElementById('map'), {
                        center: {lat: -34.397, lng: 150.644},
                        zoom: 8,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                      });

})
.controller('AddPostCtrl',function($scope, kchahiyoServices, googleMapFactory){
  kchahiyoServices
  .getPostCatagories()
    .then(function(success){
         var payload = success.data;
        if(payload.status == 'success'){
          $scope.catagoryAndSubCatagories = payload.content;
        }
      }, function(error){

      });
    /*googleMapFactory
      .load()
        .then(function(success){
          console.log('successfully loadeed');
        }, function(error){})*/
})
