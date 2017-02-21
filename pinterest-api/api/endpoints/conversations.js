const querystring = require('querystring');
function Conversations() {}
module.exports = Conversations;
var Request = require('../request');

Conversations.get = function(session) {
  var data = {
    "page_size": 25,
    "fields"   : "pin.images[236x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.conversation,board.cover_images[60x60],board.image_cover_url,board.images[90x90],user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,conversation.id,conversation.users(),conversation.emails,conversation.last_message(),conversation.unread,conversation.board,conversationmessage.id,conversationmessage.text,conversationmessage.created_at,conversationmessage.pin(),conversationmessage.board(),conversationmessage.user(),conversationmessage.sender(),conversation.name",
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('conversations_params', { 
      params: querystring.stringify(data) 
    })
    .send();
}

Conversations.post = function(session, ids) {
  var data = {
    'user_ids': ids,
    'fields': "pin.images[236x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.conversation,board.cover_images[60x60],board.image_cover_url,board.images[90x90],user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,conversation.id,conversation.users(),conversation.emails,conversation.last_message(),conversation.unread,conversation.board,conversationmessage.id,conversationmessage.text,conversationmessage.created_at,conversationmessage.pin(),conversationmessage.board(),conversationmessage.user(),conversationmessage.sender(),conversation.name,conversation.board(),board.image_cover_hd_url"
  };
  return new Request(session)
    .setMethod('POST')
    .setData(data)
    .setResource('conversations')
    .send();
}

Conversations.getMessages = function(session, id) {
  var data = {
    "fields": "pin.images[236x,736x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.conversation,board.image_cover_url,board.images[150x150],user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,conversation.id,conversation.users(),conversation.emails,conversation.last_message(),conversation.unread,conversation.board,conversationmessage.id,conversationmessage.text,conversationmessage.created_at,conversationmessage.pin(),conversationmessage.board(),conversationmessage.user(),conversationmessage.sender(),pin.videos(),video.id,video.video_list[V_HLSV4],board.pin_count,board.owner(),board.collaborating_users(),conversation.name,pin.aggregated_pin_data(),aggregatedpindata.aggregated_stats,aggregatedpindata.id,pin.edited_fields,pin.grid_description,pin.videos(),video.id,video.video_list[V_HLSV4],pin.videos(),video.id,video.video_list[V_HLSV4]",
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('conversations_messages_params', { 
      id: id,
      params: querystring.stringify(data) 
    })
    .send();
}

Conversations.postMessage = function(session, id, message) {
  var data = {
    "text": message,
    "fields": "pin.images[236x,736x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.conversation,board.image_cover_url,board.images[150x150],user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,conversation.id,conversation.users(),conversation.emails,conversation.last_message(),conversation.unread,conversation.board,conversationmessage.id,conversationmessage.text,conversationmessage.created_at,conversationmessage.pin(),conversationmessage.board(),conversationmessage.user(),conversationmessage.sender(),pin.videos(),video.id,video.video_list[V_HLSV4],board.pin_count,board.owner(),board.collaborating_users(),conversation.name,pin.aggregated_pin_data(),aggregatedpindata.aggregated_stats,aggregatedpindata.id,pin.edited_fields,pin.grid_description,pin.videos(),video.id,video.video_list[V_HLSV4],pin.videos(),video.id,video.video_list[V_HLSV4]",
  };
  return new Request(session)
    .setMethod('POST')
    .setData(data)
    .setResource('conversations_messages', {
      id: id
    })
    .send();
}

