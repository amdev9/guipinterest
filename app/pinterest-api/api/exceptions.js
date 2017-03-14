var _ = require("underscore");
var util = require("util");
var routes = require('./routes');

function APIError(message) {
    this.name = "APIError";
    this.message = (message || "Pinterest API error occured.");
}

util.inherits(APIError, Error);
exports.APIError = APIError;

APIError.prototype.serialize = function() {
  return {
    error: this.constructor.name,
    errorMessage: this.message
  }
};

function RequestCancel() {
    this.name = "RequestCancel";
    this.message = "Cancelled";
}
util.inherits(RequestCancel, APIError);
exports.RequestCancel = RequestCancel;


function RequestError(payload) {
  this.name = "RequestError";
  this.message = "It's not possible to make request!";
  this.json = {};
  if(_.isString(payload.message))
      this.message = payload.message; // message from instagram
  if(_.isObject(payload)) {
      this.json = payload
  }
}
util.inherits(RequestError, APIError);
exports.RequestError = RequestError;

function AuthenticationError(message) {
    this.name = "AuthenticationError";
    this.message = message || "Not possible to authenticate";
    this.ui = "Неверный пароль"
}
util.inherits(AuthenticationError, APIError);
exports.AuthenticationError = AuthenticationError;

function CouldNotSaveBoard(message) {
    this.name = "CouldNotSaveBoard";
    this.message = message || "Could not save board";
    this.ui = "Невозможно создать доску"
}
util.inherits(CouldNotSaveBoard, APIError);
exports.CouldNotSaveBoard = CouldNotSaveBoard;

function EmailNotFound(message) {
    this.name = "EmailNotFound";
    this.message = message || "The email you entered does not belong to any account";
    this.ui = "Неверный email"
}
util.inherits(EmailNotFound, APIError);
exports.EmailNotFound = EmailNotFound;

function ParseError(response, request) {
    this.name = "ParseError";
    this.message = "Not possible to parse API response";
    this.response = response;
    this.request = request;
}



util.inherits(ParseError, APIError);
exports.ParseError = ParseError;

ParseError.prototype.getUrl = function () {
    return this.request.url;
};


function NotFoundError(response) {
    this.name = "NotFoundError";
    this.message = "Page wasn't found!";
    this.response = response;
}

util.inherits(NotFoundError, APIError);
exports.NotFoundError = NotFoundError;



// StatusCodeError: 401 - "{\"status\": \"failure\", \"code\": 78, \"host\": \"coreapp-ngapi-prod-0a01048d\", \"error\": {\"message\": \"None\"}, \"generated_at\": \"Wed, 08 Mar 2017 22:51:53 +0000\", \"message\": \"The password you entered is incorrect.\", \"data\": null}"