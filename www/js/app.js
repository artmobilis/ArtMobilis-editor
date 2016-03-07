angular.module('starter', ['ionic', 'ngCordova'])

.run(['$ionicPlatform', '$rootScope', '$state', 'DataManagerSvc',
  function($ionicPlatform, $rootScope, $state, DataManagerSvc) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default
      // (remove this to show the accessory bar above the keyboard for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      cordova.plugins.Keyboard.disableScroll(true);

    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    var _is_web_view = ionic.Platform.isWebView();

    $rootScope.is_web_view = _is_web_view;

    if (_is_web_view)
      DataManagerSvc.OpenCustomAssets();

    DataManagerSvc.LoadConfig();

  });
}])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider.state('tracking_view', {
    url: '/',
    templateUrl: 'templates/tracking_view.html'
  })

  .state('channels_view', {
    url: 'view_channels/',
    templateUrl: 'templates/channels_view.html',
    controller: 'ChannelsViewCtrl'
  })

  .state('channel_create', {
    url: 'create_channel/',
    templateUrl: 'templates/marker_select.html',
    controller: 'ChannelCreateCtrl'
  })

  .state('channel_edit', {
    url: 'edit_channel/:channel_id/',
    templateUrl: 'templates/channel_edit.html',
    controller: 'ChannelEditCtrl'
  })

  .state('channel_select_marker', {
    url: 'channel_select_marker/:channel_id/',
    templateUrl: 'templates/marker_select.html',
    controller: 'MarkerSelectCtrl'
  })

  .state('channel_add_contents', {
    url: 'channel_add_contents/:channel_id/',
    templateUrl: 'templates/contents_add.html',
    controller: 'ContentsAddCtrl'
  })

  .state('channel_transform_contents', {
    url: 'channel_transform_contents/:channel_id/',
    templateUrl: 'templates/contents_transform.html',
    controller: 'ContentsTransformCtrl'
  })

}])