angular.module('app')

.service('ProjectsManagerSvc', ['FileSystemSvc', function(FileSystemSvc) {

  var CHANGE_EVENT_NAME = 'project_change';

  var _root;
  var _event_manager = new AM.EventManager();

  function SetRoot(root) {
    _root = root;
    FireEventChange();
  }

  function GetRoot() {
    return _root;
  }

  function CreateDirectories() {
    FileSystemSvc.CreateDir(_root + '/' + AMTHREE.IMAGE_PATH);
    FileSystemSvc.CreateDir(_root + '/' + AMTHREE.MODEL_PATH);
    FileSystemSvc.CreateDir(_root + '/' + AMTHREE.VIDEO_PATH);
    FileSystemSvc.CreateDir(_root + '/' + AMTHREE.SOUND_PATH);
  }

  function IsEmpty() {
    return (typeof _root !== 'string');
  }

  function Close() {
    _root = undefined;
    FireEventChange();
  }

  function AddListenerChange(fun) {
    _event_manager.AddListener(CHANGE_EVENT_NAME, fun);
  }

  function RemoveListenerChange(fun) {
    _event_manager.RemoveListener(CHANGE_EVENT_NAME, fun);
  }

  function FireEventChange() {
    _event_manager.Fire(CHANGE_EVENT_NAME);
  }

  this.SetRoot = SetRoot;
  this.GetRoot = GetRoot;
  this.CreateDirectories = CreateDirectories;
  this.IsEmpty = IsEmpty;
  this.Close = Close;
  this.AddListenerChange = AddListenerChange;
  this.RemoveListenerChange = RemoveListenerChange;

}])