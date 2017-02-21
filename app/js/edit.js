ipc = require('electron').ipcRenderer;
const fs = require("fs");
window.$ = window.jQuery = require('jquery');

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

/////////////////////
// jquery validate //
/////////////////////

$(function() {
  $("#edit_form").validate({
    rules: {
      username: "required",
      password: "required",
    },
    messages: {
      username: "Введите логин",
      password: "Введите пароль",
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
      saveAccountData();
    }
  });
});