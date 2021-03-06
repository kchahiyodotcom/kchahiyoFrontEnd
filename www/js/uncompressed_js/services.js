kchahiyoServices = angular.module('kchahiyo.services', []);

kchahiyoServices.service('geoServices', ['$window',
  function($window){
    this.resetGeoParameters = function(){
      console.log('here in resetGeoParameters');
      if($window.localStorage.getItem('country') != null){
        $window.localStorage.removeItem('country');
      }
      if($window.localStorage.getItem('stateName') != null){
        $window.localStorage.removeItem('stateName');
      }
      if($window.localStorage.getItem('cityName') != null){
        $window.localStorage.removeItem('cityName');
      }
    }
}])

kchahiyoServices.factory('googleMapFactory', ['$q','$window',
  function($q, $window){
    var loaded = false;
    var deferred = $q.defer();

    $window.initMap = function(){
      if(!loaded){
        loaded = true;
        console.log('loaded googleMapFactory');
        deferred.resolve(document.getElementsByClassName('pac-container'));
      }
    };

    var tag = document.createElement('script');
    tag.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAZv-6hTAT3JfRWLaWiGvadnYvpsjR3DeU&libraries=places&callback=initMap";
    tag.async = true;
    var lastScriptTag = document.getElementsByTagName('script')[0];
    lastScriptTag.parentNode.appendChild(tag);
    return {
      load: deferred.promise
    };
}])

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

