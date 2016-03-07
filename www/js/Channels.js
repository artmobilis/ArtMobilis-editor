Channel = function(marker_id, contents_id) {
  var that = this;

  arguments.callee.uuid_max = arguments.callee.uuid_max || 0;

  this.marker_id = marker_id;
  this.contents_id = contents_id;
  this.uuid = Channel.uuid_max;
  ++Channel.uuid_max;

  this.Set = function(marker_id, contents_id) {
    that.marker_id = marker_id;
    that.contents_id = contents_id;
  };

  this.ToJson = function() {
    return { marker_id: that.marker_id, contents_id: that.contents_id };
  };

  this.FromJson = function(json, uuid) {
    that.marker_id = json.marker_id;
    that.contents_id = json.contents_id;
  };
};

Channels = function() {
  var that = this;

  var _container = {};

  this.FromJson = function(json) {
    for (var uuid in json) {
      var channel = new Channel();

      channel.FromJson(json[uuid]);
      channel.uuid = uuid;

      _container[uuid] = channel;

      if (typeof(uuid) === 'number' && uuid >= Channel.prototype.uuid_max)
        Channel.prototype.uuid_max = uuid + 1;
    }
  };

  this.ToJson = function(json) {
    for (uuid in _container) {
      json[uuid] = _container[uuid].ToJson();
    }
  };

  this.GetChannel = function(uuid) {
    return _container[uuid];
  };

  this.SetChannel = function(channel) {
    _container[channel.uuid] = channel;
  };

  this.GetContainer = function() {
    return _container;
  };
};