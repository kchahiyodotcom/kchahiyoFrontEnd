app.controller('watchedPostsCtrl', ['userAuthServices','$scope',
  function(userAuthServices, $scope){
  console.log('here you goo');
  userAuthServices.getWatchedPosts().then(function (success) {
    $scope.posts = success.data;
    $scope.postType = 'watchedPosts';
    $scope.catagory = 'userProfile';
  });
}])
