app.controller('postsWithThumbnailCtrl', [
  '$window',
  '$scope',
  '$stateParams',
  'kchahiyoServices',
  'userAuthServices',
  'configs',
  'serverAddress',
  function ($window, $scope, $stateParams, kchahiyoServices, userAuthServices, configs, serverAddress){
    var location = userAuthServices.getStateAndCity();

    var catagory = $stateParams.catagory;

    var country = configs.country();

    $scope.unit = configs.currencyUnit[country];

    $scope.post = {
      number: 0,
      loadable: true,
      search: false
    };

    $scope.posts = [];

    $scope.search = function (searchText, selectedOption) {
      $scope.post = {
        searchText : searchText == undefined?'': searchText.trim(),
        selectedOption : selectedOption,
        search : true,
        loadable : true,
        number : 0
      }

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
    }

    $scope.loadMorePost = function () {
      console.log('infiniteScroll got called');
      if ($scope.post.search === true) {
        searchText = $scope.post.searchText;
        selectedOption = $scope.post.selectedOption;
        kchahiyoServices
          .getPostsBySearchtext(catagory, location, $scope.post.number++, searchText, selectedOption)
            .then(function (posts) {
              useItems(posts.data);
            });
      } else {
        kchahiyoServices.getPostsByCatagory(catagory, location, $scope.post.number++)
          .then(function (posts) {
            useItems(posts.data);
          });
        }
    };

    $scope.doRefresh = function(){
      kchahiyoServices.getPostsByCatagory(catagory, location, 0)
        .then(function (posts) {
          $scope.posts = posts.data;
        }).finally(function() {
           $scope.$broadcast('scroll.refreshComplete');
         });
    }

    $scope.getTitleImage = function(post){
      if(post.attached_images.trim().length != 0){
        var attached_images = post.attached_images.split(",");
        var title_image_id = post.title_image;
        return serverAddress + "/uploads/thumbs/thumb_"+attached_images[title_image_id];
      }else{
        return serverAddress + "/images/no-image-available.png";
      }
    };

    $scope.savePost = function (post) {
      userAuthServices.watchThisPost(post);
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

}])
