angular.module('starter.services', [])
  .service('kchahiyoServices', function($http){
    /*
      Jobs
      Items Sale
      Guff-Gaff
      Miscellaneous
    */
      this.getPostsByCatagory = function(catagory){
                              return $http.get('http://www.k-chahiyo.com/php/getPosts.php', {params:{catagory: catagory}})
                            }

      this.getItemsForSale = function(){
                                  return $http.get('http://www.k-chahiyo.com/php/getPosts.php', {params:{catagory:'Items Sale'}})
                                }
      this.getRoommates = function(){
                                  return $http.get('http://www.k-chahiyo.com/php/getPosts.php', {params:{catagory:'Room-Mates'}})
                                }

      this.getEvents = function(){
                                  return $http.get('http://www.k-chahiyo.com/php/getPosts.php', {params:{catagory:'Events'}})
                                }

      this.getRestaurants = function(){
                                  return $http.get('http://www.k-chahiyo.com/php/getPosts.php', {params:{catagory:'Restaurants'}})
                                }

      this.getOthers = function(){
                                  return $http.get('http://www.k-chahiyo.com/php/getPosts.php', {params:{catagory:'Others'}})
                                }

      this.insertPost = function(email,
                                password,
                                title,
                                content,
                                catagory,
                                sub_catagory,
                                post_zip,
                                post_city,
                                post_near_city){

          var data = $.param({
                            email:email,
                            password: password,
                            title: title,
                            content: content,
                            catagory: catagory,
                            sub_catagory: sub_catagory,
                            post_zip: post_zip,
                            post_city: post_city,
                            post_near_city: post_near_city
                          });

          $http({
            url:'http://www.k-chahiyo.com/php/app/insertPost.php',
            method: 'POST',
            data: data, 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
              }
          });
      }

      this.getPostCatagories = function(){
        return $http.get('http://www.k-chahiyo.com/php/app/getCatagoriesAndSubCatagories.php');
          
      }


  })
.factory('googleMapFactory', function($q, $window){
  var deferred = $q.defer();

  var tag = document.createElement('script');
  tag.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAZv-6hTAT3JfRWLaWiGvadnYvpsjR3DeU&callback=initMap";
  tag.async = true;
  var lastScriptTag = document.getElementsByTagName('script')[0];
  lastScriptTag.parentNode.appendChild(tag); 
  var loaded = false;
  
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
.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
