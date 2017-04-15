const querystring = require('querystring');
function Interests() {}
module.exports = Interests;
var Request = require('../request');

Interests.get = function(session, id) {
  var data = {
    "page_size": 25,
    "fields": "interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[75x75,150x150(ir.12),150x150(ir.24),150x150(ir.48),300x300(ir.24),300x300(ir.48),600x,236x],interest.is_followed",
    // "bookmark": hget,
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('interests_id_params', {
      id: id,
      params: data
    })
    .send()
}

Interests.related = function(session, id) {
  return new Request(session)
    .setMethod('GET')
    .setResource('interests_related', {
      id: id
    })
    .send()
}

Interests.feed = function(session, id) {
  var data = {
    "page_size": 25,
    "fields": "pin.images[236x,736x,236x,236x,736x],pin.id,pin.type,pin.cacheable_id,pin.description,pin.link,pin.created_at,pin.like_count,pin.repin_count,pin.comment_count,pin.view_tags,board.id,board.url,board.name,board.category,board.created_at,board.collaborator_invites_enabled,board.privacy,board.conversation(),conversation.id,pin.cinematic_data[45x45,200x,1200x],board.image_thumbnail_url,user.id,user.full_name,user.is_default_image,user.first_name,user.username,user.last_name,user.gender,user.partner(),user.image_medium_url,pin.liked_by_me,pin.dominant_color,pin.rich_summary(),pin.embed(),pin.promoter(),pin.is_promoted,pin.is_downstream_promotion,pin.recommendation_reason,pin.additional_hide_reasons,pin.is_cinematic,pin.board(),pin.pinner(),pin.source_interest(),pin.is_video,pin.ad_match_reason,interest.id,interest.name,interest.creation_time,interest.key,interest.background_color,interest.url_name,interest.follower_count,interest.feed_update_time,interest.images[75x75,150x150(ir.12),150x150(ir.24),150x150(ir.48),300x300(ir.24),300x300(ir.48),600x,236x],pin.aggregated_pin_data(),aggregatedpindata.aggregated_stats,aggregatedpindata.id,pin.edited_fields,pin.grid_description,board.image_cover_url,pin.videos(),video.id,video.video_list[V_HLSV4],pin.is_eligible_for_web_closeup,pin.ad_closeup_behaviors,pin.ad_destination_url,pin.image_signature,pin.place_summary()",
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('interests_feed', {
      id: id,
      params: data
    })
    .send()
}
