function Notifications() {}
module.exports = Notifications;
var Request = require('../request');

Notifications.get = function(session) {
  return new Request(session)
  .setMethod('GET')
  .setResource('notifications')
  .send();
}
