kchahiyoServices.factory('imageUploader',['$cordovaFileTransfer','configs','userAuthServices','$ionicActionSheet','$ionicPopup','$cordovaFile','$cordovaCamera','$cordovaImagePicker','$q','$http','serverAddress',
  function($cordovaFileTransfer, configs, userAuthServices, $ionicActionSheet, $ionicPopup, $cordovaFile, $cordovaCamera, $cordovaImagePicker, $q, $http, serverAddress){

    var images = {
      numImageUploadable : 0,
      maxImagesAllowed:0,
      setMaxImagesAllowed :function(value){
        this.maxImagesAllowed = value;
        this.numImageUploadable = value;
      },
      maxImagesAllowedExceeded: function(){
        alert('Maximum '+ this.maxImagesAllowed + ' images can be attached!');
      },
      isMaxNoImagesExceeded: function(){
        if(this.numImageUploadable <=0){
          this.maxImagesAllowedExceeded();
          return true;
        }
        return false;
      }
    };

    var isFolderCreated = function(folder){
      var deferred = $q.defer();
      $cordovaFile.checkDir(cordova.file.dataDirectory, folder.name)
        .then(function(file){
          if(file.isDirectory){
            deferred.resolve(true);
          }else{
            deferred.reject(false);
          }
        }, function(error){
          deferred.reject(false);
        });
      return deferred.promise;
    };

    var createFolderIfNotPresent = function (folder){
        console.log(folder.name + " in createFolderIfNotPresent");

        return $cordovaFile.createDir(cordova.file.dataDirectory, folder.name, true);
    };

    var copyFilesToLocalDirectory = function(files, folder){
      //copies file to cordova.file.dataDirectory+folderName directory and returns fileLinks

      var rootDeferred = $q.defer();
      var newFiles = Array();

      if(typeof files == 'string')
        files = Array(files);

      //for each image copy them to local folder and getPath
      for (var i = 0; i < files.length; i++) {
        window.resolveLocalFileSystemURL(files[i], copyFile, fail);
      }

      function copyFile(fileEntry) {
        //generate a new name for the file
        console.log('in copy fileFolder');
        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
        var newName = getRandomString(5) + name;

        //copy the file to the local accessible FileSystem
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + folder.name, function(fileSystem2) {
          fileEntry.copyTo(
            fileSystem2,
            newName,
            onCopySuccess,
            fail
            );
        },
        fail);
      }

      function onCopySuccess(entry) {
        newFiles.push(entry.nativeURL);
        if(newFiles.length === files.length){
          console.log('all files copied');
          rootDeferred.resolve(newFiles);
        }
      }

      function getRandomString(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i=0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      }

      function fail(err) {
        rootDeferred.reject('copying failed');
      }

      return rootDeferred.promise;
    };

    var getImageFromPhoneCamera = function(){
      var options = {
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        encodingType: Camera.EncodingType.JPEG,
        targetHeight: 800,
        targetWidth: 800,
      };
      return $cordovaCamera.getPicture(options);
    };

    var getImageFromImagePicker = function(maxImagesAllowed){
      var options = {
       maximumImagesCount: maxImagesAllowed,
       width: 800,
       height: 800,
       quality: 80
     };

     return $cordovaImagePicker.getPictures(options);
    };

    var usePhoneCamera = function(folder){
      var deferred = $q.defer();
      var imageURIs = [];
      //captures images and returns local file links

      //get the picture
      getImageFromPhoneCamera()
        .then(function(imageURI) {
        //create a directory if not present
        createFolderIfNotPresent(folder)
          .then(function(success){
          //move it the local folder depending on the context
          copyFilesToLocalDirectory(imageURI, folder)
            .then(function(copiedFiles){
          //return the fileLink to the view for display
            while(copiedFiles.length > 0){
              imageURIs.push(copiedFiles.pop());
            }
              $cordovaCamera.cleanup();
              deferred.resolve(imageURIs);
              console.log("URI : " + JSON.stringify(imageURIs));
          });
        });
      }, function(err) {
        console.log('error capturing pics');
        deferred.reject('capturing pics aborted');
      });
      return deferred.promise;
    };

    var useImagePicker = function(folder, maxImagesAllowed){
      //returns imageURIs of the picked images
      var deferred = $q.defer();
      var imageURIs = [];

      getImageFromImagePicker(maxImagesAllowed)
      .then(function (pickedImages){
        console.log(JSON.stringify(pickedImages));
        createFolderIfNotPresent(folder)
          .then(function(success){
            copyFilesToLocalDirectory(pickedImages, folder)
            .then(function(copiedImages){
              console.log(JSON.stringify(copiedImages));
              while(copiedImages.length > 0){
                imageURIs.push(copiedImages.pop());
              }
              console.log('done loading');
              deferred.resolve(imageURIs);
            });
          });
      }, function(error) {
        console.log('error getting pics');
        deferred.reject('error getting pics');
      });
      return deferred.promise;
    };


    var uploadPostImages = function (postId, imageArray, uploadedImagesArray, serverFolderName){
      //given postId and imageArray
      var deferred = $q.defer();

      if(imageArray.length === 0){
        deferred.resolve('no image to upload');
        return deferred.promise;
      }

      var length = imageArray.length;
      for(var i = 0; i < length; i++){
        uploadImage(postId, imageArray[i], serverFolderName)
          .then( success, error);
      }

      function error (err) {
        deferred.reject('error uploading file :' + err);
      }

      function success (file) {
        //removeFile(file.filePath, serverFolderName);
        imageArray.splice(imageArray.indexOf(file.filePath),1);

        uploadedImagesArray.push(file.newFileName);
        if(imageArray.length === 0){
          deferred.resolve('upload completed');
        }
      }

      function uploadImage(postId, filePath, serverFolderName){
        var country = configs.country();
        var file = {filePath: filePath, newFileName:''};
        var deferred = $q.defer();
        var operationType = "insert";
        var serverPageAddress = serverAddress + "/imageUploader.php";
        var options = {
          params : {
            'directory': serverFolderName,
            'postId': postId,
            'operation': operationType,
            'country': country
          }
        };
        //stores in the dataDirectory path in iOS system.


        $cordovaFileTransfer.upload(serverPageAddress, filePath, options)
          .then(function(success){
            var response = JSON.parse(success.response);
            if(response.status == "success"){
              file.newFileName = response.fileName;
              deferred.resolve(file);
              console.log('fileName ' + file.newFileName);
              return;
            }
            deferred.reject(success.data);
          }, function(error){
            console.log(error);
            deferred.reject(filePath);
          });
        return deferred.promise;
      }


      function removeFile(filePath, folder){
        var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
        return $cordovaFile.removeFile(cordova.file.dataDirectory + folder.name, fileName)
              .then(function (success) {
                console.log(fileName +' uploaded and removed');
                return success;
              }, function (error) {
                console.log(JSON.stringify(error));
                return error;
              });
      }

      return deferred.promise;
    };

    var removeFileFromServer = function(postId, fileName){
        var operationType = 'delete';
        var data = $.param({
                        directory:'uploads',
                        fileName: fileName,
                        postId: postId,
                        operation: operationType
                      });

       return $http({
          url: serverAddress + '/imageUploader.php',
          method: 'POST',
          data: data,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        }).then(function(success){
          images.numImageUploadable++;
          return success;
        });
    };

    var showActionSheet = function(context, overwrite) {
      //determine folderName
      var imageArray = Array();
      var deferred = $q.defer();
      var folder = {};

      if(context == "post"){
        folder.name = 'uploads';
      }else if(context == "profilePic" || context == "coverPic"){
        folder.name = 'userProfilePics';
      }

      console.log(folder.name + ' value of folderName ' + context);
      if(images.isMaxNoImagesExceeded() && !overwrite)
        return;

      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
         buttons: [
         { text: 'Use Camera'},
         { text: 'Select Images From Gallery' }
         ],
         titleText: 'Attach Images',
         cancelText: 'Cancel',
         cancel: function() {
              // add cancel code..
              deferred.reject('operation cancelled');
            },
            buttonClicked: function(index) {
             if(index === 0){
              usePhoneCamera(folder)
                .then(function(imageURIs){
                  deferred.resolve(imageURIs);
                });
            }else if(index === 1){
              useImagePicker(folder)
                .then(function(imageURIs){
                  deferred.resolve(imageURIs);
                });
            }
            return true;
          }
      });

      return deferred.promise;
     };

    var removeImageFromDevice = function(index, imageArray){
      imageArray.splice(index,1);
      images.numImageUploadable++;
    };

    var uploadProfilePic = function(imageArray, userId){
        var deferred = $q.defer();
        images.numImageUploadable = 1;
        images.setMaxImagesAllowed = 1;
        var filePath = imageArray.pop();
        var serverFolderName = 'userProfilePics';
        var file = {filePath: filePath, newFileName:''};

        var operationType = "profilePic";
        var serverPageAddress = serverAddress + "/imageUploader.php";
        var options = {
          params : {
            'directory': serverFolderName,
            'userId': userId,
            'operation': operationType
          }
        };



          //anotherUploadingMethod(filePath, serverPageAddress);

        $cordovaFileTransfer.upload(serverPageAddress, filePath, options, true)
          .then(function(success){
            var response = JSON.parse(success.response);
            if(response.status == "success"){
              file.newFileName = response.fileName;
              removeFile(file.filePath, serverFolderName);
              console.log('fileName ' + file.newFileName);
              userAuthServices.updateUserProfilePage(file.newFileName);
              deferred.resolve(file);
              return;
            }
            deferred.reject(success.data);
          }, function(error){
            console.log(error);
          });


        function removeFile(filePath, folder){
          var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
          return $cordovaFile.removeFile(cordova.file.dataDirectory + folder, fileName)
                .then(function (success) {
                  console.log(fileName +' uploaded and removed');
                  return success;
                }, function (error) {
                  console.log(JSON.stringify(error));
                  return error;
                });
        }
        return deferred.promise;
    };

    var imageUpldr = function (){
      var maxNumImage,
          totImagesAllowed,
          oldImages,
          newImages,
          folderName;

      var getMaxNumImage = function(){
        return maxNumImage;
      };

      var showMaxImagesExceeded = function(){
        $ionicPopup.alert({
          title: 'Error',
          template: 'No more images can be uploaded. Max. '+ totImagesAllowed +' images allowed!',
          buttons: [{
              text: 'ok'
            }]
        });
      };

      var init = function(_maxNumImage, _oldImages, _newImages, _folderName){
        maxNumImage = _maxNumImage;
        oldImages = _oldImages;
        newImages = _newImages == undefined?[]: _newImages;
        folderName = _folderName;
        totImagesAllowed = _maxNumImage;

        if(oldImages != undefined){
          maxNumImage = maxNumImage - oldImages.length;
        }
      };

      var imagePicker = function(){
        var folder = {name : folderName};
        return useImagePicker(folder, maxNumImage)
          .then(function(images){
            maxNumImage = maxNumImage - images.length;
            while(images.length > 0){
              newImages.push(images.pop());
            }
          });
      };

      var phoneCamera = function(){
        var folder = {name : folderName};
        return usePhoneCamera(folder)
          .then(function(images){
            newImages.push(images.pop());
            maxNumImage = maxNumImage - 1;
          });
      };

      var showActionSheet = function(){
        if(maxNumImage <= 0){
          showMaxImagesExceeded();
          return false;
        }

        var deferred = $q.defer();

        $ionicActionSheet.show({
            buttons: [
             { text: 'Use Camera'},
             { text: 'Select Images From Gallery'}
            ],
            titleText: 'Attach Images (Max. '+ totImagesAllowed+' images allowed)',
            cancelText: 'Cancel',
            cancel: function() {
                // add cancel code..
                deferred.reject(null);
            },
            buttonClicked: function(index) {
              if(index === 0){
                phoneCamera()
                  .then(function(){
                    deferred.resolve(newImages);
                  });
              }else if(index === 1){
                imagePicker()
                  .then(function(){
                    deferred.resolve(newImages);
                  });
              }
              return true;
            }
        });

          return deferred.promise;
      };

      var removeImageFromView = function(image){
        console.log('remove callled');
        newImages.splice(newImages.indexOf(image), 1);
        maxNumImage++;
      };

      var removeFileFromServer = function(postId, fileName){
          var operationType = 'delete';
          var data = $.param({
                          directory:'uploads',
                          fileName: fileName,
                          postId: postId,
                          operation: operationType
                        });

         return $http({
            url: serverAddress + '/imageUploader.php',
            method: 'POST',
            data: data,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
          }).then(function(success){
            oldImages.splice(oldImages.indexOf(fileName), 1);
            maxNumImage++;
            return success;
          });
      };


        return{
          init: init,
          showActionSheet : showActionSheet,
          getMaxNumImage : getMaxNumImage,
          removeImageFromView : removeImageFromView,
          removeFileFromServer:  removeFileFromServer
        };
    };

    return {
    init: images,
    imageUpldr: imageUpldr,
    removeImageFromDevice: removeImageFromDevice,
    copyFilesToLocalDirectory: copyFilesToLocalDirectory,
    uploadImages: uploadPostImages,
    uploadProfilePic: uploadProfilePic,
    showActionSheet: showActionSheet,
    removeFileFromServer: removeFileFromServer
  };
}])
