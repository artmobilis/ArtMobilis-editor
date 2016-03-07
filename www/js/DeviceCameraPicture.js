/****************



Dependency

cordova-plugin-camera
cordova plugin add cordova-plugin-camera

****************/


DeviceCameraPicture = function() {

  var that = this;

  this.quality = 50;
  this.targetWidth;
  this.targetHeight;

  this.GetPicture = function(onSuccess, onError) {
    document.addEventListener('deviceready', function () {

      var options = {
        quality: that.quality,
        destinationType: Camera.DestinationType.DATA_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: that.targetWidth,
        targetHeight: that.targetHeight,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation: true,
        cameraDirection: Camera.Direction.BACK
      };

      navigator.camera.getPicture(function(imageURI) {
        if (onSuccess)
          onSuccess(imageURI);
      }, function(err) {
        console.warn('cordovaCamera failed: ', err);
        if (onError)
          onError(err);
      },
      options);

      navigator.camera.cleanup();

    }, false);
  };

}