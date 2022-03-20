"use strict";

//Creating a method for player's game
var PlayerObject = function(connection) {
    connection.player = this;
    this.connection = connection;

    this.index = 0;
    this.game = null;
    this.color = null;
    this.shape = null;
};

PlayerObject.prototype.sendData = function(message) {
    if (typeof message == 'object') {
        message = JSON.stringify(message);
    }
    this.connection.sendText(message);
};

PlayerObject.prototype.sendMessage = function(message) {
    var json = { 'type': 'messageGame', 'text': message };
    this.sendData(json);
};

exports.Player = PlayerObject;