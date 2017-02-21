//////////////////////////////////
///////////// MODEL //////////////
//////////////////////////////////

'use strict';

const debug = require('debug');
var PouchDB = require('pouchdb');
var Promise = require('bluebird');
var readFilePromise = Promise.promisify(require("fs").readFile);
var path = require('path');
const os = require('os');
var tmpdir = os.tmpdir();
var levelpath = path.join(tmpdir, 'levdb');

var db = new PouchDB( levelpath , {adapter: 'leveldb'});
// PouchDB.debug.enable('*');
PouchDB.debug.disable();
// dropDb();

function dropDb() {
  db.destroy().then(function (response) {
    console.log(response);
  }).catch(function (err) {
    console.log(err);
  });
}

function addTaskDb(taskName, params) {
  readFilePromise(params[0], 'utf8').then(function(data) {
    var concurParsed = [];
    concurParsed = data.split('\n');
    concurParsed = concurParsed.filter(isEmpty);
    return new Promise(function(resolve, reject) {
      resolve(concurParsed);
    });
  }).then(function(parsed_array) {
 
    if (taskName == 'filtration') {
      var proxyParsed = [];
      readFile(params[12], function (data) { 
        proxyParsed = data.split('\n');
        proxyParsed = proxyParsed.filter(isEmpty);

        var to_parse_usernames = parsed_array.length;
        var div = Math.floor(to_parse_usernames / (proxyParsed.length+1) );
        var rem = to_parse_usernames % (proxyParsed.length+1);
        // var partition = [];
        // partition[0] = rem + div; // fix to { start: 0, end: rem + div }
        var partition = new Array(proxyParsed.length);
        partition.fill({});

        partition[0].start = 0;
        partition[0].end = rem + div;
        partition[0].proxy_parc = proxyParsed[0];

        for (var i = 1; i < proxyParsed.length; i++) {
          // partition[i] = partition[i-1]+div; // fix to { start: partition[i-1].end , end: partition[i-1].end + div }
          partition[i].start = partition[i-1].end;
          partition[i].end = partition[i-1].end + div;
          partition[i].proxy_parc = proxyParsed[i];
        }
        
        /////////////////////////////////
        let db_object = {
          _id: new Date().toISOString(),
          name: taskName,
          inputfile: params[0],
          input_array: parsed_array,
          followers: {
            from: params[1],
            to: params[2]
          },
          subscribers: {
            from: params[3], 
            to: params[4]
          },
          publications: {
            from: params[5],
            to: params[6]
          },
          stop_words_file: params[7],
          anonym_profile: params[8],
          private: params[9],
          lastdate: params[10],
          outputfile: params[11],
          partitions: partition,
          type: 'task',
          status: '-'
        };
        console.log(db_object);

        db.put(db_object).then(function (response) {
          console.log(response);
          renderTaskRowView(response.id, taskName);
        }).catch(function (err) {
          console.log(err);
        });
      });
    }
  });
}

function addUserDb(user) {
  db.put({
    _id: user.username,
    username: user.username,
    proxy: user.proxy,
    password: user.password,
    type: 'user',
    cookie: '',
    task: '-',
    status: '-'
  }).then(function (response) {
    renderUserRowView(user);
  }).catch(function (err) {
    console.log(err);
  });
}

function runTasksDb(rows) {
  rows.forEach(function (row_id) {
    db.get(row_id).then(function(row) {
      if (row.type == 'user' && row.task.name == 'parse_concurrents') {
        apiParseAccounts(row, row.task);
      } else if (row.task && row.task.name == 'filtration') {
        apiFilterAccounts(row);
      } else if (row.name && row.name == 'filtration') {
        apiFilterAccounts(row);
      }
    }).catch(function (err) {
      console.log(err);
    });
  });
}

function getExistedUserRows(rows) {
  var result = [];
  return new Promise(function(resolve, reject) {
    rows.forEach(function(row_id, i) {
      db.get(row_id).then(function(doc) {
        result.push(doc);
        if (i == rows.length - 1) {
          resolve(result);   /// FIX for prod
        }
      }).catch(function (err) {
        console.log(err);
      });
    });
  })
}

