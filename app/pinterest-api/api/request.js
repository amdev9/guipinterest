var _ = require('lodash');
var Promise = require('bluebird');
var request = require('request-promise');
var concat = require('concat-stream')
var Exceptions = require('./exceptions')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

class Request {

  constructor(session) {
    this._id = _.uniqueId();
    this._url = null;
    this._signData = false;
    this._request = {};
    this._request.method = 'GET';
    this._request.data = {};
    this._request.bodyType = 'formData';
    this._request.options = {
      gzip: true 
    };
    this._request.headers = {
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
    this.attemps = 2;
    if(session) {
      this.session = session;         
    }
    this._initialize.apply(this, arguments);    
    this._transform = function(t) { return t };
  }
 
  static setToken(token) {
    Request.token = token;
  }

  static setProxy(proxyUrl) {
    if(!Helpers.isValidUrl(proxyUrl))
      throw new Error("`proxyUrl` argument is not an valid url")
    var object = { 'proxy': proxyUrl };    
    Request.requestClient = request.defaults(object);
     
  }

  static setSocks5Proxy(host, port) {
    var object = { agentClass: Agent,
      agentOptions: {
      socksHost: host, // Defaults to 'localhost'.
      socksPort: port // Defaults to 1080.
    }};
    Request.requestClient = request.defaults(object);
  }

  get session() { 
    return this._session 
  }
  set session(session) {
    this.setSession(session);    
  }

  setOptions(options, override) {
    this._request.options = override ? 
      _.extend(this._request.options, options || {}) :
      _.defaults(this._request.options, options || {});
    return this;
  }

  setAuthorization(token) {
    this.removeHeader('Authorization')
    this.setHeaders({
      'Authorization': 'Bearer ' + token
    })
    return this;
  }
  
  setSession(session) {
    if(!(session instanceof Session))
      throw new Error("`session` parametr must be instance of `Session`")
    this._session = session;
    if(session.Authorization) {
      this.setAuthorization(session.Authorization);
    }
    if(session.proxyUrl) {
      this.setOptions({proxy: session.proxyUrl});
    }
    this.setOptions({
      jar: session.jar
    });
    return this;
  }




  setHeaders(headers) {
    this._request.headers = _.extend(this._request.headers, headers || {});
    return this;
  }

  removeHeader(name) {
    delete this._request.headers[name];
    return this;
  }

  setMethod(method) {
    method = method.toUpperCase();
    if(!_.includes(['POST', 'GET', 'PATCH', 'PUT', 'DELETE'], method))
      throw new Error("Method `" + method + "` is not valid method");
    this._request.method = method;
    return this;
  }

  setData(data, override) {
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
  }

  setUrl(url) {
    // if(!_.isString(url) || !Helpers.isValidUrl(url))
      // throw new Error("The `url` parametr must be valid url string");
    this._url = url;
    return this;
  }

  setResourceSigned(resource, data ) {
    this._resource = resource;
    var endpoint = routes.getUrl(resource, data);
    var signedEndpoint = Helpers.buildSignedUrl(endpoint, this._request.data, this._request.method);
    this.setUrl(signedEndpoint);
    return this;
  }

  setResource(resource, data) {
    this._resource = resource;
    var endpoint = routes.getUrl(resource, data);
    this.setUrl(endpoint);
    return this;
  }

  beforeParse(response, request, attemps) {
    return response;
  }

  beforeError(error, request, attemps) {
    throw error;
  }

  _initialize() {
  // Easier for inheritence
  }

  afterError(error, request, attemps) {
    throw error;
  }

  _mergeOptions(options) {
    var options = _.defaults({
      jar: this._jar, // new
      method: this._request.method,
      url: this._url,
      resolveWithFullResponse: true,
      headers: this._request.headers
    }, options || {}, this._request.options);
    return Promise.resolve(options);
  }

  _prepareData() {
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
  }

  parseMiddleware(response) {
    response.body = JSON.parse(response.body);
    return response;
  }

  errorMiddleware(response) {
    response = this.parseMiddleware(response)
    var json = response.body
    console.log(json)
    // if (json.spam) {
    //   throw new Exceptions.ActionSpamError(json)
    // }
    // if (json.message == 'checkpoint_required')
    //   throw new Exceptions.CheckpointError(json, this.session);
    // if (json.message == 'login_required')
    //   throw new Exceptions.AuthenticationError("Login required to process this request");
    // if (response.statusCode===429 || _.isString(json.message) && json.message.toLowerCase().indexOf('too many requests') !== -1)
    // {
    //   throw new Exceptions.RequestsLimitError();
    // }
    if (_.isString(json.message) && json.message.toLowerCase().indexOf('entered is incorrect') !== -1) 
      throw new Exceptions.AuthenticationError();
    else if (_.isString(json.message) && json.message.toLowerCase().indexOf('email you entered does not belong') !== -1) 
      throw new Exceptions.EmailNotFound();
    else if (_.isString(json.message) && json.message.toLowerCase().indexOf('could not save board') !== -1) 
      throw new Exceptions.CouldNotSaveBoard();
    throw new Exceptions.RequestError(json);
  }

  send(options, attemps) {
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
        options = opts

        return new Promise(function(resolve, reject) {
          var xhr = Request.requestClient(options)

          var res;
          var body = concat(function(data) {
            res.body = data.toString();
            if (res.statusCode == 200 ) {
              resolve([res, options, attemps]);
            } else {
              reject(res)
            }
          })

          xhr.on('response', function(response) {
            res = response;
          }).on('data', function(chunk) {
            body.write(chunk);
          }).on('end', function() {
            body.end()
          }).catch(function(err) {
          })
          .then(function(res) {
          });

          if (Request.token) {          
            Request.token.cancel = function() { 
              xhr.abort();
              reject(new Error("Cancelled"));
            };
          }
        });

        // return [Request.requestClient(options), options, attemps]
      })
      .spread(_.bind(this.beforeParse, this))
      .then(_.bind(this.parseMiddleware, this))
      .then(function (response) {
        var json = response.body;
        console.log(response)
        if (_.isObject(json) && json.status == "success") {
          return response.body
        }
        throw new Exceptions.RequestError(json);
      })
      .catch(function(error) {
        return that.beforeError(error, options, attemps)
      })
      .catch(function (err) {
        if(err.message == 'Cancelled') {        
          throw new Exceptions.RequestCancel();
        }

        // if (err instanceof Exceptions.APIError) {
        //   throw err;
        // }
        // if(!err || !err.response) {
        //   throw err;    
        // }

        var response = err //.response;
        console.log(response)
        if (response.statusCode == 404)
          throw new Exceptions.NotFoundError(response);
        if (response.statusCode >= 500) {
          if (attemps <= that.attemps) {
            attemps += 1;
            return that.send(options, attemps)
          } else {
            throw new Exceptions.ParseError(response, that);
          }
        } else {
          that.errorMiddleware(response)
        }
      })

      .catch(function (error) {
        if (error instanceof Exceptions.APIError)
          throw error;
        error = _.defaults(error, { message: 'Fatal internal error!' });
        throw new Exceptions.RequestError(error);
      })
      .catch(function(error) {
        return that.afterError(error, options, attemps)
      })
  }
}

module.exports = Request;

var Constants = require('./constants');
var Helpers = require('../helpers');
var routes = require('./routes');
var Session = require('./session');

Request.requestClient = request.defaults({});


