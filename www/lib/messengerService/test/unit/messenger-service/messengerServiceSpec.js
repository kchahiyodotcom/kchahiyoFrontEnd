'use strict';

describe('MyApp', function() {

  var module;
  var messengerService;
  var dependencies;
  dependencies = [];

  var hasModule = function(module) {
  return dependencies.indexOf(module) >= 0;
  };

  beforeEach(angular.mock.module('messengerServiceModule'));

  beforeEach(inject(function(_messengerService_){
    messengerService = _messengerService_;

    messengerService.init({
      serverAddress : 'http://localhost/kchahiyo/php'
    });

    messengerService.sendMessage({
      post_id: '12321',
      sender_id: '1231',
      receiver_id: '234124',
      content: 'mesage measdgkasjdfkasdjlfjaksdfj;asldkf'
    });

    messengerService.readUserMessages({
      userId: '123123'
    }).then(function(success){
      console.log(JSON.stringify(success));
    },function(error){
      console.log(JSON.stringify(error));
    });
  })
);


  beforeEach(function() {
    // Get module
    module = angular.module('messengerServiceModule');
    dependencies = module.requires;
  });

  it('should load config module', function() {
    expect(hasModule('messengerServiceModule.config')).to.be.ok;
  });

  it('should load services module', function() {
    expect(hasModule('messengerServiceModule.services')).to.be.ok;
  });


});
