angular.module('starter.controllers', ['filterModule'])
.controller('chooseStateCtrl', function($scope, $state, kchahiyoServices, userAuthServices, $stateParams){
  $scope.country = 'USA';
  if(userAuthServices.isSetStateAndCity() && $stateParams.resetLocation == 'false'){
    var location = userAuthServices.getStateAndCity();
    $state.go('tab.dash',{state:location.state, stateShort: location.state_abbr, city:location.city});
    return;
  }
    kchahiyoServices.getStatesByCountry($scope.country)
      .then(function(success){
        $scope.states = success.data;
        $scope.dataLoaded = true;
    })

})
.controller('chooseCityCtrl', function($scope, $stateParams, kchahiyoServices){
  $scope.stateName = $stateParams.stateName;
  $scope.city ={};

  kchahiyoServices.getCitiesByState($scope.stateName)
    .then(function(success){
      $scope.counties = success.data;
    }, function(){})
})
.controller('DashCtrl', function($scope, userAuthServices, $stateParams) {
   $scope.state = $stateParams.state;
   $scope.city = $stateParams.city;
   userAuthServices.setStateAndCity($scope.state, $scope.city);
})
.controller('loginCtrl', function($scope, $state, userAuthServices){
     
  })
.controller('userProfileCtrl', function($scope, $state, $window, userAuthServices, $ionicHistory){
  var loadUserProfilePage = function(){
    var loadUserPost = function(){
      $scope.myPosts = userAuthServices.getUserPosts();
      $scope.show = {myPosts : true};
      $scope.ui = {};
      $scope.ui.tabview = 'templates/tab-myPosts.html'; 
      $scope.isUserLoggedIn = true;
      $scope.remove = function(post){
        userAuthServices.deletePost(post);
      }
    }

    var loadWatchedPosts = function(){
      userAuthServices
        .getWatchedPosts()
        .then(function(success){
          $scope.watchedPosts = success.data;
        })
        $scope.removeWatchedPost = function(post){
          userAuthServices.removeWatchedPost(post).then(function(){
            $scope.watchedPosts.splice($scope.watchedPosts.indexOf(post),1);
          })
        }
    }
    loadUserPost();
    loadWatchedPosts();
  }

  var options = {
   maximumImagesCount: 10,
   width: 800,
   height: 800,
   quality: 80
  };

  $window.imagePicker.getPictures(
    function (results) {
      for (var i = 0; i < results.length; i++) {
        console.log('Image URI: ' + results[i]);
      }
    }, function(error) {
      // error getting photos
    },options);

  $scope.$on('$ionicView.enter', function(){
    userAuthServices
      .authenticateThisUser($scope)
        .then(function(success){
          loadUserProfilePage();
        },function(error){
          $ionicHistory.goBack();
        });
  })

  $scope.logUserOut = function(){
      userAuthServices.logUserOut()
        .then(function(){
          $state.go('tab.dash');
        }, function(){})
      //$ionicHistory.goBack();
    }
})
.controller('CatPostCtrl', function($window, $scope,$stateParams,kchahiyoServices, userAuthServices) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $scope.searchtext = {};
  $scope.selectedOption = "Title";
  $scope.catagory = $stateParams.catagory;
  var location = userAuthServices.getStateAndCity();

  kchahiyoServices
    .getPostsByCatagory($scope.catagory, location)
      .then(function(success){
        $scope.posts = success.data;
      }, function(error){})
})

.controller('CatPostDetailCtrl', 
  function($scope, $state, googleMapFactory, $stateParams, kchahiyoServices, userAuthServices) {
    var postId = $stateParams.postId;
    $scope.post = kchahiyoServices.getPostById(postId);
    $scope.watchThisPost = function(index){
      userAuthServices
        .watchThisPost(index);
        
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

.controller('myPostDetailCtrl', function($ionicPopup, $scope, googleMapFactory, $stateParams, userAuthServices, kchahiyoServices, $ionicHistory, $state){
  $scope.editing = false;
  $scope.editable = true;
  var id = $stateParams.id;
  $scope.gMapLoaded = false;
  googleMapFactory
    .load
      .then(function(success){
          console.log('successfully loadeed');
          $scope.gMapLoaded = true;
        }, function(error){})

  $scope.post = userAuthServices.getPostById(id);
      console.log(id);
  $scope.postOperations = {
    editPost : function(e){
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


.controller('AccountCtrl', function($scope) {

})
.controller('userProfileMyPostsCtrl', function () {
  // body...
  alert('boom works');
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
