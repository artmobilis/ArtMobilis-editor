angular.module('app')

.service('FileSystemSvc', function() {
  var _remote = require('remote');
  var _dialog = _remote.require('electron').dialog;
  var _fs = _remote.require('fs');


  function CopyFile(source, target) {
    return new Promise(function(resolve, reject) {

      var ended = false;

      if (!FileExists(source)) {
        reject('no such file', source);
        return;
      }

      var rd = _fs.createReadStream(source);
      rd.on("error", function(err) {
        Done(err);
      });
      var wr = _fs.createWriteStream(target);
      wr.on("error", function(err) {
        Done(err);
      });
      wr.on("close", function(ex) {
        Done();
      });
      rd.pipe(wr);

      function Done(err) {
        if (!ended) {
          ended = true;
          if (err)
            reject(err);
          else
            resolve();
        }
      }
      
    });
  }

  function FileExists(path) {
    var exists = false;
    try {
      _fs.accessSync(path, _fs.R_OK);
      exists = true;
    }
    catch (e) {
    }
    return exists;
  }

  function IsDir(path) {
    var stat = _fs.statSync(path);
    return stat.isDirectory();
  }

  function CreateDir(path) {
    if (FileExists(path)) {
      if (!IsDir(path))
        return 'cant create directory, file already exists, ' + path;
    }
    else
      _fs.mkdirSync(path);
  }

  function RealPath(path) {
    return _fs.realpathSync(path);
  }

  function GetParentDirSep(path, sep) {
    var index = path.lastIndexOf(sep);
    if (index < 0)
      return path;
    else
      return path.slice(0, index);
  }

  function GetParentDir(path) {
    return GetParentDirSep(GetParentDirSep(path, '/'), '\\');
  }

  function CompPath(path1, path2) {
    return RealPath(path1) === RealPath(path2);
  }

  this.CopyFile = CopyFile;
  this.CreateDir = CreateDir;
  this.RealPath = RealPath;
  this.CompPath = CompPath;
  this.FileExists = FileExists;


})