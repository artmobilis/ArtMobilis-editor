angular.module('app')

.directive('journeyEditorToolbar', ['DataManagerSvc', function(DataManagerSvc) {
  return {
    restrict: 'E',
    templateUrl: 'templates/journey_editor_toolbar.html',
    controller: ['$scope', 'DataManagerSvc', function($scope, DataManagerSvc) {

      function ObjectToArray(obj) {
        var ar = [];

        for (key in obj)
          ar.push(obj[key]);

        return ar;
      }

      function Save() {
        var remote = require('remote');
        var dialog = remote.require('electron').dialog;
        var fs = remote.require('fs');

        var file = dialog.showSaveDialog();

        if (typeof file !== 'undefined') {
          fs.open(file, 'w', OnOpen);
        }

        function OnOpen(err, fd) {
          if (err) {
            console.error(err);
            return;
          }

          var data_journey = DataManagerSvc.GetData();

          var data = {
            journey: ObjectToArray(data_journey.journey),
            pois: ObjectToArray(data_journey.pois),
            channels: ObjectToArray(data_journey.channels),
            markers: ObjectToArray(data_journey.markers),
            contents: ObjectToArray(data_journey.contents)
          }

          var str = JSON.stringify(data, undefined, 2);

          fs.write(fd, str, OnWrite);

        }

        function OnWrite(err, written, string) {
          if (err) {
            console.error(err);
          }
        }
      }

      function Load() {
        var remote = require('remote');
        var dialog = remote.require('electron').dialog;

        var files = dialog.showOpenDialog({ properties: [ 'openFile', 'multiSelections' ]});
      }

      $scope.Save = Save;
      $scope.Load = Load;

    }],
    link: function(scope, element, attrs) {

    }
  }
}])