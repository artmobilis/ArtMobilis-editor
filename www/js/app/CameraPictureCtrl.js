angular.module('starter')
.controller('CameraPictureCtrl', ['$scope', function($scope) {

  var _device_camera_picture = new DeviceCameraPicture();

  $scope.GetPicture = function() {
    if ($scope.isWebView) {
      _device_camera_picture.GetPicture();
    }
    else {
      console.warn('Pictures only available on devices');
    }
  };

}]);