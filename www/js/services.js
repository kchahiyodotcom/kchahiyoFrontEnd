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
                            return $http.get(web_link + '/getPosts.php', {params:{catagory: catagory}})
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
        //fetch userPost and can removed in production
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

    this.deletePost = function(post){
      
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