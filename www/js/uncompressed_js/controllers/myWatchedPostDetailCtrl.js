app.controller('myWatchedPostDetailCtrl', [
  '$scope',
  'serverAddress',
  'viewFullScreenModal',
  'userAuthServices',
  '$stateParams',
  'googleMapFactory',
  function ($scope, serverAddress, viewFullScreenModal, userAuthServices, $stateParams, googleMapFactory) {
    console.log('in myWatchedPostDetailCtrl');
    var id = $stateParams.id;
    $scope.watched = true;
    $scope.post = userAuthServices.getWatchedPostDetailsById(id);
    $scope.oldImages = [];
    $scope.serverAddress = serverAddress;
    console.log(JSON.stringify($scope.post));
    if ($scope.post.attached_images.length > 0) {
      $scope.oldImages = $scope.post.attached_images.split(',');
    }

    console.log(JSON.stringify($scope.oldImages));

    $scope.gMapLoaded = false;
    googleMapFactory.load.then(function (success) {
      console.log('successfully loadeed');
      $scope.gMapLoaded = true;
    }, function (error) {
    });

    $scope.getUserPic = function(picLink){
      if(picLink !== null ){
        if(picLink.substring(0,5)== "https"){
          return picLink;
        }else{
          return serverAddress+'/userProfilePics/thumbs/thumb_' + picLink;
        }
      }
    }

    $scope.viewFullScreen = function (index) {
      viewFullScreenModal.init($scope, $scope.oldImages).then(function (modal) {
        $scope.viewFullScreenModal = modal;
        $scope.modalImages = $scope.oldImages;
        $scope.viewFullScreenModal.show().then(function () {
          $scope.active = index;
        });
      });
    };
  }
])
