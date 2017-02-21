var _ = require('lodash');

const ROUTES = {
  gatekeeper_activate: 'v3/gatekeeper/activate/',
  gatekeeper_experiments: 'v3/gatekeeper/experiments/',

  batch: 'v3/batch/',

  boards: 'v3/boards/',
  boards_id: 'v3/boards/<%= id %>/',
  boards_follow: 'v3/boards/<%= id %>/follow/',
  boards_share: 'v3/boards/<%= id %>/share/user/',

  pins: 'v3/pins/',
  pins_id: 'v3/pins/<%= id %>/',
  pins_interests: 'v3/pins/<%= id %>/interests/',
  pins_id_params: 'v3/pins/<%= id %>/?<%= params %>',
  pins_comment: 'v3/pins/<%= id %>/comment/',
  pins_comments: 'v3/pins/<%= id %>/comments/',
  pins_like: 'v3/pins/<%= id %>/like/',
  pins_share: 'v3/pins/<%= id %>/share/user/',

  search_users: 'v3/search/users/?<%= params %>', 
  search_pins: 'v3/search/pins/?<%= params %>',

  register_email: 'v3/register/email/',
  register_exists: 'v3/register/exists/',
  login: 'v3/login/',

  experiences: 'v3/experiences/platform/ANDROID',

  users_board_picker_shortlist: 'v3/users/boards/board_picker_shortlist/?<%= params %>',
  users_settings: 'v3/users/settings/',
  users_id_params: 'v3/users/<%= id %>/?<%= params %>',
  users_me: 'v3/users/me/?<%= params %>',
  users_me_interests: 'v3/users/me/interests/?<%= params %>',
  users_me_boards: 'v3/users/me/boards/?<%= params %>',
  users_pins: 'v3/users/<%= id %>/pins/?<%= params %>',
  users_follow: 'v3/users/<%= id %>/follow/',
  users_followers: 'v3/users/<%= id %>/followers/?<%= params %>',
  users_contacts: 'v3/users/contacts/suggestions/search/share/?q=<%= query %>',
  users_state: 'v3/users/state/<%= state %>', 
  users_interests_favorited: 'v3/users/<%= id %>/interests/favorited/?<%= params %>',
  users_contacts_suggestions: 'v3/users/contacts/suggestions/share/?<%= params %>',

  interests_feed: 'v3/interests/<%= id %>/feed/?<%= params %>',
  interests_related: 'v3/interests/<%= category %>/related/?<%= params %>',
  interests_id_params: 'v3/interests/<%= id %>/?<%= params %>',

  conversations: 'v3/conversations/',
  conversations_params: 'v3/conversations/?<%= params %>',
  conversations_messages: 'v3/conversations/<%= id %>/messages/',
  conversations_messages_params: 'v3/conversations/<%= id %>/messages/?<%= params %>',

  notifications: 'v3/maia/notifications/counts',

  feeds: 'v3/feeds/<%= category %>/?<%= params %>',
  feeds_home: 'v3/feeds/home/?<%= params %>',

  orientation_signal: 'v3/orientation/signal/',
  orientation_status: 'v3/orientation/status/',
  
  categories: 'v3/categories/android/?<%= params %>',
};

const CLIENT = {
  ID: "1431602",
  DEVICE: "Google Nexus 4 - 4.3 - API 18 - 768x1280",
  USER_AGENT:  "Pinterest for Android/6.0.6 (vbox86p; 4.3)",
  DEVICE_CLASS: "2013"
};

const API_URL = "https://api.pinterest.com/";
 
module.exports = {
  ROUTES: ROUTES,
  CLIENT: CLIENT,
  API_URL: API_URL
}
