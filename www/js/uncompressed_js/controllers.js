angular.module('starter.controllers', ['filterModule'])
//to get country --> configs.country();
//countries in this module : --> UK, Australia, Nepal, USA
.controller('chooseCountryCtrl', [
  '$scope',
  '$state',
  'configs',
  '$ionicSlideBoxDelegate',
  '$ionicPlatform',
  'userAuthServices',
  '$timeout',
  function($scope, $state, configs, $ionicSlideBoxDelegate, $ionicPlatform, userAuthServices, $timeout){
    var country = configs.country();
    $scope.selectedCountry = country;

    $scope.countrySelected = function(country){
      var nextPage = configs.geoDivision[country][0];
      var state = "choose"+ nextPage[0].toUpperCase() + nextPage.substring(1);
      localStorage.setItem("country", country);
      console.log(country);
      $state.go(state);
    };

    $scope.slideHasChanged = function($index){
      country = configs.flags[$index];
      $scope.selectedCountry = country;
      localStorage.setItem("country", country);
    };

    if (userAuthServices.isSetStateAndCity() === true) {
      var location = userAuthServices.getStateAndCity();
      $state.go('tab.dash');
      return;
    }

    var flagIndex = function(){
      return configs.flags.indexOf(country);
    };

    $ionicPlatform
      .ready()
      .then(function(success){
          $ionicSlideBoxDelegate.slide(flagIndex());
        }, function(error){
          console.log(error);
        }
    );
  }
])
.controller('chooseStateCtrl', [
  '$scope',
  '$state',
  'kchahiyoServices',
  'userAuthServices',
  '$stateParams',
  'configs',
  '$rootScope',
  function ($scope, $state, kchahiyoServices, userAuthServices, $stateParams, configs, $rootScope) {
    $rootScope.$broadcast("loadingStarted");
    var country = configs.country();
    console.log(country);

    $scope.stateChanged = function (stateName) {
      console.log(stateName);
      localStorage.setItem('state', stateName);
      $state.go('chooseCity', { stateName: stateName });
    };

    kchahiyoServices
      .getStatesByCountry(country)
        .then(function (success) {
               $rootScope.$broadcast("loadingCompleted");
                $scope.states = success.data;
                $scope.dataLoaded = true;
              });
  }
])
.controller('chooseCityCtrl', [
  '$scope',
  '$state',
  '$stateParams',
  'kchahiyoServices',
  'configs',
  '$rootScope',
   function ($scope, $state, $stateParams, kchahiyoServices, configs, $rootScope) {
     //$rootScope.$broadcast("loadingStarted");
     $scope.searchText = "";
    $scope.cityChanged = function (cityName) {
      localStorage.setItem('city', cityName);
      $state.go('tab.dash');
    };

    $scope.stateName = $stateParams.stateName;
    $scope.city = {};

    var country = configs.country();
    console.log(configs.geoDivision[country].indexOf("state"));
    if(configs.geoDivision[country].indexOf("state") != -1){

      kchahiyoServices
        .getCitiesByState($scope.stateName)
        .then(function (success) {
                //$rootScope.$broadcast("loadingCompleted");
                $scope.counties = success.data;
                $scope.loaded = true;
              });
    }else{
      kchahiyoServices
        .getCitiesByCountry(country)
        .then(function(success){
                    $rootScope.$broadcast("loadingCompleted");
                    $scope.counties = success.data;
                }, function (error){
                    alert(error.data);
                    console.error(error.data);
                    console.error(error.status);
                });
    }
  }
])
.controller('DashCtrl', [
  '$scope',
  '$state',
  'configs',
  'kchahiyoServices',
  '$ionicLoading',
  '$rootScope',
  'geoServices',
  function ($scope, $state, configs, kchahiyoServices, $ionicLoading, $rootScope, geoServices) {

    $rootScope.$broadcast("loadingStarted");

    $scope.chooseCountry = function(){
      geoServices.resetGeoParameters();
      $state.go('chooseCountry');
    };

    if ($scope.state === '' || $scope.city === '') {
      $state.go('chooseCountry');
      return;
    }

    kchahiyoServices.getPostCatagories()
      .then(function(success){
          $rootScope.$broadcast('loadingCompleted');
          $scope.catagoryNames = success.catagories;
          $scope.getDashboardIconName = function(catagoryName){
            return success.catagoryObject[catagoryName].iconName;
          };

          $scope.getCatagoryPageHref = function(catagoryName){
              return success.catagoryObject[catagoryName].href;
          };
        });

    $scope.getBreadCrumb = function(){
      var breadCrumb = " ", country = configs.country();
      configs.geoDivision[country].forEach(function(item){
        breadCrumb += localStorage.getItem(item) + ", ";
      });

      return breadCrumb.substring(0, breadCrumb.length-2);
    };
}])
.controller('CatPostCtrl', [
  '$window',
  '$scope',
  '$stateParams',
  'kchahiyoServices',
  'userAuthServices',
  'configs',
  '$rootScope',
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
.controller('CatPostDetailCtrl', [
  '$scope',
  '$ionicModal',
  'messengerService',
  'serverAddress',
  '$ionicSlideBoxDelegate',
  'viewFullScreenModal',
  '$ionicScrollDelegate',
  '$sce',
  'userAuthServices',
  '$state',
  '$filter',
  'googleMapFactory',
  '$stateParams',
  'kchahiyoServices',
  'userAuthServices',
  'configs',
  function ($scope, $ionicModal, messengerService, serverAddress, $ionicSlideBoxDelegate, viewFullScreenModal, $ionicScrollDelegate, $sce, userAuthServices, $state, $filter, googleMapFactory, $stateParams, kchahiyoServices, userAuthServices, configs) {
    $scope.serverAddress = serverAddress;
    $scope.unit = configs.currencyUnit[configs.country()];
    var postId = $stateParams.postId;
    var userId = localStorage.getItem("userId");
    $scope.posterId;
    $scope.message ={};

    kchahiyoServices.getPostById(postId).then(function (success) {
      $scope.post = success.data;
      if (success.data.attached_images.length > 0) {
        $scope.containsImage = true;
        $scope.oldImages = success.data.attached_images.split(',');
      }
    });
    console.log('country');
    $scope.getUserPic = function(post){
      $scope.posterId = post.userId;
      $scope.postId = post.id;
      var picLink = post.profilePic;
      var hideUser = post.hide_user_details;
      if(hideUser == "1"){
        return serverAddress+"/images/Anonymous_emblem.svg.png";
      }
      if(picLink !== null ){
        if(picLink.substring(0,5)== "https"){
          return picLink;
        }else{
          return serverAddress+'/userProfilePics/thumbs/thumb_' + picLink;
        }
      }
    };

    messengerService.init({
      serverAddress : serverAddress
    });

    console.log($scope.message.content);


    $scope.messengerServiceInitiated = function(){
      console.log('check this thi');
      //check if user is logged in
        //if not show login page
        //else get userId
        userAuthServices.authenticateThisUser($scope)
          .then(function(success){
            $scope.showMessageSendButton = true;
          }, function(){
            console.log('error in authenticateThisUser');
          })


          $ionicModal.fromTemplateUrl('templates/messagingService/messageModal.html',{
            scope : $scope,
            backdropClickToClose:true
          }).then(function(modal){
              modal.show();
              $scope.closeButtonClicked = function(){
                sendMessageEventFinished(modal);
              };
              $scope.sendMessageEvent = function(){
                  messengerService.sendMessage({
                    post_id: $scope.postId,
                    post_title:$scope.post.title,
                    sender_id: userId,
                    receiver_id: $scope.posterId,
                    content: $scope.message.content
                  }).then(function(success){
                    console.log($scope.message.content);
                    sendMessageEventFinished(modal);

                  });
                };

              function sendMessageEventFinished(modal){
                $scope.message.content = "";
                modal.hide();
              }
          })


        //show message modal with
        //message box

        //when send is clicked
        // NEEDED
          //get userId
          //post id
          //item id

        //post object with {postId : 123, userId : 34234, messageContent: "alksdfaljsdkfasdjfalsdkfjas;dfkjalsd;fajsdas"},



    };

    $scope.jobListing = true;

    $scope.savePost = function (post) {
      userAuthServices.watchThisPost(post);
    };

    $scope.$on('$ionicView.enter', function () {
      $scope.input = { hasError: false };
    });

    $scope.gMapLoaded = false;

    googleMapFactory.load.then(function (success) {
      console.log('Google maps has successfully loadeed');
      $scope.gMapLoaded = true;
      }, function (error) {
    });

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
.controller('watchedPostsCtrl', [
  'userAuthServices',
  '$scope',
  function(userAuthServices, $scope){
  console.log('here you goo');
  userAuthServices.getWatchedPosts().then(function (success) {
    $scope.posts = success.data;
    $scope.postType = 'watchedPosts';
    $scope.catagory = 'userProfile';
  });
}])
.controller('userMessagesCtrl', [
  'messengerService',
  '$scope',
  'serverAddress',
  function(messengerService, $scope, serverAddress){
    console.log('here you  messengerService ');
    messengerService.init({serverAddress: serverAddress});
    messengerService.readUserMessages({
      user_id: localStorage.getItem('userId')
    }).then(function(success){
      console.log(JSON.stringify(success.data.content));
      //var unique_post_titles = new Set();
      var messageArray = success.data.content;
      /*success.data.content.forEach(function(record){

        /*unique_post_titles
          .add({ post_title: record.post_title,
            sender_name: record.first_name + ' ' + record.last_name,
            post_id: record.post_id
          });

          messageAttr = [record.sender_id , record.post_title];
          unique_post_titles
            .add(messageAttr);
      });*/

      function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
      }


      var unique = messageArray.filter( onlyUnique );

      console.log(unique);

      $scope.posts = unique;
      //$scope.posts = Array.from(unique_post_titles.values());
      //$scope.posts =success.data.content;
    });
}])
.controller('messageDetailsCtrl', [
  '$stateParams',
  'messengerService',
  '$scope',
  'serverAddress',
  function($stateParams, messengerService, $scope, serverAddress){
    var conversationTitle = $stateParams.title;
    messengerService.init({serverAddress: serverAddress});
    messengerService.readUserMessages({
      user_id: localStorage.getItem('userId')
    }).then(function(success){
      console.log(JSON.stringify(success.data.content));
      var messageContent = new Array();

      success.data.content.forEach(function(record){
        if(record.post_title === conversationTitle){
          messageContent.push(record);
        }
      });
      console.log(messageContent);

      /*messages = {
        message: {
          userId : "",
          text: ""
        }
      }*/

      $scope.posts = messageContent;
      //$scope.posts =success.data.content;
    });
}])
.controller('userProfileCtrl', [
  '$scope',
  'messengerService',
  'serverAddress',
  'kchahiyoServices',
  'serverAddress',
  'imageUploader',
  '$filter',
  '$cordovaCamera',
  '$cordovaFileTransfer',
  '$ionicScrollDelegate',
  '$state',
  '$window',
  'userAuthServices',
  '$ionicHistory',
  function ($scope, messengerService, serverAddress, kchahiyoServices, serverAddress, imageUploader, $filter, $cordovaCamera, $cordovaFileTransfer, $ionicScrollDelegate, $state, $window, userAuthServices, $ionicHistory) {
    $scope.ui = {};
    $scope.ui.tabview = 'templates/profilePage/posts-list.html';

    $scope.serverAddress = serverAddress;

    $scope.catagory = "Jobs";

    $scope.userLoggedIn = false;

    console.log('profile page refresh triggered');
    if(userAuthServices.isUserLoggedIn()){
      loadUserProfilePage();
    } else {
      userAuthServices.authenticateThisUser($scope)
        .then(function (success) {
          loadUserProfilePage();
          userAuthServices.userLoggedIn();
          console.log(success);
        }, function (error) {
          console.log("error in here "+error);
          $ionicHistory.goBack();
      });
    }

    function loadUserPosts () {
      console.log('in loadUserPosts');
      $scope.posts = userAuthServices.getUserPosts();
      $scope.userDetails = userAuthServices.getUserDetails();
      var profilePicURL = $scope.userDetails.profilePic || '';
      console.log('profile url ' + profilePicURL);

      if(profilePicURL === ''){
        $scope.profilePic = false;
      }else if (profilePicURL.substring(0, 5) == 'https') {
        $scope.profilePic = profilePicURL;
      } else {
        $scope.profilePic = serverAddress + '/userProfilePics/' + profilePicURL;
      }
      $scope.postType = 'myPosts';
      $scope.catagory = 'userProfile';
      $scope.postOperations = {
        removeable: true,
        saveable: false,
        removeWatch: false
      };
      $scope.remove = function (post) {
        userAuthServices.deletePost(post).
        then(function (success) {
          alert(success.data.content);
        }, function(error){
          alert('Error deleting the post, try again!');
        });
      };

    };


    function loadUserProfilePage() {
      $scope.userLoggedIn = true;
      console.log($scope.postType);
      if (typeof $scope.postType == 'undefined') {
        loadUserPosts();
      } else if ($scope.postType == 'watchedPosts') {
        loadWatchedPosts();
      } else if ($scope.postType == 'myPosts') {
        loadUserPosts();
      } else if ($scope.postType == 'myMessages') {
        loadUserMessages();
      }
    }

    $scope.search = function(searchText, selectedOption){

      var post = {};
			if(selectedOption == 'Title'){
				post.title = searchText;
			}else if(selectedOption == 'Zip'){
				post.post_zip = searchText;
			}else if(selectedOption == 'City'){
				post.city  = searchText;
			}else if($selectedOption == 'Sub Catagory'){
				post.sub_catagory = searchText;
			}

      $scope.posts = $filter('filter')(userAuthServices.getUserPosts(), post);

    };


   var loadWatchedPosts = function () {
      userAuthServices.getWatchedPosts().then(function (success) {
        $scope.postType = 'watchedPosts';
        $scope.watchedPosts = success.data;
      });
      $scope.remove = function (post) {
        userAuthServices.removeWatchedPost(post).then(function () {
          $scope.posts.splice($scope.posts.indexOf(post), 1);
        });
      };
    };

    loadWatchedPosts();


    var loadUserMessages = function(){
      console.log("load messages initiated");
      messengerService.init({serverAddress: serverAddress});
      messengerService.readUserMessages({
        user_id: localStorage.getItem('userId')
      }).then(function(success){
        console.log(JSON.stringify(success.data.content));
        var unique_post_titles = new Set();

        success.data.content.forEach(function(record){
          unique_post_titles.add(record.post_title);
        });
        console.log(unique_post_titles);
        let post_title = Array.from(unique_post_titles.values());
        console.log(post_title);
        $scope.userMessages = post_title;
      });
    }

    loadUserMessages();


    //only Catagory will be displayed no subCatagories here
    kchahiyoServices.getPostCatagories()
      .then(function(success){
          $scope.$selectedOption = 'Catagories';
          $scope.subCatagories = success.catagories;
        }, function(error){
          console.log("error while pulling the catagories, retrying");
        }
      );

    $scope.tabButtons = {
      myPostsTab: function(){
        loadUserPosts();
        $ionicScrollDelegate.scrollTop();
      },
      watchingTab: function(){
        loadWatchedPosts();
        $ionicScrollDelegate.scrollTop();
      },
      messagingTab: function(){
        loadUserMessages();
        $ionicScrollDelegate.scrollTop();
      }
    };

    $scope.logUserOut = function () {
      userAuthServices.logUserOut().then(function () {
        $state.go('tab.dash');
      }, function (err) {
        $state.go('tab.dash');
        console.log(err);
      });
    };

    var imgUpldr = imageUploader.imageUpldr();

    $scope.showActionSheet = function(){
        imgUpldr.init(1, null, null, "userProfilePics");
        var userId = userAuthServices.getUserDetails().uid;
        imgUpldr.showActionSheet()
          .then(function(imageURIs){
            $scope.profilePicLoading = true;
            imageUploader.uploadProfilePic(imageURIs, userId)
              .then(function (profilePic) {
                $scope.profilePicLoading = false;
                $scope.profilePic = serverAddress + '/userProfilePics/' + profilePic.newFileName;
            });
          });
      };

    $scope.removeImageFromView = function (index) {
      imageUploader.removeImageFromView(index, $scope.images);
    };

    $scope.urlForImage = function (imageName) {
      var name = imageName.substr(imageName.lastIndexOf('/') + 1);
      var trueOrigin = cordova.file.dataDirectory + 'uploads/' + name;
      return trueOrigin;
    };
  }
])
.controller('postDetailsCtrl', [
  '$filter',
  'serverAddress',
  '$ionicPopup',
  '$scope',
  'viewFullScreenModal',
  'googleMapFactory',
  '$stateParams',
  'userAuthServices',
  'kchahiyoServices',
  '$ionicHistory',
  '$state',
  'imageUploader',
  'configs',
    function ($filter, serverAddress, $ionicPopup, $scope, viewFullScreenModal, googleMapFactory, $stateParams, userAuthServices, kchahiyoServices, $ionicHistory, $state, imageUploader,configs) {

      $scope.unit = configs.currencyUnit[configs.country()];

      var alert = function (message) {
        $ionicPopup.alert({
          title: 'Status',
          template: message
        });
      };

      $scope.messengerServiceInitiated = function(){
        alert("byaaam");
      }

      console.log(configs.country());
      function resetFeatures(){
        $scope.priceFeature = false;
      }

      function loadFeatures(subCatagories, subCatagory){
        resetFeatures();
        if(typeof subCatagory != "undefined"){
          var subCatagory = subCatagory.trim();
          subCatagories[subCatagory].features.forEach(function(feature){
              $scope[feature + "Feature"] = true;
              console.log(feature+"Feature");
          });
        }
      }

      $scope.getUserPic = function(picLink){
        if(picLink !== null ){
          if(picLink.substring(0,5)=== "https"){
            return picLink;
          }else{
            return serverAddress+'/userProfilePics/thumbs/thumb_' + picLink;
          }
        }
      };

      kchahiyoServices.getPostCatagories()
        .then(function(success){
          console.log(success);
            $scope.catagories = success.catagoriesObject;
            var subCatagories = success.subCatagories[$scope.post.catagory].subCatagories;
            loadFeatures(subCatagories, $scope.post.sub_catagory);
          },function(err){
            console.log('failed');
          }
        );

      $scope.editing = false;
      var imageUpldr;
      $scope.editable = true;
      $scope.serverAddress = serverAddress;
      var postId = $stateParams.postId;
      $scope.gMapLoaded = false;
      $scope.images = [];
      $scope.viewFullScreen = function (index) {
        viewFullScreenModal.init($scope, $scope.oldImages).then(function (modal) {
          $scope.viewFullScreenModal = modal;
          $scope.modalImages = $scope.oldImages;
          $scope.viewFullScreenModal.show().then(function () {
            $scope.active = index;
          });
        });
      };
      googleMapFactory.load.then(function (success) {
        console.log('successfully loadeed');
        $scope.gMapLoaded = true;
      }, function (error) {
      });

      var post = userAuthServices.getPostById(postId);
      console.log(post);

      $scope.post = post;

      if (post.attached_images.length > 0) {
        $scope.oldImages = post.attached_images.split(',');
        console.log(JSON.stringify($scope.oldImages));
        $scope.containsImage = true;
        imgUpldr = imageUploader.imageUpldr();
        imgUpldr.init(5, $scope.oldImages, $scope.images, "uploads");
        viewFullScreenModal.init($scope, $scope.oldImages);
      } else {
        $scope.oldImages = [];
        imgUpldr = imageUploader.imageUpldr();
        imgUpldr.init(5, null, $scope.images, "uploads");
      }

      $scope.showActionSheet = imgUpldr.showActionSheet;

      $scope.urlForImage = function (imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + 'uploads/' + name;
        return trueOrigin;
      };

      function uploadImagesIfAny(postId) {
        var deferred = $q.defer();
        var images = $scope.images;
        var folderName = 'uploads';
        imageUploader.uploadImages(postId, images, oldImages, folderName).then(function () {
          $scope.uploadsCompleted = true;
          deferred.resolve('upload completed');
        }, function (error) {
          alert(error);
          deferred.reject('error occured during upload');
        });
        return deferred.promise;
      }
      $scope.postOperations = {
        editPost: function (e) {
          $scope.post.content = $filter('addNewLine')($scope.post.content);
          $scope.editing = true;
        },
        cancelEdit: function (e) {
          $scope.editing = false;
        },
        savePost: function (e) {
          // post saving done here
          var post = $scope.post;
          var images = $scope.images;
          var oldImages = $scope.oldImages;
          var serverDirectoryName = 'uploads';
          kchahiyoServices.savePost(post).then(function (success) {
            console.log(success);
            imageUploader.uploadImages(post.id, images, oldImages, serverDirectoryName).then(function () {
              userAuthServices.updatePostImages(post.id, oldImages);
              $scope.uploadsCompleted = true;
              viewFullScreenModal.init($scope, $scope.oldImages);
              $ionicPopup.alert({
                type: 'button-assertive',
                title: 'Success',
                template: 'Post has been saved successfully!'
              });
              userAuthServices.setUserPostsChanged(true);
              $scope.editing = false;
            });
          }, function (error) {
            $ionicPopup.alert({
              title: 'Error',
              template: 'Error, try saving again'
            });
          });
        },
        deletePost: function () {
          $ionicPopup.show({
            title: 'Confirmation',
            template: 'Do you want to delete this posting?',
            buttons: [
              {
                type: 'button-assertive',
                text: 'Yes',
                onTap: function (e) {
                  userAuthServices.deletePost($scope.post).then(function (success) {
                    alert(success.data.content);
                    $ionicHistory.goBack();
                  }, function (error) {
                    alert("Error deleting the post, try again!");
                  });
                }
              },
              { text: 'No' }
            ]
          });
        },
        removeImageFromServer: function (image, id) {
          imgUpldr.removeFileFromServer(id, image)
          .then(function (success) {
            console.log('done removal' + success.data);
          });
        },
        removeImageFromDevice: function (index) {
          imageUploader.removeImageFromDevice(index, $scope.images);
        }
      };
  }
])
.controller('myWatchedPostDetailCtrl', [
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
.controller('AddPostCtrl', [
  '$q',
  '$scope',
  'configs',
  '$ionicModal',
  '$state',
  '$ionicActionSheet',
  'userAuthServices',
  'imageUploader',
  'kchahiyoServices',
  'googleMapFactory',
  '$ionicPopup',
  '$ionicHistory',
  '$cordovaFile',
  '$cordovaImagePicker',
  '$cordovaFileTransfer',
  '$cordovaCamera',
  '$rootScope',
  function ($q, $scope, configs, $ionicModal, $state, $ionicActionSheet, userAuthServices, imageUploader, kchahiyoServices, googleMapFactory, $ionicPopup, $ionicHistory, $cordovaFile, $cordovaImagePicker, $cordovaFileTransfer, $cordovaCamera, $rootScope) {

    function resetFeatures(){
      $scope.priceFeature = false;
    }

    function loadFeatures(subCatagories, subCatagory){
      resetFeatures();
      if(typeof subCatagory != "undefined"){
        var subCatagory = subCatagory.trim();
        subCatagories[subCatagory].features.forEach(function(feature){
            $scope[feature + "Feature"] = true;
        });
      }
    }

    if(configs.features.fullAddressFeature.indexOf(configs.country()) != -1){
      $scope.fullAddressFeature = true;
      console.log(configs.country());
    }
    $scope.images = [];
    /*features management
    $scope.images = ["https://stereo.gsfc.nasa.gov/beacon/t0193.jpg",
                  "https://static1.squarespace.com/static/553a8716e4b0bada3c80ca6b/553a9655e4b03939abece18a/5731fc75f85082142b12b095/1471894315703/mayfourblocknature.jpg"];

    */

    var alert = function (message) {
      $ionicPopup.alert({
        title: 'Failure',
        template: message
      });
    };
    var location = userAuthServices.getStateAndCity();
    $scope.stateName = location.state;
    $scope.cityName = location.city;

    kchahiyoServices
      .getCitiesByState($scope.stateName)
        .then(function (success) {
          $scope.counties = success.data;
        });

    $ionicModal.fromTemplateUrl('templates/googlePlaces.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.googlePlacesModal = modal;
    });

    $scope.closeButtonClicked = function () {
      $scope.googlePlacesModal.hide();
    };

    var loadGoogleMaps = function () {
      $scope.gMapLoaded = false;
      googleMapFactory.load
        .then(function (success) {
          $scope.gMapLoaded = true;
          console.log("googleMapFactory got loaded");
        }, function (error) {
          console.error("error loading googleMapFactory");
        });
    };

    var loadAddPostPage = function () {
      loadGoogleMaps();
      var userDetails = userAuthServices.getUserDetails();
      $scope.post = {
        username: userDetails.first_name + ' ' + userDetails.last_name,
        email: userDetails.email,
        uniqueId: userDetails.unique_id,
        location: {},
        catagory: '',
        hideUserDetails: false,
        doNotUseFullAddress: false
      };

      kchahiyoServices.getPostCatagories()
        .then(function(success){
          console.log(success);
            $scope.catagories = success.catagories;
            var subCatagories;
            $scope.onCatagoryChange = function(config){
              subCatagories = success.subCatagories[config].subCatagories;
              $scope.subCatagories = Object.keys(subCatagories);
            }
            $scope.onSubCatagoryChange= function(subCatagory){
              loadFeatures(subCatagories, subCatagory);
            }
          }, function(error){
            console.log("error while pulling the catagories, retrying");
          }
        );
      $scope.userLoggedIn = true;
    };

    $scope.$on('$ionicView.enter', function () {
      userAuthServices.authenticateThisUser($scope).then(function (success) {
        loadAddPostPage();
      }, function (error) {
        $ionicHistory.goBack();
      });
    });

    $scope.postOperations = {
      zipCodeUpdated: function (e) {
        if (e.toString().length == 5) {
          $scope.cityLoading = true;
          kchahiyoServices.getCityByZip(e).then(function (success) {
            $scope.post.location.city = success.data.content.city;
            $scope.post.location.post_state = success.data.content.state;
            $scope.post.location.lng = parseFloat(success.data.content.longitude);
            $scope.post.location.lat = parseFloat(success.data.content.latitude);
            $scope.cityLoading = false;
          }, function (error) {
          });
        }
      },
      savePostClicked: function (e) {
        if (typeof e.$error.required != 'undefined' && e.$error.required.length > 0) {
          console.log('error while trying to save the post');
          $scope.input = { hasError: true };
          return true;
        } else if (typeof $scope.post.place == 'undefined' && !$scope.post.doNotUseFullAddress) {
          console.log('$scope.post.place is undefined');
          $scope.invalidAddress = true;
        } else if ($scope.post.doNotUseFullAddress) {
          console.log($scope.post);
          insertPost($scope.post);
        } else if(configs.country() == "USA"){
          console.log($scope.post.place);
          var postLocation = $scope.post.place;
          if($scope.post.place.formatted_address != undefined){
            var addressPieces = $scope.post.place.formatted_address.split(',');
            $scope.post.location = {
              lat: postLocation.geometry.location.lat(),
              lng: postLocation.geometry.location.lng(),
              street_address: addressPieces[0].trim(),
              city: addressPieces[1].trim(),
              post_state: addressPieces[2].trim().split(' ')[0],
              zip_code: parseInt(addressPieces[2].trim().split(' ')[1]),
              place_id: postLocation.place_id
            };
            insertPost($scope.post);
          }else{
            console.error("place.formatted_address is undefined");
          }
        }else {
            //if country is not USA
            var postLocation = $scope.post.place;
            if($scope.post.place.formatted_address != undefined){
              var addressPieces = $scope.post.place.formatted_address;
              $scope.post.location = {
                lat: postLocation.geometry.location.lat(),
                lng: postLocation.geometry.location.lng(),
                street_address: addressPieces,
                city: '',
                post_state: '',
                zip_code: '',
                place_id: postLocation.place_id
              };
            insertPost($scope.post);
          }
        }

        function insertPost(post) {
          $rootScope.$on("loadingStarted");
          kchahiyoServices.insertPost(post)
            .then(function (success) {
                var responseStatus = success.data.status;
                if (responseStatus == 'success') {
                  uploadImagesIfAny(success.data.content)
                    .then(function () {
                      $ionicPopup.alert({
                        title:    'Success',
                        template: 'Successfully Posted!',
                        buttons:  [{
                            text: 'ok',
                            onTap: function () {
                              $ionicHistory.goBack();
                              }
                            }]
                      });
                      userAuthServices.setUserPostsChanged(true);
                    });
                } else {
                  alert(success.data.content);
                }
                $rootScope.$on("loadingCompleted");
              }, function (error) {
                $rootScope.$on("loadingCompleted");
                  alert(error);
              });
            return false;
        }

        function uploadImagesIfAny(postId) {
          var deferred = $q.defer();
          var images = $scope.images;
          if(images.length == 0){
            deferred.resolve('no images to upload');
          }else{
            var uploadedImages = [];
            imageUploader.uploadImages(postId, images, uploadedImages, 'uploads').then(function () {
              $scope.uploadsCompleted = true;
              deferred.resolve('upload completed');
            }, function (error) {
              deferred.reject('error occured during upload');
            });
          }
          return deferred.promise;
        }
      }
    };

    var imgUpldr = imageUploader.imageUpldr();

    imgUpldr.init(5, null, $scope.images, 'uploads');

    $scope.removeImageFromView = function (image) {
        imgUpldr.removeImageFromView(image);
      };

    $scope.showActionSheet = imgUpldr.showActionSheet;

    $scope.urlForImage = function (imageName) {
      var name = imageName.substr(imageName.lastIndexOf('/') + 1);
      var trueOrigin = cordova.file.dataDirectory + 'uploads/' + name;
      return trueOrigin;
    };
  }
])
.controller('AboutCtrl', [
  '$scope',
  function ($scope) {

  }])
.controller('itemSalesCtrl', [
  '$window',
  '$scope',
  '$stateParams',
  'kchahiyoServices',
  'userAuthServices',
  'configs',
  'serverAddress',
  '$ionicLoading',
  function ($window, $scope, $stateParams, kchahiyoServices, userAuthServices, configs, serverAddress, $ionicLoading){
    var location = userAuthServices.getStateAndCity();
    /*$ionicLoading.show({
      template: 'Loading...',
      duration: 1000
    });*/
    var catagory = "Item Sales";
    $scope.searchtext = "";
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
        selectedOption : selectedOption == undefined? "Title" : selectedOption,
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
        return serverAddress + "/uploads/"+attached_images[title_image_id];
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
.controller('postsWithThumbnailCtrl', [
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
.controller('postsWithDefaultThumbnailCtrl', [
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
    $scope.catagory = $stateParams.catagory;
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
        return serverAddress + "/subCatagoryThumbnails/"+catagory.toLowerCase()+"/"+post.sub_catagory.toLowerCase()+".png";
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
