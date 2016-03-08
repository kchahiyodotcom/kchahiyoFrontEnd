angular.module('starter.controllers', ['filterModule'])

.controller('DashCtrl', function($state, $window, $scope, kchahiyoServices, $ionicPopup) {
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
.controller('loginCtrl', function($scope, $state, userAuthServices){
     
  })
.controller('myPostsCtrl', function($scope, $state, $window, userAuthServices, $ionicHistory, kchahiyoServices){
  
  /*
  $ionicModal.fromTemplateUrl('templates/tab-login.html',{
    scope: $scope
  }).then(function(modal){
    $scope.loginModal = modal;
  })
  
  $scope.$on('$ionicView.enter', function(){
  var showUserPost = function(){
    $scope.myPosts = userAuthServices.getUserPosts();
    $scope.show = {};
        $scope.show.myPosts = true;
        $scope.ui = {};
        $scope.ui.tabview = 'templates/tab-myPosts.html'; 
  }

  var promptUserForUNamePass = function(){
                  $scope.loginModal.show();
                  $scope.user = {};
                  $scope.login = function(){
                            var onSuccess = function(status){
                                            if(status == 'success'){
                                                $scope.loginModal.hide();
                                                //show an alert also .....
                                                //.... and populate the page//
                                                showUserPost();
                                            }
                                          }
                            var onError = function(failure){
                                    console.log('failure : ' + JSON.stringify(failure));
                                          }
                            userAuthServices
                                  .loginUser($scope.user)
                                    .then(onSuccess, onError);
                          }
  }
  
  var user = {
        userId : $window.localStorage.getItem('userId') ||'',
        unique_id : $window.localStorage.getItem('unique_id')||''
      };
  
  if(user.userId == '' || user.unique_id == ''){
    //promptUserForUNamePass();
  }else{    
    userAuthServices
      .getLoginStatus(user)
      .then(function(status){
        if(status == "success"){
          //populate the posts
          showUserPost();
        }else{
          //call loginModal
          promptUserForUNamePass();
        }
      },function(error){});
    }
  })
*/
  userAuthServices.authenticateThisUser($scope);

  $scope.remove = function(post){
    kchahiyoServices.deletePost(post);
  }
  
  $scope.closeButtonClicked = function(){
    $scope.loginModal.hide();
    $ionicHistory.goBack();
  }
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
              kchahiyoServices.deletePost($scope.post)
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

.controller('CatPostCtrl', function($window, $scope,$stateParams,kchahiyoServices) {
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

  kchahiyoServices
    .getPostsByCatagory($scope.catagory)
      .then(function(success){
        $scope.posts = success.data;
      }, function(error){})
})

.controller('ChatDetailCtrl', function($scope, googleMapFactory, $stateParams, kchahiyoServices) {

  var postId = $stateParams.postId;
  $scope.post = kchahiyoServices.getPostById(postId);

  $scope.gMapLoaded = false;
  googleMapFactory
      .load
        .then(function(success){
          console.log('successfully loadeed');
          $scope.gMapLoaded = true;
        }, function(error){})

})

.controller('AccountCtrl', function($scope) {

})
.controller('userProfileCtrl', function($scope){


})
.controller('userProfileMyPostsCtrl', function () {
  // body...
  alert('boom works');
})
.controller('AddPostCtrl',function($scope, $state, kchahiyoServices, googleMapFactory, $ionicPopup, $ionicHistory){
  $scope.post = {};
  $scope.post.username = "Nishchal Pandey";
  $scope.post.email ="nishchal.pandeya@mavs.uta.edu";
  $scope.post.password = 'pandey';
  $scope.post.location = {};
  $scope.post.doNotUseFullAddress = false;
  $scope.post.postOperations = {};
  $scope.gMapLoaded = false;

  googleMapFactory
      .load
        .then(function(success){
          console.log('successfully loadeed');
          $scope.gMapLoaded = true;
        }, function(error){})

  $scope.postOperations ={
    catagorySelected :function(e){

       kchahiyoServices.getSubCatagories(e)
       .then(function(success){
         $scope.subCatagories = success;
       }, function(error){});

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
    savePostClicked : function(){
      if($scope.post.doNotUseFullAddress){
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
      }
      insertPost($scope.post);

      function insertPost(post){
        kchahiyoServices
        .insertPost(post)
          .then(function(success){
           console.log(success);
            $ionicPopup.alert({
              title: 'Success',
              template:'Successfully Posted!',
              buttons:[{
                text: 'ok',
                onTap:function(){
                  $state.go('tab.myPosts');
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
