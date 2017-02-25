ipc = require('electron').ipcRenderer;
const fs = require("fs");
const readline = require('readline');
var electron = require('electron');
electron.remote.getCurrentWindow().removeAllListeners();
var config = require('../config/default');
var softname = config.App.softname;

ipc.on('log_data', (event, l_filepath, title) => {
  document.title = `Лог ${title} | ${softname}`;
  var text = document.getElementById("text");
  const rl = readline.createInterface({
    input: fs.createReadStream(l_filepath)
  });

  rl.on('line', function (line) {
    text.innerHTML += line + "<br>";
  });
});

