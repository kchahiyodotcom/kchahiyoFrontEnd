angular.module('starter.controllers', ['filterModule'])
.controller('chooseStateCtrl', function($scope, $state, kchahiyoServices, userAuthServices, $stateParams){
  $scope.country = 'USA';

  $scope.stateChanged = function(stateName){
    $state.go('chooseCity',{stateName:stateName});
  }

  if(userAuthServices.isSetStateAndCity() && $stateParams.resetLocation == 'false'){
    var location = userAuthServices.getStateAndCity();
    console.log(location);
    $state.go('tab.dash',{state:location.state, stateShort: location.state_abbr, city:location.city});
    return;
  }
    kchahiyoServices.getStatesByCountry($scope.country)
      .then(function(success){
        $scope.states = success.data;
        $scope.dataLoaded = true;
    })

})
.controller('chooseCityCtrl', function($scope, $state, $stateParams, kchahiyoServices){
  $scope.stateName = $stateParams.stateName;
  $scope.city ={};

  $scope.cityChanged = function(stateName, cityName){
    $state.go('tab.dash',{state:stateName, city:cityName});
  }

  kchahiyoServices.getCitiesByState($scope.stateName)
    .then(function(success){
      $scope.counties = success.data;
    }, function(){})
})
.controller('DashCtrl', function($scope, $state, userAuthServices, $stateParams, googleMapFactory) {
   $scope.state = $stateParams.state;
   $scope.city = $stateParams.city;
   if($scope.state == "" || $scope.city == ""){
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

})

.controller('myWatchedPostDetailCtrl', function($scope, userAuthServices, $stateParams, googleMapFactory){
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
})
.controller('userProfileCtrl', function($scope, Camera, $cordovaFileTransfer, $ionicScrollDelegate, $state, $window, userAuthServices, $ionicHistory){
  
  var loadUserPosts = function(){
    $scope.posts = userAuthServices.getUserPosts();
    $scope.userDetails = userAuthServices.getUserDetails();
    $scope.postType = 'myPosts';
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

  var loadUserProfilePage = function(){
   $scope.isUserLoggedIn = true;
   if(typeof($scope.postType) == 'undefined'){
    loadUserPosts();
   }else if($scope.postType=='watchedPosts'){
    loadWatchedPosts();
   }else if($scope.postType=="myPosts"){
    loadUserPosts();
   }
  }
  $scope.$on('$ionicView.enter',function(){
    userAuthServices
      .authenticateThisUser($scope)
        .then(function(success){
          loadUserProfilePage();
        },function(error){
          $ionicHistory.goBack();
        });    
  })
  
  var fileUpload = function(targetPath){
    // Destination URL 
     var url = "http://www.cinemagharhd.com/k-chahiyo/php/imageUploader.php";
      console.log('trager path '+targetPath);
     //File for Upload
     //var targetPath = cordova.file.externalRootDirectory + "logo_radni.png";
      
     // File name only
     /*var filename = targetPath.split("/").pop();
      console.log(filename + " thisisisisisisisisisisisisi");
     var options = {
          fileKey: "file",
          fileName: filename,
          chunkedMode: false,
          mimeType: "image/jpg",
          params : {'directory':'upload', 'fileName':filename}
      };
           
      $cordovaFileTransfer.upload(url, targetPath, options).then(function (result) {
          console.log("SUCCESS: " + JSON.stringify(result.response));
          alert("SUCCESS: " + JSON.stringify(result.response));
      }, function (err) {
          console.log("ERROR: " + JSON.stringify(err));
      }, function (progress) {
          // PROGRESS HANDLING GOES HERE
      });*/
  }
  var options = {
   maximumImagesCount: 10,
   width: 800,
   height: 800,
   quality: 80
  };


  $scope.uploadPic = function(){
    $window.imagePicker.getPictures(
      function (results) {
        for (var i = 0; i < results.length; i++) {
          console.log('Image URI: ' + results[i]);
          fileUpload(results[i]);
        }
      }, function(error) {
        // error getting photos
      },options);
  }

  $scope.cameraCapture = function(){
    Camera.getPicture({
      quality: 75,
      targetWidth: 320,
      targetHeight: 320,
      saveToPhotoAlbum: false
    }).then(function(imageURI) {
      console.log('asdfasddddddddddddddddddddddddddddddddddddddddddddddddddddddddd00000000000000000000000000000000000000000000000000' + imageURI);
      console.log(imageURI);
      fileUpload(imageURI);
      $scope.lastPhoto = imageURI;
    }, function(err) {
      console.log('erererereererererereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
      console.err(err);
    });
  }
  


  $scope.logUserOut = function(){
      userAuthServices.logUserOut()
        .then(function(){
          $state.go('tab.dash');
        }, function(){})
      //$ionicHistory.goBack();
    }
})
.controller('CatPostCtrl', function($window, posts, $scope,$stateParams,kchahiyoServices, userAuthServices) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.posts = posts.data;
  $scope.postType = 'catPost';
  $scope.postOperations = {
    saveable: true, 
    removeable:false
  };

  $scope.savePost = function(post){
    userAuthServices
      .watchThisPost(post); 
  }
})

.controller('CatPostDetailCtrl', 
  function($scope, $state, $filter, googleMapFactory, $stateParams, kchahiyoServices, userAuthServices) {
    var postId = $stateParams.postId;
    kchahiyoServices.getPostById(postId)
      .then(function(success){
        $scope.post = success.data
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
    googleMapFactory
        .load
          .then(function(success){
            console.log('successfully loadeed');
            $scope.gMapLoaded = true;
          }, function(error){})
  })

.controller('myPostDetailCtrl', function($filter, $ionicPopup, $scope, googleMapFactory, $stateParams, userAuthServices, kchahiyoServices, $ionicHistory, $state){
  $scope.editing = false;
  $scope.editable = true;
  var postId = $stateParams.postId;
  $scope.gMapLoaded = false;
  googleMapFactory
    .load
      .then(function(success){
          console.log('successfully loadeed');
          $scope.gMapLoaded = true;
        }, function(error){})

  $scope.post = userAuthServices.getPostById(postId);
      console.log(postId);
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
      kchahiyoServices.savePost($scope.post)
        .then(function(success){
          $ionicPopup.alert({
            type:'button-assertive',
            title:"Success",
            template:"Post has been saved successfully!"
          })
          $scope.editing = false;
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
    }
  };
})


.controller('AddPostCtrl',function($scope, $state, userAuthServices, kchahiyoServices, googleMapFactory, $ionicPopup, $ionicHistory){
  var location = userAuthServices.getStateAndCity();
  $scope.stateName = location.state;
  $scope.cityName = location.city;

  kchahiyoServices.getCitiesByState($scope.stateName)
    .then(function(success){
      $scope.counties = success.data;
    }, function(){})


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
            console.log(success.data);
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
          }, function(error){
            $ionicPopup.alert({
              title: 'Failure',
              template:'Error has occured, try again!'
            });
        })
      }
    }
  }

})
.controller('AboutCtrl', function($scope){

})
