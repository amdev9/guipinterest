//////////////////////////////////
///////////// API ////////////////
//////////////////////////////////

'use strict';

const Client = require('../instagram-private-api').V1; //     "instagram-private-api": "0.10.0",
const fs = require('fs');
var Promise = require('bluebird');
var cookieDir = os.tmpdir() + '/cookie/';
var async = require('async');

function mediaFilter(json, task, cb) {
  // console.log("mediaFilter");
  if (json.isBusiness) {
    mediaSessionFilter( json, task, cb);
  } else {
    mediaNoSessionFilter(json, task, cb);
  }
}

function mediaNoSessionFilter(json, task, cb) {
  var filterRequest = new Client.Web.FilterRequest();
  filterRequest.media(json.username).then(function(response) {
    // console.log(response.items[0].created_time); 
    appendStringFile(task.outputfile, json.username);
    cb();
  });
}

function mediaSessionFilter(json, task, cb) {
  var feed = new Client.Feed.UserMedia(session, json.id);
  var p = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(feed.get())
    }, 2000);
  });
  p = p.then(function(results) {
    if (new Date(results[0]._params.takenAt) >= new Date(task.lastdate + ' 00:00:00')) {
      // console.log (results[0]._params.takenAt);  
      // console.log("not private && data checked")
      appendStringFile(task.outputfile, json.username);
      cb();
    }
  }).catch(error => {
    console.log(error);
  });     
}

function filterFunction(json, task, cb) {

  var followersCond = json.followerCount > task.followers.from && json.followerCount < task.followers.to;
  var subscribersCond = json.followingCount > task.subscribers.from && json.followingCount < task.subscribers.to;
  var publicationsCond = json.mediaCount > task.publications.from && json.mediaCount < task.publications.to;
  if (task.private == 'all') {
    var privateCond = true;
  } else if (task.private == 'private') {
    var privateCond = json.isPrivate == true;
  } else if (task.private == 'open') {
    var privateCond = json.isPrivate == false;
  }
  if (followersCond && subscribersCond && publicationsCond && privateCond ) {
    if (task.stop_words_file != "") {
      fs.readFile(task.stop_words_file, function(err, f) {
      var words = f.toString().split('\n').filter(isEmpty);
      words.forEach(function (word) {
        word = word.toLowerCase();
        var fullName = json.fullName ? json.fullName.toLowerCase() : '';
        var biography = json.biography ? json.biography.toLowerCase() : '';
        if (word != "" && fullName.indexOf(word) == -1 && biography.indexOf(word) == -1 ) {
          // console.log(fullName + " -> "+ word);
          // console.log(biography + " -> "+  word);
 
          if (task.lastdate != "" && json.isPrivate == false && json.mediaCount > 0) {
            mediaFilter(json, task, cb);
          } else {
            appendStringFile(task.outputfile, json.username);
            cb();
          }
        }
      })
    });
    } else {
      appendStringFile(task.outputfile, json.username);
      cb();
    }
  } else {
    // console.log("not included " + json);
    cb();
  }
}

var filterNoSession = function(task) {
 
  updateStateView(task._id, 'В работе');
  renderNewTaskCompletedView(task._id);
  loggerDb(task._id, 'Фильтрация аудитории');
  fs.truncate(task.outputfile, 0, function() { 
    loggerDb(task._id, 'Файл подготовлен');
  });
 
  // for (var i = 0; i < task.partitions.length; i++) {
  
  async.forEach(task.partitions, function (taskpart, callback) {
    // if(task.proxy_parc.length > 0) {
      console.log(taskpart.proxy_parc);
    setProxyFunc(taskpart.proxy_parc);
    // }
    var filterRequest = new Client.Web.FilterRequest();   
    // var iterator = (i == 0) ? 0 : task.partitions[i-1]; 
    var iterator = taskpart.start;
    var promiseWhile = function( action) {
      var resolver = Promise.defer();
      var func = function(json) {
        if (json) {
          filterFunction(json, task, function() {
            renderTaskCompletedView(task._id); // +1 //, iterator, task.input_array.length
          });
        }

        if (getStateView(task._id) == 'stop' || iterator >= taskpart.end ) { 
          deleteStopStateView(task._id);
          return resolver.resolve(); 
        } // max_limit value -> partition[i]
        return Promise.cast(action())
          .then(func)
          .catch(resolver.reject);
      };
      process.nextTick(func);
      return resolver.promise;
    }

    promiseWhile(function() {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(filterRequest.getUser(task.input_array[iterator])); // FIX pass param 
          iterator++;
        }, 20);
      });
    }).then(function() {
      updateStateView(task_id, 'Остановлен');
      loggerDb(task_id, 'Фильтрация остановлена');
    }).catch(function (err) {
      console.log(err);
    });
  // }
      callback();
   }, function(err) {
    console.log(err);
      console.log('iterating done');
  }); 
}

