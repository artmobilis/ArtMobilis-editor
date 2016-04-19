/**
 * Basic class to rotate a THREE.Object3D in a 1st person fashion with the mouse.
 * @class
 * @param {THREE.Object3D} object - target object to move
 * @param {MouseControl.Direction} [direction=MouseControl.Direction.BOTH] - rotate only horizontaly, or only verticaly, or in both directions
 */
MouseControl = function(object, direction) {
	var that = this;

	var _min_x = -Math.PI / 2;
	var _max_x = Math.PI / 2;

	var _enabled = false;

  var _movement = { x: 0, y: 0 };

  var _sensitivity = 1;
  var _object = object;

  var _horizontal;
  var _vertical;

  SetDirection(direction);

  function OnMouseMove(event) {
    _enabled = true;

    var movement_x = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movement_y = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    _movement.x += movement_x;
    _movement.y += movement_y;
  }

  /**
   * Updates the rotation of the objects.
   * @inner
   */
  function Update() {
    if (_enabled) {

      var euler = new THREE.Euler();
      euler.setFromQuaternion(_object.quaternion);
      euler.reorder('YXZ');


      if (_horizontal)
        euler.y -= _movement.x / 100 * _sensitivity;
      if (_vertical) {
        euler.x -= _movement.y / 100 * _sensitivity;
        if (euler.x < _min_x)
          euler.x = _min_x;
        if (euler.x > _max_x)
          euler.x = _max_x;
      }

      _object.quaternion.setFromEuler(euler);

    }

    _movement.x = 0;
    _movement.y = 0;
  };

  /**
   * Adds the event listeners
   * @inner
   */
  function Connect() {
    document.addEventListener('mousemove', OnMouseMove);
  };

  /**
   * Removes the event listeners
   * @inner
   */
  function Disconnect() {
    document.removeEventListener('mousemove', OnMouseMove);
    _enabled = false;
  };

  /**
   * Sets the object to rotate
   * @inner
   * @param {THREE.Object3D} object
   */
  function SetObject(object) {
    _object = object;
  };

  /**
   * Sets the sensitivity
   * @inner
   * @param {number} value
   */
  function SetSensitivity(value) {
    _sensitivity = value;
  };

  /**
   * Sets the direction to rotate
   * @inner
   * @param {MouseControl.Direction} dir=MouseControl.Direction.BOTH
   */
  function SetDirection(dir) {
    if (dir !== undefined) {
      _horizontal = dir & MouseControl.Direction.HORIZONTAL;
      _vertical = dir & MouseControl.Direction.VERTICAL;
    } else {
      _horizontal = true;
      _vertical = true;
    }
  };

  this.Update = Update;
  this.Connect = Connect;
  this.Disconnect = Disconnect;
  this.SetObject = SetObject;
  this.SetSensitivity = SetSensitivity;
  this.SetDirection = SetDirection;
}

/**
 * Enum directions.
 * @inner
 * @readonly
 * @enum {number}
 */
MouseControl.Direction = {
  HORIZONTAL: 1,
  VERTICAL: 2,
  BOTH: 3
};