angular.module('starter')

.service('DataManagerSvc', ['$cordovaFileTransfer', 'ConfigManager', 'AssetsLoader', 'AssetsDownloader', 'JsonLoader',
  function($cordovaFileTransfer, ConfigManager, AssetsLoader, AssetsDownloader, JsonLoader) {
  var that = this;


  var _local_config = new ConfigManager();
  var _server_config = new ConfigManager('download/channels.json');

  var _contents_downloader = new AssetsDownloader();
  var _marker_downloader = new AssetsDownloader();
  var _on_download_marker;
  var _on_download_contents;
  var _assets_loader = new AssetsLoader();
  var _loading_manager_config = new LoadingManager();


  function GetXDomainRequest() {
    var xdr = null;

    if (window.XDomainRequest) {
      xdr = new XDomainRequest(); 
    }
    else if (window.XMLHttpRequest) {
      xdr = new XMLHttpRequest(); 
    }
    else {
      alert("Votre navigateur ne gère pas l'AJAX cross-domain !");
    }

    return xdr; 
  }

  function LoadFile(url, on_load, on_error) {
    var req = GetXDomainRequest();

    var no_cache_suffix =  '' + ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();

    req.open('GET', url + no_cache_suffix, true);
    req.setRequestHeader('Access-Control-Allow-Origin', '*');

    var onreadystatechange = function(on_load, on_error) {
      return function (aEvt) {
        if (req.readyState == 4) {
          if(req.status == 200)
            on_load(req.responseText);
          else if (on_error)
            on_error('error status: ' + req.status);
        }
      };
    }(on_load, on_error);

    req.onreadystatechange = onreadystatechange;
    req.send();
  }

  function LoadJsonFile(url, on_load, on_error) {
    var on_load_file = function(on_load, on_error) {
      return function(data) {
        var json;

        try {
          json = JSON.parse(data);
        } catch(e) {
          if (on_error)
            on_error('parsing error: ' + e);
          return;
        }
        on_load(json);
      };
    }(on_load, on_error);

    LoadFile(url, on_load_file, on_error);
  }

  function ResetOrigin() {
    that.origin = './assets';
  }

  function SetOriginToServer() {
    that.origin = 'http://www.lehublot.net/artmobilis/assets';
  }

  function GetPath(url) {
    return that.origin + '/' + url;
  }

  this.origin;
  ResetOrigin();
  this.tracking_data_manager = new TrackingDataManager();
  this.tracking_data_manager.LoadContentsAssets(GetPath('contents_objects.json'));



  this.LoadMarkers = function(url) {
    LoadJsonFile(GetPath(url), function(json) {
      that.tracking_data_manager.ParseMarkers(json);
    }, function(error) {
      console.log('DataManagerSvc: failed to load markers: ' + error);
    });
  };

  this.LoadContents = function(url) {
    LoadJsonFile(GetPath(url), function(json) {
      that.tracking_data_manager.ParseContents(json);
    }, function(error) {
      console.log('DataManagerSvc: failed to load contents: ' + error);
    });
  };

  this.LoadChannels = function(url) {
    LoadJsonFile(GetPath(url), function(json) {
      that.tracking_data_manager.ParseChannels(json);
    }, function(error) {
      console.log('DataManagerSvc: failed to load channels: ' + error);
    });
  };

  this.LoadConfig = function() {
    if (!_loading_manager_config.IsLoading()) {

      _loading_manager_config.Start();
      _local_config.Load(function() {

        that.tracking_data_manager.ParseChannels(_local_config.json, true);
        _loading_manager_config.End();

      });

    }
  };

  this.OnLoadConfig = function(callback) {
    _loading_manager_config.OnEnd(callback);
  };

  this.SaveConfig = function() {
    _local_config.json = that.tracking_data_manager.ChannelsToJson();
    _local_config.Save();
  };

  this.ClearConfig = function() {
    that.tracking_data_manager.ClearCustom();
  };

  this.LoadPreset = function() {
    ResetOrigin();
    this.LoadChannels('channels.json', true);
  };

  this.OpenCustomAssets = function() {
    _assets_loader.LoadMarkers(function() {
      for(ent of _assets_loader.markers) {
        that.tracking_data_manager.AddMarker(ent.url, ent.uuid, ent.name, ent.tag_id);
      }
    });
    _assets_loader.LoadContents(function() {
      for(object_url of _assets_loader.object_urls) {

        that.tracking_data_manager.OnLoadContentsAssets(function(url, dir) {
          return function() {
            that.tracking_data_manager.LoadContentsAssets(url, dir);
          };
        }(object_url.url, object_url.dir));
        
      }
      for(ent of _assets_loader.contents) {
        that.tracking_data_manager.AddContents(ent.object, ent.uuid, ent.name);
      }
    });
  };

  this.DownloadMarker = function(name, on_load) {
    if (!_marker_downloader.IsLoading()) {
      _on_download_marker = on_load;
      _marker_downloader.source = 'artmobilis/assets/markers/' + name;
      _marker_downloader.dst = 'assets/markers/' + name;
      _marker_downloader.Download(function() {
        console.log('File downloaded: ' + _marker_downloader.dst_full_path);
        if (_on_download_marker) {
          var fun = _on_download_marker;
          _on_download_marker = undefined;
          fun();
        }
      }, function() {
        window.alert('Failed to download file: ' + _marker_downloader.dst_full_path);
      });
    }
  };

  function DownloadContentsFilesRec(list, params) {
    if (list.length > 0) {
      var filename = list.pop();

      _contents_downloader.dst = params.dst_dir + filename;
      _contents_downloader.source = params.src_dir + filename;

      _contents_downloader.Download(function() {
        console.log('File downloaded: ' + filename);
        DownloadContentsFilesRec(list, params);
      }, function() {
        window.alert('Failed to download file: ' + filename);
        DownloadContentsFilesRec(list, params);
      });
    }
    else {
      if (_on_download_contents) {
        var fun = _on_download_contents;
        _on_download_contents = undefined;
        fun();
      }
    }
  }

  function DownloadContentsFiles(json, params) {
    json = json || {};
    var list = json.files || [];

    list = list.slice(0);

    DownloadContentsFilesRec(list, params);
  }

  this.DownloadContents = function(name, on_load) {

    var src_dir = 'artmobilis/assets/contents/' + name + '/';
    var dst_dir = 'assets/contents/' + name + '/';
    var config_name = 'config.json';

    var src_file = src_dir + config_name;
    var dst_file = dst_dir + config_name;

    if (!_contents_downloader.IsLoading()) {
      _on_download_contents = on_load;

      _contents_downloader.source = src_file;
      _contents_downloader.dst = dst_file;

      _contents_downloader.Download(function() {
        var json_loader = new JsonLoader();
        json_loader.Load(_contents_downloader.dst_full_path, function() {
          DownloadContentsFiles(json_loader.json, { src_dir: src_dir, dst_dir: dst_dir });
        }, function() {
          console.log('JsonLoader failed to load file "' + _contents_downloader.dst_full_path + '"');
        });
      });
    }
  };

  ResetOrigin();
  this.LoadMarkers('markers.json', true);
  this.LoadContents('contents.json', true);

}])