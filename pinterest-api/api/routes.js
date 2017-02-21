var Constants = require('./constants');
var _ = require('lodash');

var URLs = {};
_.each(Constants.ROUTES, function (val, key) {
  URLs[key] = _.template(val);
});

exports.getUrl = function(key, data) {
  if(!_.isFunction(URLs[key])) 
    throw new Error("Url with key `"+ key +"` is not available");
  return Constants.API_URL + URLs[key](data || {});   
}
