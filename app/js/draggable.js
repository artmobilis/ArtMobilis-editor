angular.module('app')

.directive('draggable', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var el = element[0];
      var drag = null;
      var style = null;

      el.draggable = true;

      el.addEventListener('dragstart', function(event) {
        event.dataTransfer.effectAllowed = 'move';
        this.classList.add(style);

        if (drag) $parse(drag)(scope)(event);
      }, false);

      el.addEventListener('dragend', function(event) {
        this.classList.remove(style);
        return false;
      }, false);

      attrs.$observe('drag', function(d) {
        drag = d;
      });
      attrs.$observe('dragstyle', function(s) {
        style = s;
      })
    }
  }
}])

.directive('droppable', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // again we need the native object
      var el = element[0];
      var drop = null;
      
      el.addEventListener('dragover', function(event) {
        event.dataTransfer.dropEffect = 'move';
        // allows us to drop
        if (event.preventDefault) event.preventDefault();
        this.classList.add('over');
      }, false);
      
      el.addEventListener('dragenter', function(event) {
        this.classList.add('over');
      }, false);
      
      el.addEventListener('dragleave', function(event) {
        this.classList.remove('over');
      }, false);
      
      el.addEventListener('drop', function(event) {
        // Stops some browsers from redirecting.
        if (event.stopPropagation) event.stopPropagation();
        this.classList.remove('over');
        if (drop) $parse(drop)(scope)(event);

        return false;
      }, false);

      attrs.$observe('drop', function(d) {
        drop = d;
      });
    }
  }
}]);