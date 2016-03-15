angular.module('starter')

.controller('ChannelEditCtrl', ['$scope', '$state', '$stateParams', 'DataManagerSvc',
  function($scope, $state, $stateParams, DataManagerSvc) {

    $scope.DataManagerSvc = DataManagerSvc;

    var _channel = DataManagerSvc.tracking_data_manager.GetChannel($stateParams.channel_id);

    $scope.channel_id = $stateParams.channel_id;
    $scope.channel = _channel;

    $scope.RemoveContents = function(index) {
      _channel.contents.splice(index, 1);
    };

    $scope.GetContents = function(uuid) {
      return DataManagerSvc.tracking_data_manager.GetContents(uuid);
    };

    $scope.GetMarker = function(uuid) {
      return DataManagerSvc.tracking_data_manager.GetMarker(uuid);
    };

    $scope.SelectMarker = function() {
      $state.go('channel_select_marker', { channel_id: $stateParams.channel_id });
    }

    $scope.OpenContentsAdd = function() {
      $state.go('channel_add_contents', { channel_id: $stateParams.channel_id });
    };

    $scope.OpenContentsTransform = function() {
      $state.go('channel_transform_contents', { channel_id: $stateParams.channel_id });
    };
}])