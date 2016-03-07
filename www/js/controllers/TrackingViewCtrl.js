angular.module('starter')

.controller('TrackingViewCtrl', ['$scope', '$state',
  function($scope, $state) {

    $scope.$state = $state;

    $scope.Exit = function() {
      ionic.Platform.exitApp();
    }

  }])