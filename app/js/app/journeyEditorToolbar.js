angular.module('app')

.directive('journeyEditorToolbar', ['DataManagerSvc', function(DataManagerSvc) {
  return {
    restrict: 'E',
    compile: function() {

      var template = [
        {
          label: 'File',
          submenu: [
            {
              label: 'Save',
              click: Save,
              accelerator: 'CmdOrCtrl+S'
            },
            {
              label: 'Load',
              click: Load,
              accelerator: 'CmdOrCtrl+L'
            }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Undo',
              accelerator: 'CmdOrCtrl+Z',
              role: 'undo'
            },
            {
              label: 'Redo',
              accelerator: 'Shift+CmdOrCtrl+Z',
              role: 'redo'
            },
            {
              type: 'separator'
            },
            {
              label: 'Cut',
              accelerator: 'CmdOrCtrl+X',
              role: 'cut'
            },
            {
              label: 'Copy',
              accelerator: 'CmdOrCtrl+C',
              role: 'copy'
            },
            {
              label: 'Paste',
              accelerator: 'CmdOrCtrl+V',
              role: 'paste'
            },
            {
              label: 'Select All',
              accelerator: 'CmdOrCtrl+A',
              role: 'selectall'
            },
          ]
        },
        {
          label: 'View',
          submenu: [
            {
              label: 'Reload',
              accelerator: 'CmdOrCtrl+R',
              click: function(item, focusedWindow) {
                if (focusedWindow)
                  focusedWindow.reload();
              }
            },
            {
              label: 'Toggle Full Screen',
              accelerator: (function() {
                if (process.platform == 'darwin')
                  return 'Ctrl+Command+F';
                else
                  return 'F11';
              })(),
              click: function(item, focusedWindow) {
                if (focusedWindow)
                  focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            },
            {
              label: 'Toggle Developer Tools',
              accelerator: (function() {
                if (process.platform == 'darwin')
                  return 'Alt+Command+I';
                else
                  return 'Ctrl+Shift+I';
              })(),
              click: function(item, focusedWindow) {
                if (focusedWindow)
                  focusedWindow.toggleDevTools();
              }
            },
          ]
        },
        {
          label: 'Window',
          role: 'window',
          submenu: [
            {
              label: 'Minimize',
              accelerator: 'CmdOrCtrl+M',
              role: 'minimize'
            },
            {
              label: 'Close',
              accelerator: 'CmdOrCtrl+W',
              role: 'close'
            },
          ]
        },
        {
          label: 'Help',
          role: 'help',
          submenu: [
            {
              label: 'Learn More',
              click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
            },
          ]
        }
      ]

      var _remote = require('remote');
      var _dialog = _remote.require('electron').dialog;
      var Menu = _remote.Menu;

      var _menu = new Menu();
      _menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(_menu)

      function Save() {
        var fs = _remote.require('fs');

        var file = _dialog.showSaveDialog();

        if (typeof file !== 'undefined') {
          fs.open(file, 'w', OnOpen);
        }

        function OnOpen(err, fd) {
          if (err) {
            console.error(err);
            return;
          }

          var data_journey = DataManagerSvc.GetData();

          var str = JSON.stringify(data_journey, undefined, 2);

          fs.write(fd, str, OnWrite(fd));

        }

        function OnWrite(fd) {
          return function(err, written, string) {
            if (err) {
              console.error(err);
            }
            fs.close(fd);
          }
        }
      }

      function Load() {
        var files = _dialog.showOpenDialog({ properties: [ 'openFile', 'multiSelections' ]});
      }

    }
  }
}])