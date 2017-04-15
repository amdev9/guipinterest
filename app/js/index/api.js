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
var softDir = softname.replace(/ /g, "");
var cookieDir = path.join(os.tmpdir(), softDir , 'cookie');


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
    .catch(function(err) {
      console.log(err);
      if (err instanceof Client.Exceptions.APIError) {
        loggerDb(task._id, 'Ошибка при регистрации ' + email + ' ' + proxy + ': ' + err.message);
      } else {
        loggerDb(task._id, 'Ошибка при регистрации ' + email + ' ' + proxy + ': ' + err.message);
      }
    })

}

function fastCreateAccount(session, cb) {

  Client.Register.post(session, session.name, session.email, session.password) 
  .then(function(res) {

    console.log('res', res);
    var access_token = res.data;
    session.setAuthorization(access_token);
    cb(session);
  })
  .catch(function(err) {
    console.log(err);
    if (err instanceof Client.Exceptions.APIError) {
      loggerDb(task._id, 'Ошибка при регистрации ' + email + ' ' + proxy + ': ' + err.message);
    } else {
      loggerDb(task._id, 'Ошибка при регистрации ' + email + ' ' + proxy + ': ' + err.message);
    }
  })
}

function lastBoardId(array) {
  array.sort(function(a,b) {
    return Date.parse(b.created_at) - Date.parse(a.created_at);
  });
  return array[0];
}

function repin(user_id, ses, task, pinId, cb) {
  var board_id;
  ses
  // .then(function(session) {
  //   if (task.last_board) {
  //     return [session, Client.Users.meBoards(session)] 
  //   } else {
  //     var boardName = task.board_names[Math.floor(Math.random() * task.board_names.length)];
  //     return [session, Client.Boards.add(session, boardName)]
  //   }
  // })
  .spread(function(session, res) {
    if (task.last_board) {
      var arr = [];
      res.data.forEach(function(item, i, aa) {
        arr.push (item);
        if (i == aa.length - 1) {
          board_id = lastBoardId(arr).id 
        }
      })
    } else {
      board_id = res.data.id
    }
    return [session, Client.Users.boardPickerShortlist(session, pinId)]
  })
  .spread(function(session, res) {
    return [session, Client.Pins.get(session, pinId)]
  })
  .spread(function(session, res) {

    var image_signature = res.data.image_signature;
    var closeup_user_note = res.data.closeup_user_note;
    var aggregatedpindata_id = res.data.aggregated_pin_data.id;
    var data = {
      'requests': "[" + JSON.stringify({
        "method": "POST",
        "uri"   : "/v3/pins/" + pinId + "/repin/",
        "params": {
          "image_signature": image_signature,
          "share_twitter": "0",
          "board_id": board_id,
          "description": closeup_user_note
        }
      }) + "]" 
    }
    return [session, Client.Batch.post(session, data)]
  })
  .spread(function(session, res) {
    if (res.status == 'success' && res.message == 'ok') {
      cb(true);
    }
  })
  .catch(function (err) {
    console.log(err)
    if (err instanceof Client.Exceptions.APIError && err.name != 'NotFoundError') {
      setCompleteView(user_id, err.ui)
      cb(err);
    } else {
      cb(false);  
    }
  });
}

