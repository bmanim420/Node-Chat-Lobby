
var uuid = require('node-uuid');
Session.prototype.users = require('./users.js').userList;
Session.prototype.id;
Session.prototype.timeCreated;
Session.prototype.user_ids = [];

function Session() {
	this.id = uuid.v4();
	this.timeCreated = new Date().getTime() / 1000;
	console.log('New session created.');
}

Session.prototype.addUser = function(user_id) {
	// Add user
    this.user_ids.push(user_id);
    console.log('User added to session.');
};

Session.prototype.removeUser = function(user_id) {
	// Remove user from session
	var i = 0;
	for (i; i< this.user_ids.length; i++) {
		if (this.user_ids[i] === user_id)
			break;
	}
	this.user_ids.splice(i, 1);
    // Notify other users
	this.emitToAll('updateUserList', {
		sessionId: this.id,
		userList:  this.getEmittableUserList()
	});
	// Log
	console.log('User removed from session.');
};

Session.prototype.userCount = function() {
	return this.user_ids.length;
};

Session.prototype.emitToAll = function(endpoint, data) {
	for (var i = 0; i < this.user_ids.length; i++) {
		var id = this.user_ids[i];
		this.users[id].emit(endpoint, data);
	}
};

Session.prototype.getEmittableUserList = function() {
	var userList = [];
	for (var i = 0; i < this.user_ids.length; i++) {
		var user_id = this.user_ids[i];
		userList.push({
	    	face: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRdqpVGEZ3aVpT7frjjko-omJyki-EEU7FEZtdDk0tVZIqOw5L1',
	        id: user_id,
	        username: this.users[user_id].username,
	        x: 0,
	        y: 0,
	        a: 0 //angle
	    });
	}
	return userList;
};


module.exports = Session;