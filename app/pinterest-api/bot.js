var _ = require('lodash')
var pin = require("./index")

var Session = require('./api/session')
var Request = require('./api/request');
var storage = 'cookie.json'
var session = new Session(storage);

function generatePassword() {
  return Math.random().toString(36).slice(-8).toUpperCase();
}

var token = {};
var pinId = '99782947965079223';
var board_id = '459859880640556506';
// pin.Request.setProxy(`http://192.196.1.33:80`); 
 
var promise = pin.Gatekeeper.experiments()
.then(function(res) {
  return pin.Session.create('cookie.json', 'blackkorol@gmail.com', 'qweqwe123')
})
// 1
// .then(function(session) {
//   return [session, pin.Boards.add(session, 'superttt')]
// })
.then(function(session) {
  return [session, pin.Users.meBoards(session)] 
})
.spread(function(session, res) {
  return [session, pin.Users.boardPickerShortlist(session, pinId)]
})
.spread(function(session, res) {
  return [session, pin.Pins.get(session, pinId)]
})
.spread(function(session, res) {

  var image_signature = res.data.image_signature;
  var closeup_user_note = res.data.closeup_user_note;
  var aggregatedpindata_id = res.data.aggregated_pin_data.id;

  var data = {
    'requests': "[" + JSON.stringify({
      "method": "POST",
      "uri"   : "/v3/pins/"+ pinId +"/repin/",
      "params": {
        "image_signature": image_signature,
        "share_twitter": "0",
        "board_id": board_id,
        "description": closeup_user_note
      }
    }) + "]" 
  }
  return [session, pin.Batch.post(session, data)]
})





// .then(function(session) {
 
//   return [session, pin.Interests.get (session, 'womens_fashion')]; 
// })
// .spread(function(session, res) {
//   console.log(res);  
//   return [session, pin.Interests.get(session, 'womens_fashion')]; 
// })
// .catch(function(err) {
//     console.log(err.message);
// })

// setTimeout(function() {
//   if (typeof token.cancel === "function") { 
//     token.cancel()
//   }
// }, 5)




