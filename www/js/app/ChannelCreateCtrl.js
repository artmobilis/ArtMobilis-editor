angular.module('starter')
.controller('ChannelCreateCtrl', ['$scope', '$state', 'DataManagerSvc',
  function($scope, $state, DataManagerSvc) {

  var _markers = DataManagerSvc.tracking_data_manager.GetMarkerContainer();

  var _container = {};

  for (uuid in _markers) {
    _container[uuid] = _markers[uuid];
  }

  var channels = DataManagerSvc.tracking_data_manager.GetChannelContainer();

  for (uuid in channels) {
    delete _container[channels[uuid].marker];
  }

  $scope.container = _container;

  $scope.Back = function() {
    $state.go('channels_view');
  }

  $scope.Select = function(marker_uuid) {
    var channel_uuid = DataManagerSvc.tracking_data_manager.AddChannel(marker_uuid);

    var channel = DataManagerSvc.tracking_data_manager.GetChannel(channel_uuid);

    channel.name = undefined;

    $state.go('channel_edit', { channel_id: channel_uuid });
  };
}])