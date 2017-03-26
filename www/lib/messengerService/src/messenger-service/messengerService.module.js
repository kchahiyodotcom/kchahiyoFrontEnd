(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('messengerServiceModule.config', [])

      .value('messengerServiceModule.config', {
          debug: true
      });

  // Modules
  angular.module('messengerServiceModule.services', [])
  .service('messengerService', function($http, $rootScope, $q){
    var serverAddress;
    //var localScope = $rootScope.$new();

    this.init = function(initModal){
      console.log('init doneee');
      //show modal page
      serverAddress = initModal.serverAddress;

    };

    this.readUserMessages = function(userId){
      // let promise = $q.defer();
      //   if(true){
      //     return promise.promise;
      //   }
      console.log(serverAddress + '/messangerService/messageReader.php');
      return $http({
        url: serverAddress + '/messangerService/messageReader.php',
        method: 'POST',
        data: userId,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      });
    };

    this.sendMessage = function(messageObject){
      console.log('sending message' + JSON.stringify(messageObject));
      return $http({
        url:serverAddress + '/messangerService/messageStorage.php',
        method: 'POST',
        data: messageObject,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      });
    };
  });

  angular.module('messengerServiceModule',
      [
          'messengerServiceModule.config',
          'messengerServiceModule.services'
      ]);


})(angular);
