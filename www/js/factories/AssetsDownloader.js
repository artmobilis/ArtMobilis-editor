angular.module('starter')

.factory('AssetsDownloader', ['$cordovaFileTransfer',
  function($cordovaFileTransfer) {

  var AssetsDownloader = function() {
    var that = this;

    var _loading = false;

    var _on_finish;
    var _on_error;
    var _on_progress;

    var _progress = 0;

    this.domain = 'http://lehublot.net';
    this.source = 'artmobilis/assets';
    this.url;

    this.root_dst = 'dataDirectory';
    this.dst = '';
    this.dst_full_path;


    function OnDownloadEnd(callback) {
      _loading = false;
      _on_finish = undefined;
      _on_error = undefined;
      _on_progress = undefined;

      if (callback)
        callback();
    }

    this.Download = function(on_finish, on_error, on_progress) {
      if (!_loading) {
        _loading = true;
        that.url = that.domain + '/' + that.source;

        _on_finish = on_finish;
        _on_error = on_error;
        _on_progress = _on_progress;

        document.addEventListener('deviceready', function () {

          that.dst_full_path = cordova.file[that.root_dst] + that.dst;

          var trustHosts = true;
          var options = {};

          $cordovaFileTransfer.download(that.url, that.dst_full_path, options, trustHosts)
          .then(function(result) {
            OnDownloadEnd(_on_finish);
          }, function(error) {
            OnDownloadEnd(_on_error);
          }, function(progress) {

            _progress = (progress.loaded / progress.total) * 100;
            if (on_progress)
              on_progress(progress);

          });

        }, false);
      }
    };

    this.GetProgress = function() {
      return _progress;
    };

    this.IsLoading = function() {
      return _loading;
    };

  };

  return AssetsDownloader;

}])