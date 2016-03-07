angular.module('starter')

.controller('ContentsAddCtrl', ['$scope', '$state', '$stateParams', 'DataManagerSvc',
  function($scope, $state, $stateParams, DataManagerSvc) {

    var _channel_id = $stateParams.channel_id;
    var _channel = DataManagerSvc.tracking_data_manager.GetChannel(_channel_id);

    $scope.channel_id = _channel_id;

    $scope.GetContentsContainer = function() {
      return DataManagerSvc.tracking_data_manager.GetContentsContainer();
    };

    $scope.SelectContents = function(uuid) {
      DataManagerSvc.tracking_data_manager.AddContentsToChannel(_channel_id, { uuid: uuid });
      $state.go('channel_edit', { channel_id: _channel_id } );
    };

}])