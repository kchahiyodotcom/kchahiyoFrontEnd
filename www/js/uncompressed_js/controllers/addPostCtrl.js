app.controller('AddPostCtrl', ['$q','$scope','configs','$ionicModal','$state','$ionicActionSheet','userAuthServices','imageUploader','kchahiyoServices','googleMapFactory','$ionicPopup','$ionicHistory','$cordovaFile','$cordovaImagePicker','$cordovaFileTransfer','$cordovaCamera',  '$rootScope',
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
    //features management
    // $scope.images = ["https://stereo.gsfc.nasa.gov/beacon/t0193.jpg",
    //               "https://static1.squarespace.com/static/553a8716e4b0bada3c80ca6b/553a9655e4b03939abece18a/5731fc75f85082142b12b095/1471894315703/mayfourblocknature.jpg"];
    //
    //

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