function apiParseUser(id) {


// Interests.get(session, id) 
// Interests.related(session, id)  
// Interests.feed(session, id)  


  // public function interests_feed($id, $redis) 
  // {
  //   $hget = $redis->hget ("feed_bookmark", $id );
   
  //   if ($hget) {
  //      $params = [
  //       "page_size"=> 25,
  //       "fields"=> "interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[75x75,150x150(ir.12),150x150(ir.24),150x150(ir.48),300x300(ir.24),300x300(ir.48),600x,236x],interest.is_followed",
  //       "bookmark"=> $hget,
  //       ];
  //   }
  //   else {
  //      $params = [
  //       "page_size"=> 25,
  //       "fields"=> "interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[75x75,150x150(ir.12),150x150(ir.24),150x150(ir.48),300x300(ir.24),300x300(ir.48),600x,236x],interest.is_followed",
  //       ];
  //   }
  //   $endpoint = Constants::API_URL.'v3/interests/'.$id.'/?'.$this->toStringer($params);    // ------------ interests_id_params
  //   $response = $this->request($endpoint , null , "GET");


  // //--------


  //     $params = [
  //       "limit"=>25,
  //       "fields"=>"interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[236x],interest.is_followed,interest.recommendation_source,interest.image_signature",
  //   ];

  //   $endpoint = Constants::API_URL.'v3/interests/'.$id.'/related/?'.$this->toStringer($params); // ---------- interests_related
  //   $response = $this->request($endpoint , null , "GET");

  //   ///------
   
  //   $params = [

  //       "page_size" =>25,
  //       "fields" => "pin.images[236x,736x,236x,236x,736x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.privacy,board.conversation(),conversation.id,pin.cinematic_data[45x45,200x,1200x],board.image_thumbnail_url,user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,pin.liked_by_me,pin.dominant_color,pin.rich_summary(),pin.embed(),pin.promoter(),pin.is_promoted,pin.is_downstream_promotion,pin.recommendation_reason,pin.additional_hide_reasons,pin.is_cinematic,pin.board(),pin.pinner(),pin.source_interest(),pin.is_video,pin.ad_match_reason,interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[75x75,150x150(ir.12),150x150(ir.24),150x150(ir.48),300x300(ir.24),300x300(ir.48),600x,236x],pin.aggregated_pin_data(),aggregatedpindata.aggregated_stats,aggregatedpindata.id,pin.edited_fields,pin.grid_description,board.image_cover_url,pin.videos(),video.id,video.video_list[V_HLSV4],pin.is_eligible_for_web_closeup,pin.ad_closeup_behaviors,pin.ad_destination_url,pin.image_signature,pin.place_summary()",

  //   ];

  //   $endpoint = Constants::API_URL.'v3/interests/'.$id.'/feed/?'.$this->toStringer($params);  // --------- interests_feed
  //   $response = $this->request($endpoint , null , "GET");

  //   // if ( $response[1]['status'] == "success" ) {
  //   //   if (isset($response[1]['bookmark'])) {
  //   //     echo $response[1]['bookmark'];
  //   //    // $this->redis->hdel ("parse_info", $id );
  //   //     // $this->redis->hset("parse_info", $id , $response[1]['bookmark'] );
  //   //   } else {
    
  //   //     $redis->lrem("user_to_parse", $id );
  //   //   }
  //   // }

  //   return  $response;


  // }



}



