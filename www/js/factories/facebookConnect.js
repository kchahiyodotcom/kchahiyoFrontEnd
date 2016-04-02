
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

	showLoginDialog = function(){
					var deferred = $q.defer();
					$ionicPopup.show({
				      title: ' <p>Connect with Facebook  for  better<br> viewing experience</p>',
				      buttons: [{ 
				        text: '<img width= 200 id="facebook-connect-button" src="img/facebook-connect-button.png">',
				        type: 'button-clear',
				        onTap: function(e){
				          login();
				        }
				      }] 
				    })
				    return deferred.promise;
				}

	simpleAlert = function(content){
		var simpleDialog = $ionicPopup.show({
	      title: content
	    })

		setTimeout(function(){
			simpleDialog.close();
		}, 5000);

	}

	apiRequestWallPost = function () {	
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

	fbResponse = {};
	var getProfilePicBig = function () { 
	    facebookConnectPlugin.api( "me/picture?redirect=0&type=large", ["public_profile"],
	        function (response) {
	        	var bigProfile = response.data.url;
	        	console.log(response.data.url);
	        	
	        },function(error){
	        	console.log('error has occured');
	        });
	}

	
	
	apiGetPublicProfile = function () { 
	    facebookConnectPlugin.api( "me/?fields=id,email,first_name,last_name,picture", ["public_profile"],
	        function (response) {
	        	console.log(JSON.stringify(response) + ' public_profile');
	        	getProfilePicBig();
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
	           simpleAlert("<h4 style='text-align:center'>Welcome back <br>" + response.first_name + "!</h4>");
	           fbResponse.data = response;
	           //var responseDb = sendUserInfoToDb(response);
	    	},
	        function (response) { 
	            simpleAlert("something went wrong " + JSON.stringify(response));
	    	}); 
	}	
	
	login = function () {
		var deferred  = $q.defer();
	    facebookConnectPlugin.login( ["public_profile"],
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
	    		apiGetPublicProfile();
	    		deferred.resolve(response);
	    	
	    	}, function(response){
	    		deferred.reject(response)
	    	})
	    return deferred.promise;
	}
	
	getStatus = function () {
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
	        	console.log(JSON.stringify(response) + ' get getStatus');

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
	
	sendUserInfoToDb = function(content){
		var postData = $.param({userInfo: content});
		$http({
			url:"http://cinemagharhd.com/php/user_validation.php",
			data: postData,
			method:"POST",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		});
	}

	
	
	postToFacebook = function (content , link) { 
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
	document.addEventListener("deviceready", function(){
		console.log('facebookServices loaded');
		getStatus()
		.then(function(success){
			//user already logged in
			apiGetPublicProfile();
		}, function(error){
			//user not logged in;
			$window.localStorage.removeItem('postPermission');
			showLoginDialog();
		})
	}, false);

	return{
		postToFb: postToFacebook,
		login: login,
		getResponse : fbResponse
	}

});