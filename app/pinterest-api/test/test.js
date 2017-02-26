var _ = require('lodash')
var pin = require("../index")
var should = require('should');
var session;
 

describe("Public endpoints", function() {
  it("should be possible to get #Gatekeeper.experiments", function(done) {
    pin.Gatekeeper.experiments()
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Gatekeeper.activate(smartlock)", function(done) {
     pin.Gatekeeper.activate('smartlock') 
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Gatekeeper.activate(ads_log_plain_mobile_advertiser_id)", function(done) {
     pin.Gatekeeper.activate('ads_log_plain_mobile_advertiser_id') 
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to check if email #Register.exists", function(done) {
    pin.Register.exists('blackkorol@gmail.com')
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
});

describe("Session endpoints", function() {
  it("should be possible to create #Session through login", function (done) {

    pin.Session.create('cookie.json', 'blackkorol@gmail.com', 'qweqwe123')
    .then(function(sessionInstance) {
      session = sessionInstance;
      session.should.be.instanceOf(pin.Session);
      module.exports.session = session;
      done();
    })
  });
  it("should be possible to get auth_token from session", function(done) {
    session.Authorization.should.be.a.String();
    done();
  });
  it("should be possible to get #Users.me from session", function(done) {
    pin.Users.me(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Users.meBoards from session", function(done) {
    pin.Users.meBoards(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Users.contactsSuggestions from session", function(done) {
    pin.Users.contactsSuggestions(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Experiences.get from session", function(done) {
    pin.Experiences.get(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Conversations.get from session", function(done) {
    pin.Conversations.get(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Notifications.get from session", function(done) {
    pin.Notifications.get(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Feeds.home from session", function(done) {
    pin.Feeds.home(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  var data1 = {
    'requests': '[' + JSON.stringify({
    'method':'PUT',
    'uri':'/v3/experiences/20006:30012/viewed/'}) + ']'
  };
  var data2 = {
    'requests': '[{"method":"GET","uri":"/v3/users/config/invitability/feature_weights/","params":{"snapshot_key":"0"}},{"method":"GET","uri":"/v3/users/config/invitability/name_heuristics/","params":{"snapshot_key":"0"}},{"method":"GET","uri":"/v3/users/config/invitability/settings/","params":{"snapshot_key":"0"}}]'
  };
  var data3 = {
    'requests': "[" + JSON.stringify({
                       "method": "PUT",
                       "uri"   : "/v3/experiences/20006:30012/completed/"}) + "]" 
  };
  var data4 = {
    'requests': '[{"method":"GET","uri":"/v3/experiences/","params":{"placement_ids":"20002"}}]' 
  };
  
  var dataArray = [data1, data2, data3, data4];
  dataArray.forEach(function(data, i) {
    it("should be possible to get #Batch.post for data #" + i + " from session", function(done) {
      pin.Batch.post(session, data)
      .then(function(response) {
        response.status.should.be.equal('success');
        done();
      })
    })
  })
  it("should be possible to get #Orientation.signal from session", function(done) {
    pin.Orientation.signal(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Orientation.status from session", function(done) {
    pin.Orientation.status(session)
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
  it("should be possible to get #Interests.get from session", function(done) {
    pin.Interests.get(session, '684828755775988650')
    .then(function(response) {
      response.status.should.be.equal('success');
      done();
    })
  });
});


