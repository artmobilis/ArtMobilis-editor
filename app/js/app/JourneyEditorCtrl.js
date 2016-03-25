angular.module('app')

.controller('JourneyEditorCtrl', ['$scope', '$timeout', 'DataManagerSvc', 'dataJourneyFactory',
  function($scope, $timeout, DataManagerSvc, dataJourneyFactory) {

  var selection = {
    model: 'journey',
    type: null,
    id: null,
    elem: null
  };

  $scope.edit_mode = '';
  $scope.GetJourney = null;

  $scope.selection = selection;

  function GetJourney() {
    return DataManagerSvc.GetData();
  }

  function SetJourney() {
    var journey_data = DataManagerSvc.GetData();
    $scope.journey   = journey_data.journey;
    $scope.pois      = journey_data.pois;
    $scope.channels  = journey_data.channels;
    $scope.markers   = journey_data.markers;
    $scope.contents  = journey_data.contents;
    $scope.objects   = journey_data.objects;
  }

  function SliceAssetId(data) {
    var sep_index = data.search('_');
    var type = (sep_index >= 0) ? data.slice(0, sep_index)  : data;
    var id   = (sep_index >= 0) ? data.slice(sep_index + 1) : null;
    return {
      type: type,
      id: id
    };
  }

  function OnAssetSelectionChange() {
    var journey_data = DataManagerSvc.GetData();
    var model = $scope.selection.model;

    var slice = SliceAssetId(model);
    if (slice.type === 'journey') {
      $scope.selection.elem = journey_data.journey;
    }
    else {
      $scope.selection.elem = journey_data[slice.type][slice.id];
    }

    $scope.selection.type = slice.type;
    $scope.selection.id   = slice.id;
  }

  function AllowDrop(event) {
    event.preventDefault();
  }

  function DragAsset(type, id) {
    return function(event) {
      event.dataTransfer.setData('Text', type + '_' + id);
    }
  }

  function DropAssetReplace(dst_type, elem, attr) {
    return function(event) {
      event.preventDefault();
      var data = event.dataTransfer.getData('Text');

      var slice = SliceAssetId(data);
      if (slice.type === dst_type) {
        elem[attr] = slice.id;
        $timeout();
      }
    }
  }

  function DropToChannel(channel, type, id) {
    if (type === 'markers') {
      channel.marker = id;
      $timeout();
    }
    else if (type === 'contents') {
      dataJourneyFactory.channelFactory.AddContent(
        channel,
        DataManagerSvc.GetData().contents[id]
        );
      $timeout();
    }
  }

  function DropToJourney(journey, type, id) {
    if (type === 'pois') {
      dataJourneyFactory.journeyFactory.AddPoi(journey, id);
      $timeout();
    }
  }

  function DropToPoi(poi, type, id) {
    if (type === 'channels') {
      dataJourneyFactory.poiFactory.AddChannel(poi, id);
    }
  }

  function DropToContent(content, type, id) {
    if (type === 'object') {
      content.object = id;
    }
  }

  var drop_fctns = {
    journey: DropToJourney,
    pois: DropToPoi,
    channels: DropToChannel,
    contents: DropToContent,
  }

  function Drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData('Text');
    var slice = SliceAssetId(data);

    var fun = drop_fctns[selection.type];
    if (typeof fun !== 'undefined') {
      fun(selection.elem, slice.type, slice.id);
      $timeout();
    }
  }

  DataManagerSvc.GetLoadPromise().then(function() {
    SetJourney();
    $timeout();
  }, function(e) {
    console.log(e);
  })


  $scope.$watch('selection.model', function() {
    OnAssetSelectionChange();
  });
  

  $scope.GetJourney = GetJourney;
  $scope.DragAsset = DragAsset;
  $scope.Drop = Drop;

}])