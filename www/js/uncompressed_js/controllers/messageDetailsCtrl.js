app.controller('messageDetailsCtrl', [
  '$stateParams',
  'messengerService',
  '$scope',
  'serverAddress','$ionicScrollDelegate',
  function($stateParams, messengerService, $scope, serverAddress, $ionicScrollDelegate){
    console.log('here we gooooo');
    let localRecord;
    $scope.data = {};

    $scope.myId = localStorage.getItem('userId');

    var session_id = $stateParams.title;
    let senderId;
    messengerService.init({serverAddress: serverAddress});

    //send senderId too
    messengerService.readUserMessages({
      user_id: localStorage.getItem('userId'),
    }).then(function(success){
      var messages = new Array();
      success.data.content.forEach(function(record){
        if(record.session_id === session_id){
          console.log('for each in messages');
          messages.push(record);
          localRecord = record;
          if($scope.myId != record.sender_id ){
            senderId = record.sender_id;
          }else if($scope.myId != record.receiver_id){
            senderId = record.receiver_id;
          }

        }
      });
      $scope.posts = messages;
      //$scope.posts =success.data.content;
    });

    $scope.sendMessage = ()=>{
      messengerService.sendMessage({
        post_id: localRecord.post_id,
        post_title:localRecord.post_title,
        sender_id: $scope.myId,
        receiver_id: senderId,
        content: $scope.data.message,
        session_id: localRecord.session_id
      }).then(function(success){
        $scope.posts=success.data.content;
        $scope.data.message = "";
    });
  };
}])
