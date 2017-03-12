
/*	This module requires facebook plugin for cordova to be installed
*	in order for it to function.
*	This service must be initiated after the device is
* 	ready. Use of $ionicPlatform.ready(function(){ }) is
*	highly recommended.
*
*	Author: Nishchal Pandey
*	Date: 2016-01-14
*/


var facebook = angular.module('facebookModule',[]);
facebook.factory('facebookServices',function($ionicPopup,  $window, $q, $ionicPlatform, $http){

	var	showLoginDialog = function(){
					var deferred = $q.defer();
					$ionicPopup.show({
				      title: ' <p>Connect with Facebook  for  better<br> viewing experience</p>',
				      buttons: [{
				        text: '<img width= 200 id="facebook-connect-button" src="img/facebook-connect-button.png">',
				        type: 'button-clear',
				        onTap: function(e){
									deferred.resolve(e);
				        }
				      }]
				    })
				    return deferred.promise;
				}

	var	simpleAlert = function(content){
		var simpleDialog = $ionicPopup.show({
	      title: content
	    })

		setTimeout(function(){
			simpleDialog.close();
		}, 5000);

	}

	var apiRequestWallPost = function () {
	    if($window.localStorage.getItem('postPermission') == null){
	        facebookConnectPlugin.api( "me/?fields=id,email,first_name", ["publish_actions"],
                  function (response) {
                        $window.localStorage.setItem("postPermission","set");
                  },
                  function (response) {
                    console.log("error occured");
                });
	        }
	    return false;
	}

	var getProfilePicBig = function () {
		var deferred = $q.defer();
    facebookConnectPlugin.api( "me/picture?redirect=0&type=large", ["public_profile"],
        function (response) {
        	deferred.resolve(response.data.url);
        },function(error){
        	deferred.reject('error has occured');
        });
		return deferred.promise;
	}

	var showWelcomeMessage = function(response){
		simpleAlert("<h4 style='text-align:center'>Welcome back <br>" + response.first_name + "!</h4>");
	}

	var showErrorMessage = function(){
		simpleAlert("something went wrong " + JSON.stringify(response));
	}

	var	getPublicProfile = function () {
		var deferred = $q.defer();
	    facebookConnectPlugin.api( "me/?fields=id,email,first_name,last_name,picture", ["public_profile"],
	        function (response) {
						console.log(JSON.stringify(response));
						deferred.resolve(response);
	        	/*{"id":"1065700932",
		        	"email":"nishchal_watchingyou@hotmail.com",
		        	"first_name":"Nishchal",
		        	"last_name":"Pandey",
		        	"picture":{
	        			"data": {
	        			"is_silhouette":false,
	        			"url":"https://scontent.xx.fbcdn.net/hprofile-xaf1/v/t1.0-1/c0.9.50.50/p50x50/69643_4708004052481_2116925628_n.jpg?oh=0ac1c558e7234db35e6b014e27a2529e&oe=578C4DD6"
	        			}
	        		}
	        	}*/
	    		//apiRequestWallPost();

	           //var responseDb = sendUserInfoToDb(response);
	    	},
	        function (response) {

	    	});
			return deferred.promise;
	}

	var	login = function () {
		console.log("Login clicked");
		var deferred  = $q.defer();
	    facebookConnectPlugin.login( ["public_profile","email"],
        function (response) {
        	/*
				{"status":"connected",
				"authResponse":{
					"accessToken":"CAAICCJWiP9EBALIICZAxyBxU4HOdV8evv0aftkqrZBv2rqZCsTAeJMAGmjI0SbGRsbNABEKdmFB9PxMFU3U6eQ6Q0yKEw4RRiNzhAUM49GFw1Ku8iVbPepksZAUmHZC1VR5jk6lPaELqKZB2TT6nemEE8KZBHzmJ3dVUmZA93YQ6bj91Wjb9eDj7d1AaqvdR5kgZD",
					"expiresIn":"5183998",
					"session_key":true,
					"sig":"...",
					"userID":"1065700932"}
				}
        	*/
        	console.log(JSON.stringify(response) + ' login response');
	    		deferred.resolve(response);
	    	}, function(response){
	    		deferred.reject(response)
	    	})
	    return deferred.promise;
	}

	var logout = function(){
		var deferred = $q.defer();
		if(typeof facebookConnectPlugin != 'undefined'){
			facebookConnectPlugin.logout(success, failure);
		}else{
			deferred.reject("facebookConnectPlugin not found");
		}
		function success(response) {
				deferred.resolve(response);
		}
		function failure(response){
				deferred.reject(response);
		}
		return deferred.promise;
	}

	var	getLoginStatus = function () {
		var deferred = $q.defer();
		facebookConnectPlugin.getLoginStatus(
      function (response) {
      	/*response//

      	{"status":"connected",
      	"authResponse":
      		{"accessToken":"CAAICCJWiP9EBAC0jcMt9WWd7ryJP5G72ZCZBgAQvSgZBWCPsCiS5NCIwqp680i0JTrhxRn5bJV92IBoCWGLD7pvtBZCMacZBZBeZCLXow3yzyV1Wixmn9HPnVmsZA5BzzZAJE2wAw3SCerpZBIXTe3FPVNjtvYGH61g7rzGB9RZAdmNOxucESnVocVKQMOlnqWAVqGdFYn77CHQ6wZDZD",
      		"expiresIn":"5182517",
      		"session_key":true,
      		"sig":"...",
      		"userID":"1065700932"}
      	}*/
            if(response.status == "unknown" || response.status == "not_authorized"){
               deferred.reject(response);
            }else{
            	deferred.resolve(response);
            }
      },
      function (response) {
             deferred.reject(response);
      });
		return deferred.promise;
	}

	var	sendUserInfoToDb = function(content){
		var postData = $.param({userInfo: content});
		$http({
			url:"http://cinemagharhd.com/php/user_validation.php",
			data: postData,
			method:"POST",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		});
	}

	var	postToFacebook = function (content , link) {
	    facebookConnectPlugin.getAccessToken(

	        function (response) {
	        		$http({
	        			url: "http://cinemagharhd.com/php/post_to_facebook.php",
	        			method: "GET",
	        			params: {access_token:response, text_content: content, banner_link:link}
	        		}).then(
	        			function(success){
	        				console.log('success : ' + success);
	        			},
	        			function(error){
	        				console.log('error : ' + error);
	        			}
	        		)

	        	},
	        function (response) {
	        	simpleAlert("Unable to Post, user is not logged in!");
	        });
	}
		/*	checkStatus
				if logged in get access_token for the given userID
					else
				show
					cinemagharLogin
					if user selects register through facebook
					fbLogin()
		*/

	/*var registerUser = function(){
		return showLoginDialog()
		.then(function(success){
			return login()
			.then(function(success){
				return success;
			})
		})
	}*/

	var getUserDetails = function (success) {
		var user = {access_token : success.authResponse.accessToken};
		return getPublicProfile()
							.then(function(userDetails){
								user.public_profile = userDetails;
								return getProfilePicBig()
									.then(function(imageURI){
										user.profilePicBig = imageURI;
										return user;
									})
							})
	}

	var init =  function(){
		var deferred = $q.defer();
		document.addEventListener("deviceready", function(){
			console.log('device is ready and init');
				deferred.resolve({
					getUserDetails : getUserDetails,
					getLoginStatus: getLoginStatus,
					getPublicProfile: getPublicProfile,
					getProfilePicBig: getProfilePicBig,
					login: login
				});
		}, false);
		return deferred.promise;
	}

	var getUserInfo = function(){
		console.log('facebookServices loaded');
		return getLoginStatus().then(onSuccess,onError);

		function onError (error){
			//user is not registered, register them
			return registerUser()
				.then(function(success){
					return getUserDetails(success)
						.then(function(userDetails){
							return userDetails;
						})
				})
		}
		function onSuccess (success){
			return getUserDetails(success)
				.then(function(userDetails){
					return userDetails;
				})
		}
	}

	return{
		init: init,
		logout: logout
	}

});


