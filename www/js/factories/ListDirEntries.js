angular.module('starter')

.factory('ListDirEntries', function() {

  var ListDirEntries = function() {
    var that = this;

    this.entries = [];


    this.Open = function(url, on_load, on_error) {
      document.addEventListener('deviceready', function(url, on_load, on_error) {
        return function() {

          OnError = function(er) {
            that.entries = [];
            console.log("Failed to list directory contents: " + er.code);
            if (on_error)
              on_error();
          }

          window.resolveLocalFileSystemURL(url, function (dirEntry) {

            var directoryReader = dirEntry.createReader();
            directoryReader.readEntries( function(entries) {
              that.entries = entries;
              if (on_load)
                on_load();
            }, OnError);

          }, OnError);

        };
      }(url, on_load, on_error), false);
    };

    this.LogEntries = function() {
      console.log('Log entries');
      for (ent of that.entries)
        console.log(ent.name);
    };

  };

  return ListDirEntries;
})