angular.module('starter.services', [])
.value('serverAddress', "http://www.cinemagharhd.com/k-chahiyo/php")
//.value('serverAddress', "http://192.168.1.25/k-chahiyo/php")
//.value('serverAddress', 'http://10.3.10.10/k-chahiyo/php')
.service('kchahiyoServices', ['$http','$q', 'serverAddress',
  function($http, $q, serverAddress){
    /*Jobs
      Items Sale
      Guff-Gaff
      Miscellaneous
      */

    this.postEdited = false;
    var posts = [];
    this.getPostsByCatagory = function(catagory, location, pageNum){
      return $http.get(serverAddress + '/getPosts.php',
        {params:{
            catagory: catagory,
            locationInfo: location,
            pageNum: pageNum
          }})
      .then(function(success){
              posts = success.data;
              return success;
            });
    };

    this.getPostsBySearchtext = function(_catagory, _location , _pageNum, _searchText, _selectedOption){
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
          posts = success.data;
          return success;
        });
    };


    this.insertPost = function(post){
      var data = $.param({
        email:post.email,
        unique_id: post.uniqueId,
        title: post.title,
        content: post.content,
        catagory: post.catagory,
        sub_catagory: post.sub_catagory.trim(),
        post_near_city: post.city,
        post_location: post.location,
        hide_user_details: post.hideUserDetails
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
      return $http.get(serverAddress + '/getCitiesByState.php', {params:{stateName: state}});
    };

    this.getStatesByCountry = function(country){
      return $http.get(serverAddress + '/getCitiesByState.php', {params:{countryName: country}});
    };

    this.getCityByZip = function(zip){

    /*
      {
        "status":"success",
        "content":{
          "zip":"75032",
          "city":"Rockwall",
          "state":"TX",
          "longitude":"-96.4413",
          "latitude":"32.8671",
          "timezone":"-6","dst":"1"
        }
      }
      */
      return $http.get(serverAddress + '/getCityByZip.php',{'params':{zip: zip}});

    };

    var catagoriesAndSubCatagories = {};


    this.getPostCatagories = function(){
      return $http.get(serverAddress + '/getCatagoriesAndSubCatagories.php')
        .then(function(success){
          var subCatagories = [];
          var catagoriesArray = [];
          success.data.content.forEach(function(item){
            if(catagoriesArray.indexOf(item.catagory) == -1){
              catagoriesArray.push(item.catagory);
            }
          });
          catagoriesAndSubCatagories = {
            catagories : catagoriesArray,
            catAndSubCat : success.data.content
          };
          return catagoriesAndSubCatagories;
        }, function(error){
          console.error('Error while fetching Catagories and Sub Catagories');
          return null;
        });
    };

  /*this.getPostById = function(id){
    for(var i = 0; i < posts.length; i++){
      if(posts[i].id == id){
        return posts[i];
      }
    }
  }*/

    this.getPostById = function(id){
      if(posts.length === 0){
        //fetch userPost and can be removed in production
        return $http.get(serverAddress + '/getPostById.php',{params:{id: id}});
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
      return $http.get(serverAddress + '/getPostsByUserId.php',{params:{userId: id}})
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
        postId: post.id
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
.service('userAuthServices', ['$http', '$q', 'facebookServices', '$window', '$ionicModal', '$ionicPopup', '$ionicHistory', 'serverAddress',
  function($http, $q, facebookServices, $window, $ionicModal, $ionicPopup, $ionicHistory, serverAddress){
  var userData = {
    facebookLogin: false,
    loggedIn: false,
    userPostsChanged: false
  };

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

  this.setStateAndCity = function(state, city){
    $window.localStorage.setItem('stateName', state);
    $window.localStorage.setItem('cityName', city);
  };

  this.getStateAndCity = function(){
    return {
      state: $window.localStorage.getItem('stateName'),
      city: $window.localStorage.getItem('cityName')
    };
  };

  this.isSetStateAndCity = function(){
    if($window.localStorage.getItem('stateName') != (null || "") &&
      $window.localStorage.getItem('cityName') != (null || "")){
      return true;
    }
    return false;
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
    var userId = $window.localStorage.getItem('userId');
    if(post.userId == userId){
      alert('Own posts cannot be watched!');
      return;
    }

    if(typeof(userData.watchedPosts) == 'undefined')
      userData.watchedPosts = Array();

      userData.watchedPosts.push(post);

    $http.get(serverAddress +'/postOperations.php', {params:{operationType:'watch', userId :userId, postId: post.id}})
    .then(function(success){
      alert('Posting has been watched');
      return;
    },function(err){
      alert(err);
    });
  };

  this.getWatchedPosts = function(){
    var userId = $window.localStorage.getItem('userId');
    return $http.get(serverAddress + '/postOperations.php',{params:{operationType:'getWatchedPosts', userId: userId}})
              .then(function(success){
                userData.watchedPosts = success.data;
                return success;
              });
  };

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
      postId: post.id
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
    $window.localStorage.setItem('userId','');
    $window.localStorage.setItem('unique_id','');

    return facebookServices.logout()
      .then(function(){
        userData.loggedIn = false;
        alert('You have been logged out!');
      });
  };

  this.authenticateThisUser = function(scope){

    var userAuthDeferred = $q.defer();

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
            $scope.loginModal.hide();
            $scope.spinnerModal.remove();
          });
        });



        $scope.loginModalButtons = {
          closeButton : function(){
              $scope.$emit('loginComplete','complete');
              deferred.reject('modal closed');
            },
          loginButton : function(){
            //post to the server for validation on login clicked
            loginUser($scope.user).then(onSuccess, onError);

            function onSuccess(success){
              $scope.$emit('loginComplete','complete');
              alert("You have successfully logged in!");
              deferred.resolve('success, user data loaded');
            }

            function onError(error){
              alert('User credentials do not match!');
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
                $scope.spinnerModal.hide();
                $scope.spinnerModal.remove();
              });
            });

            facebookServices.init()
              .then(function(fb){
                fb.getLoginStatus()
                .then(function(response){
                  /*user already allowed access to the app*/
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
                        getUserDetailsFromFB(fb)
                          .then(function(userDetails){
                            regstrUsrDtlsToSvr(userDetails, 'fbUserRegister')
                              .then(function(success){
                                $scope.$emit('loginComplete','complete');
                                loadUserDataAndPosts(success);
                                deferred.resolve('user logged in and posts downloaded');
                        });
                    }, function(error){
                      alert('error acquiring fb data, try again! ' + error);
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
                    });
                 });
              }, function(error){
                console.log(' fb module crashed ' + error);
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
              return fb.getProfilePicBig()
              .then(function(pictureURL){
                      user.profilePicBig = pictureURL;
                      return user;
                });
            });
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
        $scope.notFilled= true;
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
        register: function(){
          $scope.notFilled = false;
          regstrUsrDtlsToSvr($scope.user, 'createUser')
          .then(function(success){
            $scope.registerModal.hide();
            alert(success);
            $ionicHistory.goBack();
          }, function(failure){
            alert(failure);
          });
        }
      };
    };

    //first get login status
    var checkUserLoginStatus = function(){
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
            console.log(error);
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
  };

  var validateUniqueIdWithServer = function(userId, unique_id){
      //gets user details and their posts

      var data = $.param({
        operation: 'loginStatus',
        userId: userId,
        unique_id: unique_id
      });
      return sendUserCredentialForValidation(data);
    };

  var loginUser = function(user){
      console.log('loginUser called');
      //gets userInfo new User token and their posts
      var data = $.param({
        operation: 'loginUser',
        username: user.username,
        password: user.password
      });
      return sendUserCredentialForValidation(data);
    };

  function sendUserCredentialForValidation(data){
      var deferred = $q.defer();
      $http({
        url: serverAddress +'/registerUser.php',
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      }).then(function(response){
        if(response.data.status == 'success'){
          loadUserDataAndPosts(response);

          deferred.resolve('user details and post loaded');
          return;
        }
        deferred.reject(response.data.content);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
}])
.factory('googleMapFactory', ['$q','$window',
  function($q, $window){
    var loaded = false;
    var deferred = $q.defer();
    var tag = document.createElement('script');
    tag.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAZv-6hTAT3JfRWLaWiGvadnYvpsjR3DeU&callback=initMap&libraries=places";
    tag.async = true;
    var lastScriptTag = document.getElementsByTagName('script')[0];
    lastScriptTag.parentNode.appendChild(tag);

    $window.initMap = function(){
      if(!loaded){
        loaded = true;
        console.log('loaded googleMapFactory');

        deferred.resolve(document.getElementsByClassName('pac-container'));
      }
    };
    return {
      load: deferred.promise
    };
}])
.factory('imageUploader',['$cordovaFileTransfer','$ionicActionSheet','$ionicPopup','$cordovaFile','$cordovaCamera','$cordovaImagePicker','$q','$http','serverAddress',
  function($cordovaFileTransfer,$ionicActionSheet, $ionicPopup, $cordovaFile, $cordovaCamera, $cordovaImagePicker, $q, $http, serverAddress){

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
        deferred.reject('error uploading files');
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
        var file = {filePath: filePath, newFileName:''};
        var deferred = $q.defer();
        var operationType = "insert";
        var serverPageAddress = serverAddress + "/imageUploader.php";
        var options = {
          params : {
            'directory': serverFolderName,
            'postId': postId,
            'operation': operationType
          }
        };

        $cordovaFileTransfer.upload(serverPageAddress, filePath, options)
          .then(function(success){
            console.log(JSON.stringify(success));
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
          });
        return deferred.promise;
      }

      var uploadProfilePic = function(){

      };

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

        $cordovaFileTransfer.upload(serverPageAddress, filePath, options)
          .then(function(success){
            console.log(JSON.stringify(success));
            var response = JSON.parse(success.response);
            if(response.status == "success"){
              file.newFileName = response.fileName;
              deferred.resolve(file);
              removeFile(file.filePath, serverFolderName);
              console.log('fileName ' + file.newFileName);
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
.service('viewFullScreenModal', ['$ionicModal','$ionicScrollDelegate',
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
