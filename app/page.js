'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  //const API_URL = process.env.GAME_API_URL;
  const API_URL = 'https://cardgamelogic-759397bffdcc.herokuapp.com';
  const [gameState, setGameState] = useState(null);
  const [flippedCards, setFlippedCards] = useState([]);

  useEffect(() => {
    axios.post(`${API_URL}/new-game`).then(response => {
      setGameState(response.data);
    });
  }, []);

  const handleCardClick = (index) => {
    if (flippedCards.length === 1) {
      const [firstIndex] = flippedCards;
      axios.post(`${API_URL}/flip-card`, { index1: firstIndex, index2: index })
        .then(response => {
          console.log('Card flipped:', response.data);
          setGameState(response.data);
          setFlippedCards([]);
        })
        .catch(error => {
          console.error('Error flipping card:', error.response.data.error);
          setFlippedCards([]);
        });
    } else {
      setFlippedCards([index]);
    }
  };

  const handleNewGame = () => {
    axios.post(`${API_URL}/reset-game`).then(response => {
      console.log('New game started:', response.data);
      setGameState(response.data);
    }).catch(error => {
      console.error('Error starting new game:', error);
    });
  };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div  className="flex flex-col items-center justify-center min-h-screen py-2" style={{ backgroundColor: 'black', color: 'white', padding: '20px' }}>
      <div className="flex items-center justify-center w-full">
        <h1 className="text-2xl font-bold">Memory Game</h1>
        <button onClick={handleNewGame} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">New Game</button>
      </div>
      <div className="flex items-center justify-center w-full mt-4">
        <div className="px-4 py-2 bg-orange-500 rounded">
          <h2 className="text-xl font-bold">Player 1 Score: {gameState.players.player1}</h2>
        </div>
        <div className="ml-4 px-4 py-2 bg-orange-500 rounded">
          <h2 className="text-xl font-bold">Player 2 Score: {gameState.players.player2}</h2>
        </div>
      </div>
      <div className="mt-4">
        <h2 className={`text-xl font-bold ${gameState.turn === 1 ? 'text-red-500' : 'text-green-500'}`}>Current Turn: {gameState.turn}</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {gameState.board.map((card, index) => (
          <div
            key={index}
            style={{
              width: '100px',
              height: '150px',
              border: '1px solid black',
              background: 'gray',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: flippedCards.includes(index) ? '0 0 0 4px green' : 'none'  // Add green ring around the first selected card
            }}
            onClick={() => handleCardClick(index)}
          >
            {card.flipped || card.matched ? (
              <img src={`/cards/${card.card}.png`} alt={card.card} style={{ width: '100%', height: '100%' }} />
            ) : (
              <img src="/cards/back.png" alt="back" style={{ width: '100%', height: '100%' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
