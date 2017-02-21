//////////////////////////////////
///////////// VIEW ///////////////
//////////////////////////////////

'use strict';

window.$ = window.jQuery = require('jquery');

$(document).ready(function () {
  $('#memberModal').modal({backdrop: 'static', keyboard: false});
  checkSecurityController(function(result) {
    if(result == 'ok') {
      $('#memberModal').modal('hide');
    } else if (result == 'fail') {
      $("#memberModalBody > p").text("Проверьте подключение к интернету и наличие лицензии") 
      console.log(result);
    } else if (result == 'vm') {
      $("#memberModalBody > p").text("Виртуальные машины не поддерживаются") 
    } else {
      $("#memberModalBody > p").text("Произошла ошибка") 
    }
  });
});
 
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

function getStateView(user_id) { 
  var state = $('#table1 tr[data-id="' + user_id +'"]').attr('state');
  return state;
}

function addStopStateView(user_id) {
  var state = $('#table1 tr[data-id="' + user_id +'"]').attr('state')
  if (state != 'stopped') {
    $('#table1 tr[data-id="' + user_id[0] + '"]').attr('state', 'stop');
  }
}

function deleteStopStateView(user_id) {
  $('#table1 tr[data-id="' + user_id + '"]').attr('state', 'stopped');
}

function renderUserCompletedView (user_id, indicator, limit) {  //// FIX
  $('#table1 tr[data-id="' + user_id + '"]').find("td").eq(4).html( indicator + "/" + limit);
  if (indicator == limit) {
    updateUserStatusDb(user_id, 'Активен');
    // userRowRenderView(user_id);
    loggerDb(user_id, 'Работа завершена')
  }
}

function renderTaskCompletedView(user_id) {  //// add to current value of indicator (get -> plus -> set)
  var currentValue = +$('#table1 tr[data-id="' + user_id + '"]').find("td").eq(4).html();
  currentValue++;
  $('#table1 tr[data-id="' + user_id + '"]').find("td").eq(4).html(currentValue);

  // if (indicator == limit) {
  //   updateTaskStatusDb(user_id, 'Активен');
  //   updateStateView(user_id, 'Остановлен');
  //   loggerDb(user_id, 'Работа завершена')
  // }
}


function renderNewTaskCompletedView(user_id) {
  $('#table1 tr[data-id="' + user_id + '"]').find("td").eq(4).html(0);
}

function updateStateView(user_id, state) { // rewrite with jquery find filed == eq(3)
  $('#table1 tr[data-id="' + user_id + '"]').find("td").eq(3).html(state);
  if (state == 'В работе') {
    $('#table1 tr[data-id="' + user_id + '"]').attr('state', 'run');
  } else {
    $('#table1 tr[data-id="' + user_id + '"]').attr('state', 'stopped');
  }
}

function deleteRowsView(rows) {
  rows.forEach(function(row_id) {
    $('#table1 tr[data-id="' + row_id + '"]').remove();
  });
}

function userTaskRenderView(row_id, taskType) {
  $('#table1 tr[data-id="' + row_id + '"]').find("td").eq(2).html(taskType);
}

function initUserRowRenderView(user) { // rewrite to with $.each
  var userlist = `<tr data-id="${user.doc._id}" state="stopped">
                  <td>${user.doc.username}</td>
                  <td>${ user.doc.proxy != '' ? user.doc.proxy : "-" }</td>
                  <td>${ user.doc.task != '-' ? user.doc.task.name : "-"}</td>
                  <td>Остановлен</td>
                  <td>-</td>
                  <td>${user.doc.status}</td></tr>`;
  $('#table1').append(userlist);
}

function initTaskRowRenderView(task) { // rewrite to with $.each
  var userlist = `<tr data-id="${task.doc._id}" state="stopped" type="task">
                  <td>-</td>
                  <td>-</td>
                  <td>${ task.doc.name }</td>
                  <td>Остановлен</td>
                  <td>-</td>
                  <td>${task.doc.status}</td></tr>`;
  $('#table1').append(userlist);
}

function renderTaskRowView(task_id, taskName) { // rewrite to with $.each
  var userlist = `<tr class="task" data-id="${task_id}" state="stopped" type="task">
                  <td>-</td>
                  <td>-</td>
                  <td>${taskName}</td>
                  <td>Остановлен</td>
                  <td>-</td>
                  <td>-</td></tr>`;
  $('#table1').append(userlist);
}

function renderUserRowView(user) { // rewrite to with $.each
  var userlist = `<tr class="task" data-id="${user.username}" state="stopped">
                  <td>${user.username}</td>
                  <td>${ user.proxy != '' ? user.proxy : '-'}</td>
                  <td>-</td>
                  <td>Остановлен</td>
                  <td>-</td>
                  <td>-</td></tr>`;
  $('#table1').append(userlist);
}

function userRowRenderView(user_id) {
  db.get(user_id).then(function(user) {  
    $('#table1 tr[data-id="' + user._id + '"]').find("td").eq(0).html(user.username);
    if (user.proxy != '') {
      $('#table1 tr[data-id="' + user._id + '"]').find("td").eq(1).html(user.proxy);
    } else {
      $('#table1 tr[data-id="' + user._id + '"]').find("td").eq(1).html("-");
    }
    $('#table1 tr[data-id="' + user._id + '"]').find("td").eq(5).html(user.status);    
  }).then(function() {
    updateStateView(user_id, 'Остановлен');
  }).catch(function (err) {
    console.log(err);
  });
}
