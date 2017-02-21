var _ = require('lodash');
var Promise = require('bluebird');
var request = require('request-promise');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function Request(session) {
  this._id = _.uniqueId();
  this._jar = null;
  this._url = null;
  this._signData = false;
  this._request = {};
  this._request.method = 'GET';
  this._request.data = {};
  this._request.bodyType = 'formData';
  this._request.options = {
    gzip: true 
  };
  this._request.headers = Request.defaultHeaders;
  this.attemps = 2;
  if(session) {
    this.session = session;         
  }
  this._initialize.apply(this, arguments);    
  this._transform = function(t) { return t };
}

module.exports = Request;

var Constants = require('./constants');
var Helpers = require('../helpers');
var routes = require('./routes');
var Session = require('./session');

Request.defaultHeaders = {
  'Connection': 'Keep-Alive',
  'X-Pinterest-AppState': 'background',
  'Accept-Language': 'en_US',
  'Authorization': '', 
  'X-Pinterest-App-Type': 3,
  'X-Pinterest-InstallId': Helpers.generateInstallId(),
  'X-Pinterest-Device-Class': Constants.CLIENT.DEVICE_CLASS,
  'X-Pinterest-Device-HardwareId': Helpers.generateDeviceId(), 
  'X-Pinterest-Device': Constants.CLIENT.DEVICE
};

Request.requestClient = request.defaults({});

Object.defineProperty(Request.prototype, "session", {
  get: function() { 
    return this._session 
  },
  set: function(session) {
    this.setSession(session);    
  }
});

Request.prototype.setOptions = function(options, override) {
  this._request.options = override ? 
    _.extend(this._request.options, options || {}) :
    _.defaults(this._request.options, options || {});
  return this;
};

Request.prototype.setAuthorization = function(token) {
  this.removeHeader('Authorization')
  this.setHeaders({
    'Authorization': 'Bearer ' + token
  })
  return this;
};

Request.prototype.setSession = function(session) {
  if(!(session instanceof Session))
    throw new Error("`session` parametr must be instance of `Session`")
  this._session = session;
  if(session.Authorization) {
    this.setAuthorization(session.Authorization);
  }
  this.setOptions({
    jar: session.jar
  });
  return this;
};

Request.prototype.setHeaders = function(headers) {
  this._request.headers = _.extend(this._request.headers, headers || {});
  return this;
};

Request.prototype.removeHeader = function(name) {
  delete this._request.headers[name];
  return this;
};

Request.prototype.setMethod = function(method) {
  method = method.toUpperCase();
  if(!_.includes(['POST', 'GET', 'PATCH', 'PUT', 'DELETE'], method))
    throw new Error("Method `" + method + "` is not valid method");
  this._request.method = method;
  return this;
};

Request.prototype.setData = function(data, override) {
  if(_.isEmpty(data)){
    this._request.data = {};
    return this;
  }
  if(_.isString(data)) {
    this._request.data = data;
    return this;
  }
  _.each(data, function(val, key) {
    data[key] = val && val.toString && !_.isObject(val) ? val.toString() : val;
  })
  this._request.data = override ? data : _.extend(this._request.data, data || {});
  return this;
};

Request.prototype.setUrl = function(url) {
  // if(!_.isString(url) || !Helpers.isValidUrl(url))
    // throw new Error("The `url` parametr must be valid url string");
  this._url = url;
  return this;
};

Request.prototype.setResourceSigned = function(resource, data ) {
  this._resource = resource;
  var endpoint = routes.getUrl(resource, data);
  var signedEndpoint = Helpers.buildSignedUrl(endpoint, this._request.data, this._request.method);
  this.setUrl(signedEndpoint);
  return this;
};

Request.prototype.setResource = function(resource, data) {
  this._resource = resource;
  var endpoint = routes.getUrl(resource, data);
  this.setUrl(endpoint);
  return this;
};

Request.prototype.beforeParse = function (response, request, attemps) {
    return response;
}

Request.prototype.send = function(options, attemps) {
  var that = this;
  if (!attemps) attemps = 0;
  return this._mergeOptions(options)
    .then(function(opts) {
      return [opts, that._prepareData()];    
    })
    .spread(function(opts, data){
      opts = _.defaults(opts, data);
      return that._transform(opts);
    })
    .then(function(opts) { 
      options = opts;
      return [Request.requestClient(options), options, attemps]
    })
    .spread(_.bind(this.beforeParse, this))
    .then(_.bind(this.parseMiddleware, this))
    .then(function (response) {
      return response;
    })
    .catch(function(error) {
      console.log(error);
    })
}

Request.prototype._initialize = function() {
  // Easier for inheritence
};

Request.prototype.afterError = function (error, request, attemps) {
  throw error;
}

Request.prototype._mergeOptions = function(options) {
  var options = _.defaults({
    jar: this._jar, // new
    method: this._request.method,
    url: this._url,
    resolveWithFullResponse: true,
    headers: this._request.headers
  }, options || {}, this._request.options);
  return Promise.resolve(options);
};

Request.prototype._prepareData = function() {
  var that = this;
  return new Promise(function(resolve, reject){
    if(that._request.method == 'GET') 
      return resolve({})
    if(that._signData) {
      that.signData().then(function(data){
        var obj = {};
        obj[that._request.bodyType] = data;
        resolve(obj);
      }, reject)
    } else {
      var obj = {};
      obj[that._request.bodyType] = that._request.data;
      resolve(obj);
    }  
  })    
};

Request.prototype.parseMiddleware = function (response) {
  response.body = JSON.parse(response.body);
  return response;
};