function filterSessionUser(user_id, ses, task, userFilter, cb) {
  ses.then(function(session) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([session, Client.Account.searchForUser(session, userFilter)]);
      }, 2000);
    });
  }).all()
  .then(function([session, account]) {
     Client.Account.getById(session, account.id)
    .then(function(account) {
      filterFunction(account.params, task, cb);
      // if (task.anonym_profile == true) {
      //   var hasAnonymousProfilePictureCond = !account.params.hasAnonymousProfilePicture;
      // } else {
      //   var hasAnonymousProfilePictureCond = true;
      // }
    }).catch(function (err) {
        if (err instanceof Client.Exceptions.APIError) {
          console.log(err);
          loggerDb(user_id, err.name);
        } else {
          loggerDb(user_id, 'Произошла ошибка');
          console.log(err);
        }
      });
  }).catch(function (err) {
    if (err instanceof Client.Exceptions.APIError) {
      loggerDb(user_id, err.name);
    } else {
      loggerDb(user_id, 'Произошла ошибка');
      console.log(err);
    }
  });
}

var filterSession = function(user, task) {
  updateStateView(user._id, 'В работе');
  loggerDb(user._id, 'Фильтрация аудитории');
  fs.truncate(task.outputfile, 0, function(){ 
    loggerDb(user._id, 'Файл подготовлен'); 
  });

  if(user.proxy) { 
    setProxyFunc(user.proxy);
  }

  const device = new Client.Device(user.username);
  checkFolderExists(cookieDir);
  const storage = new Client.CookieFileStorage(cookieDir + user._id + ".json");
  var ses = Client.Session.create(device, storage, user.username, user.password);

  var iterator = 0;
  var promiseWhile = function(action) {
    var resolver = Promise.defer();
    var func = function(iterator) {
      if (iterator) {
        filterSessionUser(user._id, ses, task, task.input_array[iterator], function() {
          renderUserCompletedView(user._id, iterator+1, task.input_array.length);
        });
      }
      if (getStateView(user._id) == 'stop' || iterator >= task.input_array.length) { 
        deleteStopStateView(user._id);
        return resolver.resolve();
      }
      return Promise.cast(action())
        .then(func)
        .catch(resolver.reject);
    };
    process.nextTick(func);
    return resolver.promise;
  }
  promiseWhile(function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(iterator);
        iterator++;
      }, 3000);
    });
  }).then(function() {
    loggerDb(user._id, 'Фильтрация остановлена');
  }).catch(function (err) {
    console.log(err);
  });

}

function apiFilterAccounts(row) {
  if (row.type == 'user') {
    filterSession(row, row.task);
  } else if(row.type == 'task') {
    filterNoSession(row);
  }
}

function apiParseAccounts(user, task) {
  updateStateView(user._id, 'В работе');
  loggerDb(user._id, 'Парсинг аудитории');
  fs.truncate(task.outputfile, 0, function() { 
    loggerDb(user._id, 'Файл подготовлен'); 
  });
  var indicator = 0;
  
  if(user.proxy) { 
     setProxyFunc(user.proxy);
  }

  const device = new Client.Device(user.username);
  checkFolderExists(cookieDir);
  const storage = new Client.CookieFileStorage(cookieDir + user._id + ".json");
  var ses = Client.Session.create(device, storage, user.username, user.password);

  task.parsed_conc.forEach( function(conc_user) {
    ses.then(function(session) {
      return [session, Client.Account.searchForUser(session, conc_user)]   
    }).all()
    .then(function([session, account]) {
      var feed;
      if (task.parse_type == true) {
        feed = new Client.Feed.AccountFollowers(session, account.id);
      } else {
        feed = new Client.Feed.AccountFollowing(session, account.id);
      }
   
      var promiseWhile = function( action) {
      var resolver = Promise.defer();
      var indicator = 0;
      var func = function(results) {
        if (results) {
          results.forEach(function (item, i , arr) {
            if (indicator < task.max_limit * task.parsed_conc.length) {
              appendStringFile(task.outputfile, item._params.username);
              renderUserCompletedView(user._id, indicator + 1, task.max_limit * task.parsed_conc.length);
            }
            indicator++;
          });
        }
        if (getStateView(user._id) == 'stop' || indicator > task.max_limit) {
          deleteStopStateView(user._id);
          return resolver.resolve();
        }
        return Promise.cast(action())
          .then(func)
          .catch(resolver.reject);
        };
        process.nextTick(func);
        return resolver.promise;
      };

      promiseWhile(function() {
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve(feed.get());
          }, 2000);
        });
      }).then(function() {

        loggerDb(user._id, 'Парсинг остановлен');
      
      }).catch(function (err) {
        console.log(err);
      });
    }).catch(function (err) {
      if (err instanceof Client.Exceptions.APIError) {
        updateUserStatusDb(user._id, err.name);
      } else {
        // updateUserStatusDb(user._id, 'Произошла ошибка');
        console.log(err);
      }
    });
  });
}

function apiSessionCheck(user_id, username, password) { // add proxy
  const device = new Client.Device(username);
  checkFolderExists(cookieDir);
  const storage = new Client.CookieFileStorage(cookieDir + user_id + ".json");
  Client.Session.create(device, storage, username, password)
    .then(function(session) {
      Client.Session.login(session, username, password).then(function(result){
        updateUserStatusDb(user_id, 'Активен');
      }).catch(function (err) {
          if (err instanceof Client.Exceptions.APIError) {
            updateUserStatusDb(user_id, err.name);
            console.log(err);
          } else {
            updateUserStatusDb(user_id, 'Произошла ошибка');
            console.log(err);
          }
        });
      
  }).catch(function (err) {
    if (err instanceof Client.Exceptions.APIError) {
      updateUserStatusDb(user_id, err.name);
      console.log(err);
    } else {
      updateUserStatusDb(user_id, 'Произошла ошибка');
      console.log(err);
    }
  });
}
