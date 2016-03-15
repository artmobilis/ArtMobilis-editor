angular.module('starter')
.controller('MarkerSelectCtrl', ['$scope', '$state', '$stateParams', 'DataManagerSvc',
  function($scope, $state, $stateParams, DataManagerSvc) {

  var _markers = DataManagerSvc.tracking_data_manager.GetMarkerContainer();

  var _container = {};

  var _channel = DataManagerSvc.tracking_data_manager.GetChannel($stateParams.channel_id);

  for (uuid in _markers) {
    _container[uuid] = _markers[uuid];
  }

  var channels = DataManagerSvc.tracking_data_manager.GetChannelContainer();

  for (uuid in channels) {
    delete _container[channels[uuid].marker];
  }

  $scope.container = _container;
  $scope.channel_id = $stateParams.channel_id;

  $scope.Back = function() {
    $state.go('channel_edit', { channel_id: $scope.channel_id });
  }

  $scope.Select = function(uuid) {
    _channel.marker = uuid;

    $state.go('channel_edit', { channel_id: $scope.channel_id });
  };
}])