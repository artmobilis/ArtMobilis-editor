(function () {

  function DataJourneySaver(fs, DataManagerSvc) {
    var _on_end;
    var _path;
    var _fd;

    function OnEnd(err) {
      var cb = _on_end;
      _on_end = undefined;
      if (cb) cb(err);
    }

    function Save(path, on_end) {
      _path = path;
      _on_end = on_end;

      var file = path + '/journey.json';
      fs.open(file, 'w', OnOpen);
    }

    function OnOpen(err, fd) {
      if (err) {
        OnEnd(err);
        return;
      }

      _fd = fd;

      var data_journey = DataManagerSvc.GetData();

      var str = JSON.stringify(data_journey.ToJson(), undefined, 2);

      fs.write(fd, str, OnWrite);
    }

    function OnWrite(err, written, string) {
      fs.close(_fd);
      OnEnd(err);
    }

    this.Save = Save;
  }

  function GetFilename(path) {
    return path.split('/').pop().split('\\').pop();
  }


  angular.module('app')

  .service('ExportSvc', ['DataManagerSvc', 'ProjectsManagerSvc',
    function(DataManagerSvc, ProjectsManagerSvc) {

    var _remote = require('remote');
    var _dialog = _remote.require('electron').dialog;
    var _fs = _remote.require('fs');

    var _root;

    function New() {
      var files = _dialog.showOpenDialog( {
        title: 'New',
        properties: ['openDirectory']
      });

      if (typeof files !== 'undefined' && files.length == 1) {
        var root = files[0];

        ProjectsManagerSvc.SetRoot(root);
        ProjectsManagerSvc.CreateDirectories();

        DataManagerSvc.Clear();

        SaveToPath(root, function(err) {
          if (err) {
            console.warn(err);
          }
        });
      }
    }

    function Save() {
      SaveToPath(ProjectsManagerSvc.GetRoot());
    }

    function SaveToPath(path, cb) {
      (new DataJourneySaver(_fs, DataManagerSvc)).Save(path, cb);
    }

    this.New = New;
    this.Save = Save;

  }])

})()