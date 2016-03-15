angular.module('starter')

.factory('ConfigManager', ['$cordovaFile', function($cordovaFile) {

  var ConfigManager = function(filename) {

    var that = this;

    var _is_web_view = ionic.Platform.isWebView();

    var _dir = 'dataDirectory';


    this.json = {};

    this.filename = filename;


    this.ResetFilename = function() {
      that.filename = 'config.json';
    }

    function Parse(str, on_load) {
      if (typeof(str) !== 'undefined') {
        try {
          that.json = JSON.parse(str);
        }
        catch(e) {
          that.json = undefined;
          console.warn('Load failed: parsing failed: ' + e);
        }
      }
      if (on_load)
        on_load();
    }

    function LoadWebView(on_load) {
      document.addEventListener('deviceready', function(on_load) {
        return function () {
          var root = cordova.file[_dir];

          $cordovaFile.readAsText(root, that.filename).then(function(success) {
            Parse(success, on_load);
          }, function(error) {
            console.warn('Load failed', error);
            that.json = undefined;
            if (on_load)
              on_load();
          });

        }
      }(on_load));
    }

    function LoadDefault(on_load) {
      if (typeof(Storage) !== 'undefined') {
        var str = localStorage[that.filename];
        Parse(str, on_load);
      }
      else {
        console.warn('ConfigManager: Load failed: "Storage" undefined');
        if (on_load)
          on_load();
      }
    }

    this.Load = function(on_load) {
      if (_is_web_view)
        LoadWebView(on_load);
      else
        LoadDefault(on_load);
    };

    function SaveWebView(str) {
      document.addEventListener('deviceready', function () {
        var root = cordova.file[_dir];
        $cordovaFile.writeFile(root, that.filename, str, true).then(function(success) {

        }, function(error) {
          console.warn('Save failed', error);
        });
      });
    }

    function SaveDefault(str) {
      if (typeof(Storage) !== 'undefined')
        localStorage[that.filename] = str;
      else
        console.warn('ConfigManager: Save failed: "Storage" undefined');
    }

    this.Save = function() {
      var str = JSON.stringify(that.json, undefined, 2);
      if (_is_web_view)
        SaveWebView(str);
      else
        SaveDefault(str);
    };

    function ClearWebView() {
      document.addEventListener('deviceready', function () {
        var root = cordova.file[_dir];
        $cordovaFile.removeFile(root, that.filename);
      });
    }

    function ClearDefault() {
      if (typeof(Storage) !== 'undefined')
        localStorage[that.filename] = '{}';
      else
        console.warn('ConfigManager: Save failed: "Storage" undefined');
    }

    this.Clear = function() {
      that.json = {};
      if (_is_web_view)
        ClearWebView();
      else
        ClearDefault();
    };

    if (!this.filename)
      this.ResetFilename();
    
  };

  return ConfigManager;
}])