app.controller('CatPostCtrl', ['$window','$scope','$stateParams','kchahiyoServices','userAuthServices','configs','$rootScope',
  function ($window, $scope, $stateParams, kchahiyoServices, userAuthServices, configs, $rootScope) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $rootScope.$broadcast("loadingStarted");
    var location = userAuthServices.getStateAndCity();
    var catagory = $stateParams.catagory;
    $scope.post = {
      number: 0,
      loadable: true,
      search: false
    };
    $scope.posts = [];
    $scope.search = function (searchText, selectedOption) {
      $scope.post = {
        searchText : searchText === undefined?'': searchText.trim(),
        selectedOption : selectedOption,
        search : true,
        loadable : true,
        number : 0
      };

      $scope.posts = [];
      $scope.loadMorePost();
    };
    $scope.catagory = catagory;
    $scope.postType = 'catPost';
    $scope.postOperations = {
      saveable: true,
      removeable: false
    };
    $scope.filterDisplaySwitch = function(filterName){
      var country = localStorage.getItem('country');
      if(configs.filter[filterName].indexOf(country) != -1){
        return true;
      }
    };
    $scope.loadMorePost = function () {
      if ($scope.post.search === true) {
        searchText = $scope.post.searchText;
        selectedOption = $scope.post.selectedOption;
        kchahiyoServices
          .getPostsBySearchtext(catagory, location, $scope.post.number++, searchText, selectedOption)
            .then(function (posts) {
              $rootScope.$broadcast("loadingCompleted");
              useItems(posts.data);
            },function(err){
              console.log("not loaded");
            });
      } else {
        kchahiyoServices.getPostsByCatagory(catagory, location, $scope.post.number++)
          .then(function (posts) {
            $rootScope.$broadcast("loadingCompleted");
            useItems(posts.data);
          });
        }
    };
    $scope.$on('$stateChangeSuccess', function() {
      $scope.loadMorePost();
    });
    $scope.doRefresh = function(){
      kchahiyoServices.getPostsByCatagory(catagory, location, 0)
        .then(function (posts) {
          $scope.posts = posts.data;
        }).finally(function() {
           $scope.$broadcast('scroll.refreshComplete');
         });
    };
    kchahiyoServices.getPostCatagories()
      .then(function(success){
          $scope.catagories = success.catagories;
          $scope.subCatagories = Object.keys(success.subCatagories[catagory].subCatagories);
        }, function(error){
          console.log("error while pulling the catagories, retrying");
        }
      );
    function useItems(items) {
      if (items.length === 0) {
        $scope.post.loadable = false;
      } else {
        for (var item in items) {
          $scope.posts.push(items[item]);
        }
        $scope.post.loadable = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }
    $scope.savePost = function (post) {
      console.log('here we are');
      userAuthServices.watchThisPost(post);
    };
  }
])
