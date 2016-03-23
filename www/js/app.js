// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ngCordova', 'starter.controllers', 'starter.services', 'directiveModules'])
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);}

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();}
    });
})

.config(function($stateProvider, $ionicConfigProvider, $urlRouterProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
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
    .state('chooseState', {
      cache:'false',
      url:'/state/:resetLocation',
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
      url: '/dash/:state/:city',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
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
        },
        resolve: {
            posts : function($stateParams, userAuthServices, kchahiyoServices){
              var location = userAuthServices.getStateAndCity();
              var catagory = $stateParams.catagory;
              return kchahiyoServices.getPostsByCatagory(catagory, location)
            }
          }
      })
    .state('tab.cat-post-detail', {
      url: '/catPost/:postId',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-postDetail.html',
          controller: 'CatPostDetailCtrl'
        }
      }
    })
    .state('tab.myPostDetail',{
      url:'/myPosts/:postId',
      views: {
        'tab-userProfile':{
          templateUrl:'templates/tab-postDetail.html',
          controller: 'myPostDetailCtrl'
        }
      }
    })
    .state('tab.myWatchedPostDetail',{
      url:'/watchedPosts/:id',
      views: {
        'tab-userProfile':{
          templateUrl:'templates/tab-postDetail.html',
          controller: 'myWatchedPostDetailCtrl'
        }
      }
    })
    .state('tab.userProfile',{
      url:'/userProfile',
      views: {
        'tab-userProfile': {
          templateUrl:'templates/user-profile.html',
          controller: 'userProfileCtrl'
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


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/state/false');
});
