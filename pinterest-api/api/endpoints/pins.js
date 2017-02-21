const querystring = require('querystring');

function Pins() {}
module.exports = Pins;

var Request = require('../request');

Pins.get = function(session, id) {  
  var data = {
    "fields": "pin.images[236x,136x136,736x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.conversation,user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),place.id,place.name,place.latitude,place.longitude,place.source_icon,place.source_name,place.from_pin_join,board.image_thumbnail_url,user.image_medium_url,board.privacy,pin.attribution,pin.liked_by_me,pin.tracked_link,pin.mobile_link,pin.domain,pin.canonical_merchant_domain,pin.canonical_merchant_name,pin.link_domain(),domain.id,domain.name,domain.official_user(),pin.board(),pin.comment_count,pin.pinned_to_board,pin.pinner(),pin.via_pinner(),pin.is_repin,pin.origin_pinner(),pin.rich_metadata(),pin.rich_summary(),pin.embed(),pin.canonical_pin,user.blocked_by_me,user.verified_identity,user.follower_count,pin.place(),place.access,place.street,place.locality,place.region,place.country,place.phone,place.url,place.hours,place.simple_tips,pin.is_video,pin.image_signature,pin.gallery,galleryitem.id,galleryitem.image_signature,pin.serving_link_metadata(),servinglinkmetadata.gallery_items(),galleryitem.canonical_images[236x,736x],pin.aggregated_pin_data(),aggregatedpindata.id,aggregatedpindata.aggregated_stats,pin.edited_fields,pin.closeup_description,pin.closeup_user_note,makecardtutorialview.images[236x,736x],makecardtutorialinstructionview.images[236x,736x],user.image_large_url,pin.videos(),video.id,video.video_list[V_HLSV4],pin.visual_objects()",
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('pins_id_params', {
      id: id,
      params: querystring.stringify(data) 
    })
    .send();
}

Pins.view = function(session, id) { 
  var data = {
    "fields": "pin.images[236x,136x136,736x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.privacy,board.conversation(),conversation.id,user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),place.id,place.name,place.latitude,place.longitude,place.source_icon,place.source_name,place.from_pin_join,board.image_thumbnail_url,user.image_medium_url,board.privacy,pin.attribution,pin.liked_by_me,pin.tracked_link,pin.mobile_link,pin.domain,pin.canonical_merchant_domain,pin.canonical_merchant_name,pin.link_domain(),domain.id,domain.name,domain.official_user(),pin.board(),pin.comment_count,pin.pinned_to_board,pin.pinner(),pin.via_pinner(),pin.is_repin,pin.origin_pinner(),pin.rich_metadata(),pin.rich_summary(),pin.embed(),pin.canonical_pin,user.blocked_by_me,user.verified_identity,user.follower_count,pin.place(),place.access,place.street,place.locality,place.region,place.country,place.phone,place.url,place.hours,place.simple_tips,pin.is_video,pin.image_signature,pin.gallery,galleryitem.id,galleryitem.image_signature,pin.serving_link_metadata(),servinglinkmetadata.gallery_items(),galleryitem.canonical_images[236x,736x],pin.aggregated_pin_data(),aggregatedpindata.id,aggregatedpindata.aggregated_stats,pin.edited_fields,pin.closeup_description,pin.closeup_user_note,makecardtutorialview.images[236x,736x],makecardtutorialinstructionview.images[236x,736x],user.image_large_url,pin.videos(),video.id,video.video_list[V_HLSV4],pin.visual_objects()",
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('pins_id_params', {
      id: id,
      params: querystring.stringify(data) 
    })
    .send();
}

Pins.comment = function(session, id, text) {  
  var data = {
    "text": text
  };
  return new Request(session)
    .setMethod('POST')
    .setData(data)
    .setResource('pins_comment', {
      id: id
    })
    .send();
}

Pins.comments = function(session, id) { 
  return new Request(session)
    .setMethod('GET')
    .setResource('pins_comments', {
      id: id
    })
    .send();
}

Pins.like = function(session, id) {
  return new Request(session)
    .setMethod('PUT')
    .setResource('pins_like', {
      id: id
    })
    .send();
}

Pins.edit = function(session, id, board_id, pin_name) {
  var data = {
    "description": pin_name, //FIRSTCREATEADPINPHOTO
    "board_id": board_id,  //684828755775988362
    "add_fields": "pin.place(),place.access,place.hours,place.simple_tips,pin.aggregated_pin_data(),pin.edited_fields,aggregatedpindata.id,aggregatedpindata.aggregated_stats",
    "link": link,
    "share_twitter": 0,
  };
  return new Request(session)
    .setMethod('POST')
    .setResource('pins_id', {
      id: id
    })
    .send();
}
 
Pins.interests = function(session, id) { 
  return new Request(session)
    .setMethod('GET')
    .setResource('pins_interests', {
      id: id
    })
    .send();
}

Pins.share = function(session, username, message) {
  var data = {
    "user": username,
    "message": message
  };
  return new Request(session)
    .setMethod('PUT')
    .setData(data)
    .setResource('pins_share', {
      id: id
    })
    .send();
}
