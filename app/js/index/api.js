//////////////////////////////////
///////////// API ////////////////
//////////////////////////////////

'use strict';

var Client = require('./pinterest-api'); 
var fs = require('fs');
var path = require('path')
var Promise = require('bluebird');
var async = require('async');
var config = require('./config/default');
var softname = config.App.softname;
var _ = require('lodash');

var cookieDir = path.join(os.tmpdir(), softname, 'cookie');


function fullCreateAccount(session, cb) {

  var data1 = {
    'requests': '[' + JSON.stringify({
                        'method':'PUT',
                        'uri':'/v3/experiences/20006:30012/viewed/'
                    }) + ']'
  };
  var data2 = {
    'requests': '[{"method":"GET","uri":"/v3/users/config/invitability/feature_weights/","params":{"snapshot_key":"0"}},{"method":"GET","uri":"/v3/users/config/invitability/name_heuristics/","params":{"snapshot_key":"0"}},{"method":"GET","uri":"/v3/users/config/invitability/settings/","params":{"snapshot_key":"0"}}]'
  };
  var data3 = {
    'requests': "[" + JSON.stringify({
                       "method": "PUT",
                       "uri"   : "/v3/experiences/20006:30012/completed/"
                     }) + "]" 
  };
  var data4 = {
    'requests': '[{"method":"GET","uri":"/v3/experiences/","params":{"placement_ids":"20002"}}]' 
  };

  Client.Gatekeeper.experiments()
    .then(function(res) {
      return Client.Gatekeeper.activate('smartlock');
    })
    .then(function(res) {
      return Client.Gatekeeper.activate('ads_log_plain_mobile_advertiser_id');
    })
    .then(function(res) {
      return Client.Register.post(session, session.name, session.email, session.password) 
    })
    .then(function(res) {
      var access_token = res.data;
      session.setAuthorization(access_token);
      return [session, Client.Users.me(session)];
    })
    .spread(function(session, res) {
      return [session, Client.Users.state(session, 'LANDING_PAGE_PINS_INJECTED')  ]
    })
    .spread(function(session, res) {
      return [session, Client.Gatekeeper.activate('ads_log_plain_mobile_advertiser_id')];
    })
    .spread(function(session, res) {
      return [session, Client.Gatekeeper.experiments()];
    })
    .spread(function(session, res) {
      return [session, Client.Gatekeeper.activate('android_cgb')];
    })
    .spread(function(session, res) {
      return [session, Client.Users.me(session)];
    })
    .spread(function(session, res) {
      session.setUserId(res.data.id);
      return [session, Client.Users.meBoards(session)];
    })
    .spread(function(session, res) {
      return [session, Client.Experiences.get(session)];
    })
    .spread(function(session, res) {
      return [session, Client.Conversations.get(session)];
    })
    .spread(function(session, res) {
      return [session, Client.Gatekeeper.activate('android_hashtag_feed_v2')];
    })
    .spread(function(session, res) {
      return [session, Client.Gatekeeper.activate('android_aggregated_pins')];
    })
    .spread(function(session, res) {
      return [session, Client.Gatekeeper.activate('homefeed_tuner_android')];
    })
    .spread(function(session, res) {
      return [session, Client.Notifications.get(session)];
    })
    .spread(function(session, res) {
      return [session, Client.Feeds.home(session)];
    })
    .spread(function(session, res) {
      return [session, Client.Users.meInterests(session)];
    })
    .spread(function(session, res) {
      return [session, Client.Feeds.home(session)];
    })  
    .spread(function(session, res) {
      return [session, Client.Users.contactsSuggestions(session)];
    }) 
    .spread(function(session, res) {
      return [session, Client.Batch.post(session, data2)];
    }) 
    .spread(function(session, res) {
      return [session, Client.Orientation.signal(session)];
    }) 
    .spread(function(session, res) {
      return [session, Client.Orientation.signal(session)];
    }) 
    .spread(function(session, res) {
      return [session, Client.Users.interestsFavorited(session, session.id) ];
    })  
    .spread(function(session, res) {
      return [session, Client.Batch.post(session, data3) ];
    })
    .spread(function(session, res) {
      return [session, Client.Experiences.get(session) ];
    })
    .spread(function(session, res) {
      return [session, Client.Orientation.status(session) ];
    })
    .spread(function(session, res) {
      return [session, Client.Batch.post(session, data4) ];
    })
    .spread(function(session, res) {
      return [session, Client.Notifications.get(session) ];
    })
    .spread(function(session, res) {
      console.log(res);
      cb(session);
    })
}

