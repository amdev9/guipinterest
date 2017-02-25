ipc = require('electron').ipcRenderer;
const fs = require("fs");
window.$ = window.jQuery = require('jquery');
var config = require('../config/default');
var softname = config.App.softname;


document.title = "Редактирование аккаунта | " + softname

ipc.on('edit', (event, user) => {
  document.getElementById("username").value = user.username;
  document.getElementById("proxy").value = user.proxy;
  document.getElementById("password").value = user.password;
  document.getElementById("edit_form").name = user._id;
});

ipc.on('closing', () => {});

function saveAccountData() {
  var user = new Object();
  user._id = document.getElementById("edit_form").name;
  user.username = document.getElementById("username").value;
  user.proxy = document.getElementById("proxy").value;
  user.password = document.getElementById("password").value;
  ipc.send('user_edit', user );
  window.close();
}
