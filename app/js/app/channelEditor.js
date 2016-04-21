angular.module('app')

.directive('channelEditor', ['DataManagerSvc', function(DataManagerSvc) {
  return {
    restrict: 'AE',
    scope: {
      channel_id: '@channelId',
      active: '@'
    },
    templateUrl: "templates/channel_editor.html",
    link: function(scope, element, attr) {
      scope.mode = 'translate';
      scope.index = null;
      scope.GetSelectionName = function() {
        if (scope.channel_id && typeof scope.index === 'number')
          return DataManagerSvc.GetData().channels[scope.channel_id].contents[scope.index].name;
        return null;
      }

      var DEFAULT_CAMERA = new THREE.PerspectiveCamera(50, 1, 0.1, 10000);
      DEFAULT_CAMERA.name = 'Camera';
      DEFAULT_CAMERA.position.set(20, 10, 20);
      DEFAULT_CAMERA.lookAt(new THREE.Vector3());


      var _element = element[0];
      var _canvas = _element.children[0];

      var _camera = DEFAULT_CAMERA.clone();

      var _scene = new THREE.Scene();
      _scene.name = 'Scene';
      var _renderer = new THREE.WebGLRenderer( { alpha: true, canvas: _canvas, antialias: true } );
      _renderer.autoClear = false;

      var _scene_helpers = new THREE.Scene();

      var _selection = null;
      var _helpers = {};

      var _running = false;


      var _grid = new THREE.GridHelper( 50, 1 );
      _grid.scale.x = _grid.scale.y = _grid.scale.z = 0.25;

      var _channel;

      var _marker_mesh, _contents_meshes = new THREE.Object3D();
      CreateMarkerObject();

      var _selection_box = new THREE.BoxHelper();
      _selection_box.material.depthTest = false;
      _selection_box.material.transparent = true;
      _selection_box.visible = false;
      _scene_helpers.add(_selection_box);

      var _transform_controls = new THREE.TransformControls(_camera, _element);

      // _controls need to be added *after* main logic,
      // otherwise _controls.enabled doesn't work.

      var _controls = new THREE.EditorControls(_camera, _element);


      var AddHelper = function() {

        var geometry = new THREE.SphereBufferGeometry(2, 4, 2);
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: false } );

        return function (object) {

          var helper;

          if (object instanceof THREE.Camera) {
            helper = new THREE.CameraHelper( object, 1 );
          } else if (object instanceof THREE.PointLight) {
            helper = new THREE.PointLightHelper(object, 1);
          } else if (object instanceof THREE.DirectionalLight) {
            helper = new THREE.DirectionalLightHelper(object, 1);
          } else if (object instanceof THREE.SpotLight) {
            helper = new THREE.SpotLightHelper(object, 1);
          } else if (object instanceof THREE.HemisphereLight) {
            helper = new THREE.HemisphereLightHelper(object, 1);
          } else if (object instanceof THREE.SkinnedMesh) {
            helper = new THREE.SkeletonHelper(object);
          } else {
            // no helper for this object type
            return;

          }

          var picker = new THREE.Mesh(geometry, material);
          picker.name = 'picker';
          picker.userData.object = object;
          helper.add(picker);

          _scene_helpers.add(helper);
          _helpers[object.id] = helper;

        };
      }();

      function RemoveHelper(object) {
        if (_helpers[object.id] !== undefined) {

          var helper = _helpers[object.id];
          helper.parent.remove(helper);

          delete _helpers[object.id];

        }
      }

      function AddObject(object) {
        object.traverse(function(child) {
          AddHelper(child);
        });

        _scene.add(object);
      }

      function Select(object) {
        while (object) {
          if (typeof object.userData.index === 'number')
            break;
          object = object.parent;
        }

        if ( _selection === object ) return;

        _selection = object;

        scope.index = null;

        _selection_box.visible = false;
        _transform_controls.detach();

        if (object !== null) {
          scope.index = _selection.userData.index;
          if (object.geometry !== undefined &&
             object instanceof THREE.Sprite === false) {

            _selection_box.update(object);
            _selection_box.visible = true;
          }

          _transform_controls.attach(object);
        }
        scope.$apply();
      }

      // object picking

      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();

      function GetIntersects(point, objects) {
        mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
        raycaster.setFromCamera(mouse, _camera);
        return raycaster.intersectObjects(objects);
      }

      var _on_down_position = new THREE.Vector2();
      var _on_up_position = new THREE.Vector2();
      var _on_double_click_position = new THREE.Vector2();

      function GetMousePosition(dom, x, y) {
        var rect = dom.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
      }

      function OnTransformControlsMouseDown() {
        _controls.enabled = false;
      }

      function OnTransformControlsMouseUp() {
        _controls.enabled = true;
      }

      function HandleClick() {
        if (_on_down_position.distanceTo(_on_up_position) === 0) {
          var intersects = GetIntersects(_on_up_position, _contents_meshes.children);
          if (intersects.length > 0) {
            var object = intersects[0].object;
            if (object.userData.object !== undefined) {

              // helper
              Select(object.userData.object);
            }
            else {
              Select(object);
            }
          }
          else {
            Select(null);
          }

          Render();
        }
      }

      function OnMouseDown(event) {
        event.preventDefault();

        var array = GetMousePosition(_element, event.clientX, event.clientY);
        _on_down_position.fromArray(array);
        document.addEventListener('mouseup', OnMouseUp, false);
      }

      function OnMouseUp(event) {
        var array = GetMousePosition(_element, event.clientX, event.clientY);
        _on_up_position.fromArray(array);

        HandleClick();

        document.removeEventListener('mouseup', OnMouseUp, false);
      }

      function OnTouchStart(event) {
        var touch = event.changedTouches[0];

        var array = GetMousePosition(_element, touch.clientX, touch.clientY);
        _on_down_position.fromArray(array);

        document.addEventListener('touchend', OnTouchEnd, false);
      }

      function OnTouchEnd(event) {
        var touch = event.changedTouches[0];

        var array = GetMousePosition(_element, touch.clientX, touch.clientY);
        _on_up_position.fromArray(array);

        HandleClick();

        document.removeEventListener('touchend', OnTouchEnd, false);
      }

      function OnDoubleClick(event) {
        var array = GetMousePosition(_element, event.clientX, event.clientY);
        _on_double_click_position.fromArray(array);

        var intersects = GetIntersects(_on_double_click_position, _contents_meshes.children);

        if (intersects.length > 0) {
          var intersect = intersects[0];

          OnObjectFocused(intersect.object);
        }
      }

      function OnObjectFocused(object) {
        _controls.focus(object);
      }

      function OnControlsChange() {
        _transform_controls.update();
      }

      function Point3DCopy(src, dst) {
        dst.x = src.x;
        dst.y = src.y;
        dst.z = src.z;
      }

      function SaveChanges(object) {
        if (object && typeof object.userData.index === 'number') {
          var index = object.userData.index;
          if (_channel) {
            var content = _channel.contents[index];
            Point3DCopy(object.position, content.position);
            Point3DCopy(object.rotation, content.rotation);
            Point3DCopy(object.scale, content.scale);
          }
        }
      }

      function OnTransformChange() {
        var object = _transform_controls.object;
        if (object !== undefined) {

          _selection_box.update(object);

          SaveChanges(object);
        }
      }

      function OnChannelChange() {
        AMTHREE.StopAnimatedTextures(_scene);
        AMTHREE.StopSounds(_scene);
        _transform_controls.detach();
        _marker_mesh.visible = false;
        _contents_meshes.remove.apply(_contents_meshes, _contents_meshes.children);
        _selection_box.visible = false;
        _channel = null;
        scope.selection = null;
      }

      function SetChannel() {
        LoadContents();

        var marker = DataManagerSvc.GetData().markers[_channel.marker];
        if (marker) {
          (new THREE.TextureLoader()).load(marker.url, function(texture) {
            _marker_mesh.material.map = texture;
            _marker_mesh.material.needsUpdate = true;
            _marker_mesh.visible = true;
          });
        }
        AMTHREE.PlayAnimatedTextures(_scene);
        AMTHREE.PlaySounds(_scene);
      }

      function Update() {
        AMTHREE.UpdateAnimatedTextures(_scene);
      }

      function Render() {
        _scene_helpers.updateMatrixWorld();
        _scene.updateMatrixWorld();

        _renderer.clear();
        _renderer.render(_scene, _camera);
        _renderer.render(_scene_helpers, _camera);
      }

      function OnWindowResize() {
          _renderer.setSize(_element.clientWidth, _element.clientHeight);
          _camera.aspect = _renderer.domElement.width / _renderer.domElement.height;
          _camera.updateProjectionMatrix();
      }

      function CheckCanvasSize() {
        if (_element.clientWidth != _canvas.width || _element.clientHeight != _canvas.height) {
          OnWindowResize();
        }
      }

      function GetBoundingSphere(object, sphere) {
        var box = new THREE.Box3();

        box.setFromObject(object);
        box.getBoundingSphere(sphere);
      }

      function CreateMarkerObject() {
        var material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide } );
        var geometry = new THREE.PlaneGeometry(1, 1);
        _marker_mesh = new THREE.Mesh(geometry, material);
        _marker_mesh.position.z = -0.001;
      }

      function LoadContents() {
        _contents_meshes.remove.apply(_contents_meshes, _contents_meshes.children);

        var sphere = new THREE.Sphere();

        for(var len = _channel.contents.length, index = 0; index < len; ++index) {
          var contents_transform = _channel.contents[index];
          var contents_uuid = contents_transform.uuid;
          var contents = DataManagerSvc.GetData().contents[contents_uuid];
          if (!contents)
            continue;
          var object = DataManagerSvc.GetData().objects[contents.object];
          if (!object)
            continue;

          object = object.clone();

          object.userData = object.userData || {};
          object.userData.index = index;


          var pos = contents_transform.position;
          var rot = contents_transform.rotation;
          var scale = contents_transform.scale;

          object.position.set(pos.x, pos.y, pos.z);
          object.rotation.set(rot.x, rot.y, rot.z);
          object.scale.set(scale.x, scale.y, scale.z);

          GetBoundingSphere(object, sphere);

          _contents_meshes.add(object);
        }
      }


      _scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
      _scene.add(new THREE.AmbientLight(0x404040));

      _scene.add(_contents_meshes);
      _scene.add(_marker_mesh);

      _scene.add(_grid);

      _scene_helpers.add(_transform_controls);



      scope.$watch('channel_id', function(attr_channel_id) {
        OnChannelChange();

        _channel = DataManagerSvc.GetData().channels[attr_channel_id];
        if (!_channel)
          return;

        DataManagerSvc.GetLoadPromise().then(function() {
          SetChannel();
        });

      });

      scope.$watch('mode', function(mode) {
        _transform_controls.setMode(mode);
      });

      scope.$watch('active', function(active) {
        if (active === 'true') {
          Run();
        }
        else if (active === 'false') {
          Stop();
        }
      });


      function Stop() {
        if (_running) {
          window.removeEventListener('resize', OnWindowResize, false);

          _canvas.removeEventListener('mousedown', OnMouseDown, false);
          _canvas.removeEventListener('touchstart', OnTouchStart, false);
          _canvas.removeEventListener('dblclick', OnDoubleClick, false);

          _transform_controls.removeEventListener('change', OnTransformChange, false);
          _transform_controls.removeEventListener('mouseDown', OnTransformControlsMouseDown);
          _transform_controls.removeEventListener('mouseUp', OnTransformControlsMouseUp);

          _controls.removeEventListener('change', OnControlsChange, false);

          _running = false;
        }
      }

      function Run() {
        if (!_running) {
          _running = true;

          window.addEventListener('resize', OnWindowResize, false);
          OnWindowResize();

          _canvas.addEventListener('mousedown', OnMouseDown, false);
          _canvas.addEventListener('touchstart', OnTouchStart, false);
          _canvas.addEventListener('dblclick', OnDoubleClick, false);

          _transform_controls.addEventListener('change', OnTransformChange, false);
          _transform_controls.addEventListener('mouseDown', OnTransformControlsMouseDown);
          _transform_controls.addEventListener('mouseUp', OnTransformControlsMouseUp);

          _controls.addEventListener('change', OnControlsChange, false);

          function Loop() {
            if (_running) {
              window.requestAnimationFrame(Loop);
              CheckCanvasSize();
              Update();
              Render();
            }
          };
          Loop();
        }
      };

      Run();

      scope.$on('$destroy', function() {
        Stop();
      })

    }

  }
}])