angular.module('starter')

.controller('ContentsTransformCtrl', ['$scope', '$stateParams', 'DataManagerSvc',
  function($scope, $stateParams, DataManagerSvc) {


    $scope.position = new THREE.Vector3();
    $scope.rotation = new THREE.Euler();
    $scope.scale = { value: 0.2 };

    $scope.pos_extremum = 0.75;
    $scope.posZ_min = -0.2;
    $scope.posZ_max = 0.5;
    $scope.rot_min = -3.14159;
    $scope.rot_max = 3.14159;
    $scope.scale_min = 0.01;
    $scope.scale_max = 1.5;

    $scope.channel_id = $stateParams.channel_id;

    $scope.show_tools_position = false;
    $scope.show_tools_rotation = false;
    $scope.show_tools_scale = false;

    $scope.selection = undefined;

    $scope.current_tool = "";

    $scope.ShowToolsPosition = function() {
      $scope.show_tools_position = true;
      $scope.show_tools_rotation = false;
      $scope.show_tools_scale = false;
      $scope.current_tool = "Move";
    };

    $scope.ShowToolsRotation = function() {
      $scope.show_tools_position = false;
      $scope.show_tools_rotation = true;
      $scope.show_tools_scale = false;
      $scope.current_tool = "Rotate";
    };

    $scope.ShowToolsScale = function() {
      $scope.show_tools_position = false;
      $scope.show_tools_rotation = false;
      $scope.show_tools_scale = true;
      $scope.current_tool = "Scale";
    };

    $scope.Reset = function() {
      if ($scope.show_tools_position)
        ResetPosition();
      else if ($scope.show_tools_rotation)
        ResetRotation();
      else if ($scope.show_tools_scale)
        ResetScale();
    };

    $scope.ResetPosition = function() {
      $scope.position.set(0, 0, 0);
    };

    $scope.ResetRotation = function() {
      $scope.rotation.set(0, 0, 0);
    };

    $scope.ResetScale = function() {
      console.log($scope.scale);
      $scope.scale.value = 1;
      console.log($scope.scale);
    };

    $scope.Save = function() {
      $scope.$broadcast('save_channel', '');
    }

    $scope.Load = function() {
      $scope.$broadcast('load_channel', '');
    }

    $scope.ShowToolsPosition();

}])