MarkerDetector = function(videoElement) {
  var that = this;

  var _worker;

  var _canvas = document.createElement('canvas');
  var _ctx = _canvas.getContext('2d');
  var _markers = [];
  var _video = videoElement;

  var _frame = 0;
  var _frame_worker = 0;

  this.video_scale_down = 2;

  this.position = new THREE.Vector3();
  this.rotation = new THREE.Euler();
  this.quaternion = new THREE.Quaternion();
  this.scale = new THREE.Vector3();

  this.Start = function() {
    if (!_worker) {
      _worker = new Worker('js/MarkerDetectorWorker.js');
      _worker.onmessage = function(e) {

        switch (e.data.cmd) {
          case 'markers':
          _markers = e.data.markers;
          _frame_worker = e.data.frame;
          break;
        }
      }
    }
  };

  this.Update = function() {

    if (_worker && _video instanceof HTMLVideoElement
      && _video.readyState == _video.HAVE_ENOUGH_DATA
      && (_frame - _frame_worker < 2)) {

      ++_frame;

      _canvas.width = _video.videoWidth / that.video_scale_down;
      _canvas.height = _video.videoHeight / that.video_scale_down;
      _ctx.drawImage(_video, 0, 0, _canvas.width, _canvas.height);

      var image = _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
      var size = image.width * image.height * 4;

      var obj_data = {
        cmd: 'new_img',
        image: image,
        frame: _frame
      };
      _worker.postMessage(obj_data, [image.data.buffer]);

    }
  };

  this.Stop = function() {
    if (_worker) {
      _worker.terminate();
      _worker = undefined;
    }
  };

  this.GetMarkers = function() {
    return _markers;
  };

  this.Empty = function() {
    _markers = [];
  };

  this.SetTransform = function(marker, model_size) {
    model_size = model_size || 35;

    var corners = [];
    for (var i = 0; i < marker.corners.length; ++i) {
      corners.push( {
        x: marker.corners[i].x - (_canvas.width / 2),
        y: (_canvas.height / 2) - marker.corners[i].y,
      } );
    }

    var posit = new POS.Posit(model_size, _canvas.width);
    var pose = posit.pose(corners);

    if (pose === null) return;


    var rot = pose.bestRotation;
    var translation = pose.bestTranslation;

    that.scale.x = model_size;
    that.scale.y = model_size;
    that.scale.z = model_size;

    that.rotation.x = -Math.asin(-rot[1][2]);
    that.rotation.y = -Math.atan2(rot[0][2], rot[2][2]);
    that.rotation.z = Math.atan2(rot[1][0], rot[1][1]);

    that.position.x = translation[0];
    that.position.y = translation[1];
    that.position.z = -translation[2];

    that.quaternion.setFromEuler(that.rotation);
  };

  this.AddMarker = function(url, uuid) {
    if (_worker) {
      _worker.postMessage( {
        cmd: 'add_marker',
        url: url,
        uuid: uuid
      } );
    }
  };
};