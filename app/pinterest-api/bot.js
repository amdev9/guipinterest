var _ = require('lodash')
var pin = require("./index")

var Session = require('./api/session')
var Request = require('./api/request');
var storage = 'cookie.json'
var session = new Session(storage);

function generatePassword() {
  return Math.random().toString(36).slice(-8).toUpperCase();
}

// pin.Request.setProxy(`http://1.1.1.1:3333`); 
pin.Session.create('cookie.json', 'blackkorol@gmail.com', 'qweqwe123')
.then(function (session) {
  return session;
})
.then(function (session) {
  return pin.Categories.get(session);
})
.then(function (session) {
  console.log(session);
})





// const NAMES = require('../app/config/names').names;
// const SURNAMES = require('../app/config/names').surnames;

// var name = SURNAMES[Math.floor(Math.random() * SURNAMES.length)] + NAMES[Math.floor(Math.random() * SURNAMES.length)];
// var email = name + 'llman@mailglobals.co';
// var password = generatePassword();

// console.log(name, email, password)

// var storage = 'cookie.json'
// var session = new Session(storage);
// pin.Register.post(session, 'Angealaiaaze', 'Angealizeapaaullman@mailglobals.co', 'C4MSCZJO') 
// .then(function(res) {
//   console.log(res);
// })

// .spread(function(session, res) {
//   // console.log(res.body);  
//   return [session, pin.Interests.get (session, 'womens_fashion')]; 
// })
// .spread(function(session, res) {
//   return [session, pin.Interests.get(session, 'womens_fashion')]; 
// })
// // .spread(function(session, res) {
//   // var boardname = "Weight Loss Guide 4";
//   // return [session, pin.Boards.add(session,boardname)];
// // })
// // .spread(function(session, res) {
// //   return [session, pin.Boards.edit(session,res.body.data.id, 'descript', 'womens_fashion', 'Weight Loss Guide 5')];
// // })
// .spread(function(session, res) {

//   return [session, pin.Users.meBoards(session)];
// })
// .spread(function(session, res) {

//   console.log(res);
//   // repin
//   // var pin_id = '';
//   // var image_signature = '';
//   // var board_id = '';
//   // var closeup_user_note = '';
//   // var jsondata = '{"method":"POST","uri":"/v3/pins/' + pin_id + '/repin/","params":{"image_signature":"' + image_signature + '","share_twitter":"0","board_id":"' + board_id + '","description":"' + closeup_user_note + '"}}';
//   // var data5 = {
//   //   'requests': "[" + jsondata + "]"
//   // };
// })
 

 


