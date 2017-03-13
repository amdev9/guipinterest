ipc = require('electron').ipcRenderer;
const fs = require("fs");
window.$ = window.jQuery = require('jquery');
const {dialog} = require('electron').remote
var config = require('../config/default');
var softname = config.App.softname;

document.title = "Добавление задания | " + softname 
document.getElementById("own_emails").addEventListener("click",function(){
  checkDisabler();
}, false)
checkDisabler();

ipc.on('closing', () => {});

ipc.on('type', (event, type, rows) => { 
  updateElementsAccessibility(type);
  saveTypeRowsDom(type, rows);
});

ipc.on('edit', (event, task) => {
  if (task.name == 'filtration') {
    editFiltration(task);
  } else if (task.name == 'parse_concurrents') {
    editParseConcurrents(task);
  } else if (task.name == 'create_accounts') {
    editCreateAccounts(task);
  }
});

function updateElementsAccessibility(type) {
  if (type == 'user') {
    updateElemView(['repin']);
  } else {
    updateElemView(['create_accounts']);
    // disableCustomElem();
  }
}

function disableCustomElem() {
  $("#div_avatar").addClass("disabled");
  $("#avatar").prop("disabled", true);
  $("#proxy_file").prop("disabled", false);
  $("#proxy_file_button").prop("disabled", false);
}

function saveTypeRowsDom(type, rows) {
  $("div.container").attr('id', type);
  $("div.container").data('rows', rows);
}

function updateElemView(accessible) {
  $("#" + accessible[0] + "_tab").addClass('active');
  $("#" + accessible[0]).addClass('active');
  $("nav.nav-pills > a").each(function(index) {
    if ( accessible.indexOf( $(this).attr('id').slice(0, -4) ) === -1) {
      $(this).addClass("disabled");
    }
  });
}

function isEmpty(x) {
  if (x !== "") {
    return true;
  }
}

function clearTextArea (selector) {
  document.getElementById(selector).value = "";
}

function openFile ( selector ) {
  var path = dialog.showOpenDialog({properties: ['openFile']}); // 'openDirectory'
  if (path) {
    document.getElementById(selector).value = path;
  } 
}

function openParse(selector) {
  var path = dialog.showOpenDialog({properties: ['openFile']}); // , 'openDirectory'
  readFile(path[0], function(data) {
    document.getElementById(selector).value = data;
  });
}

function readFile(filepath, cb) {
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) throw err;
    return cb(data);
  });
}

function saveFile(selector) {
  var path = dialog.showSaveDialog();
  if (path) {
    document.getElementById(selector).value = path;
  }
}

 
function checkDisabler() {
  if (document.getElementById('own_emails').checked == true) {
    document.getElementById("parsed_own_emails").disabled = false;
    document.getElementById("clean_own_emails").disabled = false;
    document.getElementById("open_own_emails").disabled = false;
    document.getElementById("reg_count").disabled = true;
  } else {
    document.getElementById("open_own_emails").disabled = true;
    document.getElementById("parsed_own_emails").disabled = true;
    document.getElementById("clean_own_emails").disabled = true;
    document.getElementById("reg_count").disabled = false;
  }
}

function editCreateAccounts(task) {
  $("div.container").data('task', { _id: task._id, _rev: task._rev });
  updateElemView(['create_accounts']);
  document.getElementById("own_emails").checked = task.own_emails;
  document.getElementById("reg_timeout").value = task.reg_timeout;
  document.getElementById("proxy_file").value = task.proxy_file;
  document.getElementById("output_file").value = task.output_file;
  if (document.getElementById("own_emails").checked) {
    document.getElementById("parsed_own_emails").value = task.email_parsed.join('\n');
  } else {
    document.getElementById("reg_count").value = task.emails_cnt;
  }
  checkDisabler();
}
 

function createAccounts(taskName) {
  var task = {};
  var domContainer = $("div.container").data('task');
  if (domContainer) {
    task._id = domContainer._id;
    task._rev = domContainer._rev;
  } else {
    task._id = new Date().toISOString();
  }
  
  task.status = '-';
  task.name = taskName;
  task.type = 'task';
  task.email_parsed = '';
  task.own_emails = document.getElementById("own_emails").checked;
  if(document.getElementById("own_emails").checked == true) {
    task.email_parsed = document.getElementById("parsed_own_emails").value.split('\n').filter(isEmpty);
  } else {
    task.emails_cnt = document.getElementById("reg_count").value;
  }
  task.reg_timeout = document.getElementById("reg_timeout").value;
  task.proxy_file = document.getElementById("proxy_file").value;
  task.output_file = document.getElementById("output_file").value;

  ipc.send('add_task_event', task);
  window.close();
}

function repin(taskName) {
  // var task = {};
  // var domContainer = $("div.container").data('task');
  // if (domContainer) {
  //   task._id = domContainer._id;
  //   task._rev = domContainer._rev;
  // } else {
  //   task._id = new Date().toISOString();
  // }
  
  // task.status = '-';
  // task.name = taskName;
  // task.type = 'task';
  // task.email_parsed = '';
  // task.own_emails = document.getElementById("own_emails").checked;
  // if(document.getElementById("own_emails").checked == true) {
  //   task.email_parsed = document.getElementById("parsed_own_emails").value.split('\n').filter(isEmpty);
  // } else {
  //   task.emails_cnt = document.getElementById("reg_count").value;
  // }
  // task.reg_timeout = document.getElementById("reg_timeout").value;
  // task.proxy_file = document.getElementById("proxy_file").value;
  // task.output_file = document.getElementById("output_file").value;

  // ipc.send('add_task_event', task);
  window.close();
}

function completeTask(taskName) {
  if (taskName == 'parse_concurrents') {
    parseConcurrents(taskName);
  } else if (taskName == 'filtration') {
    filtration(taskName);
  } else if (taskName == 'create_accounts') {
    createAccounts(taskName);
  } else if (taskName == 'repin') {
    repin(taskName);
  }
}




