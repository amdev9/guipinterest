function Gatekeeper() {}
module.exports = Gatekeeper;
var Request = require('../request');

Gatekeeper.activate = function(experiment) {
  var experiment_data = {
    'key': experiment
  };
  return new Request()
    .setMethod('PUT')
    .setData({
      experiment_data: JSON.stringify(experiment_data)
    })
    .setResourceSigned('gatekeeper_activate')
    .send();
}
 
Gatekeeper.experiments = function() {
  return new Request()
    .setMethod('GET')
    .setResourceSigned('gatekeeper_experiments')
    .send();
}