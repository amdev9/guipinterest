var util = require('util');
var FileCookieStore = require('tough-cookie-filestore'); 
var Resource = require('./resource');
var Request = require('./request');
var request = require('request-promise');

function Session(storage) {
  this.setCookiesStorage(storage);
}

util.inherits(Session, Resource);
module.exports = Session;

Object.defineProperty(Session.prototype, "jar", {
  get: function() { return this._jar },
  set: function(val) {}
});

Object.defineProperty(Session.prototype, "Authorization", {
  get: function() {   
    return this._Authorization;
  },
  set: function(val) {}
});

Session.prototype.setCookiesStorage = function(storage) {
  this._jar = request.jar(new FileCookieStore(storage)); 
  return this;
};

Session.prototype.setAuthorization = function(token) {
  this._Authorization = token;
  return this;
};

Session.login = function(session, email, password) {
  return new Request(session) 
    .setMethod('POST')
    .setData({
      "password": password,
      "username_or_email": email
    })
    .setResourceSigned('login')
    .send()
    .catch(function(error) {
      throw error;
    })
    .then(function(res) {
      var access_token = res.body.data.access_token;
      session.setAuthorization(access_token);
      return session;
    })
    .catch(function(error) {
      console.log(error);
    })
}

Session.create = function(storage, email, password) {
  var that = this;
  var session = new Session(storage);
  return Session.login(session, email, password);
}
