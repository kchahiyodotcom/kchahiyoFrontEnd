kchahiyoServices.service('kchahiyoServices', ['$http','$q', 'serverAddress','configs','$sce','$rootScope','$ionicLoading',
  function($http, $q, serverAddress, configs, $sce, $rootScope, $ionicLoading){
    console.log('serverAddress :' + serverAddress);
    /*Jobs
      Items Sale
      Guff-Gaff
      Miscellaneous
    */
    var posts = [];
    var getPost = function(_catagory, _location , _pageNum, _searchText, _selectedOption){
      return $http.get(serverAddress + '/getPosts.php',
        {params:{
            catagory: _catagory,
            locationInfo: _location,
            pageNum: _pageNum,
            searchText: _searchText,
            selectedOption: _selectedOption
          }})
      .then(
        function(success){
          posts.concat(success.data);
          return success;
        });
    };

    this.postEdited = false;

    this.getPostsByCatagory = getPost;

    this.getPostsBySearchtext = getPost;

    this.insertPost = function(post){
      var country = configs.country();

      var data = $.param({
        countryName: country,
        email:post.email,
        unique_id: post.uniqueId,
        title: post.title,
        content: post.content,
        catagory: post.catagory,
        sub_catagory: post.sub_catagory? post.sub_catagory.trim():"",
        post_near_city: post.city,
        post_location: post.location,
        post_title_image: post.titleImage? post.titleImage:"0",
        hide_user_details: post.hideUserDetails,
        item_price: post.item_price? post.item_price : "0"
      });

      return $http({
        url:serverAddress + '/insertPost.php',
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      });
    };

    this.getCitiesByState = function(state){
      var country = configs.country();
      return $http.get(serverAddress + '/getCitiesByState.php', {
        params:{
          countryName:  country,
          stateName: state || ""
        }})
    };

    this.getCitiesByCountry = function(country){
      $sce.trustAsResourceUrl(serverAddress);
      return $http.get(serverAddress + '/getCitiesByCountry.php?countryName='+country)
              .then(function(success){
                return success;
              }, function(error){
                console.log("no connection with server");
                var cities = {data: ["Butwal", "Bhairahawa", "Birgunj"]};
                return cities;
              });
    }

    this.getStatesByCountry = function(country){
      return $http.get(serverAddress + '/getCitiesByState.php', {params:{countryName: country}})
    };

    this.getCityByZip = function(zip){
      return $http.get(serverAddress + '/getCityByZip.php',{'params':{zip: zip}});
    };

    var catagoriesAndSubCatagories = {};

    this.getAddPostFeatures = function(){
      return $http.get(serverAddress +'/getConfigs.php');
    }

    this.getPostCatagories = function(){
      return $http.get(serverAddress +'/getConfigs.php')
        .then(function(success){
          var catagories = success.data.postCatagories[configs.country()].catagories;
          var catagoryNames = Object.keys(success.data.postCatagories[configs.country()].catagories);
          var catSubCats = success.data.postCatagories[configs.country()].catagories;
          console.log(catagoryNames);
            return  {catagories : catagoryNames,
                    subCatagories : catSubCats,
                    catagoryObject: catagories,
            };
      }, function(error){
        console.log(error);
      })
    };

    (function initiateLoadingSpinnerModal(){
      $rootScope.$on("loadingStarted", function(){
        $ionicLoading.show();
      })
      $rootScope.$on("loadingCompleted",function(){
        $ionicLoading.hide();
      });
    })();

    this.getPostById = function(id){
      var country = configs.country();
      if(posts.length === 0){
        //fetch userPost and can be removed in production
        return $http.get(serverAddress + '/getPostById.php',{params:{countryName: country, id: id}});
      }else{
        var deferred = $q.defer();
        for(var i = 0; i < posts.length; i++){
          if(posts[i].id == parseInt(id)){
            var success = {};
            success.data = posts[i];
            deferred.resolve(success);
          }
        }
        return deferred.promise;
      }
    };

    this.getPostsByUserId = function(id){
      var country = configs.country();
      return $http.get(serverAddress + '/getPostsByUserId.php',
        {
          params:{
            userId: id,
            countryName: country
          }
        })
      .then(function(success){
        myPosts = success.data;
        return success;
      }, function(error){});
    };

    this.getUserPostById = function(id){
      if(myPosts.length === 0){
        //fetch userPost and can be removed in production
        return $http.get(serverAddress + '/getPostById.php',{params:{id: id}});
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
      var myPosts = [];
    };

    this.savePost = function(post){
      var data = $.param({
        operationType: 'save',
        title : post.title,
        content: post.content,
        userId: post.userId,
        postId: post.id,
        countryName: post.tableName,
        post_title_image: post.titleImage? post.titleImage:"0",
        item_price: post.item_price? post.item_price:"0"
    });

      return $http({
        url: serverAddress + '/postOperations.php',
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      });
    };
}])
