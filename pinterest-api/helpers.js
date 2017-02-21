var Helpers = {};
var fs = require('fs');
var path = require("path");
var touch = require("touch");
var isStream = require("is-stream");
var _ = require("underscore");

var md5 = require('md5');
var crypto = require('crypto');
const querystring = require('querystring');
var Constants = require('./api/constants');

Helpers.sorted = function (o) {
  let p = Object.create(null);
  for (const k of Object.keys(o).sort()) p[k] = o[k];
  return p;
}

Helpers.buildSignedUrl = function(endpoint, formData, method) {
  var data = {
    'client_id': Constants.CLIENT.ID,
    'timestamp': Date.now() / 1000 | 0
  };
  var merged = Object.assign(formData, data); 
  var final_url = encodeURIComponent(endpoint);
  var stringData = querystring.stringify(data);
  var mergedData = querystring.stringify(Helpers.sorted(merged));
  var message = method + "&" + final_url + "&" + mergedData;
  const secret = "492124fd20e80e0f678f7a03344875f9b6234e2b";
  const hmac = crypto.createHmac('sha256', secret);
  var signature = hmac.update(message).digest('hex');
  if (method != "GET") {
    finalUrl = endpoint + "?" +  stringData + "&oauth_signature=" + signature;
  } else {
    finalUrl = endpoint + "?" +  mergedData + "&oauth_signature=" + signature;
  }
  return finalUrl;
}

Helpers.generateInstallId = function() {
  sub_uid = Helpers.generateUUID(false).substr(0, 26)
  final = md5(sub_uid + "user").substr(0, 27)
  result = sub_uid + final
  return result
}

Helpers.generateDeviceId = function() {
  return crypto.randomBytes(8).toString('hex');
}

Helpers.generateUUID = function (type) {
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toLowerCase();
    if (type == false ) {
        return uuid;
    } else {
        return uuid.replace(/-/g, '');
    }
};

////////////////////////////////

var emailTester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

Helpers.validateEmail = function(email) {
  if(!email) return false;
  if(email.length>254) return false;
  var valid = emailTester.test(email);
  if(!valid) return false;
  var parts = email.split("@");
  if(parts[0].length>64) return false;
  var domainParts = parts[1].split(".");
  if(domainParts.some(function(part) { return part.length>63; }))
    return false;
  return true;
}

Helpers.getRandomArbitrary = function(min, max) {
    return Math.random() * (max - min) + min;
}


Helpers.buildRankToken = function (accountId) {
    return accountId + '_' + Helpers.generateUUID();
};


Helpers.isValidUrl = function(textval) {
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
}

Helpers.ensureExistenceOfJSONFilePath = function(path) {
    try {
        touch.sync(path);
        JSON.parse(fs.readFileSync(path));
    } catch (e) {
        fs.unlinkSync(path);
    }
    touch.sync(path);
}


Helpers.resolveDirectoryPath = function (directory) {
    directory = path.resolve(directory);
    if(!fs.statSync(directory).isDirectory())
        throw new Error("Path `"+directory+"` is not directory!");
    return directory;
}

Helpers.fileExists = function (path) {
    try {
        return fs.statSync(path).isFile()
    } catch(e) {
        return false;
    }
}

Helpers.pathToStream = function (streamOrPath) {
    var stream = _.isString(streamOrPath) ? 
        fs.createReadStream(path.resolve(streamOrPath)) : 
        streamOrPath;
    if(!isStream(stream))
        throw new Error("Argument is not posible to convert to stream!");
    return stream;    
}

Helpers.isStream = function (stream) {
    return isStream(stream);   
}

Helpers.dataToRequestOption = function (data, filename) {
    var raw, options = {};
    if(_.isString(filename))
        options.filename = filename;
    if(data instanceof Buffer){
        raw = data;        
    } else if(isStream(data)) {
        raw = data;
    } else if(_.isString(data)) {
        raw = Helpers.pathToStream(data);
    } else if(_.isObject(data)) {
        raw = Helpers.dataToRequestOption(data.value).value;
        options = _.defaults(options, _.omit(data, 'value'));
    } else {
        throw new Error("Invalid data passed as argument for request!")
    }
    return {value: raw, options: options}
}

module.exports = Helpers;