var _ = require('lodash')
var pin = require("./index")

pin.Session.create('cookies.json', 'blackkorol@gmail.com', 'qweqwe123')
.then(function (session) {
  return session;
})
.then(function (session) {
  return [session, pin.Categories.get(session)];
})
.spread(function(session, res) {
  // console.log(res.body);  
  return [session, pin.Interests.get (session, 'womens_fashion')]; 
})
.spread(function(session, res) {
  return [session, pin.Interests.get(session, 'womens_fashion')]; 
})
// .spread(function(session, res) {
  // var boardname = "Weight Loss Guide 4";
  // return [session, pin.Boards.add(session,boardname)];
// })
// .spread(function(session, res) {
//   return [session, pin.Boards.edit(session,res.body.data.id, 'descript', 'womens_fashion', 'Weight Loss Guide 5')];
// })
.spread(function(session, res) {

  return [session, pin.Users.meBoards(session)];
})
.spread(function(session, res) {

  console.log(res);
  // repin
  // var pin_id = '';
  // var image_signature = '';
  // var board_id = '';
  // var closeup_user_note = '';
  // var jsondata = '{"method":"POST","uri":"/v3/pins/' + pin_id + '/repin/","params":{"image_signature":"' + image_signature + '","share_twitter":"0","board_id":"' + board_id + '","description":"' + closeup_user_note + '"}}';
  // var data5 = {
  //   'requests': "[" + jsondata + "]"
  // };

//  $this->repin('623607879622624899', $board_id);  
//  $this->repin('459859811936415997', $board_id);  
//  $this->repin('459859811936415983', $board_id);  
//  $this->repin('459859811936415967', $board_id);  
//  $this->repin('459859811936415918', $board_id);  
//  $this->repin('459859811936415897', $board_id);  
//  $this->repin('459859811936415822', $board_id); 

})
 

 


