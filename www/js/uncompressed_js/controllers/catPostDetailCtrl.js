app.controller('CatPostDetailCtrl', ['$scope','$ionicModal','messengerService','serverAddress','$ionicSlideBoxDelegate','viewFullScreenModal','$ionicScrollDelegate','$sce','userAuthServices','$state','$filter','googleMapFactory','$stateParams','kchahiyoServices','userAuthServices','configs',
  function ($scope, $ionicModal, messengerService, serverAddress, $ionicSlideBoxDelegate, viewFullScreenModal, $ionicScrollDelegate, $sce, userAuthServices, $state, $filter, googleMapFactory, $stateParams, kchahiyoServices, userAuthServices, configs) {
    $scope.serverAddress = serverAddress;
    $scope.unit = configs.currencyUnit[configs.country()];
    var postId = $stateParams.postId;
    var userId = localStorage.getItem("userId");
    $scope.posterId;
    $scope.message = {};

    kchahiyoServices.getPostById(postId).then(function (success) {
      $scope.post = success.data;
      if (success.data.attached_images.length > 0) {
        $scope.containsImage = true;
        $scope.oldImages = success.data.attached_images.split(',');
      }
    });
    console.log('country');
    $scope.getUserPic = function(post){
      $scope.posterId = post.userId;
      $scope.postId = post.id;
      var picLink = post.profilePic;
      var hideUser = post.hide_user_details;
      if(hideUser == "1"){
        return serverAddress+"/images/Anonymous_emblem.svg.png";
      }
      if(picLink !== null ){
        if(picLink.substring(0,5)== "https"){
          return picLink;
        }else{
          return serverAddress+'/userProfilePics/thumbs/thumb_' + picLink;
        }
      }
    };

    messengerService.init({
      serverAddress : serverAddress
    });

    console.log($scope.message.content);


    $scope.messengerServiceInitiated = function(){
      console.log('check this thi');
      //check if user is logged in
        //if not show login page
        //else get userId
        userAuthServices.authenticateThisUser($scope)
          .then(function(success){
            $scope.showMessageSendButton = true;
          }, function(){
            console.log('error in authenticateThisUser');
          })

          $ionicModal.fromTemplateUrl('templates/messagingService/messageModal.html',{
            scope : $scope,
            backdropClickToClose:true
          }).then(function(modal){
              modal.show();
              $scope.closeButtonClicked = function(){
                sendMessageEventFinished(modal);
              };
              $scope.sendMessageEvent = function(){
                  messengerService.sendMessage({
                    post_id: $scope.postId,
                    post_title:$scope.post.title,
                    sender_id: userId,
                    receiver_id: $scope.posterId,
                    content: $scope.message.content
                  }).then(function(success){
                    console.log($scope.message.content);
                    sendMessageEventFinished(modal);

                  });
                };

              function sendMessageEventFinished(modal){
                $scope.message.content = "";
                modal.hide();
              }
          })


        //show message modal with
        //message box

        //when send is clicked
        // NEEDED
          //get userId
          //post id
          //item id

        //post object with {postId : 123, userId : 34234, messageContent: "alksdfaljsdkfasdjfalsdkfjas;dfkjalsd;fajsdas"},

    };

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
