angular.module('starter')

.directive('objectRender', ['DataManagerSvc', 'ObjectRenderSvc',
  function(DataManagerSvc, ObjectRenderSvc) {
  return {
    restrict: 'E',
    template: '<div/>',
    link: function(scope, element, attr) {

      var _div = element.children()[0];
      var _canvas = document.createElement('canvas');

      var _object;
      var _alt = '';

      var _has_object = false;

      var _canvas_is_appended = false;


      function setAlt() {
        _div.innerHTML = '<table><tr><td style="vertical-align:middle">' + _alt + '</td></tr></table>';
      }

      function resetAlt() {
        _div.innerHTML = '';
      }

      function OnHasObject() {
        resetAlt();
        _has_object = true;

        if (attr.width)
          _canvas.width = attr.width;
        if (attr.height)
          _canvas.height = attr.height;

        if (!_canvas_is_appended) {
          _div.appendChild(_canvas);
          _canvas_is_appended = true;
        }
      }

      function OnHasntObject() {
        setAlt();
        _has_object = false;

        if (_canvas_is_appended)
          _div.removeChild(_canvas);
        _canvas_is_appended = false;
      }

      function Render() {
        ObjectRenderSvc.Render(_object, _canvas);
      }

      attr.$observe('object', function(attr_object_id) {

        DataManagerSvc.tracking_data_manager.OnLoadContentsAssets(function() {

          _object = DataManagerSvc.tracking_data_manager.GetObject(attr_object_id);
          if (_object) {
            OnHasObject();
            Render();
          }
          else {
            OnHasntObject();
          }
        });
      });

      attr.$observe('alt', function(alt) {
        _alt = alt;
        if (!_has_object)
          setAlt();
      });

      scope.$on('$destroy', function() {
        _canvas = undefined;
      });

    }
  };
}]);