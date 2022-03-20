"use strict";

//Creating a new game object 
var GameObj = function() {
    this.indexes = [0, 1];
    this.colors = ['blue', 'red'];
    this.shapes = ['cross', 'circle'];
    this.grid = [];
    this.nextTurn = -1;
    this.running = false;

    this.players = [];
};
GameObj.prototype.newPlayer = function(player) {
    if (this.indexes.length == 0) {
        return false;
    }
    var index = this.indexes.shift();

    player.index = index;
    player.GameObj = this;
    player.color = this.colors.shift();
    player.shape = this.shapes.shift();
    this.players[index] = player;

    var initMessage = { 'type': 'connection', 'index': index, 'players': this.getPlayersData() };
    player.sendData(initMessage);
    this.broadcast({ 'type': 'newplayer', 'index': index, 'players': this.getPlayersData() });

    if (this.indexes.length == 0) {
        this.start();
    } else {
        this.broadcast({ 'type': 'message', 'text': 'Waiting for another player...' });
    }

    return true;
};

GameObj.prototype.getPlayersData = function() {
    var data = [];
    for (var i in this.players) {
        if (this.players[i] != null && this.players.hasOwnProperty(i)) {
            data[i] = { color: this.players[i].color, shape: this.players[i].shape };
        }
    }
    return data;
};

GameObj.prototype.start = function() {
    this.running = true;
    this.nextTurn = 0;
    this.grid = [
        [-1, -1, -1],
        [-1, -1, -1],
        [-1, -1, -1]
    ];

    var message = { 'type': 'newGameObj', 'next': this.nextTurn };
    this.broadcast(message);
};

GameObj.prototype.hasFreeSlot = function() {
    return this.indexes.length > 0;
};

GameObj.prototype.processMove = function(coords, player) {
    if (!this.running) {
        player.sendMessage('The GameObj did not begin yet.');
        return;
    }
    if (this.nextTurn != player.index) {
        player.sendMessage('Its not your turn to play.');
        return;
    }

    if (this.grid[coords.x][coords.y] == -1) {
        this.grid[coords.x][coords.y] = player.index;
        this.nextTurn++;
        this.nextTurn %= 2;

        var win = checkWin(this.grid);
        var message = {
            'type': 'move',
            'coords': coords,
            'index': player.index,
            'next': this.nextTurn,
            'win': win
        };
        this.broadcast(message);

        if (win != -1) {
            this.endGameObj('Player ' + win + ' win.');
        }

    } else {
        player.sendMessage('Move is not allowed');
    }
};

GameObj.prototype.onPlayerQuit = function(player) {
    var index = player.index;
    player.GameObj = null;

    this.colors.push(player.color);
    this.shapes.push(player.shape);

    this.players[index] = null;

    this.indexes.push(index);

    this.endGameObj('The player ' + index + 'quit the GameObj.');
};

GameObj.prototype.endGameObj = function(reason) {
    this.nextTurn = -1;
    this.running = false;

    this.broadcast({ 'type': 'endGameObj', 'text': reason });
};
GameObj.prototype.broadcast = function(message) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i] != null) {
            this.players[i].sendData(message);
        }
    }
};

function checkWin(grid) {
    var current = -1;
    // check columns
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
            if (grid[i][j] == -1) {
                current = -1;
                break;
            }
            if (grid[i][j] == current || current == -1) {
                current = grid[i][j];
                if (j == grid.length - 1) {
                    return current;
                }
            } else {
                current = -1;
                break;
            }
        }
    }

    // check lines
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
            if (grid[j][i] == -1) {
                current = -1;
                break;
            }
            if (grid[j][i] == current || current == -1) {
                current = grid[j][i];
                if (j == grid.length - 1) {
                    return current;
                }
            } else {
                current = -1;
                break;
            }
        }
    }

    // check diags
    for (var i = 0; i < grid.length; i++) {
        if (grid[i][i] == -1) {
            current = -1;
            break;
        }
        if (grid[i][i] == current || current == -1) {
            current = grid[i][i];
            if (i == grid.length - 1) {
                return current;
            }
        } else {
            current = -1;
            break;
        }
    }
    for (var i = 0; i < grid.length; i++) {
        var j = grid.length - i - 1;
        if (grid[i][j] == -1) {
            break;
        }
        if (grid[i][j] == current || current == -1) {
            current = grid[i][j];
            if (i == grid.length - 1) {
                return current;
            }
        } else {
            current = -1;
            break;
        }
    }

    return -1;
}

exports.GameObj = GameObj;