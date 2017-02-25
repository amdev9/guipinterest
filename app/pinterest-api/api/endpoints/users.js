const querystring = require('querystring');
function Users() {}
module.exports = Users;
var Request = require('../request');

Users.me = function(session) {
  var data = {
    'fields' :'user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,user.image_large_url,user.email,user.secret_board_count,user.connected_to_facebook,user.facebook_timeline_enabled,user.facebook_publish_stream_enabled,user.connected_to_gplus,user.connected_to_twitter,user.experiments,user.gatekeeper_experiments,user.last_pin_like_time,user.created_at'
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('users_me', { 
      params: querystring.stringify(data) 
    })
    .send()

}

Users.get = function(session) {
  var data = {
    "fields": "user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,user.image_large_url,user.image_xlarge_url,user.about,user.blocked_by_me,user.board_count,user.domain_verified,user.explicitly_followed_by_me,user.facebook_url,user.follower_count,user.following_count,user.has_custom_board_sorting_order,user.implicitly_followed_by_me,user.like_count,user.location,user.pin_count,user.last_pin_like_time,user.verified_identity,user.website_url,user.canonical_merchant_domain",
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('users_id_params', { 
      id: id,
      params: querystring.stringify(data) 
    })
    .send();
}

Users.interestsFavorited = function(session, userId) {
  var data = {
    "limit": 25,
    "fields": "interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[75x75,150x150(ir.12),150x150(ir.24),150x150(ir.48),300x300(ir.24),300x300(ir.48),600x,236x],interest.is_followed",
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('users_interests_favorited', { 
      id: userId, 
      params: querystring.stringify(data) 
    })
    .send();
}

Users.meInterests = function(session) {
  var data = {
    "blend_type": "nux",
    "fields"    : "interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[75x75,150x150(ir.12),150x150(ir.24),150x150(ir.48),300x300(ir.24),300x300(ir.48),600x,236x]",
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('users_me_interests', { 
      params: querystring.stringify(data) 
    })
    .send();
}

Users.meBoards = function(session) {
  var data = {
    "sort": "alphabetical",
    "filter": "all",
    "fields": "board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.conversation,board.cover_images[60x60],board.is_collaborative,board.privacy"
  };
  return new Request(session)
    .setMethod('GET')
    .setData(data)
    .setResource('users_me_boards', { 
      params: querystring.stringify(data) 
    })
    .send();
}

Users.pins = function(session, id) {
  var data = {
    "page_size": 8,
    "fields": "pin.images[236x,736x,236x,236x,736x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.privacy,board.conversation(),conversation.id,pin.cinematic_data[45x45,200x,1200x],board.image_thumbnail_url,user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,pin.liked_by_me,pin.dominant_color,pin.rich_summary(),pin.embed(),pin.promoter(),pin.is_promoted,pin.is_downstream_promotion,pin.recommendation_reason,pin.additional_hide_reasons,pin.is_cinematic,pin.board(),pin.pinner(),pin.source_interest(),pin.is_video,pin.ad_match_reason,interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[75x75,150x150(ir.12),150x150(ir.24),150x150(ir.48),300x300(ir.24),300x300(ir.48),600x,236x],pin.aggregated_pin_data(),aggregatedpindata.aggregated_stats,aggregatedpindata.id,pin.edited_fields,pin.grid_description,board.image_cover_url,pin.videos(),video.id,video.video_list[V_HLSV4],pin.is_eligible_for_web_closeup,pin.ad_closeup_behaviors,pin.ad_destination_url,pin.image_signature,pin.place_summary()",
  };
  return new Request(session)
    .setMethod('GET')
    .setData(data)
    .setResource('users_pins', { 
      params: querystring.stringify(data) 
    })
    .send();
}

Users.followers = function(session, id) {
  var data = {
    "page_size": 25,
    "fields": "user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,user.image_large_url,user.image_xlarge_url,user.website_url,user.domain_verified,user.location,user.explicitly_followed_by_me,user.implicitly_followed_by_me,user.blocked_by_me,user.pin_count,user.follower_count,user.pins_done_count,user.verified_identity",
    // "bookmark": hget 
  };
  return new Request(session)
    .setMethod('GET')
    .setData(data)
    .setResource('users_followers', { 
      id: id,
      params: querystring.stringify(data) 
    })
    .send();
}

Users.contactsSuggestions = function(session) {
  var data = {
    'add_fields': 'contact.user()',
    'page_size': 15
  };
  return new Request(session)
    .setMethod('GET')
                // users_contacts ??
    .setResource('users_contacts_suggestions', { 
      params: querystring.stringify(data) 
    }) 
    .send();
}

Users.settings = function(session) {
  return new Request(session)
    .setMethod('GET')
    .setResource('users_settings')
    .send();
}

Users.follow = function(session, id) {
  return new Request(session)
    .setMethod('PUT')
    .setResource('users_follow', { 
      id: id
    })
    .send();
}

Users.boardPickerShortlist = function(session, pinId) {
  var data = {
    'count': 3,
    'pin': pinId,
    'max_num_suggestions': 2,
    'fields': 'board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.conversation,board.cover_images[60x60],board.is_collaborative,board.privacy',
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('users_board_picker_shortlist', { 
      params: data
    })
    .send();
}

Users.state = function(session, state) { // LANDING_PAGE_PINS_INJECTED, MOBILE_CONTEXTUAL_MENU_ACTION_TAKEN
  var data = {
    "value": 1
  };
  return new Request(session)
    .setMethod('GET')
    .setData(data)
    .setResource('users_state', { 
      state: state
    })
    .send()
}

Users.setAvatar = function(session, filepath) {
  var boundary = '1cEfr3XMRslTD8zE4ksrmbDZ-5D-M6'; 
  var stream = Helpers.pathToStream(filepath);
  var form = {
    'type': 'form-data',
    'name': 'profile_image',
    'data': stream, 
    'filename': 'profilepicture.jpg',  
    'headers': {
      'Content-Type': 'image/jpg',
      'Content-Transfer-Encoding': 'binary'
    }
  };
  return new Request(session)
    .setMethod('POST')
    .setResource('users_settings')
    .setOptions({
      formData: form
    })
    .setHeaders({
      'Content-type': 'multipart/form-data; boundary=' + boundary
    })
    .send();
}
               
      

