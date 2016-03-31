angular.module('app')

.controller('JourneyEditorCtrl', ['$scope', '$timeout', 'DataManagerSvc', 'dataJourneyFactory', 'emptyAssetFactory',
  function($scope, $timeout, DataManagerSvc, dataJourneyFactory, emptyAssetFactory) {

  var selection = {
    model: 'journey',
    type: null,
    id: null,
    elem: null
  };

  $scope.edit_mode = '';
  $scope.GetJourney = null;

  $scope.selection = selection;

  $scope.drag = {
    type: null,
    id: null
  }

  function ResetSelection() {
    selection.model = 'journey';
    OnAssetSelectionChange();
  }

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
    if (type === 'objects') {
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

  function DropToPoiChannel(poi_id, channel_index) {
    var poi = DataManagerSvc.GetData().pois[poi_id];
    var channel_poi = poi.channels[channel_index];
    if (channel_poi) {
      return function(event) {
        event.preventDefault();
        var data = event.dataTransfer.getData('Text');
        var slice = SliceAssetId(data);
        if (slice.type === 'objects') {
          channel_poi.object = slice.id;
        }

        $timeout();
      };
    }
    else
      return function() {};
  }

  function NewPoi() {
    var elem = emptyAssetFactory.CreatePoi();
    DataManagerSvc.GetData().pois[elem.uuid] = elem;
  }

  function NewChannel() {
    var elem = emptyAssetFactory.CreateChannel();
    DataManagerSvc.GetData().channels[elem.uuid] = elem;
  }

  function NewMarker() {
    var elem = emptyAssetFactory.CreateMarker();
    DataManagerSvc.GetData().markers[elem.uuid] = elem;
  }

  function NewContent() {
    var elem = emptyAssetFactory.CreateContent();
    DataManagerSvc.GetData().contents[elem.uuid] = elem;
  }

  function NewObject() {
    var elem = emptyAssetFactory.CreateObject();
    DataManagerSvc.GetData().objects[elem.uuid] = elem;
  }

  function SetSelection(type, id) {
    selection.model = type + '_' + id;
  }

  function Delete() {
    var data_jouney = DataManagerSvc.GetData();
    var container = data_jouney[selection.type];

    var previous;
    var next;
    var found = false;
    for (id in container) {
      if (found) {
        next = id;
        break;
      }
      if (id === selection.id) {
        found = true;
        continue;
      }
      previous = id;
    }
    if (found) {
      delete container[selection.id];
      if (next)
        SetSelection(selection.type, next);
      else if (previous)
        SetSelection(selection.type, previous);
      else
        ResetSelection();

      DataManagerSvc.CleanReferences();
    }
  }

  function DetachFromPoi(poi, type, id) {
    if (type === 'poi-channel') {
      poi.channels.splice(id, 1);
    }
    else if (type === 'poi-channel-object') {
      poi.channels[id].object = null;
    }
  }

  function DetachFromChannel(channel, type, id) {
    if (type === 'channel-content') {
      channel.contents.splice(id, 1);
    }
    else if (type === 'channel-marker') {
      channel.marker = null;
    }
  }

  function DetachFromJourney(journey, type, id) {
    if (type === 'journey-poi') {
      journey.pois.splice(id, 1);
    }
  }

  function DetachFromContent(content, type, id) {
    if (type === 'content-object') {
      content.object = null;
    }
  }

  var detach_fctns = {
    journey: DetachFromJourney,
    pois: DetachFromPoi,
    channels: DetachFromChannel,
    contents: DetachFromContent
  }

  function Detach(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData('Text');
    var slice = SliceAssetId(data);

    var fun = detach_fctns[selection.type];
    if (fun)
      fun(selection.elem, slice.type, slice.id);
    $timeout();
  }

  DataManagerSvc.GetLoadPromise().then(function() {
    SetJourney();
    ResetSelection();
    $timeout();
  }, function(e) {
    console.log(e);
  });

  ResetSelection();


  $scope.$watch('selection.model', function() {
    OnAssetSelectionChange();
  });
  

  $scope.GetJourney = GetJourney;
  $scope.DragAsset = DragAsset;
  $scope.Drop = Drop;
  $scope.DropToPoiChannel = DropToPoiChannel;
  $scope.NewPoi = NewPoi;
  $scope.NewChannel = NewChannel;
  $scope.NewMarker = NewMarker;
  $scope.NewContent = NewContent;
  $scope.NewObject = NewObject;
  $scope.Delete = Delete;
  $scope.Detach = Detach;

}])