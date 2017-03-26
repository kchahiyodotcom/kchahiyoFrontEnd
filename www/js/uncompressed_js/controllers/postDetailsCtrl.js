app.controller('postDetailsCtrl', [
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
