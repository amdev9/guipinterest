var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Request = require('./request');
var Session = require('./session');

class Resource extends EventEmitter {

  constructor(session, params) {
    super()
    if (!(session instanceof Session))
    throw new Error("Argument `session` is not instace of Session");
    this._session = session;
    this._params = {};
    this.setParams(_.isObject(params) ? params : {});
  }

  parseParams(params) {  
    return params;
  }

  setParams(params) {
    if (!_.isObject(params))
        throw new Error("Method `setParams` must have valid argument");
    params = this.parseParams(params);
    if (!_.isObject(params))
        throw new Error("Method `parseParams` must return object");
    this._params = params;
    if (params.id) this.id = params.id;
    return this;
  }

  getParams() {
    return this._params;
  }

  request() {
    return new Request(this._session);
  }

  get params() { return this.getParams() }
  get session() { return this._session }
}

module.exports = Resource;
