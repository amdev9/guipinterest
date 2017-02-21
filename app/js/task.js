ipc = require('electron').ipcRenderer;
const fs = require("fs");
window.$ = window.jQuery = require('jquery');
const {dialog} = require('electron').remote

ipc.on('closing', () => {});

ipc.on('type', (event, type, rows) => { 
  updateElementsAccessibility(type);
  saveTypeRowsDom(type, rows);
});

ipc.on('edit', (event, task) => {
  if (task.name == 'filtration') {
    updateElemView(['filtration']);
    document.getElementById("inputfile").value = task.inputfile;
    document.getElementById("followers_from").value = task.followers.from;
    document.getElementById("followers_to").value = task.followers.to;
    document.getElementById("publications_from").value = task.subscribers.from;
    document.getElementById("publications_to").value = task.subscribers.to;
    document.getElementById("subscribers_from").value = task.publications.from;
    document.getElementById("subscribers_to").value = task.publications.to;
    document.getElementById("stop_words_file").value = task.stop_words_file;
    document.getElementById("avatar").checked = task.anonym_profile; 
    document.getElementById("private").value =  task.private;
    document.getElementById("lastdate").value = task.lastdate;
    document.getElementById("filtered_accounts").value = task.outputfile;
    // proxy_file ???
  } else if (task.name == 'parse_concurrents') {
    updateElemView(['parse_concurrents']);
    document.getElementById("parsed_conc").value = task.parsed_conc.join('\n');
    document.getElementById("follow").checked = task.parse_type;
    document.getElementById("subscribe").checked = !task.parse_type;
    document.getElementById("max_limit").value = task.max_limit;
    document.getElementById("parsed_accounts").value = task.outputfile;
  }
 
});

function updateElementsAccessibility(type) {
  if (type == 'user') {
    updateElemView(['parse_concurrents', 'filtration']);
  } else {
    updateElemView(['filtration']);
    disableCustomElem();
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

function completeTask(taskName) {
  var containerRows = $("div.container").data('rows');
  if (taskName == 'parse_concurrents') {
    var followTrueSubscribeFalse = false;
    var concurParsed = document.getElementById("parsed_conc").value.split('\n');
    concurParsed = concurParsed.filter(isEmpty);
    if (document.getElementById("follow").checked == true) {
      followTrueSubscribeFalse = true;
    }
    var limit = document.getElementById("max_limit").value;
    var parsedAccountsFile = document.getElementById("parsed_accounts").value;

    const parse_concurrents_params = [parsedAccountsFile, concurParsed, limit, followTrueSubscribeFalse]; 
    const parse_concurrents_user = [ 'task_complete_event', containerRows, taskName].concat(parse_concurrents_params);
    ipc.send.apply(this, parse_concurrents_user);
    window.close();

  } else if (taskName == 'filtration') {

    var inputfile = document.getElementById("inputfile").value;
    var followers_from = document.getElementById("followers_from").value;
    var followers_to = document.getElementById("followers_to").value;
    var subscribers_from = document.getElementById("subscribers_from").value;
    var subscribers_to = document.getElementById("subscribers_to").value;
    var publications_from = document.getElementById("publications_from").value;
    var publications_to = document.getElementById("publications_to").value;
    var stop_words_file = document.getElementById("stop_words_file").value;
    var avatar = document.getElementById("avatar").checked;
    var private = document.getElementById("private").value;

    if (document.getElementById ('date_checker').checked == true) {
      var lastdate = document.getElementById("lastdate").value;
    } else {
      var lastdate = "";
    }
    var filtered_accounts = document.getElementById("filtered_accounts").value;
    var proxy_file = document.getElementById("proxy_file").value;

    const filtration_params = [inputfile, followers_from, followers_to, subscribers_from, subscribers_to, publications_from, publications_to, stop_words_file, avatar,  private, lastdate , filtered_accounts, proxy_file];
    const filtration_params_task = ['add_task_event', taskName].concat(filtration_params);
    const filtration_params_user = [ 'task_complete_event', containerRows , taskName].concat(filtration_params);

    if ($("div.container").attr('id') == "task" ) {
      ipc.send.apply(this, filtration_params_task);
      window.close();
    } else { 
      ipc.send.apply(this, filtration_params_user);
      window.close();
    }
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

document.getElementById("lastdate").disabled = true;
function checkDatePicker() {
  if (document.getElementById('date_checker').checked == true) {
     document.getElementById("lastdate").disabled = false;
  } else {
    document.getElementById("lastdate").disabled = true;
  }
}

/////////////////////
// jquery validate //
/////////////////////

$(function() {
  $("#parse_concurrents_form").validate({
    rules: {
      parsed_accounts: "required",
      concur_parsed: "required",
      radio_follow: "required",
      from_one: "required",
    },
    messages: {
      parsed_accounts: "Выберите файл",
      concur_parsed: "Введите имена аккаунтов для парсинга",
      radio_follow: "",
      from_one: "Введите кол-во"
    },
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-danger');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-danger');
    },
    errorElement: 'span',
    errorClass: 'form-control-feedback form-control-sm',  // 'help-block',

    submitHandler: function(form) {
      completeTask('parse_concurrents');
    }
  });


  $("#filtration_form").validate({
    rules: {
      forFilterFile: "required",
      followers_from: "required",
      followers_to: "required",
      publications_from: "required",
      publications_to: "required",
      subscribers_from: "required",
      subscribers_to: "required",
      filteredAccounts:  "required", 
    },
    messages: {
      forFilterFile: "Выберите файл",
      filteredAccounts: "Выберите файл"
    },
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-danger');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-danger');
    },
    errorElement: 'span',
    errorClass: 'form-control-feedback form-control-sm',

    submitHandler: function(form) {
      completeTask('filtration');
    }
  });

});
