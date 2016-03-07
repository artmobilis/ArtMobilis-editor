/*********************


Aruco tags naming norm

tag_{id}.jpg

Replace {id} by the tag's id.




********************/


angular.module('starter')

.factory('AssetsLoader', ['ListDirEntries', function(ListDirEntries) {

  var AssetsLoader = function() {
    var that = this;

    var _list_markers = new ListDirEntries();
    var _list_contents = new ListDirEntries();

    var _loading_markers = false;
    var _loading_contents = false;
    var _on_load_markers;
    var _on_load_contents;

    this.root = 'dataDirectory';
    this.dir_assets = 'assets';
    this.dir_markers = 'markers';
    this.dir_contents = 'contents';

    this.uuid_prefix = 'custom_';

    this.path_markers;
    this.path_contents;

    this.markers = [];
    this.contents = [];
    this.object_urls = [];


    function GetTagId(name) {
      var split = name.split('_');

      if (split.length == 2 && split[0] === 'tag') {
        var s = split[1].split();

        var id = parseInt(s[0]);

        return id;
      }

      return -1;
    }

    function SetMarkers() {
      that.markers = [];
      for (ent of _list_markers.entries) {

        var split = ent.name.split('.');
        if (split[split.length - 1] === 'jpg') {

          split.pop();
          var name = split.join('.');

          var tag_id = GetTagId(name);
          var is_tag = (tag_id >= 0);

          that.markers.push( {
            uuid: that.uuid_prefix + ent.name,
            name: name,
            url: that.path_markers + '/' + ent.name,
            is_tag: is_tag,
            tag_id: (is_tag) ? tag_id : undefined
          } );

        }

      }
    }

    this.LoadMarkers = function(on_load) {
      if (!_loading_markers) {
        _loading_markers = true;
        _on_load_markers = on_load;
        document.addEventListener('deviceready', function() {

          var dir = cordova.file[that.root] + that.dir_assets;
          that.path_markers = dir + '/' + that.dir_markers;

          _list_markers.Open(that.path_markers, function() {

            SetMarkers();

            _loading_markers = false;
            if (_on_load_markers)
              _on_load_markers();
            _on_load_markers = undefined;
            
          }, function() {
            _loading_markers = false;
            _on_load_contents = undefined;
          });

        }, false);
      }
    };

    function SetContents() {
      that.contents = [];
      that.object_urls = [];
      for (ent of _list_contents.entries) {

        var name = ent.name;

        that.contents.push( {
          uuid: that.uuid_prefix + name,
          name: name,
          object: name
        } );

        that.object_urls.push( {
          dir: that.path_contents + '/' + name + '/',
          url: that.path_contents + '/' + name + '/config.json'
        } );

      }
    }

    this.LoadContents = function(on_load) {
      if (!_loading_contents) {
        _loading_contents = true;
        _on_load_contents = on_load;
        document.addEventListener('deviceready', function() {

          var dir = cordova.file[that.root] + that.dir_assets;
          that.path_contents = dir + '/' + that.dir_contents;

          _list_contents.Open(that.path_contents, function() {

            SetContents();

            _loading_contents = false;
            if (_on_load_contents)
              _on_load_contents();
            _on_load_contents = undefined;
            
          }, function() {
            _loading_contents = false;
            _on_load_contents = undefined;
          });

        }, false);
      }
    };

  };

  return AssetsLoader;

}])