function apiRepin(user, task, token) {

  mkdirFolder(logsDir)
  .then(function() {
    setStateView(user._id, 'run');
    var iterator = 0;
    var filterSuccess = 0;
    var cookiePath = path.join(cookieDir, user._id + '.json');
    var pin_array = fs.readFileSync(task.pin_file, 'utf8').replace(/ /g, "").split(/\r\n|\r|\n/).filter(isEmpty);
    Client.Request.setToken(token)
    var ses = Client.Session.create(cookiePath, user.username, user.password, returnProxyFunc(user.proxy))
      .then(function(session) {
        if (task.last_board) {
          return [session, Client.Users.meBoards(session)] 
        } else {
          var boardName = task.board_names[Math.floor(Math.random() * task.board_names.length)];
          return [session, Client.Boards.add(session, boardName)]
        }
      })

    fs.closeSync(fs.openSync(cookiePath, 'w')); // createFile(cookiePath);
    var promiseWhile = function(action) {
      return new Promise(function(resolve, reject) {
        var func = function(iterator) {

          if (iterator > pin_array.length || getStateView(user._id) == 'stop' || getStateView(user._id) == 'stopped' ) {
            return reject(new Error("stop"));
          }

          if (pin_array[iterator]) {
            repin(user._id, ses, task, pin_array[iterator], function(success) {
              if(success === true) {
                filterSuccess += 1;
              } else if (success instanceof Client.Exceptions.APIError) {
                console.log('succ', success.name)
                return reject(new Error("stop"));
              }
              renderUserCompletedView(user._id, pin_array.length, iterator + 1, filterSuccess); 
            });
          }
          
          return Promise.resolve(action())
          .then(func)
          .catch(function() {
            reject();
          });
        }
        process.nextTick(func)
      })
    }
    promiseWhile(function() {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(iterator);
          iterator++;
        }, 2000);
      });
    })
    .catch(function (err) {
      if(err.message == 'stop') {
        console.log('stopped')
        loggerDb(user._id, 'Репинниг остановлен');
        setStateView(user._id, 'stopped');
      } else {
        console.log(err.message);
      }
    });
  })
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function apiCreateAccounts(task, token) {
  mkdirFolder(logsDir)
  .then(function() {
    mkdirFolder(cookieDir)
  })
  .then(function() {

    setStateView(task._id, 'run');
    loggerDb(task._id, 'Регистрация аккаунтов');
    setCompleteView(task._id, 0);

    Client.Request.setToken(token)
    
    const NAMES = require('./config/names').names;
    const SURNAMES = require('./config/names').surnames;
    var Session = require('./pinterest-api/api/session');
   
    var proxy_array = fs.readFileSync(task.proxy_file, 'utf8')  // FIX readFileSync
    proxy_array = proxy_array.replace(/ /g, "").split(/\r\n|\r|\n/).filter(isEmpty).filter(validateProxyString);
    console.log(proxy_array)

    var email_array = [];

    if (!task.own_emails) {
      for(var i = 0; i < task.emails_cnt; i++) {
        var name = SURNAMES[Math.floor(Math.random() * SURNAMES.length)] + NAMES[Math.floor(Math.random() * SURNAMES.length)];
        email_array.push(name + getRandomInt(1000, 9999999) + '@gmail.com');
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
    

    console.log(chunked)

    // async.forEach(task.partitions, function (taskpart, callback) {

    var promiseWhile = function( action, email_tuple) {
      console.log(email_tuple)
      var resolver = Promise.defer();
      var indicator = 0;
      var i = 0;
      var func = function(results) {
        

        async.mapValues(_.object(email_tuple[i], proxy_array), function (proxy, email, callback) {


          console.log(email, proxy)
          var storage = path.join(cookieDir, email + '.json')

          fs.appendFile(storage, '', (err) => {
            if (err) throw err;
            
            var session = new Session(storage, returnProxyFunc(proxy) );
            var password = generatePassword(); 
            var name = email.split("@")[0];

            session.setName(name);
            session.setEmail(email);
            session.setPassword(password);
   
            
            if(task.fast_create) {
              fastCreateAccount(session, function(session) {
                appendStringFile(task.output_file, session.email + "|" + session.password + "|" + proxy); 
                renderTaskCompletedView(task._id);
                callback();
              });
            } else {
              fullCreateAccount(session, function(session) {
                appendStringFile(task.output_file, session.email + "|" + session.password + "|" + proxy); 
                renderTaskCompletedView(task._id);
                callback();
              });
            }
          })
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

function apiSessionCheck(user_id, username, password, proxy, token) {
 mkdirFolder(cookieDir)
  .then(function() {
    setStateView(user_id, 'run');
    loggerDb(user_id, 'Выполняется логин');
    var cookiePath = path.join(cookieDir, user_id + ".json");
    fs.closeSync(fs.openSync(cookiePath, 'w')); // createFile(cookiePath);
    Client.Request.setToken(token)
    Client.Session.create(cookiePath, username, password, returnProxyFunc(proxy) ) // check for created file
      .then(function (session) {
        updateUserStatusDb(user_id, 'Активен');
        setStateView(user_id, 'stopped');
      }).catch(function (err) {
          setStateView(user_id, 'stopped');
          if (err instanceof Client.Exceptions.APIError) {
            if(err.ui) {
              updateUserStatusDb(user_id, err.ui); 
            } else if (err.name == 'RequestCancel') {
              
            } else {
              updateUserStatusDb(user_id, err.name);
            }
          } else if (err.message == 'stop') {

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
