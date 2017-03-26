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
