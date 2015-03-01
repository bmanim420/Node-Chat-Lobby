
app.controller("ApplicationController", function($scope) {
    $scope.sessionId = 'None';

    var socket = io.connect('ws://' + window.location.hostname + ":8000");
    //var socket = io();

    /*
     * Connect listener
     */
    socket.on('connect', function() {
        $scope.$broadcast('event:showToast', 'Connection established.');
        appendToChat('Connection established.');
        appendToChat('Please enter a nickname and press the Find Session button in the top left of the window.');
    });

    /*
     * Disconnect listener
     */
    socket.on('disconnect', function() {
        $scope.$broadcast('event:showToast', 'You have been disconnected!.');
        appendToChat('You have been disconnected!.');
    });

    /*
     * Find session button event
     */
    $('#findSessionForm').submit(function() {
      socket.emit('findSession', $('#username').val());
      return false;
    });

    /*
     * Send chat message event
     */
    $('#chatMessageForm').submit(function() {
      console.log('Sending message');
      socket.emit('chatMsg', $('#chatMessageTextbox').val());
      $('#chatMessageTextbox').val('');
      return false;
    });

    /*
     * Session found event
     */
    socket.on('sessionFound', function() {
      $scope.$broadcast('event:showToast', 'You have joined a room.');
      appendToChat('You have joined a room.');
      $("#findSession").animate({
        height: "0",
        opacity: 0
      }, 1500);
    });

    /*
     * Update user list event
     */
    socket.on('updateUserList', function(data) {
      console.log('User list update:');
      console.log(data);

     // var oldUserList = $.extend(true, {}, userList);
      if (userList.legnth > 0) {
        // Gather clientside keys
        var clientKeys = [];
        for (var key in userList) {      
          if (userList.hasOwnProperty(key)) {
            clientKeys.push(key);
          }
        }
        // Gather serverside keys
        var serverKeys = [];
        for (var key in data.userList) {      
          if (data.userList.hasOwnProperty(key)) {
            serverKeys.push(key);
          }
        }

        // Search for new users
        for (var s = 0; s < serverKeys.length; s++) {
          var userId = data.userList[serverKeys[s]].id;
          var found = false;
          for (var c = 0; c < clientKeys.length; c++) {
            if (userList[clientKeys[c]].id === userId) {
              found = true;
              break;
            }
          }
          if (!found) {
            // New user
            $scope.$broadcast('event:showToast', data.userList[serverKeys[s]].username + ' connected.');
          }
        }

        // Search for disconnected users
        for (var c = 0; c < clientKeys.length; c++) {
          var userId = userList[clientKeys[c]].id;
          var found = false;
          for (var s = 0; s < serverKeys.length; s++) {
            if (data.userList[serverKeys[s]].id === userId) {
              found = true;
              break;
            }
          }
          if (!found) {
            // Disconnected user
            $scope.$broadcast('event:showToast', userList[clientKeys[c]].username + ' disconnected.');
          }
        }
      }
      // Set userlist
      userList = data.userList;
      // Set sidebar userlist
      $scope.userList = userList;
      $scope.sessionId = data.sessionId;
      $scope.$apply();
    });

    /*
     * Reveive chat message event
     */
    socket.on('chatMsg', function(data) {
      appendToChat(data.username + ': ' + data.message);
      $scope.$broadcast('event:showToast', data.username + ' says: ' + data.message);
      console.log(data);
    });

    /*
     * Movement
     */
    $scope.$on('event:move', function(e, args) {
      socket.emit('move', args);
    });
    socket.on('move', function(data) {
      //id, x, y, a (angle)
    });

    /*
     * Appends a message to the chat log
     */
    function appendToChat(msg) {
      $('#chatLog').text($('#chatLog').text() + msg + '\n');
      $('#chatLog').scrollTop($('#chatLog')[0].scrollHeight);
      $('#chatMessageTextbox').focus();
    }

    /*
     * Ensures socket is closed when user leaves
     * (This fixes a bug with firefox)
     */
    $(window).on('beforeunload', function() {
        socket.close();
    });

});







