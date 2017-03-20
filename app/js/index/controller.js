//////////////////////////////////
///////////// CONTROLLER /////////
//////////////////////////////////

'use strict';

var path = require('path')
const url = require('url')
var _ = require('lodash')
const {dialog, BrowserWindow} = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer

var config = require('./config/default')
const devIsOpen = config.App.devTools
var softname = config.App.softname
var logsDir = path.join(os.tmpdir(), softname, 'logs')

document.title = softname
var logControls = [];

// Display the current version
let version = window.location.hash.substring(1);
// document.getElementById('version').innerText = version;
document.title = softname + " " + version

ipcRenderer.on('message', function(event, text) {
  var container = document.getElementById('messages');
  var message = document.createElement('div');
  message.innerHTML = text;
  container.appendChild(message);
})

ipcRenderer.on('add', (event, users) => {
  addUsersDb(users);
});

ipcRenderer.on('edit', (event, user) => {
  editUserDb(user);
});

ipcRenderer.on('sync_db', (event) => {
  initViewDb();
});

ipcRenderer.on('add_task', (event, tasks, users) => {
  addTaskDb(tasks, users);
});

function emitLoggerMessage(row_id, message) {
  var logView = _.find(logControls, function(obj) { return obj.key == row_id })
  if (logView) {
    logView.control.send('append', message);
  }
}

function checkSecurityController(cb) {
  checkLicense(cb);
}

function openDevTool(win, isOpen) {
  if (isOpen) {
    win.webContents.openDevTools()
  } else {
    win.webContents.on("devtools-opened", () => {
      win.webContents.closeDevTools();
    });
  }
}

function editUserController(user) {
  if (user.length == 0) {
    dialog.showMessageBox({ 
      message: "Пользователь не выбран",
      buttons: ["OK"] 
    });
  } else if (user.length > 1) {
    dialog.showMessageBox({ 
      message: "Выберите одного пользователя",
      buttons: ["OK"] 
    });
  } else if (user.length == 1) {
    let editView = new BrowserWindow({width: 600, height: 300, frame: true});
    editView.setMenu(null)
    editView.loadURL(url.format({
      pathname: path.join(__dirname, 'html', 'edit.html'),
      protocol: 'file:',
      slashes: true
    }))
    editView.on('close', function() {
      editView = null;
    });
    window.onbeforeunload = function (e) { 
      editView.webContents.send('closing');
      return false;
    }

    editView.webContents.on('did-finish-load', () => {
      getItemDb(user[0], editView.webContents ); 
    });
    openDevTool(editView, devIsOpen);
  }
}

function tasksController(action, rows) {
  let taskView = new BrowserWindow({width: 1000, height: 800, frame: true});
  taskView.setMenu(null)
  taskView.loadURL(url.format({
    pathname: path.join(__dirname, 'html', 'task.html'),
    protocol: 'file:',
    slashes: true
  }))
  taskView.on('close', function() {
    taskView = null;
  });
  // Prevent from closing main window
  window.onbeforeunload = function (e) { 
    taskView.webContents.send('closing');
    return false;
  }
  taskView.webContents.on('did-finish-load', () => {
    if (action == "add" && rows.length > 0) {
      taskView.webContents.send('type', 'user', rows);
    } else if (action == "add" && rows.length == 0) {
      taskView.webContents.send('type', 'task');
    } else if (action == "edit" && rows.length == 1) {
      getItemDb(rows[0], taskView.webContents);
    }
  });
  openDevTool(taskView, devIsOpen);
}

function showLogsController(rows) {
  mkdirFolder(logsDir)
  .then(function() {
    rows.forEach(function (row_id) {
      let loggerView;
      var l_filepath = path.join(logsDir, row_id + ".txt");
      if (fs.existsSync(l_filepath) ) {
        loggerView = new BrowserWindow({width: 600, height: 300, frame: true});
        loggerView.setMenu(null)
        loggerView.loadURL(url.format({
          pathname: path.join(__dirname, 'html', 'log.html'),
          protocol: 'file:',
          slashes: true
        }))

        loggerView.on('closed', function() {
          loggerView = null;
        });

        loggerView.webContents.on('close', function() {
          _.remove(logControls, {
              key: row_id
          });
        });

        loggerView.webContents.on('did-finish-load', () => {
          var logControl = {
            key: row_id,
            control: loggerView.webContents
          };
          logControls.push(logControl);
          loggerView.webContents.send('log_data', l_filepath, row_id);
        });
        openDevTool(loggerView, devIsOpen);
      } else {
        dialog.showMessageBox({ 
          message: `Логи для ${row_id} отсутствуют`,
          buttons: ["OK"] 
        });
      }
    }); 
  })
}

function addUsersController() {
  let addView = new BrowserWindow({width: 600, height: 300, frame: true})
  addView.setMenu(null)
  addView.loadURL(url.format({
    pathname: path.join(__dirname, 'html', 'add.html'),
    protocol: 'file:',
    slashes: true
  }))
  addView.on('closed', function() {
    addView = null;
  })
  // Prevent from closing main window
  window.onbeforeunload = function (e) { 
    addView.webContents.send('closing');
    return false;
  }
  openDevTool(addView, devIsOpen); 
}
