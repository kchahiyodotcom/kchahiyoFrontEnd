angular.module('starter.services', [])
  .service('kchahiyoServices', function($http, $q){
    var web_link = "http://www.cinemagharhd.com/k-chahiyo/php";
    /*
      Jobs
      Items Sale
      Guff-Gaff
      Miscellaneous
    */

    this.postEdited = false;

    var posts= new Array();
    this.getPostsByCatagory = function(catagory){
                            return $http.get(web_link + '/getPosts.php', 
                              {params:{catagory: catagory}})
                                .then(
                                    function(success){
                                      posts = success.data;
                                      console.log(posts);
                                      return success;
                                    }, function(error){});    
                           }

    this.insertPost = function(post){

        var data = $.param({
                          email:post.email,
                          password: post.password,
                          title: post.title,
                          content: post.content,
                          catagory: post.catagory,
                          sub_catagory: post.sub_catagory,
                          post_location: post.location
                        });

        return $http({
          url:web_link + '/insertPost.php',
          method: 'POST',
          data: data, 
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        })
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
      return $http.get(web_link + '/getCityByZip.php',{'params':{zip: zip}})

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
      
      return $http.get(web_link + '/getCatagoriesAndSubCatagories.php')
        .then(function(success){
          catagoriesAndSubCatagories = success.data.content; 
          return success;
        }, function(error){
          console.error('Error while fetching Catagories and Sub Catagories');
      });

    }

    this.getPostById = function(id){
      for(var i = 0; i < posts.length; i++){
        if(posts[i].id == id){
          return posts[i];
        }
      }
    }
    var myPosts = new Array();
    this.getPostsByUserId = function(id){
      return $http.get(web_link + '/getPostsByUserId.php',{params:{userId: id}})
                .then(function(success){
                  myPosts = success.data;
                  return success;
                }, function(error){});
    }


    this.getUserPostById = function(id){
      if(myPosts.length == 0){
        //fetch userPost and can be removed in production
        return $http.get(web_link + '/getPostById.php',{params:{id: id}})
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
        url: web_link + '/postOperations.php',
        method: 'POST',
        data: data, 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
      })
    }
  })
.service('userAuthServices', function($http, $window, $ionicModal, $ionicHistory){
  var userData = {};

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

  this.authenticateThisUser = function(scope){
    var loginModal;

    var userLoginModule = function($scope){
      //get user info from login modal

      $ionicModal.fromTemplateUrl('templates/tab-login.html',{
      scope: $scope
    }).then(function(modal){
    //  loginModal.show();
      $scope.loginModal = modal;
      $scope.loginModal.show();

      $scope.closeButtonClicked = function(){
          console.log('closeButtonClicked');
          $scope.loginModal.hide();
          $ionicHistory.goBack();
        }



      $scope.user = {};

      //post to the server for validation on login clicked   
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
        loginUser($scope.user)
                .then(onSuccess, onError);
      }


    })

    }
    
    //first get login status
    var user = {
        userId : $window.localStorage.getItem('userId') ||'',
        unique_id : $window.localStorage.getItem('unique_id')||''
      };

    //if not logged (username & pass not in localstorage) show login modal and call loginUser,
    if(user.userId == '' || user.unique_id == ''){
      userLoginModule(scope);
    }else{
      getLoginStatus(user)
        .then(function(status){
            if(status == "success"){
              //populate the posts
              showUserPost();
              return "success";
            }
            //call loginModal
            userLoginModule(scope);
            
          },function(error){});
    }

    getLoginStatus(user);

    //get posts
    //return succes or failure finally if user not in database
    //can ask for registation



  }
  
  this.deletePost = function(post){
   //not working   
        var data = $.param({
          operationType: 'delete', 
          userId: post.userId,
          postId: post.id
        });

        myPosts.splice(myPosts.indexOf(post),1);

      return $http({
        url: web_link + '/postOperations.php',
        method: 'POST',
        data: data, 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
      })
    }
  

  //var serviceAddress = "http://www.cinemagharhd.com/k-chahiyo/php/registerUser.php";
  var serviceAddress = "http://localhost/php/registerUser.php";
  
   var getLoginStatus = function(user){
    //gets user details and their posts
  
    var data = $.param({
          operation: 'loginStatus',
          userId: user.userId,
          unique_id: $window.localStorage.getItem('unique_id')
        });
      return $http({
          url: serviceAddress,
          method: 'POST',
          data: data, 
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }).then(function(success){
          var status = success.data.status;
          if(status == 'success'){
          userData.data = success.data.content;
            return "success";
          }
          return "failure";
        }, function(error){})
  }
  
  var loginUser = function(user){
    //gets userInfo new User token and their posts
      var data = $.param({
          operation: 'loginUser', 
          username: user.username,
          password: user.password
        });
      return $http({
          url: serviceAddress,
          method: 'POST',
          data: data, 
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }).then(function(success){
          var status = success.data.status;
          if(status == 'success'){
            console.log(success);
            $window.localStorage.setItem('userId',success.data.content.userDetails.uid );
            $window.localStorage.setItem('unique_id',success.data.content.userDetails.unique_id);
            userData.data = success.data.content;
            return "success";
          } 
          return "failure";
        }, function(error){})
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
      deferred.resolve();
    }
  }

  return {
    load: deferred.promise
  }

})

