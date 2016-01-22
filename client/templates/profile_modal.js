var MIN_TRADE_PARAM = 0;
var MAX_TRADE_PARAM = 25;

function checkOfferParam(param) {
  if (isNaN(parseInt(param)) || param < MIN_TRADE_PARAM || param > MAX_TRADE_PARAM)
  {
    return false;
  }
  return true;
}

Template.profile_modal.helpers({
  get_min_trade_param: function() {
    return MIN_TRADE_PARAM;
  },
  get_max_trade_param: function() {
    return MAX_TRADE_PARAM;
  },

  modify_status: function() {
    return Session.get("modifyStatus");
  },

  name_lookup: function(user_id) {
    return nameLookup(user_id);
  },

  exists_param_error: function() {
    return Session.get("paramError");
  },
  other_user_timeline: function() {
    return Session.get("otherUserTimeline");
  },
	proposing_trade_to: function() {
		return Meteor.users.findOne({"_id":Session.get("proposing_trade_to")}).profile.name;
	},
  get_user_by_id: function(user_id) {
    return Meteor.users.findOne({"_id":user_id});
  },
  has_current_trade_relationship: function(user_id){
    return has_current_trade_relationship(user_id);
  },
  exists_pending_trade_request: function(user_id) {
    return existsPendingTradeRequest(user_id);
  },
  exists_bio: function(user_id) {
    var user = getSpecificUser(user_id);
    var profile = user && user.profile;
    if (profile.bio) {
      return true;
    }
    else {
      return false;
    }
  },
  exists_interests: function(user_id){
    var user = getSpecificUser(user_id);
    var profile = user && user.profile;
    if (profile.interests) {
      return true;
    }
    else {
      return false;
    }
  },

  bio: function(user_id) {
    var user = getSpecificUser(user_id);
    return user && user.profile && user.profile.bio;
  },

  interests: function(user_id) {
    var user = getSpecificUser(user_id);
    return user && user.profile && user.profile.interests;
  },
  dateConverter: function(date) {
    return dateConverter(date);
  }
});

Template.profile_modal.events({
  'shown.bs.modal .profile-modal': function() {
    if (Session.equals("modifyStatus", true)) {
      $(".num-them").val(Session.get("old_proposed_from"));
      $(".num-you").val(Session.get("old_proposed_to"));
    }
  },

  'click #propose-modified-trade': function(event, template) {
    event.preventDefault();

    // Push the old request to the historic collection
    var user_id_to = Meteor.userId();
    var user_id_from = Session.get("modify_trade_from_id");
    var old_proposed_from = Session.get("old_proposed_from");
    var old_proposed_to = Session.get("old_proposed_to");
    
    Meteor.call("pushHistoricTradeRequest", user_id_from, user_id_to, old_proposed_from, old_proposed_to, "modified");
    // Update the current trade request
    var user_id_to = Session.get("modify_trade_from_id");
    var user_id_from = Meteor.userId();
    var new_proposed_from = template.find('.num-you').value;
    var new_proposed_to = template.find('.num-them').value;
    Meteor.call("updateCurrentTradeRequest", user_id_from, user_id_to, new_proposed_from, new_proposed_to);
    Session.set("modifyStatus", false);
  },


  'click #make-offer': function(e, template) {
    e.preventDefault();
    var user_id_to = this._id;
    var user_id_from = Meteor.userId();
    var proposed_from = template.find('.num-you').value;
    var proposed_to = template.find('.num-them').value;

    if (!(checkOfferParam(proposed_from) && checkOfferParam(proposed_to))) {
        Session.set("paramError", true);
        $('.modal').modal('hide');
        return;
    }

    Meteor.call("updateCurrentTradeRequest", user_id_from, user_id_to, proposed_from, proposed_to);
    $('.modal').modal('hide');
  },

  'hidden.bs.modal .modal': function() {
    Session.set("paramError", false);
  }

});
