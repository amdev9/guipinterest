var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Request = require('./request');
var Session = require('./session');

function Resource(session, params) {
  EventEmitter.call(this);
  if (!(session instanceof Session))
    throw new Error("Argument `session` is not instace of Session");
  this._session = session;
  this._params = {};
  this.setParams(_.isObject(params) ? params : {});
}

util.inherits(Resource, EventEmitter);
module.exports = Resource;

Object.defineProperty(Resource.prototype, "params", {
  get: function() { return this.getParams() }
});

Object.defineProperty(Resource.prototype, "session", {
  get: function() { return this._session }
});

Resource.prototype.parseParams = function(params) {  
  return params;
};

Resource.prototype.setParams = function(params) {
  if (!_.isObject(params))
      throw new Error("Method `setParams` must have valid argument");
  params = this.parseParams(params);
  if (!_.isObject(params))
      throw new Error("Method `parseParams` must return object");
  this._params = params;
  if (params.id) this.id = params.id;
  return this;
};

Resource.prototype.getParams = function() {
  return this._params;
};
    
Resource.prototype.request = function() {
  return new Request(this._session);
};

