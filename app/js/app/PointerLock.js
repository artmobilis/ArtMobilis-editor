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

  this.AddLockListener = function(callback) {
    _on_lock_callbacks.push(callback);
  };

  this.RemoveLockListener = function(callback) {
    var index = _on_lock_callbacks.indexOf(callback);
    if (index > 0)
      _on_lock_callbacks.splice(index, 1);
  };

  this.AddUnlockListener = function(callback) {
    _on_unlock_callbacks.push(callback);
  };

  this.RemoveUnlockListener = function(callback) {
    var index = _on_unlock_callbacks.indexOf(callback);
    if (index > 0)
      _on_unlock_callbacks.splice(index, 1);
  };

  this.Connect = function() {
    document.addEventListener('pointerlockchange'      , OnPointerLockChange, false);
    document.addEventListener('mozpointerlockchange'   , OnPointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', OnPointerLockChange, false);
  };

  this.Disconnect = function() {
    if (that.locked)
      that.Unlock();
    document.removeEventListener('pointerlockchange'      , OnPointerLockChange, false);
    document.removeEventListener('mozpointerlockchange'   , OnPointerLockChange, false);
    document.removeEventListener('webkitpointerlockchange', OnPointerLockChange, false);
  };

  this.SetElement = function(element) {
    var locked = that.locked;
    if (locked)
      Unlock();

    _element = element;

    _element.requestPointerLock = _element.requestPointerLock
    || _element.mozRequestPointerLock
    || _element.webkitRequestPointerLock;

    if (locked)
      Lock();
  };

};