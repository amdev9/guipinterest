if(require('electron-squirrel-startup')) return

const {ipcMain, app, BrowserWindow, autoUpdater, dialog, Menu} = require('electron')
const path = require('path')
const url = require('url')
var config = require('./config/default')
const devIsOpen = config.App.devTools
const os = require('os')

let template = []
const name = app.getName()
if (process.platform === 'darwin') {
  // OS X
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit() }
      },
      {
        label: "Edit",
        submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]}
    ]
  })
} else {
  // Win 
  template = [{
    label: name,
    submenu: [{
        label: 'Выход',
        accelerator: 'Command+Q',
        click() { app.quit() }
    }]
  }]
}

let mainWindow
function createDefaultWindow() {
  mainWindow = new BrowserWindow({width: 800, height: 600})    //show: false
  mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`)
  
  mainWindow.on('closed', function() {
    mainWindow = null
  })
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('sync_db')
    // mainWindow.show()
  })
  openDevTool(mainWindow, devIsOpen)
  return mainWindow
}

ipcMain.on('users_add', (event, users) => {
  mainWindow.webContents.send('add', users)
})

ipcMain.on('user_edit', (event, user) => {
  mainWindow.webContents.send('edit', user)
})

ipcMain.on('add_task_event', (event, tasks, users) => {
  mainWindow.webContents.send('add_task', tasks, users)
})

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit()
  }
})

app.on('ready', function() {
  let platform = 'win'
  let url = `http://192.168.1.33:5014/update/${platform}_${os.arch()}/${app.getVersion()}`
  if (process.platform === 'darwin') {
    platform = 'osx'
  }
  if (platform == 'osx') {
    autoUpdater.setFeedURL(url)
  } else if (platform == 'win') {
    autoUpdater.setFeedURL(url + '/RELEASES')
  }
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  createDefaultWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

function openDevTool(win, isOpen) {
  if (isOpen) {
    win.webContents.openDevTools()
  } else {
    win.webContents.on("devtools-opened", () => {
      win.webContents.closeDevTools()
    })
  }
}

autoUpdater.on('checking-for-update', () => {})
autoUpdater.on('update-available', (ev, info) => {})
autoUpdater.on('update-not-available', (ev, info) => {})
autoUpdater.on('error', (ev, err) => {
  if(!devIsOpen)
    dialog.showErrorBox('Ошибка обновления', 'Произошла ошибка при обновлении программы')
})
autoUpdater.on('download-progress', (ev, progressObj) => {})

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  let message = 'Доступно обновление ' + app.getName() + ' ' + releaseName + '. Оно будет установлено при следующем запуске программы.'
  if (releaseNotes) {
    const splitNotes = releaseNotes.split(/[^\r]\n/)
    message += '\n\nОписание обновления:\n'
    splitNotes.forEach(notes => {
      message += notes + '\n\n'
    })
  }
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Установить и перезапустить', 'Позже'],
    defaultId: 0,
    message: 'Обновление ' + app.getName() + ' было загружено',
    detail: message
  }, response => {
    if (response === 0) {
      setTimeout(() => autoUpdater.quitAndInstall(), 1)
    }
  })
})

setTimeout(function() {
  autoUpdater.checkForUpdates()
}, 1000)