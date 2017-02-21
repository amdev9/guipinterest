ipc = require('electron').ipcRenderer;
const fs = require("fs");
window.$ = window.jQuery = require('jquery');
var config = require('config');
var softname = config.get('App.softname');

document.title = "Добавить аккаунты | " + softname

ipc.on('closing', () => {});

ipc.on('selected_accounts', (event, message) => {
  var test = document.getElementById("test");
  for (var n = 0; n < message.length; n ++) {
    test.innerHTML += message[n] + "<br>";
  }
});

var openFile = function(selector) {
  const {dialog} = require('electron').remote
  var path = dialog.showOpenDialog({properties: ['openFile']}); // , 'openDirectory'
  if (path) {
    document.getElementById(selector).value = path;
  }
}

var parseDataFileToArray = (selector) => {
  var filename = document.getElementById(selector).value;
  fs.readFile(filename, function(err, f) {
    var array = f.toString().split('\n');
    array.forEach( function (item, i , arr) { // FIX pass array 
      if (item.length > 0 ) {
        var arr = item.split('|');
        var user = {};
        user.username = arr[0];   
        user.password = arr[1];
        user.proxy = arr[2];
        ipc.send('user_add', user);
      } 
    });
    window.close(); 
  });
}
