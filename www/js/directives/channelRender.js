angular.module('starter')

.directive('channelRender', ['DataManagerSvc', function(DataManagerSvc) {
  return {
    restrict: 'A',
    template: '<canvas></canvas>',
    scope: {
      position: '=',
      rotation: '=',
      scale: '=',
      selection: '='
    },
    link: function(scope, element, attr) {

      var _div  = element[0];
      var _canvas = _div.children[0];
      var _scene, _renderer;

      var _camera;
      var _cameraX, _cameraY;
      var _camera_distance = 0;

      var _channel;

      var _running = true;

      var _marker_mesh, _contents_meshes = new THREE.Object3D();

      var _touch, _is_pinch = false, _touch_distance, _mouse_down = false;

      var _select_start, _selected, _selection_object;


      function GetBoundingSphere(object, sphere) {
        var box = new THREE.Box3();

        box.setFromObject(object);
        box.getBoundingSphere(sphere);
      }

      function Clamp(val, min, max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
      }

      function CameraRotate(x, y) {
        _cameraX.rotation.z += x / 100;
        _cameraY.rotation.x = Clamp(_cameraY.rotation.x + y / 100, 0, Math.PI / 2);
      }

      function CreateMarkerObject() {
        var box = new THREE.Box3();
        var sphere = new THREE.Sphere();

        var marker = DataManagerSvc.tracking_data_manager.GetMarker(_channel.marker);
        if (!marker)
          return undefined;

        var texture = THREE.ImageUtils.loadTexture(marker.img);
        var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
        var geometry = new THREE.PlaneGeometry(1, 1);
        _marker_mesh = new THREE.Mesh(geometry, material);
        _marker_mesh.position.z = -0.001;

        box.setFromObject(_marker_mesh);
        box.getBoundingSphere(sphere);
        _camera_distance = Math.max(sphere.radius, _camera_distance);
      }

      function TouchStart(event) {
        if (event.targetTouches.length == 1) {
          _touch = event.targetTouches.item(0);

          SelectStart(_touch.clientX, _touch.clientY);
        }
        else if (event.targetTouches.length == 2)
          GestureStart(event);
      }

      function TouchMove(event) {
        if (_is_pinch) {
          GestureChange(event);
        }
        else if (event.targetTouches.length == 1 && _touch) {
          var new_touch = event.targetTouches.item(0);

          if (new_touch.identifier == _touch.identifier)
            CameraRotate(new_touch.clientX - _touch.clientX, new_touch.clientY - _touch.clientY);

          _touch = new_touch;
        }
      }

      function TouchEnd(event) {
        if (_is_pinch) {
          GestureEnd(event);
        }
        else if (event.targetTouches.length == 1) {
          var touch = event.targetTouches.item(0);

          SelectEnd(touch.clientX, touch.clientY);
        }

        _touch = undefined;
      }

      function GetPinchDistance(touch1, touch2) {
        var dx = touch1.clientX - touch2.clientX;
        var dy = touch1.clientY - touch2.clientY;

        return dx * dx + dy * dy;
      }

      function GestureStart(event) {
        if (event.targetTouches.length == 2) {
          _is_pinch = true;
          _touch_distance = GetPinchDistance(event.targetTouches.item(0), event.targetTouches.item(1));
        }
      }

      function GestureChange(event) {
        if (event.targetTouches.length == 2) {
          var distance = GetPinchDistance(event.targetTouches.item(0), event.targetTouches.item(1));

          var scale = _touch_distance / distance;
          _touch_distance = distance;

          _camera.position.z *= scale;
        }
      }

      function GestureEnd(event) {
        GestureChange(event);
        _is_pinch = false;
      }

      function MouseStart(event) {
        _mouse_down = true;

        SelectStart(event.clientX, event.clientY);
      }

      function MouseMove(event) {
        if (_mouse_down) {
          CameraRotate(event.movementX, event.movementY);
        }
      }

      function MouseEnd(event) {
        _mouse_down = false;

        SelectEnd(event.clientX, event.clientY);
      }

      function MouseWheel(e) {
        var e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        _camera.position.z *= 1 + delta / 10;
      }

      function Raycast(x, y) {
        var rect = _canvas.getBoundingClientRect();
        var position = new THREE.Vector2();

        position.x = ((x - rect.left) / _renderer.domElement.width) * 2 - 1;
        position.y = - ((y - rect.top) / _renderer.domElement.height) * 2 + 1;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(position, _camera);

        var intersects = raycaster.intersectObjects(_contents_meshes.children, true);
        if (intersects.length > 0)
          return intersects[0].object;
        return undefined;
      }

      function SelectStart(x, y) {
        _select_start = Raycast(x, y);
      }

      function SelectEnd(x, y) {
        if (_select_start) {
          if (_select_start === Raycast(x, y)) {

            _selected = _select_start;

            var temp = _selected.parent;
            while (temp != _contents_meshes) {
              _selected = temp;
              temp = _selected.parent;
            }

            _select_start = undefined;

            var sphere = new THREE.Sphere();
            GetBoundingSphere(_selected, sphere);

            _scene.add(_selection_object);

            scope.position.copy(_selected.position);
            scope.rotation.copy(_selected.rotation);
            scope.scale = _selected.scale.x;
            scope.selection = _selected.userData;
            scope.$apply();
          }
        }
        else {
        }
      }

      function ResetSelection() {
        _selected = undefined;
        _scene.remove(_selection_object);
        scope.selection = undefined;
      }

      function LoadContents() {
        var sphere = new THREE.Sphere();

        _contents_meshes.children = [];
        ResetSelection();

        for(var len = _channel.contents.length, index = 0; index < len; ++index) {
          var contents_transform = _channel.contents[index];
          var contents_uuid = contents_transform.uuid;
          var contents = DataManagerSvc.tracking_data_manager.GetContents(contents_uuid);
          if (!contents)
            continue;
          var object = DataManagerSvc.tracking_data_manager.GetObject(contents.object);
          if (!object)
            continue;

          object = object.clone();

          object.userData = index;


          var pos = contents_transform.position;
          var rot = contents_transform.rotation;
          var scale = contents_transform.scale;

          object.position.set(pos.x, pos.y, pos.z);
          object.rotation.set(rot.x, rot.y, rot.z);
          object.scale.set(scale, scale, scale);


          GetBoundingSphere(object, sphere);
          _camera_distance = Math.max(sphere.radius, _camera_distance);


          _contents_meshes.add(object);
        }
      }

      function SaveContents() {
        for(object of _contents_meshes.children) {
          var contents_index = object.userData;

          var contents_transform = _channel.contents[contents_index];

          contents_transform.position = { x: object.position.x, y: object.position.y, z: object.position.z };
          contents_transform.rotation = { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z };
          contents_transform.scale = object.scale.x;
        }
      }

      function CreateSelectionObject() {
        var geometry = new THREE.RingGeometry(0.9, 1, 40, 2);
        var material = new THREE.MeshBasicMaterial( { color: 0x2194ce, side: THREE.DoubleSide } );
        material.transparent = true;
        material.opacity = 0.5;

        var ring1 = new THREE.Mesh(geometry, material);
        var ring2 = new THREE.Mesh(geometry, material);
        var ring3 = new THREE.Mesh(geometry, material);

        ring2.rotation.x = 1.570796;
        ring3.rotation.y = 1.570796;

        _selection_object = new THREE.Object3D();
        _selection_object.add(ring1, ring2, ring3);
      }

      scope.$on('save_channel', function() {
        SaveContents();
      });

      scope.$on('load_channel', function() {
        LoadContents();
      });

      CreateSelectionObject();

      attr.$observe('channel', function(attr_channel_id) {
        _running = false;

        _channel = DataManagerSvc.tracking_data_manager.GetChannel(attr_channel_id);

        if (!_channel)
          return;

        DataManagerSvc.tracking_data_manager.OnLoadContentsAssets(function() {

          _canvas.addEventListener('touchstart', TouchStart, false);
          _canvas.addEventListener('touchend', TouchEnd, false);
          _canvas.addEventListener('touchcancel', TouchEnd, false);
          _canvas.addEventListener('touchleave', TouchEnd, false);
          _canvas.addEventListener('touchmove', TouchMove, false);

          _canvas.addEventListener('mousedown', MouseStart, false);
          _canvas.addEventListener('mousemove', MouseMove, false);
          _canvas.addEventListener('mouseup', MouseEnd, false);

          _canvas.addEventListener('mousewheel', MouseWheel, false);
          _canvas.addEventListener('DOMMouseScroll', MouseWheel, false);

          _scene = new THREE.Scene();
          _renderer = new THREE.WebGLRenderer( { alpha: true, canvas: _canvas } );
          _camera = new THREE.PerspectiveCamera(80, _canvas.width / _canvas.height, 0.1, 100000);
          _cameraX = new THREE.Object3D();
          _cameraY = new THREE.Object3D();

          _cameraY.rotation.x = 0.5;

          _cameraY.add(_camera);
          _cameraX.add(_cameraY);
          _scene.add(_cameraX);


          function ResizeRenderer(width, height) {
            _renderer.setSize(width, height);
            _camera.aspect = _renderer.domElement.width / _renderer.domElement.height;
            _camera.updateProjectionMatrix();
          }

          function OnWindowResize() {
            ResizeRenderer(_div.clientWidth, _div.clientHeight);
          }
          window.addEventListener('resize', OnWindowResize, false);
          OnWindowResize();

          _scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
          _scene.add(new THREE.AmbientLight(0x404040));


          LoadContents();
          CreateMarkerObject();


          _camera.position.z = _camera_distance * 1.5;

          _scene.add(_marker_mesh);
          _scene.add(_contents_meshes);

          _running = true;
          (function step() {
            if (_running) {
              window.requestAnimationFrame(step);

              if (_selected) {
                _selected.position.copy(scope.position);
                _selected.rotation.copy(scope.rotation);
                _selected.scale.x = _selected.scale.y = _selected.scale.z = scope.scale;

                _selection_object.position.copy(_selected.position);
                _selection_object.rotation.copy(_selected.rotation);
                _selection_object.scale.copy(_selected.scale);
              }

              DataManagerSvc.tracking_data_manager.UpdateAnimations();

              _renderer.render(_scene, _camera);
            }
          })();
        });
      });

      scope.$on('$destroy', function() {
        _running = false;
      });

    }
  };
}]);