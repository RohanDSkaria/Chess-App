const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect('mongodb://localhost/chess', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const GameSchema = new mongoose.Schema({
  fen: String,
  history: [String],
  clock: {
    white: Number,
    black: Number,
  },
});

const Game = mongoose.model('Game', GameSchema);

io.on('connection', (socket) => {
  socket.on('createGame', async (callback) => {
    const newGame = new Game({ fen: 'start', history: [], clock: { white: 600, black: 600 } });
    await newGame.save();
    callback(newGame._id);
  });

  socket.on('joinGame', (gameId) => {
    socket.join(gameId);
  });

  socket.on('move', async (gameId, move) => {
    const game = await Game.findById(gameId);
    game.history.push(move.san);
    game.fen = move.fen;
    await game.save();
    io.to(gameId).emit('move', move);
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});