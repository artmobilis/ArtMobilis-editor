angular.module('app')

.directive('journeyPreview', [
  'JourneySceneSvc',
  'GeolocationSvc',
  'CameraSvc',
  'JourneyManagerSvc',
  'DataManagerSvc',
  'JourneyRenderer',
  function(
    JourneySceneSvc,
    GeolocationSvc,
    CameraSvc,
    JourneyManagerSvc,
    DataManagerSvc,
    JourneyRenderer) {


  return {
    restrict: 'E',
    scope: {
      active: '@'
    },
    template: '<canvas style="position: absolute"></canvas>',
    link: function(scope, element, attr) {

      var _journey_renderer = new JourneyRenderer();

      var _element = element[0];
      var _canvas = _element.children[0];
      var _ctx = _canvas.getContext('2d');

      var _scene_canvas = _journey_renderer.GetCanvas();
      var _camera_width = 0;
      var _camera_height = 0;
      var _camera_video_element = CameraSvc.GetVideoElement();

      var _running = false;

      var _stop_count = 0;

      var _user_body = JourneySceneSvc.GetUserBody();
      var _user_head = JourneySceneSvc.GetUserHead();
      var _mouse_control_h = new MouseControl(_user_body, MouseControl.Direction.HORIZONTAL);
      var _mouse_control_v = new MouseControl(_user_head, MouseControl.Direction.VERTICAL);
      _mouse_control_h.SetSensitivity(0.08);
      _mouse_control_v.SetSensitivity(0.08);
      var _keyboard_control = new KeyboardControl(_user_body);
      var _pointer_lock = new PointerLock(_element);


      function OnCamLoaded() {
        _camera_width  = _camera_video_element.videoWidth,
        _camera_height = _camera_video_element.videoHeight;
      }

      function AjdustSize() {
        var new_width  = _element.clientWidth;
        var new_height = _element.clientHeight;

        if (new_width !== _canvas.width || new_height !== _canvas.height) {
          _journey_renderer.Resize(_element.clientWidth, _element.clientHeight);
          _canvas.width  = _element.clientWidth;
          _canvas.height = _element.clientHeight;
        }
      }

      function Draw() {
        if (_camera_video_element.readyState === _camera_video_element.HAVE_ENOUGH_DATA) {
          if (_camera_width > 0 && _camera_height > 0) {
            var ratio_x = _canvas.width  / _camera_width;
            var ratio_y = _canvas.height / _camera_height;
            var ratio   = Math.max(ratio_x, ratio_y);
            var diff_h  = (_canvas.width  - _camera_width  * ratio) / 2;
            var diff_v  = (_canvas.height - _camera_height * ratio) / 2;
            var new_width  = _camera_width  * ratio;
            var new_height = _camera_height * ratio;

            // _ctx.drawImage(_camera_video_element, diff_h, diff_v, new_width, new_height);
          }
        }

        _journey_renderer.Render();
        _ctx.drawImage(_scene_canvas, 0, 0);
      }

      function OnDataChange() {
        Stop();
        Run();
      }

      function OnMouseWheel(e) {
        var i = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        var ratio = 1.5;
        var speed = _keyboard_control.GetSpeed();

        if (i < 0) speed /= ratio;
        else speed *= ratio;

        _keyboard_control.SetSpeed(speed);
      }

      function OnMouseDown(e) {
        _pointer_lock.ToogleLock();
      }

      function OnPointerLock() {
        _element.addEventListener('mousewheel', OnMouseWheel, false);

        _mouse_control_h.Connect();
        _mouse_control_v.Connect();
        _keyboard_control.Connect();
      }

      function OnPointerUnlock() {
        _element.removeEventListener('mousewheel', OnMouseWheel, false);

        _mouse_control_h.Disconnect();
        _mouse_control_v.Disconnect();
        _keyboard_control.Disconnect();
      }

      function Run() {
        if (!_running) {
          _running = true;

          _camera_video_element.addEventListener('loadedmetadata', OnCamLoaded, false);
          DataManagerSvc.AddListenerDataChange(OnDataChange);

          JourneySceneSvc.Start(false);

          _pointer_lock.AddLockListener(OnPointerLock);
          _pointer_lock.AddUnlockListener(OnPointerUnlock);
          _pointer_lock.Connect();

          _element.addEventListener('mousedown', OnMouseDown, false);

          function Loop() {
            if (_stop_count <= 0) {
              window.requestAnimationFrame(Loop);
              AjdustSize();

              _mouse_control_h.Update();
              _mouse_control_v.Update();
              _keyboard_control.Update();

              GeolocationSvc.SimulateNewPosition(_user_body.position.x, _user_body.position.z);

              JourneySceneSvc.Update();
              Draw();
            }
            else
              --_stop_count;
          }

          Loop();
        }
      }

      function Stop() {
        if (_running) {
          _running = false;
          ++_stop_count;

          JourneySceneSvc.Stop();
          _ctx.fillStyle = 'white';
          _ctx.fillRect(0, 0, _canvas.width, _canvas.height);

          _camera_video_element.removeEventListener('loadedmetadata', OnCamLoaded, false);
          DataManagerSvc.RemoveListenerDataChange(OnDataChange);

          _element.removeEventListener('mousedown', OnMouseDown, false);

          _pointer_lock.Disconnect();
          _pointer_lock.RemoveLockListener(OnPointerLock);
          _pointer_lock.RemoveUnlockListener(OnPointerUnlock);
        }
      }

      scope.$watch('active', function(active) {
        if (active === 'true') {
          Run();
        }
        else if (active === 'false') {
          Stop();
        }
      });

      scope.$on('$destroy', function() {
        Stop();
      });

      Run();

    }
  }


}])