angular.module('app')

.controller('JourneyEditorCtrl', ['$scope', '$timeout', 'DataManagerSvc', function($scope, $timeout, DataManagerSvc) {

  $scope.edit_mode = '';
  $scope.GetJourney = null;

  $scope.asset_selection = {
    model: 'journey'
  };

  function GetJourney() {
    return DataManagerSvc.GetData();
  }

  DataManagerSvc.GetLoadPromise().then(function() {
    $timeout();
  }, function(e) {
    console.log(e);
  })
  

  $scope.GetJourney = GetJourney;

  $scope.k = '2';

}])