function fastCreateAccount(session, cb) {
  Client.Register.post(session, session.name, session.email, session.password) 
  .then(function(res) {
    console.log(res);
    var access_token = res.data;
    session.setAuthorization(access_token);
    cb(session);
  })
  .catch(function(err) {
    console.log(err);
  })
}

function apiCreateAccounts(task) {
  mkdirFolder(logsDir)
  .then(function() {
    
    setStateView(task._id, 'run');
    loggerDb(task._id, 'Регистрация аккаунтов');
    setCompleteView(task._id, 0);
    const NAMES = require('./config/names').names;
    const SURNAMES = require('./config/names').surnames;
    var Session = require('./pinterest-api/api/session');
   
    var proxy_array = fs.readFileSync(task.proxy_file, 'utf8').split('\n').filter(isEmpty).filter(validateProxyString); // check

    var email_array = [];

    if (!task.own_emails) {
      for(var i = 0; i < task.emails_cnt; i++) {
        var name = SURNAMES[Math.floor(Math.random() * SURNAMES.length)] + NAMES[Math.floor(Math.random() * SURNAMES.length)];
        email_array.push(name + 'llman@mailglobals.co');
      }
    } else {
      email_array = task.email_parsed;
    }

    if(!proxy_array || email_array.length == 0) {
      console.log("empty");
      return;
    }

    var chunked = _.chunk(email_array, proxy_array.length);
    _.object = function(list, values) {
      if (list == null) return {};
      var result = {};
      for (var i = 0, l = list.length; i < l; i++) {
        if (values) {
          result[list[i]] = values[i];
        } else {
          result[list[i][0]] = list[i][1];
        }
      }
      return result;
    };
    
    var promiseWhile = function( action, email_tuple) {
      var resolver = Promise.defer();
      var indicator = 0;
      var i = 0;
      var func = function(results) {
        
        async.mapValues(_.object(email_tuple[i], proxy_array), function (proxy, email, callback) {
          if(config.App.devTools == false) {
            setProxyFunc(proxy);
          }
          var storage = path.join(cookieDir, email + '.json')
          fs.closeSync(fs.openSync(storage, 'w') );
          var session = new Session(storage);
          var password = generatePassword(); 
          var name = email.split("@")[0];

          session.setName(name);
          session.setEmail(email);
          session.setPassword(password);

          fastCreateAccount(session, function(session) {
            appendStringFile(task.output_file, session.email + "|" + session.name + "|" + session.password);
            renderTaskCompletedView(task._id);
            callback();
             
          });
        }, function(err, result) {
          console.log("DONE!");
        });

        i++;
        if(getStateView(task._id) == 'stop' || i > email_tuple.length -1) {
          return resolver.resolve(); 
        }
        return Promise.cast(action(email_tuple))
          .then(func)
          .catch(resolver.reject);
      };
      process.nextTick(func);
      return resolver.promise;
    };

    var actionFunc = function() {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(chunked);
        }, task.reg_timeout * 1000);
      });
    };
    promiseWhile(actionFunc, chunked)
      .then(function() {
        setStateView(task._id, 'stopped');
        loggerDb(task._id, 'Регистрация остановлена');  
      }).catch(function (err) {
        console.log(err);
      });
  })
}


function apiSessionCheck(user_id, username, password, proxy) {
 mkdirFolder(cookieDir)
  .then(function() {

    setStateView(user_id, 'run');
    loggerDb(user_id, 'Выполняется логин');
    var cookiePath = path.join(cookieDir, user_id + ".json");
    createFile(cookiePath);

    if(_.isString(proxy) && !_.isEmpty(proxy)) {
      setProxyFunc(proxy); //session proxy
    }

    Client.Session.create(cookiePath, username, password) // check for created file
      .then(function (session) {
        updateUserStatusDb(user_id, 'Активен');
        setStateView(user_id, 'stopped');
      }).catch(function (err) {
        setStateView(user_id, 'stopped');
        if (err instanceof Client.Exceptions.APIError) {
          updateUserStatusDb(user_id, err.name);
          console.log(err);
        } else {
          updateUserStatusDb(user_id, 'Произошла ошибка');
          console.log(err);
        }
      });
  })
  .catch(function(err) {
    setStateView(user_id, 'stopped');
    console.log(err);
  })

}