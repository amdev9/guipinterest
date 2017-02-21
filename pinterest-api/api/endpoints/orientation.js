function Orientation() {}
module.exports = Orientation;

var Request = require('../request');

Orientation.signal = function(session) {
  var data = {
    "interests": "927552077382,935249274030,924255633983,961238559656,955506047789"
  };
  return new Request(session) 
    .setMethod('POST')
    .setData(data)
    .setResourceSigned('orientation_signal')
    .send()
}

Orientation.status = function(session) {
  return new Request(session) 
    .setMethod('GET')
    .setResource('orientation_status')
    .send()
}
