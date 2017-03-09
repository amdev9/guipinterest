var util = require('util');
var FileCookieStore = require('tough-cookie-filestore'); 
var Resource = require('./resource');
var Request = require('./request');
var request = require('request-promise');
var Exceptions = require('./exceptions')

class Session {
  constructor(storage) {
    this.setCookiesStorage(storage);
  }

  get jar() { return this._jar }
  set jar(val) {}

  get id() { return this._id }
  set id(val) {}

  get name() { return this._name }
  set name(val) {}
 
  get email() { return this._email }
  set email(val) {}
  
  get password() { return this._password }
  set password(val) {}
 
  get Authorization() {   
    return this._Authorization;
  }
  set Authorization(val) {}
 
  setName(name) {
    this._name = name;
    return this;
  }

  setPassword(password) {
    this._password = password;
    return this;
  };

  setEmail(email) {
    this._email = email;
    return this;
  };

  setUserId(id) {
    this._id = id;
    return this;
  };
  
  setCookiesStorage(storage) {
    this._jar = request.jar(new FileCookieStore(storage)); 
    return this;
  };

  setAuthorization(token) {
    this._Authorization = token;
    return this;
  };

  static login(session, email, password) {
    
    return new Request(session) 
    .setMethod('POST')
    .setData({
      "password": password,
      "username_or_email": email
    })
    .setResourceSigned('login')
    .send()
    .catch(function (error) {
      if (error.name == "RequestError" && 
       _.isString(error.json.message) && 
          error.json.message.toLowerCase().indexOf('entered is incorrect') !== -1) {
        throw new Exceptions.AuthenticationError(error.json.message);
      }
      throw error;
    })
    .then(function(res) {
      var access_token = res.data.access_token;
      session.setAuthorization(access_token);
      return session;
    })
  }

  static create(storage, email, password) { 
    var that = this;
    var session = new Session(storage);
    return Session.login(session, email, password); 
  }
}

module.exports = Session;



