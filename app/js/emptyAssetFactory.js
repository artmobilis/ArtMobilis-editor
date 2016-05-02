angular.module('app')

.factory('emptyAssetFactory', ['uuid4', 'dataJourneyFactory', function(uuid4, dataJourneyFactory) {

  function CreatePoi() {
    return dataJourneyFactory.poiFactory.Create(uuid4.generate());
  };

  function CreateChannel() {
    return dataJourneyFactory.channelFactory.Create(uuid4.generate());
  };

  function CreateContent() {
    return dataJourneyFactory.contentFactory.Create(uuid4.generate());
  };

  function CreateMarker() {
    return dataJourneyFactory.markerFactory.Create(uuid4.generate());
  };

  function CreateObject() {
    var obj = new THREE.Object3D();
    obj.name = 'unnamed object';
    return obj;
  };

  return {
    CreatePoi: CreatePoi,
    CreateChannel: CreateChannel,
    CreateContent: CreateContent,
    CreateMarker: CreateMarker,
    CreateObject: CreateObject
  };

}])