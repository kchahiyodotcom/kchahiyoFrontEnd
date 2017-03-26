// app.controller('userMessagesCtrl', [
//   'messengerService',
//   '$scope',
//   'serverAddress',
//   function(messengerService, $scope, serverAddress){
//     console.log('here you  messengerService ');
//
//     //read sender id
//     messengerService.init({serverAddress: serverAddress});
//     messengerService.readUserMessages({
//       user_id: localStorage.getItem('userId')
//     }).then(function(success){
//       console.log(JSON.stringify(success.data.content));
//       //var unique_post_titles = new Set();
//       var messageArray = success.data.content;
//       success.data.content.forEach(function(record){
//         unique_post_titles
//           .add({ post_title: record.post_title,
//            sender_name: record.first_name + ' ' + record.last_name,
//            post_id: record.post_id
//           });
//
//          messageAttr = [record.sender_id , record.post_title];
//          unique_post_titles
//            .add(messageAttr);
//       });
//
//       function onlyUnique(value, index, self) {
//           return self.indexOf(value) === index;
//       }
//
//
//       var unique = messageArray.filter( onlyUnique );
//
//       console.log(unique);
//
//       $scope.posts = unique;
//       //$scope.posts = Array.from(unique_post_titles.values());
//       //$scope.posts =success.data.content;
//     });
//
// }])