kchahiyoServices.service('kchahiyoServices', ['$http','$q', 'serverAddress','configs','$sce','$rootScope','$ionicLoading',
  function($http, $q, serverAddress, configs, $sce, $rootScope, $ionicLoading){
    console.log('serverAddress :' + serverAddress);
    /*Jobs
      Items Sale
      Guff-Gaff
      Miscellaneous
    */
    var posts = [];
    var getPost = function(_catagory, _location , _pageNum, _searchText, _selectedOption){
      return $http.get(serverAddress + '/getPosts.php',
        {params:{
            catagory: _catagory,
            locationInfo: _location,
            pageNum: _pageNum,
            searchText: _searchText,
            selectedOption: _selectedOption
          }})
      .then(
        function(success){
          posts.concat(success.data);
          return success;
        });
    };

    this.postEdited = false;

    this.getPostsByCatagory = getPost;

    this.getPostsBySearchtext = getPost;

    this.insertPost = function(post){
      var country = configs.country();

      var data = $.param({
        countryName: country,
        email:post.email,
        unique_id: post.uniqueId,
        title: post.title,
        content: post.content,
        catagory: post.catagory,
        sub_catagory: post.sub_catagory? post.sub_catagory.trim():"",
        post_near_city: post.city,
        post_location: post.location,
        post_title_image: post.titleImage? post.titleImage:"0",
        hide_user_details: post.hideUserDetails,
        item_price: post.item_price? post.item_price : "0"
      });

      return $http({
        url:serverAddress + '/insertPost.php',
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      });
    };

    this.getCitiesByState = function(state){
      var country = configs.country();
      return $http.get(serverAddress + '/getCitiesByState.php', {
        params:{
          countryName:  country,
          stateName: state || ""
        }})
    };

    this.getCitiesByCountry = function(country){
      $sce.trustAsResourceUrl(serverAddress);
      return $http.get(serverAddress + '/getCitiesByCountry.php?countryName='+country)
              .then(function(success){
                return success;
              }, function(error){
                console.log("no connection with server");
                var cities = {data: ["Butwal", "Bhairahawa", "Birgunj"]};
                return cities;
              });
    }

    this.getStatesByCountry = function(country){
      return $http.get(serverAddress + '/getCitiesByState.php', {params:{countryName: country}})
    };

    this.getCityByZip = function(zip){
      return $http.get(serverAddress + '/getCityByZip.php',{'params':{zip: zip}});
    };

    var catagoriesAndSubCatagories = {};

    this.getAddPostFeatures = function(){
      return $http.get(serverAddress +'/getConfigs.php');
    }

    this.getPostCatagories = function(){
      return $http.get(serverAddress +'/getConfigs.php')
        .then(function(success){
          var catagories = success.data.postCatagories[configs.country()].catagories;
          var catagoryNames = Object.keys(success.data.postCatagories[configs.country()].catagories);
          var catSubCats = success.data.postCatagories[configs.country()].catagories;
          console.log(catagoryNames);
            return  {catagories : catagoryNames,
                    subCatagories : catSubCats,
                    catagoryObject: catagories,
            };
      }, function(error){
        console.log(error);
      })
    };

    (function initiateLoadingSpinnerModal(){
      $rootScope.$on("loadingStarted", function(){
        $ionicLoading.show();
      })
      $rootScope.$on("loadingCompleted",function(){
        $ionicLoading.hide();
      });
    })();

    this.getPostById = function(id){
      var country = configs.country();
      if(posts.length === 0){
        //fetch userPost and can be removed in production
        return $http.get(serverAddress + '/getPostById.php',{params:{countryName: country, id: id}});
      }else{
        var deferred = $q.defer();
        for(var i = 0; i < posts.length; i++){
          if(posts[i].id == parseInt(id)){
            var success = {};
            success.data = posts[i];
            deferred.resolve(success);
          }
        }
        return deferred.promise;
      }
    };

    this.getPostsByUserId = function(id){
      var country = configs.country();
      return $http.get(serverAddress + '/getPostsByUserId.php',
        {
          params:{
            userId: id,
            countryName: country
          }
        })
      .then(function(success){
        myPosts = success.data;
        return success;
      }, function(error){});
    };

    this.getUserPostById = function(id){
      if(myPosts.length === 0){
        //fetch userPost and can be removed in production
        return $http.get(serverAddress + '/getPostById.php',{params:{id: id}});
      }else{
        var deferred = $q.defer();
        for(var i = 0; i < myPosts.length; i++){
          if(myPosts[i].id == parseInt(id)){
            var success = {};
            success.data = myPosts[i];
            deferred.resolve(success);
          }
        }
        return deferred.promise;
      }
      var myPosts = [];
    };

    this.savePost = function(post){
      var data = $.param({
        operationType: 'save',
        title : post.title,
        content: post.content,
        userId: post.userId,
        postId: post.id,
        countryName: post.tableName,
        post_title_image: post.titleImage? post.titleImage:"0",
        item_price: post.item_price? post.item_price:"0"
    });

      return $http({
        url: serverAddress + '/postOperations.php',
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      });
    };
}])

