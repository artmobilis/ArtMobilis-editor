/**
 * Basic class to move a THREE.Object3D in a 1st person fashion, using 'zqsd' by default
 * @class
 * @param {THREE.Object3D} object
 */
var KeyboardControl = function(object) {
	var that = this;

	var _object = object;

	var _speed = 1;

  var _keys = {
    forward: 90,
    backward: 83,
    rightward: 68,
    leftward: 81
  }

  var _enabled = false;

  var _fwd = false, _bwd = false, _lwd = false, _rwd = false;


  function OnKeyDown(event) {
    _enabled = true;
    if (event.which == _keys.forward)
      _fwd = true;
    else if (event.which == _keys.backward)
      _bwd = true;
    else if (event.which == _keys.leftward)
      _lwd = true;
    else if (event.which == _keys.rightward)
      _rwd = true;
  }

  function OnKeyUp(event) {
    if (event.which == _keys.forward)
      _fwd = false;
    else if (event.which == _keys.backward)
      _bwd = false;
    else if (event.which == _keys.leftward)
      _lwd = false;
    else if (event.which == _keys.rightward)
      _rwd = false;
  }


  /**
   * Updates the object's position
   * @inner
   */
  this.Update = function() {
    var x = 0, z = 0;

    if (_enabled) {
      if (_fwd) z -= _speed;
      if (_bwd) z += _speed;
      if (_lwd) x -= _speed;
      if (_rwd) x += _speed;

      _object.translateX(x);
      _object.translateZ(z);
    }
  };

  /**
   * Adds the event listeners.
   * @inner
   */
  this.Connect = function() {
    document.addEventListener('keydown', OnKeyDown);
    document.addEventListener('keyup', OnKeyUp);
  };

  /**
   * Removes the event listeners.
   * @inner
   */
  this.Disconnect = function() {
    document.removeEventListener('keydown', OnKeyDown);
    document.removeEventListener('keyup', OnKeyUp);
    _fwd = false;
    _bwd = false;
    _lwd = false;
    _rwd = false;
  };

  /**
   * Sets the object
   * @inner
   * @param {THREE.Object3D} object
   */
  this.SetObject = function(object) {
    _object = object;
  };

  /**
   * Sets the speed
   * @inner
   * @param {number} speed=1
   */
  this.SetSpeed = function(speed) {
    _speed = speed;
  };

  /**
   * Sets a key value
   * @inner
   * @param {string} name - The name of a key, "forward", "backward", "rightward", or "leftward".
   * @param {number} key_value
   */
  this.SetKey = function(name, key_value) {
    if (typeof _keys[name] !== 'undefined') {
      _keys[name] = key_value;
    }
  };

  this.GetSpeed = function() {
    return _speed;
  };
};