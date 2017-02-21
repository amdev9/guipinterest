const querystring = require('querystring');

function Boards() {}
module.exports = Boards;

var Request = require('../request');

Boards.add = function(session, board_name) {
  var data = {
    "description": "",
    "name": board_name,
    "privacy": "public",
    "collaborator_invites_enabled": true,
  };
  return new Request(session)
    .setMethod('PUT')
    .setData(data)
    .setResource('boards')
    .send();
}

Boards.edit = function(session, id, text, category, board_name) {
  var data = {
    "category": category,
    "description": text,
    "name": board_name,
    "privacy": "public",
    "collaborator_invites_enabled": true
  };
  return new Request(session)
    .setMethod('POST')
    .setData(data)
    .setResource('boards_id', { 
      id: id 
    })
    .send();
}

Boards.follow = function(session, id) {
  return new Request(session)
    .setMethod('PUT')
    .setResource('boards_follow', { 
      id: id 
    })
    .send();
}

Boards.share = function(session, id) {
  var data = {
    "message": text,
    "user": username
  }
  return new Request(session)
    .setMethod('PUT')
    .setData(data)
    .setResourceSigned('boards_share', { 
      id: id 
    })
    .send();
}


