angular.module('starter.controllers', ['filterModule'])
.controller('chooseStateCtrl',['$scope', '$state', 'kchahiyoServices', 'userAuthServices', '$stateParams',
  function($scope, $state, kchahiyoServices, userAuthServices, $stateParams){
    if(userAuthServices.isSetStateAndCity() && $stateParams.resetLocation == 'false'){
      var location = userAuthServices.getStateAndCity();
      $state.go('tab.dash',{state:location.state, stateShort: location.state_abbr, city:location.city});
      return;
    }

    $scope.country = 'USA';
    $scope.stateChanged = function(stateName){
      $state.go('chooseCity',{stateName:stateName});
    };

    kchahiyoServices.getStatesByCountry($scope.country)
    .then(function(success){
      $scope.states = success.data;
      $scope.dataLoaded = true;
    })
}])
.controller('chooseCityCtrl',['$scope', '$state', '$stateParams', 'kchahiyoServices',
  function($scope, $state, $stateParams, kchahiyoServices){
    $scope.cityChanged = function(stateName, cityName){
      $state.go('tab.dash',{state:stateName, city:cityName});
    }
    $scope.stateName = $stateParams.stateName;
    $scope.city ={};


    kchahiyoServices.getCitiesByState($scope.stateName)
    .then(function(success){
      $scope.counties = success.data;
    }, function(){})
}])
.controller('DashCtrl', ['$scope', 'facebookServices', '$state', '$sce', '$ionicModal', 'userAuthServices', '$stateParams', 'googleMapFactory' ,
  function($scope, facebookServices, $state, $sce, $ionicModal, userAuthServices, $stateParams, googleMapFactory) {

  $scope.state = $stateParams.state;
  $scope.city = $stateParams.city;
  if($scope.state === "" || $scope.city === ""){
    $state.go('chooseState');
    return;
  }
  userAuthServices.setStateAndCity($scope.state, $scope.city);

  googleMapFactory
  .load
  .then(function(success){
    console.log('successfully loadeed');
    $scope.gMapLoaded = true;
  }, function(error){})
}])
.controller('CatPostCtrl', ['$window', '$scope', '$stateParams', 'kchahiyoServices', 'userAuthServices',
  function($window, $scope, $stateParams, kchahiyoServices, userAuthServices) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //

  //$scope.$on('$ionicView.enter', function(e) {
  //});
  var location = userAuthServices.getStateAndCity();
  var catagory = $stateParams.catagory;
  $scope.post = {
    number: 0,
    loadable: true,
    search: false
  }
  $scope.posts = [];
  $scope.search = function(searchText, selectedOption){
    $scope.post.searchText = searchText;
    $scope.post.selectedOption = selectedOption;
    $scope.post.search = true;
    $scope.post.loadable = true;
    $scope.post.number = 0;
    kchahiyoServices.getPostsBySearchtext(catagory, location, 0, searchText, selectedOption)
      .then(function(posts){
        $scope.posts = posts.data;
      })
  }
  $scope.catagory = catagory;
  $scope.postType = 'catPost';
  $scope.postOperations = {
    saveable: true,
    removeable:false
  }

  $scope.loadMorePost = function(){
    if($scope.post.search == true){
      searchText = $scope.post.searchText;
      selectedOption = $scope.post.selectedOption;
      kchahiyoServices.getPostsBySearchtext(catagory, location, $scope.post.number++, searchText, selectedOption)
        .then(function(posts){
          useItems(posts.data);
        })
    }else{
      kchahiyoServices.getPostsByCatagory(catagory, location, $scope.post.number++)
        .then(function(posts){
          useItems(posts.data);
        })
      }
  }

  function useItems(items){
    if(items.length == 0){
      $scope.post.loadable = false;
    }else{
      for(var item in items){
        $scope.posts.push(items[item]);
      }
      $scope.post.loadable = true;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.savePost = function(post){
    userAuthServices
    .watchThisPost(post);
  }
}])
.controller('CatPostDetailCtrl', ['$scope', 'serverAddress', '$ionicSlideBoxDelegate', 'viewFullScreenModal', '$ionicScrollDelegate', '$sce', '$state', '$filter', 'googleMapFactory', '$stateParams', 'kchahiyoServices', 'userAuthServices', function($scope, serverAddress, $ionicSlideBoxDelegate, viewFullScreenModal, $ionicScrollDelegate, $sce, $state, $filter, googleMapFactory, $stateParams, kchahiyoServices, userAuthServices) {
  $scope.serverAddress = serverAddress;
  var postId = $stateParams.postId;
  kchahiyoServices.getPostById(postId)
  .then(function(success){
    $scope.post = success.data;
    if(success.data.attached_images.length > 0){
      $scope.containsImage = true;
      $scope.oldImages = success.data.attached_images.split(',');
    }
  });

  $scope.jobListing = true;
  $scope.savePost = function(post){
    userAuthServices
    .watchThisPost(post);
  }

  $scope.$on('$ionicView.enter', function(){
    $scope.input = {
      hasError: false
    }
  })

 $scope.gMapLoaded = false;
 googleMapFactory.load
  .then(function(success){
    console.log('successfully loadeed');
    $scope.gMapLoaded = true;
  }, function(error){})

  $scope.viewFullScreen = function(index){
    viewFullScreenModal.init($scope, $scope.oldImages)
      .then(function(modal){
        $scope.viewFullScreenModal = modal;
        $scope.modalImages = $scope.oldImages;
        $scope.viewFullScreenModal.show()
          .then(function(){
            $scope.active = index;
          })
      })
    }
}])
.controller('userProfileCtrl', ['$scope', 'serverAddress', 'imageUploader', '$cordovaCamera', '$cordovaFileTransfer', '$ionicScrollDelegate', '$state', '$window', 'userAuthServices', '$ionicHistory',
  function($scope, serverAddress, imageUploader, $cordovaCamera, $cordovaFileTransfer, $ionicScrollDelegate, $state, $window, userAuthServices, $ionicHistory){

  $scope.serverAddress = serverAddress;
  console.log('logged in '+userAuthServices.isUserLoggedIn());
  $scope.$on('$ionicView.enter',function(){
    $scope.userLoggedIn = false;
   if(userAuthServices.isUserLoggedIn()){
     loadUserProfilePage();
   }else {
      console.log('not logged in');
      userAuthServices
      .authenticateThisUser($scope)
      .then(function(success){
        loadUserProfilePage();
        userAuthServices.userLoggedIn();
      },function(error){
        $ionicHistory.goBack();
      });
    }
  })

  function loadUserProfilePage(){
   $scope.userLoggedIn = true;
   if(typeof($scope.postType) == 'undefined'){
    loadUserPosts();
    }else if($scope.postType=='watchedPosts'){
      loadWatchedPosts();
    }else if($scope.postType=="myPosts"){
      loadUserPosts();
    }
  }

  var loadUserPosts = function(){
    $scope.posts = userAuthServices.getUserPosts();
    $scope.userDetails = userAuthServices.getUserDetails();
    var profilePicURL = $scope.userDetails.profilePic;
    if(profilePicURL.substring(0,5) == 'https'){
      $scope.profilePic = $scope.userDetails.profilePic;
    }else{
      $scope.profilePic = serverAddress +'/userProfilePics/' + $scope.userDetails.profilePic;
    }

    $scope.postType = 'myPosts';
    $scope.catagory = 'userProfile';
    $scope.postOperations = {
      removeable: true,
      saveable:false,
      removeWatch:false
    };

    $scope.remove = function(post){
      userAuthServices.deletePost(post);
    }
    $ionicScrollDelegate.scrollTop();
  }

  var loadWatchedPosts = function(){
    userAuthServices
    .getWatchedPosts()
    .then(function(success){
      $scope.postType = 'watchedPosts';
      $scope.posts = success.data;
    })
    $scope.remove = function(post){
      userAuthServices.removeWatchedPost(post).then(function(){
        $scope.posts.splice($scope.posts.indexOf(post),1);
      })
    }
    $ionicScrollDelegate.scrollTop();
  }

  $scope.tabButtons = {
    myPostsTab : loadUserPosts,
    watchingTab : loadWatchedPosts
  }

  $scope.logUserOut = function(){
    userAuthServices.logUserOut()
      .then(function(){
        $state.go('tab.dash');
      }, function(){})
      //$ionicHistory.goBack();
  }

  //profile image;
  $scope.images = Array();
  imageUploader.init.setMaxImagesAllowed(1);

  $scope.removeImageFromView = function(index){
   imageUploader.removeImageFromView(index, $scope.images);
  }

  $scope.showActionSheet = function(context){
    var userId = userAuthServices.getUserDetails().uid;
    imageUploader.showActionSheet(context, true)
      .then(function(imageURIs){
        console.log(imageURIs);
        imageUploader.uploadProfilePic(imageURIs, userId).then(
          function(profilePic){
            $scope.profilePic = serverAddress +'/userProfilePics/' + profilePic.newFileName;
          })
      });
  }

  $scope.urlForImage = function(imageName) {
    var name = imageName.substr(imageName.lastIndexOf('/') + 1);
    var trueOrigin = cordova.file.dataDirectory + "uploads/"+ name;
    return trueOrigin;
  }
}])
.controller('myPostDetailCtrl', ['$filter', 'serverAddress', '$ionicPopup', '$scope', 'viewFullScreenModal', 'googleMapFactory', '$stateParams', 'userAuthServices', 'kchahiyoServices', '$ionicHistory', '$state', 'imageUploader',
  function($filter, serverAddress, $ionicPopup, $scope, viewFullScreenModal, googleMapFactory, $stateParams, userAuthServices, kchahiyoServices, $ionicHistory, $state, imageUploader){
  $scope.editing = false;
  $scope.editable = true;
  $scope.serverAddress = serverAddress;
  var postId = $stateParams.postId;
  $scope.gMapLoaded = false;
  $scope.images = Array();
  $scope.oldImages = Array();

  googleMapFactory.load
  .then(function(success){
    console.log('successfully loadeed');
    $scope.gMapLoaded = true;
  }, function(error){})

  var post = userAuthServices.getPostById(postId);
  $scope.post = post;

  if(post.attached_images.length > 0){
    $scope.oldImages = post.attached_images.split(',');
    console.log(JSON.stringify($scope.oldImages));
    $scope.containsImage = true;
    imageUploader.init.setMaxImagesAllowed(5 - $scope.oldImages.length);
    viewFullScreenModal.init($scope, $scope.oldImages);
  }else{
    imageUploader.init.setMaxImagesAllowed(5);
  }

  $scope.showActionSheet = function(context){
    imageUploader.showActionSheet(context)
      .then(function(imageURIs){
        console.log('here I am');
        while(imageURIs.length > 0)
        $scope.images.push(imageURIs.pop());
      });
  }

  $scope.urlForImage = function(imageName) {
    var name = imageName.substr(imageName.lastIndexOf('/') + 1);
    var trueOrigin = cordova.file.dataDirectory +'uploads/'+ name;
    return trueOrigin;
  }

  function uploadImagesIfAny(postId){
    var deferred = $q.defer();
    var images = $scope.images;
    var folderName = 'uploads';
    imageUploader.uploadImages(postId, images, oldImages, folderName)
    .then(function(){
      $scope.uploadsCompleted = true;
      deferred.resolve('upload completed');
    },function(error){
      deferred.reject('error occured during upload');
    })
    return deferred.promise;
  }

  $scope.postOperations = {
    editPost : function(e){
      $scope.post.content = $filter('addNewLine') ($scope.post.content);
      $scope.editing = true;
    },
    cancelEdit : function(e){
      $scope.editing = false;
    },
    savePost : function(e){
      // post saving done here
      var post = $scope.post;
      var images = $scope.images;
      var oldImages = $scope.oldImages;
      var serverDirectoryName = 'uploads';
      kchahiyoServices.savePost(post)
      .then(function(success){
        console.log(success);
        imageUploader.uploadImages(post.id, images, oldImages, serverDirectoryName)
        .then(function(){
          $scope.uploadsCompleted = true;
          viewFullScreenModal.init($scope, $scope.oldImages);
          $ionicPopup.alert({
            type:'button-assertive',
            title:"Success",
            template:"Post has been saved successfully!"
          })
          $scope.editing = false;
        })


      }, function(error){
        $ionicPopup.alert({
          title:"Error",
          template: "Error, try saving again"
        })
      })
    },
    deletePost : function(){
      $ionicPopup.show({
        title: 'Confirmation',
        template:'Do you want to delete this posting?',
        buttons:[
        {
          type:'button-assertive',
          text:'Yes',
          onTap:function(e){
            userAuthServices.deletePost($scope.post)
            .then(function(success){
              $ionicHistory.goBack();
            }, function(error){})
          }
        },{
          text: 'No'
        }
        ]
      })
    },
    removeImageFromServer: function(image, id){
      imageUploader.removeFileFromServer(id, image)
        .then(function(success){
            console.log("done removal" + success.data)
            $scope.oldImages.splice($scope.oldImages.indexOf(image),1);
        })
    },
    removeImageFromDevice: function(index){
      imageUploader.removeImageFromDevice(index, $scope.images);
    }
  };
}])
.controller('myWatchedPostDetailCtrl', ['$scope', 'userAuthServices', '$stateParams', 'googleMapFactory',
  function($scope, userAuthServices, $stateParams, googleMapFactory){
    var id = $stateParams.id;
    $scope.watched = true;
    $scope.post = userAuthServices.getWatchedPostDetailsById(id);
    console.log($scope.post);

    $scope.gMapLoaded = false;
    googleMapFactory
    .load
    .then(function(success){
      console.log('successfully loadeed');
      $scope.gMapLoaded = true;
    }, function(error){})
}])
.controller('AddPostCtrl', ['$q', '$scope', '$ionicModal','$state', '$ionicActionSheet', 'userAuthServices', 'imageUploader', 'kchahiyoServices', 'googleMapFactory', '$ionicPopup', '$ionicHistory', '$cordovaFile', '$cordovaImagePicker', '$cordovaFileTransfer', '$cordovaCamera',
  function($q, $scope, $ionicModal, $state, $ionicActionSheet, userAuthServices, imageUploader, kchahiyoServices, googleMapFactory, $ionicPopup, $ionicHistory, $cordovaFile, $cordovaImagePicker, $cordovaFileTransfer, $cordovaCamera){
  var location = userAuthServices.getStateAndCity();
  $scope.stateName = location.state;
  $scope.cityName = location.city;
  $scope.images = Array();
  kchahiyoServices.getCitiesByState($scope.stateName)
  .then(function(success){
    $scope.counties = success.data;
  }, function(){})
  
  $ionicModal.fromTemplateUrl('templates/googlePlaces.html',{
    scope: $scope
  }).then(function(modal){
    $scope.googlePlacesModal = modal;
  })

  $scope.closeButtonClicked =function(){
    $scope.googlePlacesModal.hide();
  }

  var loadGoogleMaps = function(){
    googleMapFactory
    .load
    .then(function(success){
      $scope.gMapLoaded = true;
    }, function(error){})
  }

  var loadAddPostPage = function(){
    loadGoogleMaps();
    var userDetails = userAuthServices.getUserDetails();
    $scope.post = {
      username : userDetails.first_name+' '+ userDetails.last_name,
      email : userDetails.email,
      uniqueId : userDetails.unique_id,
      location : {},
      doNotUseFullAddress : false,
    };
    $scope.userLoggedIn = true;
  }

  $scope.$on('$ionicView.enter', function(){
    userAuthServices
    .authenticateThisUser($scope)
    .then(function(success){
      loadAddPostPage();
    },function(error){
      $ionicHistory.goBack();
    });
  })

  $scope.postOperations ={
    catagorySelected :function(e){
      if(e != ""){
        kchahiyoServices.getSubCatagories(e)
        .then(function(success){
         $scope.subCatagories = success;
       }, function(error){})
      }
    },
    zipCodeUpdated : function(e){
      if(e.toString().length == 5){
        $scope.cityLoading = true;
        kchahiyoServices
        .getCityByZip(e)
        .then(function(success){
          $scope.post.location.city = success.data.content.city;
          $scope.post.location.post_state = success.data.content.state;
          $scope.post.location.lng = parseFloat(success.data.content.longitude);
          $scope.post.location.lat = parseFloat(success.data.content.latitude);
          $scope.cityLoading = false;
        }, function(error){});
      }
    },
    savePostClicked : function(e){

      if(typeof(e.$error.required) != "undefined" && e.$error.required.length > 0){
        $scope.input = {
          hasError: true
        }
      }else if(typeof($scope.post.place)=='undefined'){
        $scope.invalidAddress = true;
      }
      else if($scope.post.doNotUseFullAddress){
        console.log($scope.post);
      }else{
        var postLocation = $scope.post.place;
        var addressPieces  = $scope.post.place.formatted_address.split(',');

        $scope.post.location= {
          lat : postLocation.geometry.location.lat(),
          lng : postLocation.geometry.location.lng(),
          street_address : addressPieces[0].trim(),
          city : addressPieces[1].trim(),
          post_state : addressPieces[2].trim().split(' ')[0],
          zip_code : parseInt(addressPieces[2].trim().split(' ')[1])
        };

        insertPost($scope.post);
      }

      function insertPost(post){
        kchahiyoServices
        .insertPost(post)
        .then(function(success){
          uploadImagesIfAny(success.data)
          .then(function(){
            $ionicPopup.alert({
              title: 'Success',
              template:'Successfully Posted!',
              buttons:[{
                text: 'ok',
                onTap:function(){
                  $ionicHistory.goBack();
                }
              }]
            });
          })
        }, function(error){
          $ionicPopup.alert({
            title: 'Failure',
            template:'Error has occured, try again!'
          });
        })
      }

      function uploadImagesIfAny(postId){
        var deferred = $q.defer();
        var images = $scope.images;
        var uploadedImages = Array();
        imageUploader.uploadImages(postId, images, uploadedImages, 'uploads')
        .then(function(){
          $scope.uploadsCompleted = true;
          deferred.resolve('upload completed');
        },function(error){
          deferred.reject('error occured during upload');
        })
        return deferred.promise;
      }
    }
  }

  imageUploader.init.setMaxImagesAllowed(5);

  $scope.removeImageFromView = function(index){
   imageUploader.removeImageFromView(index, $scope.images);
  }

  $scope.showActionSheet = function(context){
    imageUploader.showActionSheet(context)
      .then(function(imageURIs){
        while(imageURIs.length > 0)
        $scope.images.push(imageURIs.pop());
      });
  }

  $scope.urlForImage = function(imageName) {
    var name = imageName.substr(imageName.lastIndexOf('/') + 1);
    var trueOrigin = cordova.file.dataDirectory + "uploads/"+ name;
    return trueOrigin;
  }
}])
.controller('AboutCtrl',['$scope', function($scope){
  //about Page code
}])
