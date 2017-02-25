function Experiences() {}
module.exports = Experiences;
var Request = require('../request');

Experiences.get = function(session) {
  return new Request(session)
  .setMethod('GET')
  .setResource('experiences')
  .send();
}