/*
	first get the login status
	show loginDialog
	if connectWithFacebook clicked
		getUserInfo triggered
			if userNotRegister
				loginUser is triggered


*/


/*
{"access_token":"CAAICCJWiP9EBAJljSo8mem0dafoXDoBOmUzJGqcTP2Htp6ZAWYSAOPLhTll8xs6U6x8KXfl9qQIrYMwBWGCSuCQDODDOVbPOTAI6ZCD4BCf7FZCuV1FZA4zfN9HDPZCZAKaaZCRdFRteSF6kfLZAnTh7zdctpCXesJbZC2IXadnDR9ynK8yK035WAhlm4R4fakCIZD",
"id":"1065700932",
"public_profile":{
	"id":"1065700932",
	"first_name":"Nishchal",
	"last_name":"Pandey",
	"picture":{
		"data":{
			"is_silhouette":false,
			"url":"https://scontent.xx.fbcdn.net/hprofile-xaf1/v/t1.0-1/c0.9.50.50/p50x50/69643_4708004052481_2116925628_n.jpg?oh=0ac1c558e7234db35e6b014e27a2529e&oe=578C4DD6"
		}
	}
},
"profilePicBig":"https://scontent.xx.fbcdn.net/hprofile-xaf1/v/t1.0-1/p200x200/69643_4708004052481_2116925628_n.jpg?oh=91ad09de1920ce4afb24c69fb5a95348&oe=578B0D0F"
}
*/
