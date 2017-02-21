'use strict';

const ipc = require('electron').ipcRenderer;

/////////////////////////////////////
////////////// EVENTS ///////////////
/////////////////////////////////////

ipc.on('add', (event, user) => {
  addUserDb(user);
});

ipc.on('edit', (event, user) => {
  editUserDb(user);
});

ipc.on('sync_db', (event) => {
  initViewDb();
});

ipc.on('task_complete', (event, rows, taskName, params ) => {
  completeUserTaskDb(rows, taskName, params);
});

ipc.on('add_task', (event, taskName, params ) => {
  addTaskDb(taskName, params);
});
