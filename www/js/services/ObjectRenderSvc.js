angular.module('starter')

.service('ObjectRenderSvc', function() {

  var _canvas = document.createElement('canvas');
  var _scene = new Scene( { canvas: _canvas } );
  var _renderer = _scene.GetRenderer();

  var _box = new THREE.Box3();
  var _sphere = new THREE.Sphere();
  var _obj_container = new THREE.Object3D();

  _obj_container.rotation.x = 0.5;
  _obj_container.rotation.y = -0.25;

  _scene.AddObject(new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 ));
  _scene.AddObject(new THREE.AmbientLight( 0x404040 ));

  _scene.AddObject(_obj_container);


  this.Render = function(object, canvas) {

    _scene.ResizeRenderer(canvas.width, canvas.height);

    _box.setFromObject(object);
    _box.getBoundingSphere(_sphere);;

    _scene.GetCameraBody().position.z = _sphere.radius * 1.5;

    _obj_container.position.copy(_sphere.center.negate());
    _obj_container.add(object);


    _scene.Update();
    _scene.Render();

    _obj_container.remove(object);

    var ctx = canvas.getContext('2d');
    ctx.drawImage(_renderer.domElement, 0, 0);
  };

})