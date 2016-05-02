angular.module('app')

.run(['DataManagerSvc', function(DataManagerSvc) {
  // DataManagerSvc.LoadPresets();
}])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/journey_editor');

  $stateProvider

  .state('journey_editor', {
    url: '/journey_editor',
    templateUrl: 'templates/journey_editor.html',
    controller: 'JourneyEditorCtrl'
  })

}])