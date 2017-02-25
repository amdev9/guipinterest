'use strict'
var PinterestAPI = {}

PinterestAPI.Batch = require('./api/endpoints/batch')
PinterestAPI.Boards = require('./api/endpoints/boards')
PinterestAPI.Categories = require('./api/endpoints/categories')
PinterestAPI.Conversations = require('./api/endpoints/conversations')
PinterestAPI.Experiences = require('./api/endpoints/experiences')
PinterestAPI.Feeds = require('./api/endpoints/feeds')
PinterestAPI.Gatekeeper = require('./api/endpoints/gatekeeper')
PinterestAPI.Interests = require('./api/endpoints/interests')
PinterestAPI.Notifications = require('./api/endpoints/notifications')
PinterestAPI.Orientation = require('./api/endpoints/orientation')
PinterestAPI.Pins = require('./api/endpoints/pins')
PinterestAPI.Register = require('./api/endpoints/register')
PinterestAPI.Search = require('./api/endpoints/search')
PinterestAPI.Users = require('./api/endpoints/users')

PinterestAPI.Request = require('./api/request')
PinterestAPI.Constants = require('./api/constants')
PinterestAPI.Resource = require('./api/resource')
PinterestAPI.Session = require('./api/session')

module.exports = PinterestAPI
