function Batch() {}
module.exports = Batch;

var Request = require('../request');
Batch.post = function(session, data) {
  return new Request(session) 
    .setMethod('POST')
    .setData(data)
    .setResourceSigned('batch')
    .send()
}

