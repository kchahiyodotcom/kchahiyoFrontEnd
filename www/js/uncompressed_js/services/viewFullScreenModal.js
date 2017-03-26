kchahiyoServices.service('viewFullScreenModal', ['$ionicModal','$ionicScrollDelegate',
  function($ionicModal,$ionicScrollDelegate){
    this.init = function($scope, images){

      $scope.slideHasChanged = function(index){
        $ionicScrollDelegate.$getByHandle('scrollHandle'+index).zoomTo(1);
        $scope.active = index;
      };

      $scope.closeModal = function(){
        $scope.viewFullScreenModal.hide();
      };

      $scope.$on('$destory', function(){
        $scope.viewFullScreenModal.remove();
      });

      return $ionicModal.fromTemplateUrl('templates/modal-image.html', {
        scope: $scope
      });
  };
}]);