kchahiyoServices.service('userAuthServices', ['$http', '$q', '$ionicLoading','facebookServices', '$window', '$ionicModal', '$ionicPopup', '$ionicHistory', 'serverAddress','configs',
  function($http, $q, $ionicLoading, facebookServices, $window, $ionicModal, $ionicPopup, $ionicHistory, serverAddress, configs){
    var userData = {
      facebookLogin: false,
      loggedIn: false,
      userPostsChanged: false
    };

    this.updatePostImages = function(postId, images){
      console.log('here at updatePostImages');
      var imageString = '';
      images.forEach(function(image){
        imageString = imageString + ',' + image;
      });
      imageString = imageString.substr(1, imageString.length-1);
      console.log(imageString);
      nextThing(postId, imageString);

      function nextThing(postId, imageString){
        var posts = userData.data.posts;
        for(var i = 0; i < posts.length; i++){
          if(posts[i].id == postId){
            posts[i].attached_images = imageString;
            console.log(posts[i]);
          }
        }
      };
    }

    this.updateUserProfilePage = function (imageFileName) {
      userData.data.userDetails.profilePic = imageFileName;
      return;
    }

    this.setUserPostsChanged = function(boolean){
      userData.userPostsChanged = boolean;
    };

    this.isUserPostsChanged = function(){
      return userData.userPostsChanged;
    };

    var alert = function(content){
      $ionicPopup.alert({
        title: content
      });
    };
    this.resetGeoParameters = function(){
      if($window.localStorage.getItem('country') != null){
        $window.localStorage.removeItem('country');
      }
      if($window.localStorage.getItem('stateName') != null){
        $window.localStorage.removeItem('stateName');
      }
      if($window.localStorage.getItem('cityName') != null){
        $window.localStorage.removeItem('cityName');
      }
    }

    this.setStateAndCity = function(state, city){
      $window.localStorage.setItem('stateName', state);
      $window.localStorage.setItem('cityName', city);
    };

    this.getStateAndCity = function(){
      var location = {};
      var country = configs.country();
       location["country"] = country;
      configs.geoDivision[country]
        .forEach(function(item){
          //if city or state, get value
          location[item] = localStorage.getItem(item);
      })
      return location;
    };

    this.isSetStateAndCity = function(){
      var result = true;
      var country = configs.country();
      if($window.localStorage.getItem("country") === null){
        return false;
      }
      configs.geoDivision[country]
      .forEach(function(item){
        console.log(country);
        console.log(item);
        if($window.localStorage.getItem(item) === null){
          return false;
        }
      })
      return result;
    };

    this.isFacebookLogin = function(){
      return userData.facebookLogin;
    };

    this.userLoggedIn = function(){
      userData.loggedIn = true;
    };

    this.isUserLoggedIn = function(){
      return userData.loggedIn;
    };

    this.watchThisPost = function(post){
      console.log('I am called');
      var userId = $window.localStorage.getItem('userId');
      /*if(post.userId == userId){
        alert('Own posts cannot be watched!');
        return;
      }*/

      if(typeof(userData.watchedPosts) == 'undefined'){
        userData.watchedPosts = Array();
      }
        userData.watchedPosts.push(post);
        var country = configs.country();
        $http.get(serverAddress +'/postOperations.php', {params:{operationType:'watch', userId :userId, postId: post.id, countryName: country}})
          .then(function(success){
            console.log(success);
            if(success.data.status == 'success'){
            alert('The post has been watched');
          }else {
            alert(success.data.content);
          }
            return;
          },function(err){
            alert(err);
          });
    };

    this.getWatchedPosts = function(){
      return getWatchedPostsForCurrentUser();
    };

    function getWatchedPostsForCurrentUser(){
      console.log('in getWatchedPostsForCurrentUser');
      var userId = $window.localStorage.getItem('userId');
      return $http.get(serverAddress + '/postOperations.php',{params:{operationType:'getWatchedPosts', userId: userId}})
                .then(function(success){
                  userData.watchedPosts = success.data;
                  return success;
                });
    }

    this.getWatchedPostDetailsById = function(postId){
      var watchedPostsLength = userData.watchedPosts.length;
      for(var i = 0; i < watchedPostsLength; i++){
        if(userData.watchedPosts[i].id == postId){
          return userData.watchedPosts[i];
        }
      }
      return null;
    };

    this.removeWatchedPost = function(post, watchedPosts){

      var userId = $window.localStorage.getItem('userId');
      var postId = post.id;
      return $http.get(serverAddress + '/postOperations.php',{params:{operationType:'removeWatchedPost', postId: postId, userId: userId}});
    };

    this.getUserDetails = function(){
      return userData.data.userDetails;
    };

    this.getUserPosts = function(){
      return userData.data.posts;
    };

    this.getPostById = function(id){
      var posts = userData.data.posts;
      for(var i = 0; i < posts.length; i++){
        if(posts[i].id == id){
          return posts[i];
        }
      }
    };

    this.deletePost = function(post){
       //not working
       var myPosts = userData.data.posts;
       var data = $.param({
        operationType: 'delete',
        userId: post.userId,
        postId: post.id,
        countryName: post.tableName
      });

       myPosts.splice(myPosts.indexOf(post),1);

       return $http({
        url: serverAddress + '/postOperations.php',
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      });
    };

     this.logUserOut = function(){
      var deferred = $q.defer();
      $window.localStorage.setItem('userId','');
      $window.localStorage.setItem('unique_id','');

      //check if user used facebook account to log in
      let response = typeof facebookServices;
      //if facebook account used to log in
      console.log(facebookServices);
      function afterLogoutSuccess(){
        userData.loggedIn = false;
        alert('You have been logged out!');
        deferred.resolve('You have been logged out!');
      }

      if(response.status == "connected"){
      facebookServices.logout()
          .then(function(){
            afterLogoutSuccess();
          },function(err){
            console.log(err);
            deferred.reject('error while logging out');
          });
        }
        else{
          afterLogoutSuccess();
        }

        return deferred.promise;
    };

    this.authenticateThisUser = function(scope){

      var userAuthDeferred = $q.defer();
      $q.resolve();
        //loginModal and controllers are loaded
      var userLoginModule = function($scope){
          //get user info from login modal
          var deferred = $q.defer();
          $scope.user = {};
          $scope.loginModalButtons ={};

          $ionicModal.fromTemplateUrl('templates/tab-login.html',{
            scope: $scope
          }).then(function(modal){
            $scope.loginModal = modal;
            $scope.loginModal.show();
            $scope.$on('loginComplete', function(event, data){
              $ionicLoading.hide();
              $scope.loginModal.hide();
              if($scope.spinnerModal === undefined){
                $scope.spinnerModal.remove();
              }
            });
            $scope.$on('loginInComplete', function(event, data){
              //$scope.spinnerModal.remove();
              $q.reject();
            });
          });

          $scope.loginModalButtons = {
            closeButton : function(){
                $scope.$emit('loginComplete','complete');
                deferred.reject('modal closed');
              },
            loginButton : function(){
              //post to the server for validation on login clicked
              loginUser($scope.user)
                .then(onSuccess, onError);

              function onSuccess(success){
                $scope.$emit('loginComplete','complete');
                alert("You have successfully logged in!");
                deferred.resolve('success, user data loaded');
              }

              function onError(error){
                alert('User credentials do not match!');
                $scope.$emit('loginInComplete',JSON.stringify(error));
                console.log('failure : ' + JSON.stringify(error));
              }
            },
            fbLogin : function(){
              $ionicModal.fromTemplateUrl('templates/spinner-modal.html',{
                scope:$scope
              }).then(function(modal){
                $scope.spinnerModal = modal;
                $scope.spinnerModal.show();
                $scope.$on('loginComplete', function(event, data){
                  console.log('loginCompleted');
                  $scope.spinnerModal.hide();
                  $scope.spinnerModal.remove();
                });

                $scope.$on('loginError',function(event, data){
                  console.log('facebook login error');
                  $scope.spinnerModal.hide();
                })
              });
              console.log(facebookServices.init());
              facebookServices.init()
                .then(function(fb){
                  console.log(fb);
                  fb.getLoginStatus()
                  .then(function(response){
                    /*user already allowed access to the app*/
                    console.log(response);
                    var userId = response.authResponse.userID;
                    var accessToken = response.authResponse.accessToken;
                    console.log(JSON.stringify(response));
                    validateUniqueIdWithServer(userId, accessToken)
                      .then(function(success){
                        $scope.$emit('loginComplete','complete');
                        loadUserDataAndPosts(success);
                        alert("You have successfully logged in!");
                        return deferred.resolve('user successfully logged in');
                      },function(err){
                          console.log(err + 'in validateUniqueIdWithServer');
                          return getUserDetailsFromFB(fb)
                            .then(function(userDetails){
                              return regstrUsrDtlsToSvr(userDetails, 'fbUserRegister')
                                .then(function(success){
                                  console.log('got user details '+ JSON.stringify(userDetails));
                                  $scope.$emit('loginComplete','complete');
                                  loadUserDataAndPosts(success);
                                  deferred.resolve('user logged in and posts downloaded');
                          }, function(err){
                              $scope.$emit('loginError','error');
                              alert('Registration server didn\'t respond, try again later! ');
                              return err;
                          });
                      }, function(error){
                        alert('error acquiring fb data, try again! ' + error);
                        $scope.$emit('loginError','error');
                        console.log('error acquiring fb data, try again! ' + error );
                      });
                          return err;
                      });
                  }, function(){
                    //if user has logged out from app
                    console.log('here now in gett loginStatus error cb' );
                    getUserDetailsFromFB(fb)
                      .then(function(userDetails){
                        return regstrUsrDtlsToSvr(userDetails, 'fbUserRegister')
                          .then(function(success){
                            $scope.$emit('loginComplete','complete');
                            loadUserDataAndPosts(success);
                            deferred.resolve('user logged in and posts downloaded');
                          });
                      }, function(error){
                        alert('error acquiring fb data, try again! ' + error);
                        console.log('error acquiring fb data, try again! ' + error );
                        $scope.$emit('loginError','error');
                      });
                   });
                }, function(error){
                  console.log(' fb module crashed ' + error);
                  $scope.$emit('loginError','error');
                });
            },
            signUp: function(){
              showRegisterModal($scope);
            }
          };
        return deferred.promise;
      };

      var getUserDetailsFromFB = function(fb){
        return fb.login()
          .then(function(success){
            var user = {accessToken: success.authResponse.accessToken};
            return fb.getPublicProfile()
              .then(function(userDetails){
                user.publicProfile = userDetails;
                console.log("error in the userdetails " + JSON.stringify(userDetails));
                return fb.getProfilePicBig()
                .then(function(pictureURL){
                        user.profilePicBig = pictureURL;
                        console.log("error in the user " + JSON.stringify(user));
                        return user;
                  });
              },function(err){
                $scope.$emit('loginError','error');
                console.log("error in the getUserDetailsFromFB " + err);
              });
          }, function(err){
            $scope.$emit('loginError','error');
            console.log("error in the getUserDetailsFromFB " + err);
            return err;
          });
      };

      var regstrUsrDtlsToSvr = function(user, operation){
        var deferred = $q.defer();
        var data = $.param({
          operation:operation,
          user:user,
        });

        $http({
          url: serverAddress +'/registerUser.php',
          method: 'POST',
          data: data,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        }).then(function(response){
            //show alert ....
            console.log(JSON.stringify(response.data));
            var message = response.data.content;
            if(response.data.status == 'success'){
              deferred.resolve(response);
            }else{
              deferred.reject(message);
            }
          }, function(error){
            deferred.reject(error);
          });
        return deferred.promise;
      };

      var showRegisterModal = function($scope){
        $scope.loginModal.hide();
        $ionicModal.fromTemplateUrl('templates/tab-register.html', {
          scope : $scope
        }).then(function(modal){
          $scope.registerModal = modal;
          $scope.registerModal.show();
          $scope.user = {};
          $scope.user.firstName = {
            text: 'firstName',
            word: /^\s*\w*\s*$/
          };
        });

        $scope.registerModalButtons = {
          closeButton: function(){
            $scope.registerModal.hide();
            $ionicHistory.goBack();
          },
          register: function(userDetails){
            if($scope.user.password != $scope.user.reenter_password){
              alert("Passwords don't match");
            }else if(userDetails.$valid && $scope.user.password == $scope.user.reenter_password){
              regstrUsrDtlsToSvr($scope.user, 'createUser')
              .then(function(success){
                var response = success.data;
                if(response.status == 'success'){
                  $scope.registerModal.hide();
                  alert(response.content);
                  $ionicHistory.goBack();
                }else if(response.status == 'error'){
                  alert(response.content);
                }
              }, function(failure){
                alert(failure.content);
              });
            }else{
              alert("Invalid data provided!");
            }
          }
        };
      };

      //first get login status
      var checkUserLoginStatus = function(){
        //first checks if the userId and unique_id stored in
        //a valid userId and unique_id by validating with the auth server
        //if user credentials invalid or already expired, login modal
        //shows up

          console.log('checkUserLoginStatus');
          var user = {
            userId : $window.localStorage.getItem('userId') ||'',
            unique_id : $window.localStorage.getItem('unique_id')||''
          };

          if(user.userId === ''|| user.unique_id === ''){
              //if not logged (username & pass not in localstorage) load userLoginModule
              console.log(JSON.stringify(user));
            return userLoginModule(scope);
          }else{
            //userId and unique id present in system,
            //authenticate the user via authServer
              var userId = user.userId;
              var unique_id = $window.localStorage.getItem('unique_id');
            return validateUniqueIdWithServer(userId, unique_id)
            .then(function(userDetails){
              //get Userpost
              return 'success';
            },
            function(error){
                //userId or unique_id is not valid, call loginModal for re-login,
                return userLoginModule(scope);
            });

          }
      };
        return checkUserLoginStatus();
    };

    var loadUserDataAndPosts = function(success){
      $window.localStorage.setItem('userId',success.data.content.userDetails.uid );
      $window.localStorage.setItem('unique_id',success.data.content.userDetails.unique_id);
      userData.data = success.data.content;
      console.log('in loadUserDataAndPosts');
      getWatchedPostsForCurrentUser();
    };



    function sendUserCredentialForAuthentication(data){
      console.log('here we are');
      $ionicLoading.show();
        var deferred = $q.defer();
        $http({
          url: serverAddress +'/registerUser.php',
          method: 'POST',
          data: data,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        }).then(function(response){
          $ionicLoading.hide();
          if(response.data.status == 'success'){
            loadUserDataAndPosts(response);
            deferred.resolve('user details and post loaded');
            return;
          }
          deferred.reject(response.data.content);
        }, function(error){
          $ionicLoading.hide();
          deferred.reject(error);
        });
        return deferred.promise;
      }

      var validateUniqueIdWithServer = function(userId, unique_id){
          //gets user details and their posts
          console.log('validate with unique id with server failed');
          var data = $.param({
            operation: 'loginStatus',
            userId: userId,
            unique_id: unique_id
          });
          return sendUserCredentialForAuthentication(data);
        };

      var loginUser = function(user){
          console.log('loginUser called');
          //gets userInfo new User token and their posts
          var data = $.param({
            operation: 'loginUser',
            username: user.username,
            password: user.password
          });
          return sendUserCredentialForAuthentication(data);
        };
}])

kchahiyoServices.value('serverAddress', 'https://kchahiyo-nishchalpandey.rhcloud.com')
//.value('serverAddress', "http://www.cinemagharhd.com/k-chahiyo/php")
//.value('serverAddress', "http://192.168.0.36:7888/k-chahiyo/php")
//.value('serverAddress', 'http://localhost/kchahiyo/php')
//.value('serverAddress', 'http://192.168.0.36/kchahiyo/php')

kchahiyoServices.service('viewFullScreenModal', ['$ionicModal','$ionicScrollDelegate',
  function($ionicModal,$ionicScrollDelegate){
    this.init = function($scope, images){

      $scope.slideHasChanged = function(index){
        $ionicScrollDelegate.$getByHandle('scrollHandle'+index).zoomTo(1);
        $scope.active = index;
      };

      $scope.closeModal = function(){
        $scope.viewFullScreenModal.hide();
      };

      $scope.$on('$destory', function(){
        $scope.viewFullScreenModal.remove();
      });

      return $ionicModal.fromTemplateUrl('templates/modal-image.html', {
        scope: $scope
      });
  };
}]);
