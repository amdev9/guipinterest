var async = require('async')
var _ = require('lodash')

var proxy_array = [1,2,3,4,5];
var email_array = [7,8,9];// ,10,11,12,13,14,15,16,17,18,20,21,22,23

// async.forEach(email_array, function(email, callback) {
//   async.forEach(proxy_array, function(proxy, callback) {
    
//     console.log(email + " -> " + proxy);
//     callback();

//   }, function(err) {
//     console.log("proxy done");
//   })    
// },
// function(err) {
//   console.log("email done");
// })

var obj = {}
email_array.forEach(function(value, index) {
  if(index < proxy_array.length) {
    obj[value] = proxy_array[index];
  } else {
    var a = Math.floor(index/proxy_array.length);
    var new_inde = (index - a*proxy_array.length);
    obj[value] = proxy_array[new_inde];
  }
});
 
async.mapValues(obj, function (file, key, callback) {
  console.log(file + " -> " + key);
  callback();
}, function(err, result) {
  console.log("done");
});
