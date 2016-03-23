angular.module('starter.services', [])
.value('serverAddress', "http://www.cinemagharhd.com/k-chahiyo/php")
//.value('serverAddress', "http://localhost/php")
.service('kchahiyoServices', function($http, $q, serverAddress){

    /*Jobs
      Items Sale
      Guff-Gaff
      Miscellaneous
      */

      this.postEdited = false;


      var posts= new Array();
      this.getPostsByCatagory = function(catagory, location){
        return $http.get(serverAddress + '/getPosts.php', 
          {params:{catagory: catagory, locationInfo: location}})
        .then(
          function(success){
            posts = success.data;
            return success;
          }, function(error){});    
      }

      this.insertPost = function(post){
        var data = $.param({
          email:post.email,
          unique_id: post.uniqueId,
          title: post.title,
          content: post.content,
          catagory: post.catagory,
          sub_catagory: post.sub_catagory.trim(),
          post_near_city: post.city,
          post_location: post.location
        });

        return $http({
          url:serverAddress + '/insertPost.php',
          method: 'POST',
          data: data, 
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        })
      }

      this.getCitiesByState = function(state){
        return $http.get(serverAddress + '/getCitiesByState.php', {params:{stateName: state}})
      }

      this.getStatesByCountry = function(country){
        return $http.get(serverAddress + '/getCitiesByState.php', {params:{countryName: country}})
      }

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
        return $http.get(serverAddress + '/getCityByZip.php',{'params':{zip: zip}})

      }

      var catagoriesAndSubCatagories = new Array();

      var extractSubCatagories = function(catagory, catSubCats){
        var subCatagory = new Array();
        var catagory = catagory.toLowerCase();
        for(var i = 0; i < catSubCats.length; i++){
          if(catSubCats[i].catagory == catagory){
            subCatagory.push(catSubCats[i]);
          }
        }
        return subCatagory;
      }

      this.getSubCatagories = function(catagory){
        var deferred  = $q.defer();
        if(catagoriesAndSubCatagories.length == 0){
          this.getPostCatagories()
          .then(function(success){
            deferred.resolve(extractSubCatagories(catagory, success.data.content));
          }, function(error){});

        }else{
          deferred.resolve(extractSubCatagories(catagory, catagoriesAndSubCatagories));
        }
        return deferred.promise;
      }

      this.getPostCatagories = function(){

        return $http.get(serverAddress + '/getCatagoriesAndSubCatagories.php')
        .then(function(success){
          catagoriesAndSubCatagories = success.data.content; 
          return success;
        }, function(error){
          console.error('Error while fetching Catagories and Sub Catagories');
        });

      }

    /*this.getPostById = function(id){
      for(var i = 0; i < posts.length; i++){
        if(posts[i].id == id){
          return posts[i];
        }
      }
    }*/

    this.getPostById = function(id){
      if(posts.length == 0){
        //fetch userPost and can be removed in production
        return $http.get(serverAddress + '/getPostById.php',{params:{id: id}})
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
    }


    var myPosts = new Array();
    this.getPostsByUserId = function(id){
      return $http.get(serverAddress + '/getPostsByUserId.php',{params:{userId: id}})
      .then(function(success){
        myPosts = success.data;
        return success;
      }, function(error){});
    }
    this.getUserPostById = function(id){
      if(myPosts.length == 0){
        //fetch userPost and can be removed in production
        return $http.get(serverAddress + '/getPostById.php',{params:{id: id}})
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
    }

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
      })
    }
})
.service('userAuthServices', function($http, $q, $window, $ionicModal, $ionicPopup, $ionicHistory, serverAddress){
  var userData = {};

  this.setStateAndCity = function(state, city){
    $window.localStorage.setItem('stateName', state);
    $window.localStorage.setItem('cityName', city);
  }

  this.getStateAndCity = function(){
    return {
      state: $window.localStorage.getItem('stateName'),
      city: $window.localStorage.getItem('cityName')
    }
  }
  this.isSetStateAndCity = function(){
    if($window.localStorage.getItem('stateName') != (null || "") && 
      $window.localStorage.getItem('cityName') != (null || "")){
      return true
    }
    return false;
  }

  this.watchThisPost = function(post){
    var userId = $window.localStorage.getItem('userId');
    if(typeof(userData.watchedPosts) != 'undefined'){
      userData.watchedPosts.push(post);
    }

    return $http.get(serverAddress +'/postOperations.php', {params:{operationType:'watch', userId :userId, postId: post.id}})
    .then(function(success){
      alert('Posting has been watched');
      return success;
    })
  }

  this.getWatchedPosts = function(){
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
  }

  this.removeWatchedPost = function(post, watchedPosts){

    var userId = $window.localStorage.getItem('userId');
    var postId = post.id;
    return $http.get(serverAddress + '/postOperations.php',{params:{operationType:'removeWatchedPost', postId: postId, userId: userId}});
  }


  var alert = function(content){
    $ionicPopup.alert({
      title: content
    })
  }

  this.getUserDetails = function(){
    return userData.data.userDetails;
  }

  this.getUserPosts = function(){
    return userData.data.posts;
  }

  this.getPostById = function(id){
    var posts = userData.data.posts;
    for(var i = 0; i < posts.length; i++){
      if(posts[i].id == id){
        return posts[i];
      }
    }
  }

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
    })
   }

   this.logUserOut = function(){
    var deferred = $q.defer();
    $window.localStorage.setItem('userId','');
    $window.localStorage.setItem('unique_id','');
    alert('You have been logged out!');
    deferred.resolve('user logged out');
    return deferred.promise;
  }

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
        })  
        
        $scope.loginModalButtons = {
          closeButton : function(){
            $scope.loginModal.hide();
            //deferred.reject('modal closed');
            userAuthDeferred.reject('modal closed');
          },

          loginButton : function(){
          //post to the server for validation on login clicked   
          var onSuccess = function(success){
            $scope.loginModal.hide();
            alert("You have successfully logged in!");
            userAuthDeferred.resolve('success, user data loaded');
          }

          var onError = function(error){
            alert('User credentials do not match!');
            console.log('failure : ' + JSON.stringify(error));
          }
          loginUser($scope.user).then(onSuccess, onError);
        },

        signUp: function(){
          registerUser($scope);
        }
      }
      return deferred.promise;
    }

    var registerUser = function($scope){
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
      })

      $scope.registerModalButtons = {
        closeButton: function(){
          $scope.registerModal.hide();
          $ionicHistory.goBack();
        },
        register: function(){
          $scope.notFilled = false;
          createUser($scope.user)
          .then(function(success){
            $scope.registerModal.hide();
            alert(success);
            $ionicHistory.goBack();
          }, function(failure){
            alert(failure);
          })
        }
      }


      var createUser = function(user){
        var deferred = $q.defer();
        var data = $.param({
          operation:'createUser',    
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          password: user.password,
        });

        $http({
          url: serverAddress +'/registerUser.php',
          method: 'POST',
          data: data, 
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        }).then(function(success){
            //show alert ....
            if(success.data.status == 'success'){
              deferred.resolve('Confirmation email has been sent to you. Please click the link provided to activate your account.');
              
            }else{
              deferred.reject("Provided email address already used!");
            }
          }, function(error){
            deferred.reject('communication error');
          })

        return deferred.promise;
      } 
    }

      //first get login status
      var checkUserLoginStatus = function(){
        var user = {
          userId : $window.localStorage.getItem('userId') ||'',
          unique_id : $window.localStorage.getItem('unique_id')||''
        };

        if(user.userId == '' || user.unique_id == ''){  
          //if not logged (username & pass not in localstorage) load userLoginModule
          userLoginModule(scope);
        }else{
          //userId and unique id present in system, 
          //authenticate the user via authServer
          validateUniqueIdWithServer(user)
          .then(function(success){
            userAuthDeferred.resolve('success'); 
          },
          function(error){
                    //userId or unique_id not valid, call loginModal for re-login, 
                    userLoginModule(scope);
                  });
        }
      }
      checkUserLoginStatus();
      return userAuthDeferred.promise;
    }

    var validateUniqueIdWithServer = function(user){
      //gets user details and their posts
      var deferred = $q.defer();
      var data = $.param({
        operation: 'loginStatus',
        userId: user.userId,
        unique_id: $window.localStorage.getItem('unique_id')
      });

      $http({
        url: serverAddress +'/registerUser.php',
        method: 'POST',
        data: data, 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      }).then(function(success){
        if(success.data.status == 'success'){
          userData.data = success.data.content;
          deferred.resolve('success, got user posts');
          return;
        }
        deferred.reject("user credentials don't match, token might have expired");
      }, function(error){
        deferred.reject('error in the communication');
      })
      return deferred.promise; 
    }
    
    var loginUser = function(user){
      var deferred = $q.defer();
      //gets userInfo new User token and their posts
      var data = $.param({
        operation: 'loginUser', 
        username: user.username,
        password: user.password
      });
      $http({
        url: serverAddress + '/registerUser.php',
        method: 'POST',
        data: data, 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      }).then(function(success){
        if(success.data.status == 'success'){
              //credentials match
              $window.localStorage.setItem('userId',success.data.content.userDetails.uid );
              $window.localStorage.setItem('unique_id',success.data.content.userDetails.unique_id);
              userData.data = success.data.content;
              deferred.resolve('user logged in and posts downloaded');
            }else{
              //if credentials don't match 
              deferred.reject( "failure user credential not valid, function-name: loginUser");
            }
          }, function(error){
            deferred.reject('error in communication, try again '+ error);
          })
      return deferred.promise;
    }

})
.factory('googleMapFactory', function($q, $window){
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
  }

  return {
    load: deferred.promise
  }

})
.factory('imageUploader',['$cordovaFileTransfer','$cordovaFile','$q', function($cordovaFileTransfer, $cordovaFile, $q){
    var uploadedFiles = {
      getDefaultLocation : function(){
        return cordova.file.dataDirectory + 'uploads';
      }
    }

    return {
    copyFilesToLocalDirectory: function(files){
      var rootDeferred = $q.defer();
      var newFiles = Array();

      function createUploadsFolderIfNotPresent(folderName){
        var deferred = $q.defer();
        $cordovaFile.createDir(cordova.file.dataDirectory, folderName, true)
          .then(function (success) {
            deferred.resolve(true);
          }, function (error) {
            deferred.reject(false);
          })
        return deferred.promise;
      }

       $cordovaFile.createDir(cordova.file.dataDirectory, "uploads", true)
      .then(function(){
        //for each image copy them to local folder and getPath
        for (var i = 0; i < files.length; i++) {
          window.resolveLocalFileSystemURL(files[i], copyFile, fail);

          function copyFile(fileEntry) {
            var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
            var newName = makeid() + name;
            window.resolveLocalFileSystemURL(uploadedFiles.getDefaultLocation(), function(fileSystem2) {
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
              if(newFiles.length == files.length){
                // all files uploaded
                rootDeferred.resolve(newFiles);
              }
          }
          
          function makeid() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i=0; i < 5; i++) {
              text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
          }

          function fail(err) {
            rootDeferred.reject('upload failed');
          }
        }

      }, function(err){
        rootDeferred.reject('Local folder could not be created to copy the selected images')
      });
      return rootDeferred.promise;
    },
    isUploadDirPresent : function(){
      var deferred = $q.defer();
      $cordovaFile.checkDir(uploadedFiles.getDefaultLocation(), 'Uploads')
        .then(function(file){
          if(file.isDirectory){
            deferred.resolve(true);
          }else{
            deferred.reject(false);
          }
        }, function(error){
          deferred.reject(false);
        })
      return deferred.promise;  
    },
    uploadImages: function (postId, images){
      var deferred = $q.defer();
      
      if(images.length == 0){
        deferred.resolve('no image to upload');
        return deferred.promise;
      }

      for(var i = 0; i < images.length; i++){  
        uploadImages(postId, images[i])
          .then(function(file) {
            removeFile(file.filePath);
            images.splice(images.indexOf(file.filePath),1);
            if(images.length == 0){
              deferred.resolve('upload completed');
            }
          }, function(err) {
            deferred.reject('error uploading files');
          })
      }

      function uploadImages(postId, filePath){
        var file = {filePath: filePath};
        var deferred = $q.defer();
        var server = "http://www.cinemagharhd.com/k-chahiyo/php/imageUploader.php";
        var options = {params : {'directory':'upload','postId': postId}};
        $cordovaFileTransfer.upload(server, filePath, options)
          .then(function(success){
            deferred.resolve(file);
          }, function(error){
            deferred.reject(error);
          })
        return deferred.promise;
      }

      function removeFile(filePath){
        var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
        return $cordovaFile.removeFile(uploadedFiles.getDefaultLocation(), fileName)
              .then(function (success) {
                console.log(fileName +' uploaded and removed');
              }, function (error) {
                console.log(JSON.stringify(error));
              });
      }
      return deferred.promise;
    }
  }
}])

