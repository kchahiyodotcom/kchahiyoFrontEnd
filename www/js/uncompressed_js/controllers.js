angular.module('starter.controllers', ['filterModule'])
.value("configs",{
  flags: ["Australia", "Nepal",  "USA", "UK"],
  country: function(){
              if(sessionStorage.getItem("country") == null){
                return "Australia";
              }else{
                return sessionStorage.getItem("country");
              }
            },
  filter:{
    zipCode : ["USA"],
    title : ["USA", "Australia", "Nepal", "UK"],
    city : ["USA"]
  },
  geoDivision : {
      "USA"  : ["state", "city"],
      "Nepal" : ["city"],
      "UK" : ["city"],
      "Australia" : ["city"]
    }
  })
.controller('chooseCountryCtrl', [
  '$scope',
  '$state',
  'configs',
  '$ionicSlideBoxDelegate',
  '$ionicPlatform',
  'userAuthServices',
  function($scope, $state, configs, $ionicSlideBoxDelegate, $ionicPlatform, userAuthServices){
    var country = configs.country();

    $scope.countrySelected = function(){
      var country = configs.country();
      var nextPage = configs.geoDivision[country][0];
      var state = "choose"+ nextPage[0].toUpperCase() + nextPage.substring(1);
      $state.go(state);
    };

    $scope.slideHasChanged = function($index){
      country = configs.flags[$index];
      console.log(country);
      sessionStorage.setItem("country", country);
    };

    if (userAuthServices.isSetStateAndCity() == true) {
      var location = userAuthServices.getStateAndCity();
      $state.go('tab.dash');
      return;
    };

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
  function ($scope, $state, kchahiyoServices, userAuthServices, $stateParams, configs) {
    var country = configs.country();


    $scope.stateChanged = function (stateName) {
      console.log(stateName);
      sessionStorage.setItem('state', stateName);
      $state.go('chooseCity', { stateName: stateName });
    };

    kchahiyoServices
      .getStatesByCountry(country)
        .then(function (success) {
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
   function ($scope, $state, $stateParams, kchahiyoServices, configs) {
    $scope.cityChanged = function (cityName) {
      sessionStorage.setItem('city', cityName);
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
                $scope.counties = success.data;
                $scope.loaded = true;
              });
    }else{
      kchahiyoServices
        .getCitiesByCountry(country)
        .then(function(success){
                    console.log("cities " + success.data);
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
  function ($scope, $state, configs) {
    if ($scope.state === '' || $scope.city === '') {
      $state.go('chooseCountry');
      return;
    }

    $scope.getBreadCrumb = function(){
      var breadCrumb = " ", country = configs.country();

      configs.geoDivision[country].forEach(function(item){
        breadCrumb += sessionStorage.getItem(item) + ", ";
      })
      console.log(breadCrumb);
      return breadCrumb.substring(0, breadCrumb.length-2);
    };
  }
])
.controller('CatPostCtrl', [
  '$window',
  '$scope',
  '$stateParams',
  'kchahiyoServices',
  'userAuthServices',
  'configs',
  function ($window, $scope, $stateParams, kchahiyoServices, userAuthServices, configs) {
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
      var country = sessionStorage.getItem('country');
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

    kchahiyoServices.getPostCatagories()
      .then(function(catagories){
        $scope.catagories = catagories.catagories;
        $scope.catAndSubCat = catagories.catAndSubCat;
      });

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
      userAuthServices.watchThisPost(post);
    };
  }
])
.controller('CatPostDetailCtrl', [
  '$scope',
  'serverAddress',
  '$ionicSlideBoxDelegate',
  'viewFullScreenModal',
  '$ionicScrollDelegate',
  '$sce',
  '$state',
  '$filter',
  'googleMapFactory',
  '$stateParams',
  'kchahiyoServices',
  'userAuthServices',
  function ($scope, serverAddress, $ionicSlideBoxDelegate, viewFullScreenModal, $ionicScrollDelegate, $sce, $state, $filter, googleMapFactory, $stateParams, kchahiyoServices, userAuthServices) {
    $scope.serverAddress = serverAddress;
    var postId = $stateParams.postId;
    kchahiyoServices.getPostById(postId).then(function (success) {
      $scope.post = success.data;
      if (success.data.attached_images.length > 0) {
        $scope.containsImage = true;
        $scope.oldImages = success.data.attached_images.split(',');
      }
    });
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
.controller('userProfileCtrl', [
  '$scope',
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
  function ($scope, kchahiyoServices, serverAddress, imageUploader, $filter, $cordovaCamera, $cordovaFileTransfer, $ionicScrollDelegate, $state, $window, userAuthServices, $ionicHistory) {
    $scope.serverAddress = serverAddress;
    $scope.catagory = "Jobs";
    $scope.$on('$ionicView.enter', function () {
      $scope.userLoggedIn = false;
      console.log('profile page refresh triggered');
      if(userAuthServices.isUserLoggedIn()){
        loadUserProfilePage();
      } else {
        userAuthServices.authenticateThisUser($scope)
          .then(function (success) {
            loadUserProfilePage();
            userAuthServices.userLoggedIn();
          }, function (error) {
            $ionicHistory.goBack();
        });
      }
    });

    function loadUserProfilePage() {
      $scope.userLoggedIn = true;
      if (typeof $scope.postType == 'undefined') {
        loadUserPosts();
      } else if ($scope.postType == 'watchedPosts') {
        loadWatchedPosts();
      } else if ($scope.postType == 'myPosts') {
        loadUserPosts();
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

    var loadUserPosts = function () {
      $scope.posts = userAuthServices.getUserPosts();
      $scope.userDetails = userAuthServices.getUserDetails();
      var profilePicURL = $scope.userDetails.profilePic || '';

      if(profilePicURL == ''){
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
        userAuthServices.deletePost(post);
      };

    };

    var loadWatchedPosts = function () {
      userAuthServices.getWatchedPosts().then(function (success) {
        $scope.postType = 'watchedPosts';
        $scope.posts = success.data;
      });
      $scope.remove = function (post) {
        userAuthServices.removeWatchedPost(post).then(function () {
          $scope.posts.splice($scope.posts.indexOf(post), 1);
        });
      };
    };

    $scope.tabButtons = {
      myPostsTab: function(){
        loadUserPosts();
        $ionicScrollDelegate.scrollTop();
      },
      watchingTab: function(){
        loadWatchedPosts();
        $ionicScrollDelegate.scrollTop();
      }
    };

    $scope.logUserOut = function () {
      userAuthServices.logUserOut().then(function () {
        $state.go('tab.dash');
      }, function () {
      });
    };

    kchahiyoServices.getPostCatagories()
      .then(function(catagories){
        $scope.catagories = catagories.catagories;
        $scope.catAndSubCat = catagories.catAndSubCat;
      });

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
.controller('myPostDetailCtrl', [
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
    function ($filter, serverAddress, $ionicPopup, $scope, viewFullScreenModal, googleMapFactory, $stateParams, userAuthServices, kchahiyoServices, $ionicHistory, $state, imageUploader) {
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
                    $ionicHistory.goBack();
                  }, function (error) {
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
  function ($q, $scope, $ionicModal, $state, $ionicActionSheet, userAuthServices, imageUploader, kchahiyoServices, googleMapFactory, $ionicPopup, $ionicHistory, $cordovaFile, $cordovaImagePicker, $cordovaFileTransfer, $cordovaCamera) {
    var alert = function (message) {
      $ionicPopup.alert({
        title: 'Failure',
        template: message
      });
    };
    var location = userAuthServices.getStateAndCity();
    $scope.stateName = location.state;
    $scope.cityName = location.city;
    $scope.images = [];
    kchahiyoServices
      .getCitiesByState($scope.stateName)
        .then(function (success) {
          $scope.counties = success.data;
        }, function () {});

    $ionicModal.fromTemplateUrl('templates/googlePlaces.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.googlePlacesModal = modal;
    });

    $scope.closeButtonClicked = function () {
      $scope.googlePlacesModal.hide();
    };

    var loadGoogleMaps = function () {
      googleMapFactory.load.then(function (success) {
        $scope.gMapLoaded = true;
      }, function (error) {
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
        .then(function(catagories){
          $scope.catagories = catagories.catagories;
          $scope.catAndSubCat = catagories.catAndSubCat;
        });
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
        console.log(e.$error);
        if (typeof e.$error.required != 'undefined' && e.$error.required.length > 0) {
          console.log('this is error');
          $scope.input = { hasError: true };
        } else if (typeof $scope.post.place == 'undefined' && !$scope.post.doNotUseFullAddress) {
          console.log('here in undefined');
          $scope.invalidAddress = true;
        } else if ($scope.post.doNotUseFullAddress) {
          console.log($scope.post);
          insertPost($scope.post);
        } else {
          console.log('here we are');
          var postLocation = $scope.post.place;
          var addressPieces = $scope.post.place.formatted_address.split(',');
          $scope.post.location = {
            lat: postLocation.geometry.location.lat(),
            lng: postLocation.geometry.location.lng(),
            street_address: addressPieces[0].trim(),
            city: addressPieces[1].trim(),
            post_state: addressPieces[2].trim().split(' ')[0],
            zip_code: parseInt(addressPieces[2].trim().split(' ')[1])
          };
          insertPost($scope.post);
        }
        function insertPost(post) {
          kchahiyoServices.insertPost(post).then(function (success) {
            var responseStatus = success.data.status;
            if (responseStatus == 'success') {
              uploadImagesIfAny(success.data.content).then(function () {
                $ionicPopup.alert({
                  title: 'Success',
                  template: 'Successfully Posted!',
                  buttons: [{
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
          }, function (error) {
            alert(error);
          });
        }
        function uploadImagesIfAny(postId) {
          var deferred = $q.defer();
          var images = $scope.images;
          var uploadedImages = [];
          imageUploader.uploadImages(postId, images, uploadedImages, 'uploads').then(function () {
            $scope.uploadsCompleted = true;
            deferred.resolve('upload completed');
          }, function (error) {
            deferred.reject('error occured during upload');
          });
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

  }]);
