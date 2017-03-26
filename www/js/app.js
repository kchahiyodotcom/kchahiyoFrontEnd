// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('templates',[])

angular.module('starter', ['ionic',
                          'templates',
                          'ngCordova',
                          'ngRoute',
                          'configs',
                          'ngSanitize',
                          'kchahiyo.controllers',
                          'kchahiyo.services',
                          'directiveModules',
                          'facebookModule',
                          'ion-google-place',
                          'ngAnimate',
                          'kchahiyoAnimation',
                          'messengerServiceModule'])
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)

      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();}
    });
})

.config(function($stateProvider, $ionicConfigProvider, $sceDelegateProvider, $urlRouterProvider, $httpProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.scrolling.jsScrolling(false);
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    // setup an abstract state for the tabs directive
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })
    // Each tab has its own nav history stack:

    .state('login', {
      url: '/login',
      templateUrl:'templates/tab-login.html',
      controller: 'loginCtrl'
    })
    .state('chooseCountry',{
      cache:'false',
      url:'/country',
      templateUrl: 'templates/selectYourCountry.html',
      controller: 'chooseCountryCtrl'
    })
    .state('tab.restaurant',{
      url:'/postsWithThumbnail/:catagory',
      views: {
        'tab-dash': {
          templateUrl: 'templates/catagories/postsWithThumbnail.html',
          controller: 'postsWithThumbnailCtrl'
        }
      }
    })
    .state('tab.jobs',{
      url:'/postsWithDefaultThumbnail/:catagory',
      views: {
        'tab-dash': {
          templateUrl: 'templates/catagories/jobs.html',
          controller: 'postsWithDefaultThumbnailCtrl'
        }
      }
    })
    .state('chooseState', {
      cache:'false',
      url:'/state',
      templateUrl:'templates/chooseState.html',
      controller:'chooseStateCtrl'
    })
    .state('chooseCity', {
      cache:'false',
      url:'/state/:stateName',
      templateUrl: "templates/chooseCity.html",
      controller:'chooseCityCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl:'templates/tab-register.html',
      controller: 'registerCtrl'
    })
    .state('tab.dash', {
      cache: 'false',
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })
    .state('tab.itemGallery', {
      url: '/posts/itemGallery',
      views: {
        'tab-dash': {
          templateUrl: 'templates/itemSalesGallery_2item1Row.html',
          controller: 'itemSalesCtrl'
        }
      }
    })
    .state('tab.posts', {
        url: '/posts/:catagory',
        controller: 'CatPostCtrl as catPostCtrl',
        views: {
          'tab-dash': {
            templateUrl: 'templates/cat-posts.html',
            controller: 'CatPostCtrl'
          }
        }
      })
    .state('tab.cat-post-detail', {
      url: '/catPost/:catagory/:postId',
      cache:true,
      views: {
        'tab-dash': {
          templateUrl: 'templates/postDetails.html',
          controller: 'CatPostDetailCtrl'
        }
      }
    })
    .state('tab.userProfile',{
      url:'/userProfile',
      cache:false,
      views: {
        'tab-userProfile': {
          templateUrl:'templates/user-profile.html',
          controller: 'userProfileCtrl'
        }
      }
    })
    .state('tab.userProfile.myWatchedPostDetail',{
      url:'/watchedPosts/:id',
      views: {
        'tab-userProfile@tab':{
          templateUrl:'templates/postDetails.html',
          controller: 'myWatchedPostDetailCtrl'
        }
      }
    })
    .state('tab.userProfile.postDetails',{
      url:'/posts/:postId',
      views: {
        'tab-userProfile@tab':{
          templateUrl:'templates/postDetails.html',
          controller: 'postDetailsCtrl'
        }
      }
    })
    .state('tab.userProfile.messages',{
      url:'/messages',
      views: {
        'profile-page': {
          templateUrl:'templates/messagingService/messageList.html',
          controller: 'userMessagesCtrl'
        }
      }
    })
    .state('tab.userProfile.messages.messageDetails',{
      url:'/:title',
      views: {
        'tab-userProfile@tab': {
          templateUrl:'templates/messagingService/chat-page.html',
          controller: 'messageDetailsCtrl'
        }
      }
    })
      .state('tab.userProfile.posts',{
          url:'/posts',
          views: {
          'profile-page': {
          templateUrl:'templates/profilePage/posts-list.html',
          }
        }
      })

    .state('tab.insertPost',{
      url:'/insertPost',
      views: {
        'tab-dash': {
          templateUrl: 'templates/add-post.html',
          controller: 'AddPostCtrl'
        }
      }
    })
    .state('tab.about', {
      url: '/about',
      views: {
        'tab-about': {
          templateUrl: 'templates/tab-about.html',
          controller: 'AboutCtrl'
        }
      }
  })
//$sceDelegateProvider.resourceUrlWhitelist(['self', 'http://www.cinemagharhd.com/**']);
  //delete $httpProvider.defaults.headers.common['X-Requested-With'];
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/country');
  //$urlRouterProvider.otherwise('/country');
});
