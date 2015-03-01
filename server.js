#!/bin/env node
var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var users = require('./users.js').userList;
var sessionmanager = require('./sessionmanager.js');


/*
 * Page serving functions
 */
app.use(express.static(__dirname + '/client'));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});


/*
 * Connection listeners
 */
io.on('connection', function(user)
{
	/* Find Session listener */
	user.on('findSession', function(username) {
		// Make sure username isnt blank
		if (isBlank(username)) return;
		// Assign provided username to user
	    user.username = username;
	    // If user is already in a session, remove him
	    if (user.session_id) {
	    	sessionmanager.removeUserFromSession(user.id, user.session_id);
	    	delete user.session_id;
	    }
	    // Find user a session
	    sessionmanager.findSession(user.id, function(session_id) {
	    	// Assign session to the user
			user.session_id = session_id;
			// Add the user to the user list
  			users[user.id] = user;
  			// Tell user they have found a session
  			user.emit('sessionFound');
  			// Update all users in session with the new user list
  			var userList = sessionmanager.sessions[session_id].getEmittableUserList();
  			sessionmanager.sessions[session_id].emitToAll('updateUserList', {
  				sessionId: session_id,
  				userList:  userList
  			});
	    }); 
	});

	/* Disconnect listener */
	user.on('disconnect', function() {
		if (user.username)
			console.log(user.username + ' disconnected.');
		if (user.session_id)
			sessionmanager.removeUserFromSession(user.id, user.session_id);
		if (users[user.id])
			delete users[user.id];
	});

	/* Chat broadcast listener */
	user.on('chatMsg', function(data) {
		if (!user.username || !user.session_id || isBlank(data)) return;
		sessionmanager.sessions[user.session_id].emitToAll('chatMsg', {
			username: user.username,
			message:  data
		});
	});
});


/*
 * Start server
 */
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var ip = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
http.listen(port, ip, function() {
	console.log('Server started on port ' + port + '.');
});

/*
 * Returns true if a string is empty or whitespace
 */
function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

module.exports = function getUsers() {
    return users;
}