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

Object.defineProperty(Session.prototype, "id", {
  get: function() { return this._id },
  set: function(val) {}
});

Object.defineProperty(Session.prototype, "name", {
  get: function() { return this._name },
  set: function(val) {}
});

Object.defineProperty(Session.prototype, "email", {
  get: function() { return this._email },
  set: function(val) {}
});

Object.defineProperty(Session.prototype, "password", {
  get: function() { return this._password },
  set: function(val) {}
});

Object.defineProperty(Session.prototype, "Authorization", {
  get: function() {   
    return this._Authorization;
  },
  set: function(val) {}
});

Session.prototype.setName = function(name) {
  this._name = name;
  return this;
};

Session.prototype.setPassword = function(password) {
  this._password = password;
  return this;
};

Session.prototype.setEmail = function(email) {
  this._email = email;
  return this;
};

Session.prototype.setUserId = function(id) {
  this._id = id;
  return this;
};

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
      var access_token = res.data.access_token;
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