function completeUserTaskDb(rows, taskName, params) {
  getExistedUserRows(rows)
    .then(function(result) {
    var users = result;

    if (taskName == 'parse_concurrents') {
      var to_parse_usernames = params[1].length;
      var div = Math.floor(to_parse_usernames / users.length);
      var rem = to_parse_usernames % users.length;
      var dotation = [];
      dotation[0] = rem + div;
      for (var i = 1; i < users.length; i++) {
        dotation[i] = dotation[i-1]+div;
      }
      users.forEach( function(user, i , arr) {

        let db_object = {
          _id: user._id,
          username: user.username, 
          proxy: user.proxy,
          password: user.password,
          status: user.status,
          type: user.type,
          cookie: user.cookie,
          task: {
            name: taskName,
            outputfile: params[0], 
            parsed_conc: (i == 0) ? params[1].slice(0, dotation[i]) : params[1].slice(dotation[i-1], dotation[i]),
            max_limit: params[2], 
            parse_type: params[3]
          },
          _rev: user._rev 
        };
        return db.put(db_object).then(function (result) {
          userTaskRenderView(user._id, taskName);
        }).catch(function (err) {
          console.log(err);
        });

      });
    
    } else if (taskName == 'filtration') {

      var concurParsed = [];
      readFile(params[0], function (data) {
        concurParsed = data.split('\n');
        concurParsed = concurParsed.filter(isEmpty);

        var to_parse_usernames = concurParsed.length;
        var div = Math.floor(to_parse_usernames / users.length);
        var rem = to_parse_usernames % users.length;
        var dotation = [];
        dotation[0] = rem + div;
        for (var i = 1; i < users.length; i++) {
          dotation[i] = dotation[i-1]+div;
        }
        
        users.forEach( function(user, i , arr) {
          let db_object = {
            _id: user._id,
            username: user.username, 
            proxy: user.proxy,
            password: user.password,
            status: user.status,
            type: user.type,
            cookie: user.cookie,
            task: {
              name: taskName,
              inputfile: params[0],
              input_array: (i == 0) ? concurParsed.slice(0, dotation[i]) : concurParsed.slice(dotation[i-1], dotation[i]), // params[0],  
              followers: {
                from: params[1],
                to: params[2]
              },
              subscribers: {
                from: params[3], 
                to: params[4]
              },
              publications: {
                from: params[5],
                to: params[6]
              },
              stop_words_file: params[7],
              anonym_profile: params[8],
              private: params[9],
              lastdate: params[10],
              outputfile: params[11]
            },
            _rev: user._rev
          };
          return db.put(db_object).then(function (result) {
            userTaskRenderView(user._id, taskName);
          }).catch(function (err) {
            console.log(err);
          });
        });
      });
    }

  }).catch(function(err) {
    console.log(err);
  });
}

function checkAccountsDb(user_ids) {
  user_ids.forEach(function(user_id) {
    updateStateView(user_id, 'В работе');
    db.get(user_id).then(function(user) {
      apiSessionCheck(user._id, user.username, user.password); // add proxy
    }).catch(function(err) {
      console.log(err);
    });
  });
}

function loggerDb(user_id, log_string) {
  var d = new Date();
  var datetext = d.toTimeString();
  datetext = datetext.split(' ')[0];
  db.get(user_id).then(function(user) {
    if (user.username) {
      var l_string = "[" + datetext + "] " + user.username + ": " + log_string;
    } else {
      var l_string = "[" + datetext + "] " + user.name + ": " + log_string;
    }
    var l_filepath = __dirname + "/logs/" +  user._id + ".txt";
    createFile(l_filepath);
    appendStringFile(l_filepath, l_string);
  }).catch(function (err) {
    console.log(err);
  });
}

function getUserDb(user_id, webcontents) {
  db.get(user_id).then(function(user) {
    webcontents.send('edit', user);
  }).catch(function (err) {
    console.log(err);
  });
}

