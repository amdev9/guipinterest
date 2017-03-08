//////////////////////////////////
///////////// VIEW ///////////////
//////////////////////////////////

'use strict';

window.$ = window.jQuery = require('jquery');
var config = require('./config/default');
var softname = config.App.softname;

$(document).ready(function () {
  $('#navbarBrand').text(softname)
  $('#memberModal').modal({backdrop: 'static', keyboard: false});
  $('#memberLicense').html(`<small>Спасибо за использование ${softname}</small>`)
  checkSecurityController(setModalStatus);
});
 
function setModalStatus(result) {
  if(result == 'ok') {
    $('#memberModal').modal('hide');
  } else if (result == 'fail') {
    $("#memberModalBody").text("Проверьте подключение к интернету и наличие лицензии")
  } else if (result == 'vm') {
    $("#memberModalBody").text("Виртуальные машины не поддерживаются") 
  } else {
    $("#memberModalBody").text("Ошибка проверки лицензии") 
  }
}

function showLicenseTokenView(token) {
  $("#memberLicense > p").text("Лицензионный ключ: " + token + "")
}

$(function() {
  $('#table1').multiSelect({
    actcls: 'table-info',  
    selector: 'tbody tr',  
    except: ['tbody'], 
    statics: ['.danger', '[data-no="1"]'], 
    callback: function (items) {
      taskItemInContext = items; // $('#table2').empty().append(items.clone().removeClass('info').addClass('success'));
    }
  });
});

function setUsernameView(id, username) {
  $('#table1 tr[data-id="' + id + '"]').find("td").eq(0).html(username);
}

function setProxyView(id, proxy) {
  $('#table1 tr[data-id="' + id + '"]').find("td").eq(1).html(proxy);
}

function setTaskView(id, taskName) {
  var taskName = taskRenderNames(taskName);
  $('#table1 tr[data-id="' + id + '"]').find("td").eq(2).html(taskName);
}

function setStateMessage(id, message) {
  $('#table1 tr[data-id="' + id + '"]').find("td").eq(3).html(message);
}

function setState(id, state) {
  $('#table1 tr[data-id="' + id + '"]').attr('state', state);
}

function getState(id) {
  return $('#table1 tr[data-id="' + id + '"]').attr('state');
}

function changeTrThemeView(id, theme) {
  $('#table1 tr[data-id="' + id + '"]').removeClass().addClass(theme);
}

function setStateView(id, state) {
  if (state == 'run') {
    if (getState(id) != 'stop') {
      setState(id, state)
      setStateMessage(id, 'В работе');
    }
  } else if (state == 'stop') {
    if (getState(id) != 'stopped') {
      setState(id, state);
      setStateMessage(id, 'Останавливаем');
    } 
  } else if (state == 'stopped') {
    setState(id, state);
    setStateMessage(id, 'Остановлен');
  }
}

function taskRenderNames(taskDbName) {
  switch(taskDbName) {
    case 'filtration': return 'Фильтрация'
    case 'parse_concurrents': return 'Парсинг по конкурентам'
    case 'create_accounts': return 'Регистрация аккаунтов'
    default: return '-'
  }
}

function getStateView(id) {
  return $('#table1 tr[data-id="' + id +'"]').attr('state');
}

function setCompleteView(id, complete) {
  $('#table1 tr[data-id="' + id + '"]').find("td").eq(4).html(complete);
}

function getCompleteView(id, complete) {
  return $('#table1 tr[data-id="' + id + '"]').find("td").eq(4).html();
}

function setStatusView(id, status) {
  $('#table1 tr[data-id="' + id + '"]').find("td").eq(5).html(status);
}

function addStopStateView(rows_ids) {
  tokenCancel();
  rows_ids.forEach( function(user_id) {
    var state = getStateView(user_id);
    if (state != 'stopped') {
      setStateView(user_id, 'stop');
    }
  })
}

function deleteRowsView(rows) {
  rows.forEach(function(row_id) {
    $('#table1 tr[data-id="' + row_id + '"]').remove();
  });
}

function userRowRenderView(user_id) {
  db.get(user_id).then(function(user) {  
    setUsernameView(user._id, user.username);
    if (user.proxy != '') {
      setProxyView(user._id, user.proxy);
    } else {
      setProxyView(user._id, "-");
    }
    setStatusView(user._id, user.status);    
  }).catch(function (err) {
    console.log(err);
  });
}

function renderNewTaskCompletedView(user_id) {
  $('#table1 tr[data-id="' + user_id + '"]').find("td").eq(4).html(0);
}

function renderTaskCompletedView(user_id) {
  var currentValue = +getCompleteView(user_id);
  currentValue++;
  setCompleteView(user_id, currentValue);
}

function renderUserCompletedView(user_id, limit, indicator, filterSuccess) {
  $('#table1 tr[data-id="' + user_id + '"]').find("td").eq(4).html(limit + "/" + indicator + "/" + filterSuccess);
}

function renderTaskRowView(task_id, taskName) { 
  var taskName = taskRenderNames(taskName);
  var taskHtml = `<tr data-id="${task_id}" state="stopped" type="task">
    <td>-</td>
    <td>-</td>
    <td>${taskName}</td>
    <td>Остановлен</td>
    <td>-</td>
    <td>-</td></tr>`;
  $(taskHtml).prependTo('#table1');
}

function initTaskRowRenderView(tasks) {
  var tasksHtml = "";
  tasks.forEach(function(task) { // class="task"??
    var taskName = taskRenderNames(task.doc.name);
    var oneTaskHtml = `<tr data-id="${task.doc._id}" state="stopped" type="task">
      <td>-</td>
      <td>-</td>
      <td>${taskName}</td>
      <td>Остановлен</td>
      <td>-</td>
      <td>${task.doc.status}</td></tr>`;
    tasksHtml += oneTaskHtml;
  });
  $('#table1').append(tasksHtml);
}

function renderUserRowView(users) {
  var usersHtml = "";
  users.forEach(function(user) {
    var oneUserHtml = `<tr data-id="${user.username}" state="stopped" class="table-sm">
      <td>${user.username}</td>
      <td>${ user.proxy != '' ? user.proxy : '-'}</td>
      <td>-</td>
      <td>Остановлен</td>
      <td>-</td>
      <td>-</td></tr>`;
    usersHtml += oneUserHtml;
  });
  $('#table1').append(usersHtml);
}

function initUserRowRenderView(users) {
  var usersHtml = "";
  users.forEach(function(user) {
    var taskName = taskRenderNames(user.doc.task.name);
    var oneUserHtml = `<tr data-id="${user.doc._id}" state="stopped" class="table-sm">
      <td>${user.doc.username}</td>
      <td>${ user.doc.proxy != '' ? user.doc.proxy : "-" }</td>
      <td>${taskName}</td>
      <td>Остановлен</td>
      <td>-</td>
      <td>${user.doc.status}</td></tr>`;
    usersHtml += oneUserHtml;
  });
  $('#table1').append(usersHtml);
}
