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
// pin.Request.setProxy(`http://192.196.1.33:80`); 
pin.Request.setStopToken(token);
var promise = pin.Gatekeeper.experiments()
.then(function(res) {
  return pin.Session.create('cookie.json', 'blackkorol@gmail.com', 'qweqwe123')
})
.then(function(session) {
  console.log(session)
  return session;
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
// }, 65)




