window = self;

// aruco
importScripts('../lib/ArtMobilib/ArtMobilib/aruco/cv.js');
importScripts('../lib/ArtMobilib/ArtMobilib/aruco/aruco.js');
importScripts('../lib/ArtMobilib/ArtMobilib/aruco/svd.js');
importScripts('../lib/ArtMobilib/ArtMobilib/aruco/posit1.js');

// jsfeat
// importScripts('../lib/ArtMobilib/ArtMobilib/jsfeat/jsfeat.js');
// importScripts('../lib/ArtMobilib/ArtMobilib/jsfeat/compatibility.js');
// importScripts('../lib/ArtMobilib/ArtMobilib/jsfeat/profiler.js');

// ArtMobilib
// importScripts('../lib/ArtMobilib/ArtMobilib/CornerDetector.js');
// importScripts('../lib/ArtMobilib/ArtMobilib/ImageMarkers.js');
// importScripts('../lib/ArtMobilib/ArtMobilib/MarkerContainer.js');
// importScripts('../lib/ArtMobilib/ArtMobilib/MarkerMatcher.js');
// importScripts('../lib/ArtMobilib/ArtMobilib/webcamConverter.js');
// importScripts('../lib/ArtMobilib/ArtMobilib/MarkerManager.js');



var _detector = new AR.Detector();

// var _im_width = 640;
// var _im_height = 480;
// var _corner_detector = new CornerDetector();
// var _markers = new MarkerContainer();
// var _matcher = new MarkerMatcher();
// var _img_u8;
// var _screen_corners = [];
// var _screen_descriptors;
// var _found = 0;
// var _num_corners = 0;
// var _max_corner = 150;
// var _nb_focussing_marker = 10;
// var _allocation_corner = 2000;

// for (var i = _allocation_corner - 1; i >= 0; --i)
//   _screen_corners.push(new jsfeat.keypoint_t(0, 0, 0, 0, -1));


// _img_u8 = new jsfeat.matrix_t(_im_width, _im_height, jsfeat.U8_t | jsfeat.C1_t);
// _screen_descriptors = new jsfeat.matrix_t(32, _max_corner, jsfeat.U8_t | jsfeat.C1_t);


function SendResult(markers, frame) {
    var msg = {
      cmd: 'markers',
      markers: markers,
      frame: frame
    };

    postMessage(msg);
}

function DetectMarkerImage(image) {

  jsfeat.imgproc.grayscale(image.data, _im_width, _im_height, _img_u8);

  // depending on status search for a specific or a marker
  _num_corners = _corner_detector.DetectCorners(_img_u8, _screen_corners, _screen_descriptors);
  //console.log("Screen: " + img_u8.cols + "x" + img_u8.rows + " points: " + that.num_corners);

  if (!_markers.markerContainer.length || !_num_corners) return 0;

  // search the same marker while it is detected or one different at each image
  if (_found > 0) { // if one has already been detected
    if (_matcher.matching(_screen_corners, _screen_descriptors, _markers.GetCurrent()))
      _found = _nbFocussingMarker;
    else
      _found--;
  }
  else { // no detection before, search for new marker
    if (_matcher.matching(_screen_corners, _screen_descriptors, _markers.GetNext()))
      _found = _nb_focussing_marker;
    else
      _found--;
  }

  return { corners: _matcher.corners };
}

function DetectTags(image) {
  return _detector.detect(image);
}

function AddMarker(url) {
  var marker = new ImageMarkers(url);
  _markers.Add(marker);
}


onmessage = function(e) {
  var cmd = e.data.cmd;

  switch (cmd) {
    case 'new_img':
      var markers = DetectTags(e.data.image);
      // markers.push(DetectMarkerImage(e.data.image));
      SendResult(markers, e.data.frame);
    break;
    case 'add_marker':
    break;
  }
};