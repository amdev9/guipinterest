ipc = require('electron').ipcRenderer;
const fs = require("fs");
window.$ = window.jQuery = require('jquery');
const {dialog} = require('electron').remote
var config = require('../config/default');
var softname = config.App.softname;

document.title = "Добавление задания | " + softname 

ipc.on('closing', () => {});

ipc.on('type', (event, type, rows) => { 
  updateElementsAccessibility(type);
  saveTypeRowsDom(type, rows);
});

ipc.on('edit', (event, item) => {
  if (item.type == 'user') {
    var rows = [];
    rows.push(item._id);
    saveTypeRowsDom('user', rows);
    
    var user = item;  
    if (user.task.name == 'parse_concurrents') {
      editParseConcurrents(user.task);
    } else if (user.task.name == 'filtration') {
      editFiltration(user.task);
    } else if(user.task.name == 'repin') {
      editRepin(user.task)
    }
  } else {
    var rows = { _id: item._id, _rev: item._rev };
    saveTypeRowsDom('task', rows);

    var task = item;
    if (task.name == 'parse_concurrents') {
      editParseConcurrents(task);
    } else if (task.name == 'filtration') {
      updateElementsAccessibility('task');
      editFiltration(task);
    } else if (task.name == 'create_accounts') {
      editCreateAccounts(task);
    }
  }
});

var elements1 = ["parsed_own_emails", "clean_own_emails", "open_own_emails", "reg_count"]
document.getElementById("own_emails").addEventListener("click", function() {
  checkDisabler( elements1);
}, false)

var elements2 = ["board_names", "clean_boardnames", "open_boardnames"]
document.getElementById("last_board").addEventListener("click", function() {
  checkDisabler( elements2);
}, false)

function checkDisabler(elements) {
  elements.forEach(function(item) {
    document.getElementById(item).disabled = !document.getElementById(item).disabled;
  })
}

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
  $("div.container").data(type, rows);
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

function editCreateAccounts(task) {
  $("div.container").data('task', { _id: task._id, _rev: task._rev });
  updateElemView(['create_accounts']);
  document.getElementById("own_emails").checked = task.own_emails;
  document.getElementById("reg_timeout").value = task.reg_timeout;
  document.getElementById("proxy_file").value = task.proxy_file;
  document.getElementById("output_file").value = task.output_file;
  if (document.getElementById("own_emails").checked) {
    document.getElementById("parsed_own_emails").value = task.email_parsed.join('\n');
    checkDisabler(["parsed_own_emails", "clean_own_emails", "open_own_emails", "reg_count"])
  } else {
    document.getElementById("reg_count").value = task.emails_cnt;
  }
}

function createAccounts(taskName) {
  var task = {};
  var domContainer = $("div.container").data('task');
  if (domContainer) {
    task._id = domContainer._id;
    task._rev = domContainer._rev;
  } else {
    task._id = new Date().toISOString().replace(".", "").replace(":", "");
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

function editRepin(task) { 
  updateElemView(['repin']);
  document.getElementById("last_board").checked = task.last_board;
  document.getElementById("timeout").value = task.timeout;
  document.getElementById("pin_file").value = task.pin_file;
  if (document.getElementById("last_board").checked) {
    checkDisabler(["board_names", "clean_boardnames", "open_boardnames"])
  } else {
    document.getElementById("board_names").value = task.board_names.join('\n');
  }
}

function repin(taskName) {
  var tasks = [];
  var users = $("div.container").data('user');
  users.forEach(function(user, iter, arr) {
    var task = {};
    task.name = taskName;
    task.pin_file = document.getElementById("pin_file").value;
    task.timeout = document.getElementById("timeout").value;
    var last_board = false;
    if (document.getElementById("last_board").checked == true) {
      last_board = true;
    }
    task.last_board = last_board;
    var board_names = document.getElementById("board_names").value.split('\n');
    task.board_names = board_names.filter(isEmpty);
    tasks.push(task);
    if(iter == arr.length - 1) {      
      ipc.send('add_task_event', tasks, users);
      window.close();
    }
  });
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




