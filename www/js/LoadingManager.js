LoadingManager = function() {

  var _callbacks = [];
  var _loading = 0;

  this.Start = function() {
    ++_loading;
  };

  this.End = function() {
    if (_loading > 0)
      --_loading;
    if (_loading <= 0) {
      for(fun of _callbacks) {
        fun();
        _callbacks = [];
      }
    }
  };

  this.OnEnd = function(callback) {
    if (_loading > 0) {
      _callbacks.push(callback);
    }
    else
      callback();
  };

  this.IsLoading = function() {
    return _loading > 0;
  };

};