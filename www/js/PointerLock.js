PointerLock = function(element) {

  var that = this;

  var _element = element;

  this.locked = false;

  var _on_lock_callbacks = [];
  var _on_unlock_callbacks = [];

  if (typeof(_element) !== 'undefined') {
    _element.requestPointerLock = _element.requestPointerLock
    || _element.mozRequestPointerLock
    || _element.webkitRequestPointerLock;
  }

  document.exitPointerLock = document.exitPointerLock
  || document.mozExitPointerLock
  || document.webkitExitPointerLock;

  function OnPointerLockChange() {
    if (that.locked) {
      for (fun of _on_unlock_callbacks)
        fun();

      that.locked = false;
    }
    else {
      for (fun of _on_lock_callbacks)
        fun();

      that.locked = true;
    }
  }

  this.Lock = function() {
    _element.requestPointerLock();
  };

  this.Unlock = function() {
    document.exitPointerLock();
  };

  this.ToogleLock = function() {
    if (that.locked)
      that.Unlock();
    else
      that.Lock();
  };

  this.OnLock = function(callback) {
    _on_lock_callbacks.push(callback);
  };

  this.OnUnlock = function(callback) {
    _on_unlock_callbacks.push(callback);
  };

  this.Connect = function() {
    document.addEventListener('pointerlockchange', OnPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', OnPointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', OnPointerLockChange, false);
  };

  this.Disconnect = function() {
    document.removeEventListener('pointerlockchange', OnPointerLockChange, false);
    document.removeEventListener('mozpointerlockchange', OnPointerLockChange, false);
    document.removeEventListener('webkitpointerlockchange', OnPointerLockChange, false);
  };

  this.SetElement = function(element) {
    _element = element;

    _element.requestPointerLock = _element.requestPointerLock
    || _element.mozRequestPointerLock
    || _element.webkitRequestPointerLock;
  };

};