function getTaskDb(row_id, webcontents) {
  // figure out by row_id user or task
  // console.log(row_id);
  db.get(row_id).then(function(item) {
    if (item.type == 'task') {
      webcontents.send('edit', item);
    } else {
      webcontents.send('edit', item.task);
    }
  }).catch(function (err) {
    console.log(err);
  });
}

function updateUserStatusDb(user_id, statusValue) {
  db.get(user_id).then(function(user) {
    return db.put({
      _id: user._id,
      username: user.username, 
      proxy: user.proxy,
      password: user.password,
      status: statusValue,
      type: user.type,
      cookie: user.cookie,
      task: user.task,
      _rev: user._rev  
    });
  }).then(function(response) {
    userRowRenderView(user_id);
  }).catch(function (err) {
    console.log(err);
  });
}

function updateTaskStatusDb(task_id, statusValue) {
  db.get(task_id).then(function(task) {
    
    if (task.name == 'filtration') {
      let db_object = {
      _id: task._id,
      name: task.name,
      inputfile: inputfile,
      input_array: input_array,
      followers: {
        from: task.followers.from,
        to: task.followers.to
      },
      subscribers: {
        from: task.subscribers.from, 
        to: task.subscribers.to
      },
      publications: {
        from: task.publications.from,
        to: task.publications.to
      },
      stop_words_file: task.stop_words_file,
      anonym_profile: task.anonym_profile,
      private: task.private,
      lastdate: task.lastdate,
      outputfile: task.outputfile,
      proxy_parc: task.proxy_parc,
      type: task.type,

      status: statusValue,
      _rev: task._rev 
    };
    return db.put(db_object);
  }

  }).then(function(response) {
    // userRowRenderView(task_id);
  }).catch(function (err) {
    console.log(err);
  });
}

function deleteRowsDb(rows) {
  deleteRowsView(rows);
  // FIX
  // get all docs and get _rev
  // then delete all docs 
  // db.bulkDocs([
  //   {
  //     title    : 'Lisa Says',
  //     _deleted : true,
  //     _id      : "doc1",
  //     _rev     : "1-84abc2a942007bee7cf55007cba56198"
  //   },
  //   {
  //     title    : 'Space Oddity',
  //     _deleted : true,
  //     _id      : "doc2",
  //     _rev     : "1-7b80fc50b6af7a905f368670429a757e"
  //   }
  // ]).then(function (result) {
  //   // handle result
  // }).catch(function (err) {
  //   console.log(err);
  // });

  rows.forEach(function(row_id) {
    db.get(row_id).then(function(doc) {
      return db.remove(doc);
    }).then(function (result) {
      // deleteRowsView(row_id);
    }).catch(function (err) {
      console.log(err);
    });
  });
}

function editUserDb(item) {
  db.get(item._id).then(function(user) {
    return db.put({
      _id: user._id,
      username: item.username, 
      proxy: item.proxy,
      password: item.password,
      status: user.status,
      type: user.type,
      cookie: user.cookie,
      task: user.task,
      _rev: user._rev
    });
  }).then(function(response) {
    userRowRenderView(item._id);
  }).catch(function (err) {
    console.log(err);
  });
}

function initViewDb() {
  var ddoc2 = {
    _id: '_design/index',
    views: {
      index: {
        map: function mapFun(doc) {
          if (doc.type) {
            emit(doc.type);
          }
        }.toString()
      }
    }
  }

  db.put(ddoc2).catch(function (err) {
    if (err.name !== 'conflict') {
      throw err;
    }
  }).then( function() {
    return db.query('index', {
      key: 'task',
      include_docs: true
    });
  }).then(function (result) {
    result.rows.forEach( function (task) {
      initTaskRowRenderView(task); // pass all result.rows and make one append
    });
  }).then(function () {
    return db.query('index', {
      key: 'user',
      include_docs: true
    });
  }).then(function (result) {
    result.rows.forEach( function (user) {
      initUserRowRenderView(user); // pass all result.rows and make one append
    });
  }).catch(function (err) {
    console.log(err);
  });
}
