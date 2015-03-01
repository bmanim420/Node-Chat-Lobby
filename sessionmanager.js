
var Session = require('./session.js');

var SessionManager = module.exports = {
    MAX_USERS_PER_SESSION: 2,
	sessions: {},

    findSession: function(user_id, callback) {
        // If no sessions exist create one
	    if (Object.keys(this.sessions).length === 0) {
	    	var s = this.createSession();
	    	this.sessions[s.id] = s;
	    	this.addUserToSession(user_id, s.id);
	        callback(s.id);
	        return;
	    }

		// Find oldest session
		var found_session_id = null;
		var oldest_time = Number.MAX_SAFE_INTEGER;

	    for (var key in this.sessions) {
	        if (this.sessions.hasOwnProperty(key)) {
	            if (this.sessions[key].userCount() < this.MAX_USERS_PER_SESSION) {
	                if (this.sessions[key].timeCreated <= oldest_time) {
					    found_session_id  = key;
					    oldest_time = this.sessions[key].timeCreated;
					}
				}
		    }
		}

		// If sessions are all full then create a new one
		if (found_session_id === null) {
			var s = this.createSession();
			this.sessions[s.id] = s;
			this.addUserToSession(user_id, s.id);
	        callback(s.id);
	        return;
		}

		// Reaching this point means a session was found
		this.addUserToSession(user_id, found_session_id);
		callback(found_session_id);
    },

    addUserToSession: function(user_id, session_id) {
        this.sessions[session_id].addUser(user_id);
    },

    removeUserFromSession: function(user_id, session_id) {
        // Remove user from session
		this.sessions[session_id].removeUser(user_id);
		// If there are no more users in the session then delete it
		if (this.sessions[session_id].user_ids.length === 0)
			delete this.sessions[session_id];
    },

    createSession: function() {
        var s = new Session();
		return s;
    }
}