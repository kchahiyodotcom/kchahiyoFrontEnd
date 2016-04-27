angular.module("starter.services",[]).value("serverAddress","http://192.168.1.7/k-chahiyo/php").service("kchahiyoServices",["$http","$q","serverAddress",function(e,t,o){console.log("serverAddress :"+o);var n=[],r=function(t,r,a,i,s){return e.get(o+"/getPosts.php",{params:{catagory:t,locationInfo:r,pageNum:a,searchText:i,selectedOption:s}}).then(function(e){return n.concat(e.data),e})};this.postEdited=!1,this.getPostsByCatagory=r,this.getPostsBySearchtext=r,this.insertPost=function(t){var n=$.param({email:t.email,unique_id:t.uniqueId,title:t.title,content:t.content,catagory:t.catagory,sub_catagory:t.sub_catagory.trim(),post_near_city:t.city,post_location:t.location,hide_user_details:t.hideUserDetails});return e({url:o+"/insertPost.php",method:"POST",data:n,headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8;"}})},this.getCitiesByState=function(t){return e.get(o+"/getCitiesByState.php",{params:{stateName:t}}).then(function n(n){return n},function r(r){return console.log(r),r})},this.getStatesByCountry=function(t){return e.get(o+"/getCitiesByState.php",{params:{countryName:t}})},this.getCityByZip=function(t){return e.get(o+"/getCityByZip.php",{params:{zip:t}})};var a={};this.getPostCatagories=function(){return e.get(o+"/getCatagoriesAndSubCatagories.php").then(function(e){var t=[];return e.data.content.forEach(function(e){-1==t.indexOf(e.catagory)&&t.push(e.catagory)}),a={catagories:t,catAndSubCat:e.data.content}},function(e){return console.error("Error while fetching Catagories and Sub Catagories"),null})},this.getPostById=function(r){if(0===n.length)return e.get(o+"/getPostById.php",{params:{id:r}});for(var a=t.defer(),i=0;i<n.length;i++)if(n[i].id==parseInt(r)){var s={};s.data=n[i],a.resolve(s)}return a.promise},this.getPostsByUserId=function(t){return e.get(o+"/getPostsByUserId.php",{params:{userId:t}}).then(function(e){return myPosts=e.data,e},function(e){})},this.getUserPostById=function(n){if(0===s.length)return e.get(o+"/getPostById.php",{params:{id:n}});for(var r=t.defer(),a=0;a<s.length;a++)if(s[a].id==parseInt(n)){var i={};i.data=s[a],r.resolve(i)}return r.promise;var s},this.savePost=function(t){var n=$.param({operationType:"save",title:t.title,content:t.content,userId:t.userId,postId:t.id});return e({url:o+"/postOperations.php",method:"POST",data:n,headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8;"}})}}]).service("userAuthServices",["$http","$q","facebookServices","$window","$ionicModal","$ionicPopup","$ionicHistory","serverAddress",function(e,t,o,n,r,a,i,s){function l(o){var n=t.defer();return e({url:s+"/registerUser.php",method:"POST",data:o,headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8;"}}).then(function(e){return"success"==e.data.status?(d(e),void n.resolve("user details and post loaded")):void n.reject(e.data.content)},function(e){n.reject(e)}),n.promise}var c={facebookLogin:!1,loggedIn:!1,userPostsChanged:!1};this.updatePostImages=function(e,t){function o(e,t){for(var o=c.data.posts,n=0;n<o.length;n++)o[n].id==e&&(o[n].attached_images=t,console.log(o[n]))}console.log("here at updatePostImages");var n="";t.forEach(function(e){n=n+","+e}),n=n.substr(1,n.length-1),console.log(n),o(e,n)},this.setUserPostsChanged=function(e){c.userPostsChanged=e},this.isUserPostsChanged=function(){return c.userPostsChanged};var u=function(e){a.alert({title:e})};this.setStateAndCity=function(e,t){n.localStorage.setItem("stateName",e),n.localStorage.setItem("cityName",t)},this.getStateAndCity=function(){return{state:n.localStorage.getItem("stateName"),city:n.localStorage.getItem("cityName")}},this.isSetStateAndCity=function(){return""!=n.localStorage.getItem("stateName")&&""!=n.localStorage.getItem("cityName")},this.isFacebookLogin=function(){return c.facebookLogin},this.userLoggedIn=function(){c.loggedIn=!0},this.isUserLoggedIn=function(){return c.loggedIn},this.watchThisPost=function(t){var o=n.localStorage.getItem("userId");"undefined"==typeof c.watchedPosts&&(c.watchedPosts=Array()),c.watchedPosts.push(t),e.get(s+"/postOperations.php",{params:{operationType:"watch",userId:o,postId:t.id}}).then(function(e){u("Posting has been watched")},function(e){u(e)})},this.getWatchedPosts=function(){var t=n.localStorage.getItem("userId");return e.get(s+"/postOperations.php",{params:{operationType:"getWatchedPosts",userId:t}}).then(function(e){return c.watchedPosts=e.data,e})},this.getWatchedPostDetailsById=function(e){for(var t=c.watchedPosts.length,o=0;t>o;o++)if(c.watchedPosts[o].id==e)return c.watchedPosts[o];return null},this.removeWatchedPost=function(t,o){var r=n.localStorage.getItem("userId"),a=t.id;return e.get(s+"/postOperations.php",{params:{operationType:"removeWatchedPost",postId:a,userId:r}})},this.getUserDetails=function(){return c.data.userDetails},this.getUserPosts=function(){return c.data.posts},this.getPostById=function(e){for(var t=c.data.posts,o=0;o<t.length;o++)if(t[o].id==e)return t[o]},this.deletePost=function(t){var o=c.data.posts,n=$.param({operationType:"delete",userId:t.userId,postId:t.id});return o.splice(o.indexOf(t),1),e({url:s+"/postOperations.php",method:"POST",data:n,headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8;"}})},this.logUserOut=function(){return n.localStorage.setItem("userId",""),n.localStorage.setItem("unique_id",""),o.logout().then(function(){c.loggedIn=!1,u("You have been logged out!")})},this.authenticateThisUser=function(a){var l=(t.defer(),function(e){var n=t.defer();return e.user={},e.loginModalButtons={},r.fromTemplateUrl("templates/tab-login.html",{scope:e}).then(function(t){e.loginModal=t,e.loginModal.show(),e.$on("loginComplete",function(t,o){e.loginModal.hide(),e.spinnerModal.remove()})}),e.loginModalButtons={closeButton:function(){e.$emit("loginComplete","complete"),n.reject("modal closed")},loginButton:function(){function t(t){e.$emit("loginComplete","complete"),u("You have successfully logged in!"),n.resolve("success, user data loaded")}function o(e){u("User credentials do not match!"),console.log("failure : "+JSON.stringify(e))}f(e.user).then(t,o)},fbLogin:function(){r.fromTemplateUrl("templates/spinner-modal.html",{scope:e}).then(function(t){e.spinnerModal=t,e.spinnerModal.show(),e.$on("loginComplete",function(t,o){e.spinnerModal.hide(),e.spinnerModal.remove()}),e.$on("loginError",function(t,o){e.spinnerModal.hide()})}),o.init().then(function(t){t.getLoginStatus().then(function(o){var r=o.authResponse.userID,a=o.authResponse.accessToken;console.log(JSON.stringify(o)),g(r,a).then(function(t){return e.$emit("loginComplete","complete"),d(t),u("You have successfully logged in!"),n.resolve("user successfully logged in")},function(o){return console.log(o+"in validateUniqueIdWithServer"),c(t).then(function(t){return p(t,"fbUserRegister").then(function(o){console.log("got user details "+JSON.stringify(t)),e.$emit("loginComplete","complete"),d(o),n.resolve("user logged in and posts downloaded")},function(t){return e.$emit("loginError","error"),u("Registration server didn't respond, try again later! "),t})},function(t){u("error acquiring fb data, try again! "+t),e.$emit("loginError","error"),console.log("error acquiring fb data, try again! "+t)})})},function(){console.log("here now in gett loginStatus error cb"),c(t).then(function(t){return p(t,"fbUserRegister").then(function(t){e.$emit("loginComplete","complete"),d(t),n.resolve("user logged in and posts downloaded")})},function(t){u("error acquiring fb data, try again! "+t),console.log("error acquiring fb data, try again! "+t),e.$emit("loginError","error")})})},function(t){console.log(" fb module crashed "+t),e.$emit("loginError","error")})},signUp:function(){h(e)}},n.promise}),c=function(e){return e.login().then(function(t){var o={accessToken:t.authResponse.accessToken};return e.getPublicProfile().then(function(t){return o.publicProfile=t,console.log("error in the userdetails "+JSON.stringify(t)),e.getProfilePicBig().then(function(e){return o.profilePicBig=e,console.log("error in the user "+JSON.stringify(o)),o})},function(e){console.log("error in the getUserDetailsFromFB "+e)})},function(e){return console.log("error in the getUserDetailsFromFB "+e),e})},p=function(o,n){var r=t.defer(),a=$.param({operation:n,user:o});return e({url:s+"/registerUser.php",method:"POST",data:a,headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8;"}}).then(function(e){console.log(JSON.stringify(e.data));var t=e.data.content;"success"==e.data.status?r.resolve(e):r.reject(t)},function(e){r.reject(e)}),r.promise},h=function(e){e.loginModal.hide(),r.fromTemplateUrl("templates/tab-register.html",{scope:e}).then(function(t){e.registerModal=t,e.registerModal.show(),e.user={},e.notFilled=!0,e.user.firstName={text:"firstName",word:/^\s*\w*\s*$/}}),e.registerModalButtons={closeButton:function(){e.registerModal.hide(),i.goBack()},register:function(){e.notFilled=!1,p(e.user,"createUser").then(function(t){e.registerModal.hide(),u(t),i.goBack()},function(e){u(e)})}}},m=function(){console.log("checkUserLoginStatus");var e={userId:n.localStorage.getItem("userId")||"",unique_id:n.localStorage.getItem("unique_id")||""};if(""===e.userId||""===e.unique_id)return console.log(JSON.stringify(e)),l(a);var t=e.userId,o=n.localStorage.getItem("unique_id");return g(t,o).then(function(e){return"success"},function(e){return console.log(e),l(a)})};return m()};var d=function(e){n.localStorage.setItem("userId",e.data.content.userDetails.uid),n.localStorage.setItem("unique_id",e.data.content.userDetails.unique_id),c.data=e.data.content},g=function(e,t){var o=$.param({operation:"loginStatus",userId:e,unique_id:t});return l(o)},f=function(e){console.log("loginUser called");var t=$.param({operation:"loginUser",username:e.username,password:e.password});return l(t)}}]).factory("googleMapFactory",["$q","$window",function(e,t){var o=!1,n=e.defer(),r=document.createElement("script");r.src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAZv-6hTAT3JfRWLaWiGvadnYvpsjR3DeU&callback=initMap&libraries=places",r.async=!0;var a=document.getElementsByTagName("script")[0];return a.parentNode.appendChild(r),t.initMap=function(){o||(o=!0,console.log("loaded googleMapFactory"),n.resolve(document.getElementsByClassName("pac-container")))},{load:n.promise}}]).factory("imageUploader",["$cordovaFileTransfer","userAuthServices","$ionicActionSheet","$ionicPopup","$cordovaFile","$cordovaCamera","$cordovaImagePicker","$q","$http","serverAddress",function(e,t,o,n,r,a,i,s,l,c){var u={numImageUploadable:0,maxImagesAllowed:0,setMaxImagesAllowed:function(e){this.maxImagesAllowed=e,this.numImageUploadable=e},maxImagesAllowedExceeded:function(){alert("Maximum "+this.maxImagesAllowed+" images can be attached!")},isMaxNoImagesExceeded:function(){return this.numImageUploadable<=0?(this.maxImagesAllowedExceeded(),!0):!1}},d=function(e){return console.log(e.name+" in createFolderIfNotPresent"),r.createDir(cordova.file.dataDirectory,e.name,!0)},g=function(e,t){function o(e){console.log("in copy fileFolder");var o=e.fullPath.substr(e.fullPath.lastIndexOf("/")+1),i=r(5)+o;window.resolveLocalFileSystemURL(cordova.file.dataDirectory+t.name,function(t){e.copyTo(t,i,n,a)},a)}function n(t){l.push(t.nativeURL),l.length===e.length&&(console.log("all files copied"),i.resolve(l))}function r(e){for(var t="",o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=0;e>n;n++)t+=o.charAt(Math.floor(Math.random()*o.length));return t}function a(e){i.reject("copying failed")}var i=s.defer(),l=Array();"string"==typeof e&&(e=Array(e));for(var c=0;c<e.length;c++)window.resolveLocalFileSystemURL(e[c],o,a);return i.promise},f=function(){var e={destinationType:Camera.DestinationType.FILE_URI,sourceType:Camera.PictureSourceType.CAMERA,correctOrientation:!0,encodingType:Camera.EncodingType.JPEG,targetHeight:800,targetWidth:800};return a.getPicture(e)},p=function(e){var t={maximumImagesCount:e,width:800,height:800,quality:80};return i.getPictures(t)},h=function(e){var t=s.defer(),o=[];return f().then(function(n){d(e).then(function(r){g(n,e).then(function(e){for(;e.length>0;)o.push(e.pop());a.cleanup(),t.resolve(o),console.log("URI : "+JSON.stringify(o))})})},function(e){console.log("error capturing pics"),t.reject("capturing pics aborted")}),t.promise},m=function(e,t){var o=s.defer(),n=[];return p(t).then(function(t){console.log(JSON.stringify(t)),d(e).then(function(r){g(t,e).then(function(e){for(console.log(JSON.stringify(e));e.length>0;)n.push(e.pop());console.log("done loading"),o.resolve(n)})})},function(e){console.log("error getting pics"),o.reject("error getting pics")}),o.promise},v=function(o,n,r,a){function i(e){d.reject("error uploading file :"+e)}function l(e){n.splice(n.indexOf(e.filePath),1),r.push(e.newFileName),0===n.length&&(t.updatePostImages(o,r),d.resolve("upload completed"))}function u(t,o,n){var r={filePath:o,newFileName:""},a=s.defer(),i="insert",l=c+"/imageUploader.php",u={params:{directory:n,postId:t,operation:i}};return e.upload(l,o,u).then(function(e){console.log(JSON.stringify(e));var t=JSON.parse(e.response);return"success"==t.status?(r.newFileName=t.fileName,a.resolve(r),void console.log("fileName "+r.newFileName)):void a.reject(e.data)},function(e){console.log(e),a.reject(o)}),a.promise}var d=s.defer();if(0===n.length)return d.resolve("no image to upload"),d.promise;for(var g=n.length,f=0;g>f;f++)u(o,n[f],a).then(l,i);return d.promise},y=function(e,t){var o="delete",n=$.param({directory:"uploads",fileName:t,postId:e,operation:o});return l({url:c+"/imageUploader.php",method:"POST",data:n,headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8;"}}).then(function(e){return u.numImageUploadable++,e})},I=function(e,t){var n=(Array(),s.defer()),r={};if("post"==e?r.name="uploads":"profilePic"!=e&&"coverPic"!=e||(r.name="userProfilePics"),console.log(r.name+" value of folderName "+e),!u.isMaxNoImagesExceeded()||t){o.show({buttons:[{text:"Use Camera"},{text:"Select Images From Gallery"}],titleText:"Attach Images",cancelText:"Cancel",cancel:function(){n.reject("operation cancelled")},buttonClicked:function(e){return 0===e?h(r).then(function(e){n.resolve(e)}):1===e&&m(r).then(function(e){n.resolve(e)}),!0}});return n.promise}},w=function(e,t){t.splice(e,1),u.numImageUploadable++},P=function(t,o){function n(e,t){var o=e.substr(e.lastIndexOf("/")+1);return r.removeFile(cordova.file.dataDirectory+t,o).then(function(e){return console.log(o+" uploaded and removed"),e},function(e){return console.log(JSON.stringify(e)),e})}var a=s.defer();u.numImageUploadable=1,u.setMaxImagesAllowed=1;var i=t.pop(),l="userProfilePics",d={filePath:i,newFileName:""},g="profilePic",f=c+"/imageUploader.php",p={params:{directory:l,userId:o,operation:g}};return e.upload(f,i,p).then(function(e){console.log(JSON.stringify(e));var t=JSON.parse(e.response);return"success"==t.status?(d.newFileName=t.fileName,a.resolve(d),n(d.filePath,l),void console.log("fileName "+d.newFileName)):void a.reject(e.data)},function(e){console.log(e)}),a.promise},S=function(){var e,t,r,a,i,u=function(){return e},d=function(){n.alert({title:"Error",template:"No more images can be uploaded. Max. "+t+" images allowed!",buttons:[{text:"ok"}]})},g=function(o,n,s,l){e=o,r=n,a=void 0==s?[]:s,i=l,t=o,void 0!=r&&(e-=r.length)},f=function(){var t={name:i};return m(t,e).then(function(t){for(e-=t.length;t.length>0;)a.push(t.pop())})},p=function(){var t={name:i};return h(t).then(function(t){a.push(t.pop()),e-=1})},v=function(){if(0>=e)return d(),!1;var n=s.defer();return o.show({buttons:[{text:"Use Camera"},{text:"Select Images From Gallery"}],titleText:"Attach Images (Max. "+t+" images allowed)",cancelText:"Cancel",cancel:function(){n.reject(null)},buttonClicked:function(e){return 0===e?p().then(function(){n.resolve(a)}):1===e&&f().then(function(){n.resolve(a)}),!0}}),n.promise},y=function(t){console.log("remove callled"),a.splice(a.indexOf(t),1),e++},I=function(t,o){var n="delete",a=$.param({directory:"uploads",fileName:o,postId:t,operation:n});return l({url:c+"/imageUploader.php",method:"POST",data:a,headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8;"}}).then(function(t){return r.splice(r.indexOf(o),1),e++,t})};return{init:g,showActionSheet:v,getMaxNumImage:u,removeImageFromView:y,removeFileFromServer:I}};return{init:u,imageUpldr:S,removeImageFromDevice:w,copyFilesToLocalDirectory:g,uploadImages:v,uploadProfilePic:P,showActionSheet:I,removeFileFromServer:y}}]).service("viewFullScreenModal",["$ionicModal","$ionicScrollDelegate",function(e,t){this.init=function(o,n){return o.slideHasChanged=function(e){t.$getByHandle("scrollHandle"+e).zoomTo(1),o.active=e},o.closeModal=function(){o.viewFullScreenModal.hide()},o.$on("$destory",function(){o.viewFullScreenModal.remove()}),e.fromTemplateUrl("templates/modal-image.html",{scope:o})}}]);