var _ = require('lodash');
var async = require('async')
var Promise = require('bluebird')

var email_array = [10,13,19,11,12,15,16];
var proxy_array = [3,2,1];

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

// var i = 0;
// async.forEach( chunked, function(email_arr, callback) {
//   i++;
 
//   setTimeout(function() {
//     async.mapValues(_.object(email_arr, proxy_array), function (proxy, email, callback) {
//       console.log(proxy + "->" + email)      
//        callback('err')
//     }, function(err, result) {  
//       console.log("DONE!");

//     });
//   }, i * 1000)
// });


var promiseWhile = function( action, param) {
  var resolver = Promise.defer();
  var indicator = 0;
  var i = 0;
  var func = function(results) {
    async.mapValues(_.object(param[i], proxy_array), function (proxy, email, callback) {
      console.log(proxy + "->" + email)      
       callback()
    }, function(err, result) {  
      console.log("DONE!");
    });

    i++;
    if (getStateView(task._id) == 'stop' || i > param.length -1) {
      return resolver.resolve(); 
    }
    return Promise.cast(action(param))
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
    }, 2000);
  });
};

 
promiseWhile(actionFunc, chunked);


// const EventEmitter = require('events');
// const ee = new EventEmitter();

// setTimeout(() => {
//   // This will crash the process because no 'error' event
//   // handler has been added.
//   ee.emit('error', new Error('This will crash'));
//   console.log("asd");
// }, 1000);

// ee.on('error', function(err) {
//   console.log( "Поймал: " + err );
// });


// Or, with named functions:
// async.waterfall([
//   myFirstFunction,
//   mySecondFunction,
//   myLastFunction,
// ], function (err, result) {
//   console.log(err);
// });

// function myFirstFunction(callback) {
//   callback(null, 'one', 'two');
// }
// function mySecondFunction(arg1, arg2, callback) {
//   // arg1 now equals 'one' and arg2 now equals 'two'
//   callback(null, 'three');
// }
// function myLastFunction(arg1, callback) {
//   // arg1 now equals 'three'
//   callback(null, 'done');
// }


// const net = require('net');
// const connection = net.connect('localhost');

// // Adding an 'error' event handler to a stream:
// connection.on('error', (err) => {
//   // If the connection is reset by the server, or if it can't
//   // connect at all, or on any sort of error encountered by
//   // the connection, the error will be sent here.
//   console.error(err);
// });

// connection.pipe(process.stdout);




// function readData() {
//   var data = '{ "name": "Вася", "age": 30 }';

//   try {
 
//     var user = JSON.parse(data);
//     if (!user.name) {
//       throw new SyntaxError("Ошибка в данных");
//     }
//     console.log(user.name);
//     blabla(); // ошибка!
//   } catch (e) {
//     // ...
//     if (e.name != 'SyntaxError') {
//       throw e; // пробрасываем
//     }
//   }
// }

// try {
//   readData();
// } catch (e) {
//   console.log( "Поймал во внешнем catch: " + e ); // ловим
// }

