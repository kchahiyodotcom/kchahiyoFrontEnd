app.controller('userProfileCtrl', ['$scope','messengerService','serverAddress','kchahiyoServices','serverAddress','imageUploader','$filter','$cordovaCamera','$cordovaFileTransfer','$ionicScrollDelegate','$state','$window','userAuthServices','$ionicHistory',
  function ($scope, messengerService, serverAddress, kchahiyoServices, serverAddress, imageUploader, $filter, $cordovaCamera, $cordovaFileTransfer, $ionicScrollDelegate, $state, $window, userAuthServices, $ionicHistory) {
    $scope.ui = {};
    $scope.ui.tabview = 'templates/profilePage/posts-list.html';

    $scope.serverAddress = serverAddress;

    $scope.catagory = "Jobs";

    $scope.userLoggedIn = false;

    function loadUserMessages(){
      console.log("load messages initiated");
      messengerService.init({serverAddress: serverAddress});
      if(localStorage.getItem('userId') != ""){
        console.log('userId != ""');
        messengerService.readUserMessages({
          user_id: localStorage.getItem('userId')
        }).then(function(success){
          console.log(JSON.stringify(success.data.content));
          $scope.messages = $filter('unique')(success.data.content, 'session_id');

          /*var unique_post_titles = new Set();
          success.data.content.forEach(function(record){
            let fullName = record.first_name + record.last_name +" on "+ record.post_title;
            unique_post_titles.add(fullName );
          });
          console.log(unique_post_titles);
          let post_title = Array.from(unique_post_titles.values());
          console.log(post_title);
          $scope.userMessages = post_title;*/
        },function(err){
          console.log(err);
        });
      }
    }

    loadUserMessages();

    console.log('profile page refresh triggered');
    if(userAuthServices.isUserLoggedIn()){
      console.log("user status: logged in");
      loadUserProfilePage();
    } else {
      userAuthServices.authenticateThisUser($scope)
        .then(function (success) {
          loadUserProfilePage();
          userAuthServices.userLoggedIn();
          console.log(success);
        }, function (error) {
          console.log("error in here "+error);
          console.log($ionicHistory);
          if($ionicHistory.backTitle() === null){
            $state.go('tab.dash');
          }else{
            $ionicHistory.goBack();
        }
      });
    }

    function loadUserPosts () {
      console.log('in loadUserPosts');
      loadWatchedPosts();
      $scope.posts = userAuthServices.getUserPosts();
      //$scope.watchedPosts = userAuthServices.getWatchedPosts();
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
        loadWatchedPosts().then(function(){
          loadUserPosts();
          loadUserMessages();
          console.log("loaduser posts fired");
        }, function(){
          console.log('error loading user posts');
        })
      } else if ($scope.postType == 'watchedPosts') {
        loadWatchedPosts().then(function(){
          loadUserPosts();
          loadWatchedPosts();
        },function(error){
          console.error('error loading watchedPosts');
        })
      } else if ($scope.postType == 'myPosts') {
        loadWatchedPosts().then(function(){
          loadUserPosts();
          loadUserMessages();
        },function(error){
          console.error('error loading user posts');
        })
      } else if ($scope.postType == 'myMessages') {
        loadWatchedPosts().then(function(){
          loadUserPosts();
          loadUserMessages();
      },function(error){
        console.error('error loading user messages');
      })
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


   function loadWatchedPosts() {
      return userAuthServices.getWatchedPosts().then(function (success) {
        //$scope.postType = 'watchedPosts';
        console.log(success);
        $scope.remove = function (post) {
          userAuthServices.removeWatchedPost(post).then(function () {
            $scope.posts.splice($scope.posts.indexOf(post), 1);
          });
        };

        $scope.watchedPosts = success.data;
      });
    };

    loadWatchedPosts();





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
