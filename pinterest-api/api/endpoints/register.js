function Register() {}
module.exports = Register;
var Request = require('../request');
 
Register.exists = function(email) {
  return new Request()
    .setMethod('GET')
    .setData({
      email: email
    })
    .setResourceSigned('register_exists')
    .send();
}

Register.post = function(session, first_name, email, password) {
  return new Request(session) 
    .setMethod('POST')
    .setData({
      "first_name": first_name,
      "username"  : "",
      "gender"    : "female",
      "email"     : email,
      "locale"    : "en_US",
      "password"  : password
    })
    .setResourceSigned('register_email')
    .send()

}