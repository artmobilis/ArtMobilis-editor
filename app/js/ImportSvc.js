angular.module('app')

.service('ImportSvc', [
  'DataManagerSvc',
  'FileSystemSvc',
  'ProjectsManagerSvc',
  'journeyType',
  function(
    DataManagerSvc,
    FileSystemSvc,
    ProjectsManagerSvc,
    journeyType) {

    var _remote = require('remote');
    var _dialog = _remote.require('electron').dialog;
    var _fs = _remote.require('fs');


    var PLANE_GEOMETRY_UNIT = new THREE.PlaneGeometry(1, 1);
    PLANE_GEOMETRY_UNIT.uuid = '50DBA06D-DC6D-4F1F-BF90-BE6F3F69CB5D';
    PLANE_GEOMETRY_UNIT.name = 'PLANE_GEOMETRY_UNIT';


    function GetFilename(path) {
      return path.split('/').pop().split('\\').pop();
    }

    function GetExtension(path) {
      return path.slice(path.lastIndexOf('.') + 1).toLowerCase();
    }

    function ReplaceBackslashBySlash(path) {
      return path.replace(/\\/g, '/');
    }

    function GetName(path) {
      var filename = GetFilename(path);
      return filename.slice(0, filename.lastIndexOf('.'));
    }

    function AddMarker(filename, path) {
      var name = GetName(filename);

      var marker = new journeyType.Marker(undefined, name, 'img', path);
      marker.name = name;
      marker.type = 'img';
      marker.url = path;


      DataManagerSvc.GetData().markers[marker.uuid] = marker;

      DataManagerSvc.NotifyChange('marker', marker.uuid);
    }

    var ImportMarkers = function() {

      function MarkersImporter(path) {
        var filename = GetFilename(path);
        var root = ProjectsManagerSvc.GetRoot();
        var new_dir = root + '/' + AMTHREE.IMAGE_PATH;
        var new_path = new_dir + filename;

        if (!FileSystemSvc.FileExists(new_path)) {
          FileSystemSvc.CopyFile(path, new_path).then(function() {
            AddMarker(filename, new_path);
          }).catch(function(err) {
            console.warn(err);
          });
        }
        else
          AddMarker(filename, new_path);
      }

      return function() {
        var files = _dialog.showOpenDialog( {
          title: 'Import markers',
          properties: ['openFile', 'multiSelections'],
          filters: [
            {
              name: 'JPEG image',
              extensions: ['jpg', 'jpeg']
            }
          ]
        });

        if (typeof files !== 'undefined') {
          ProjectsManagerSvc.CreateDirectories();
          for (var i = 0, c = files.length; i < c; ++i) {
            (new MarkersImporter(files[i]));
          }
        }
      }
    }();

    function AddPlane(path, texture) {
      var geometry = PLANE_GEOMETRY_UNIT;
      var material = new THREE.MeshBasicMaterial( { side: 2, map: texture, transparent: true } );
      var object = new THREE.Mesh(geometry, material);
      object.name = GetName(path);

      DataManagerSvc.GetData().objects[object.uuid] = object;

      DataManagerSvc.NotifyChange('object', object.uuid);
    }

    function AddPlaneImage(path) {
      var image = new AMTHREE.Image(undefined, path);
      var texture = new AMTHREE.ImageTexture(image);

      AddPlane(path, texture);
    }

    function AddPlaneGif(path) {
      var image = new AMTHREE.Image(undefined, path);
      var texture = new AMTHREE.GifTexture(image);

      AddPlane(path, texture);
    }

    function AddPlaneMp4(path) {
      var video = new AMTHREE.Video(undefined, path);
      var texture = new AMTHREE.VideoTexture(video);

      AddPlane(path, texture);
    }

    function AddSoundObject(path) {
      var sound = new AMTHREE.Sound(undefined, path);
      var object = new AMTHREE.SoundObject(sound);
      object.name = GetName(path);

      DataManagerSvc.GetData().objects[object.uuid] = object;

      DataManagerSvc.NotifyChange('object', object.uuid);
    }

    function ImportFilesAsPlanes() {
      var files = _dialog.showOpenDialog( {
        title: 'Import objects',
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            name: 'Image, video, sound',
            extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3']
          }
        ]
      })

      if (typeof files !== 'undefined') {
        ProjectsManagerSvc.CreateDirectories();
        for (var i = 0, c = files.length; i < c; ++i) {

          function PlaneImporter(path) {
            var filename = GetFilename(path);
            var root = ProjectsManagerSvc.GetRoot();
            var extension = GetExtension(filename);

            switch (extension) {
              case 'jpg':
              case 'jpeg':
              case 'png':
              var local_path = AMTHREE.IMAGE_PATH + filename;
              var new_path = root + '/' + local_path;
              if (FileSystemSvc.FileExists(new_path))
                AddPlaneImage(new_path);
              else {
                FileSystemSvc.CopyFile(path, new_path).then(function() {
                  AddPlaneImage(new_path);
                }).catch(function(err) {
                  console.warn(err);
                });
              }
              break;

              case 'gif':
              var local_path = AMTHREE.IMAGE_PATH + filename;
              var new_path = root + '/' + local_path;
              if (FileSystemSvc.FileExists(new_path))
                AddPlaneGif(new_path);
              else {
                FileSystemSvc.CopyFile(path, new_path).then(function() {
                  AddPlaneGif(new_path);
                }).catch(function(err) {
                  console.warn(err);
                });
              }
              break;

              case 'mp4':
              var local_path = AMTHREE.VIDEO_PATH + filename;
              var new_path = root + '/' + local_path;
              if (FileSystemSvc.FileExists(new_path))
                AddPlaneMp4(new_path);
              else {
                FileSystemSvc.CopyFile(path, new_path).then(function() {
                  AddPlaneMp4(new_path);
                }).catch(function(err) {
                  console.warn(err);
                });
              }
              break;

              case 'mp3':
              var local_path = AMTHREE.SOUND_PATH + filename;
              var new_path = root + '/' + local_path;
              if (FileSystemSvc.FileExists(new_path))
                AddSoundObject(new_path);
              else {
                FileSystemSvc.CopyFile(path, new_path).then(function() {
                  AddSoundObject(new_path);
                }).catch(function(err) {
                  console.warn(err);
                });
              }
              break;

              default:
              console.warn('failed to import file: invalid file extension', path);
              break;
            }
          }

          (new PlaneImporter(files[i]));

        }
      }
    }

    var ImportObjects3D = function() {

      function ObjectImporter(path) {
        var objects = DataManagerSvc.GetData().objects;

        AMTHREE.LoadObject(path).then(function(object) {
          objects[object.uuid] = object;
          DataManagerSvc.NotifyChange('object', object.uuid);
        }, function(e) {
          console.log('failed to load object', e);
        });
      }

      function CopyImages(object) {
        var root = ProjectsManagerSvc.GetRoot();
        object.traverse(function(child) {

          if (child.material && child.material.map instanceof AMTHREE.ImageTexture) {
            var image_ref = child.material.map.image_ref;
            var url = image_ref.url;
            if (url) {
              url = url.replace('file:///', '');
              if (FileSystemSvc.FileExists(url)) {
                var new_path = root + '/' + AMTHREE.IMAGE_PATH + GetFilename(url);
                if (!FileSystemSvc.FileExists(new_path)) {
                  FileSystemSvc.CopyFile(url, new_path);
                  image_ref.url = new_path;
                  child.material.map.set(image_ref);
                }
              }
            }
          }

        });
      }

      function CopyModel(url) {
        if (url) {

        var root = ProjectsManagerSvc.GetRoot();
        url = url.replace('file:///', '');
          if (FileSystemSvc.FileExists(url)) {
            var new_path = root + '/' + AMTHREE.MODEL_PATH + GetFilename(url);
            if (!FileSystemSvc.FileExists(new_path)) {
              FileSystemSvc.CopyFile(url, new_path);
            }
          }

        }
      }

      function ColladaImporter(path) {
        path = ReplaceBackslashBySlash(path);
        var objects = DataManagerSvc.GetData().objects;
        var root = ProjectsManagerSvc.GetRoot();

        var object = new AMTHREE.ColladaObject();
        object.load(path).then(function(object) {
          object.name = GetFilename(path);
          CopyImages(object);
          CopyModel(path);
          objects[object.uuid] = object;
          DataManagerSvc.NotifyChange('object', object.uuid);
        }).catch(function(e) {
          console.warn(e);
        });
      }

      return function() {
        var files = _dialog.showOpenDialog( {
          title: 'Import models 3D',
          properties: ['openFile', 'multiSelections'],
          filters: [
            {
              name: 'Threejs object',
              extensions: ['json', 'dae']
            }
          ]
        });

        if (typeof files !== 'undefined') {
          ProjectsManagerSvc.CreateDirectories();
          for (var i = 0, c = files.length; i < c; ++i) {
            var path = files[i];

            var extension = GetExtension(path);

            switch (extension) {
              case 'json':
              (new ObjectImporter(path));
              break;

              case 'dae':
              (new ColladaImporter(path));
              break;
            }
          }
        }
      }
    }();

    function Open() {
      var files = _dialog.showOpenDialog({
        title: 'Open',
        properties: ['openDirectory']
      });

      if (typeof files !== 'undefined' && files.length === 1) {
        var root = files[0];

        ProjectsManagerSvc.SetRoot(root);

        var config_file = root + '/journey.json';
        FileSystemSvc.ReadFile(config_file).then(OnLoadFile).catch(function(err) {
          ProjectsManagerSvc.Close();
          console.warn('failed to open project: ', err);
        });
      }
    }

    function OnLoadFile(data) {
      var json = JSON.parse(data);
      json.objects = json.objects || {};
      json.objects.constants = json.objects.constants || {};
      json.objects.constants.asset_path = ProjectsManagerSvc.GetRoot();
      DataManagerSvc.Clear();
      DataManagerSvc.ParseData(json, 'data_journey');

      DataManagerSvc.GetLoadPromise().then(function() {
        var markers = DataManagerSvc.GetData().markers
        for (var id in markers) {
          var elem = markers[id];
          elem.url = ProjectsManagerSvc.GetRoot() + '/' + AMTHREE.IMAGE_PATH + GetFilename(elem.url);
        }
      });
    }

    this.ImportMarkers = ImportMarkers;
    this.ImportFilesAsPlanes = ImportFilesAsPlanes;
    this.ImportObjects3D = ImportObjects3D;
    this.Open = Open;

}])