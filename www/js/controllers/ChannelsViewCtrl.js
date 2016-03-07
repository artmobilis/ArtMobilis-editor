angular.module('starter')
.controller('ChannelsViewCtrl', ['$scope', '$state', 'DataManagerSvc', '$ionicModal',
  function($scope, $state, DataManagerSvc, $ionicModal) {

    var _modal_download;

    $scope.DeleteChannel = function(uuid) {
      delete DataManagerSvc.tracking_data_manager.GetChannelContainer()[uuid];
    };

    $scope.$on('$destroy', function() {
      if (_modal_download)
        _modal_download.remove();
    });

    $scope.$on('popover.hidden', function() {
      $ionicSideMenuDelegate.toggleLeft(false);
    });

    $scope.LoadConfig = function() {
      DataManagerSvc.LoadConfig();
    };

    $scope.SaveConfig = function() {
      DataManagerSvc.SaveConfig();
    };

    $scope.ClearConfig = function() {
      DataManagerSvc.ClearConfig();
    };

    $scope.GetChannelContainer = function() {
      return DataManagerSvc.tracking_data_manager.GetChannelContainer();
    };

    $scope.GetMarker = function(uuid) {
      return DataManagerSvc.tracking_data_manager.GetMarker(uuid);
    };

    $scope.GetContents = function(uuid) {
      return DataManagerSvc.tracking_data_manager.GetContents(uuid);
    };

    $scope.LoadPreset = function() {
      DataManagerSvc.LoadPreset();
    };

    $scope.CreateChannel = function() {
      $state.go('channel_create');
    };

    $scope.LoadChannelsServer = function() {
      if ($scope.is_web_view)
        DataManagerSvc.LoadChannelsServer();
      else
        window.alert('Feature available on device only !');
    };

    $scope.DownloadAssets = function() {
      if ($scope.is_web_view)
        DataManagerSvc.DownloadAssets();
      else
        window.alert('Feature available on device only !');
    };

    $scope.DownloadMarker = function() {
      if ($scope.is_web_view)
        DataManagerSvc.DownloadMarker($scope.input.marker_name, function() {
          DataManagerSvc.OpenCustomAssets();
        });
      else
        window.alert('Feature available on device only !');
    };

    $scope.DownloadContents = function() {
      if ($scope.is_web_view)
        DataManagerSvc.DownloadContents($scope.input.contents_name, function() {
          DataManagerSvc.OpenCustomAssets();
        });
      else
        window.alert('Feature available on device only !');
    }

    $scope.OpenCustomAssets = function() {
      if ($scope.is_web_view)
        DataManagerSvc.OpenCustomAssets();
      else
        window.alert('Feature available on device only !');
    };

    $ionicModal.fromTemplateUrl('download_modal', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      _modal_download = modal;
    });

    $scope.ShowDownloadModal = function() {
      _modal_download.show();
    };

    $scope.HideDownloadModal = function() {
      _modal_download.hide();
    };

    $scope.input = {};
    $scope.input.marker_name = '';
    $scope.input.contents_name = '';
}]);