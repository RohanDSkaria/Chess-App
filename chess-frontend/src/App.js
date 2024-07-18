import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [clock, setClock] = useState({ white: 600, black: 600 });

  useEffect(() => {
    socket.on('move', (move) => {
      game.move(move);
      setGame(new Chess(game.fen()));
      setMoveHistory([...moveHistory, move]);
    });

    const timer = setInterval(() => {
      // update clock logic
    }, 1000);

    return () => clearInterval(timer);
  }, [game, moveHistory]);

  const onDrop = (sourceSquare, targetSquare) => {
    const move = game.move({ from: sourceSquare, to: targetSquare });
    if (move) {
      setGame(new Chess(game.fen()));
      setMoveHistory([...moveHistory, move]);
      socket.emit('move', move);
    }
  };

  const onSquareClick = (square) => {
    const moves = game.moves({ square, verbose: true });
    const highlights = {};
    moves.forEach((move) => {
      highlights[move.to] = true;
    });
    setHighlightedSquares(highlights);
  };

  return (
    <div>
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        customSquareStyles={highlightedSquares}
      />
      <div>{/* Timer and move history components */}</div>
    </div>
  );
};

export default ChessGame;
