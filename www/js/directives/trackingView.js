angular.module('starter')

.directive('trackingView', ['$ionicPlatform', 'DataManagerSvc', 
  function($ionicPlatform, DataManagerSvc) {
    return {
      restrict: 'E',
      template: '<div/>',
      link: function(scope, element, attr) {

        var that = this;

        var _webcam_grabbing; // background
        var _scene;
        var _canvas;

        var _orientationControl;

        var _device_lock_screen = new DeviceLockScreenOrientation();

        var _video_grabbing;  // video Frozen, contents
        var _js_aruco_marker;
        var _trackedObjManager;

        var _running = false;
        var _destroyed = false;


        function CreateCanvasElementGlobal(id) {

          var canvas = document.createElement('canvas');

          canvas.id = id;
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          return canvas;
        }


        $ionicPlatform.ready(function() {

          _device_lock_screen.LockPortrait();

          _canvas = CreateCanvasElementGlobal('canvasthree');


          _scene = new Scene( { canvas: _canvas, fov: (scope.is_web_view) ? 80 : 40 } );
          _scene.SetFullWindow();
          

          // Create background
          _webcam_grabbing = new FrontCamGrabbing();
          document.body.appendChild(_webcam_grabbing.domElement);

          // Create scene
          var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
          _scene.AddObject(light);


          // Orient camera
          _orientationControl = new DeviceOrientationControl(_scene.GetCamera());
          _orientationControl.Connect();
          _orientationControl.SetCoefficient(0.1);


          // start Image marker detection
          // var _AMmarkerManager = new MarkerManager(_webcam_grabbing.domElement, _canvas);

          _trackedObjManager = new TrackedObjManager( { camera: _scene.GetCamera() } );


          function OnWindowResize() {
            _scene.ResizeRenderer(window.innerWidth, window.innerHeight);
          }
          window.addEventListener('resize', OnWindowResize, false);


          document.body.appendChild(_canvas);


          var _detector_worker = new MarkerDetector(_webcam_grabbing.domElement);
          

          scope.$on('$destroy', function() {
            _running = false;
            _destroyed = true;
            document.body.removeChild(_webcam_grabbing.domElement);
            document.body.removeChild(_canvas);
            _webcam_grabbing.Stop();
            _detector_worker.Stop();
          });


          function InitScene() {
            if (_destroyed)
              return;

            var channels = DataManagerSvc.tracking_data_manager.GetChannelContainer();
            for (uuid in channels) {

              var marker = DataManagerSvc.tracking_data_manager.GetMarker(channels[uuid].marker);

              if (marker) {
                if (marker.is_tag) {
                  var object = DataManagerSvc.tracking_data_manager.BuildChannelContents(uuid);

                  (function(object) {
                    _trackedObjManager.Add(object, uuid, function() {
                      _scene.AddObject(object);
                    }, function() {
                      _scene.RemoveObject(object);
                    });
                  })(object);
                }

                if (marker.is_image) {
                  var object = DataManagerSvc.tracking_data_manager.BuildChannelContents(uuid);

                  // we load trained images
                  // _AMmarkerManager.AddMarker(marker.img, uuid);
                  // _scene.AddObject(object);
                  // _trackedObjManager.Add(object, uuid);
                }
              }
            }
            _webcam_grabbing.Start();
          }

          function Run() {

            _detector_worker.Start();

            _running = true;
            (function loop() {
              if (!_running)
                return;

              // _orientationControl.Update();

              _detector_worker.Update();

              var tags = _detector_worker.GetMarkers();

              var channels = DataManagerSvc.tracking_data_manager.GetChannelContainer();

              for (tag of tags) {
                for (uuid in channels) {
                  var marker = DataManagerSvc.tracking_data_manager.GetMarker(channels[uuid].marker);
                  if (marker.is_tag && marker.tag_id === tag.id) {
                    _detector_worker.SetTransform(tag);
                    _trackedObjManager.TrackCompose(uuid, _detector_worker.position,
                      _detector_worker.quaternion, _detector_worker.scale);
                  }
                }
              }

              // if (_AMmarkerManager.ProcessVideo()) {
              //     console.log("Marker detected");
              //     var o = new THREE.Object3D();
              //     _AMmarkerManager.markerToObject3D(o);
              //   _trackedObjManager.TrackCompose(_AMmarkerManager.GetId(), o.position, o.quaternion, o.scale);
              // }

              _trackedObjManager.Update();

              DataManagerSvc.tracking_data_manager.UpdateAnimations();

              _scene.Update();
              _scene.Render();

              _detector_worker.Empty();
              window.requestAnimationFrame(loop);
            })();
          }

          DataManagerSvc.OnLoadConfig(function() {
            DataManagerSvc.tracking_data_manager.OnLoadContentsAssets(function() {
              InitScene();
              Run();
            });
          });

        });


      }

    }
  }
])