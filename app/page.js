"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Select from 'react-select';

export default function Home() {
  const API_URL = "http://localhost:3001";
  const avatars = ["/avatars/av1.png", "/avatars/av2.png", "/avatars/av3.png"];

  const [gameState, setGameState] = useState(null);
  const [flippedCards, setFlippedCards] = useState([]);
  const [cumulativeScores, setCumulativeScores] = useState({
    player1: 0,
    player2: 0,
  });
  const [showModal, setShowModal] = useState(true);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [player1Avatar, setPlayer1Avatar] = useState("/avatars/av1.png");
  const [player2Avatar, setPlayer2Avatar] = useState("/avatars/av2.png");

  const avatarOptions = avatars.map((avatar, index) => ({
    value: avatar,
    label: `Avatar ${index + 1}`,
    image: { avatar },
  }));

  useEffect(() => {
    axios
      .post(`${API_URL}/new-game`)
      .then((response) => {
        setGameState(response.data.gameData);
        setCumulativeScores(response.data.cumulativeScores);
      })
      .catch((error) => {
        console.error("Error initializing new game:", error);
      });
  }, []);

  function handleAvatarClick(player, avatar) {
    if (player === 1) {
      setPlayer1Avatar(avatar);
    } else if (player === 2) {
      setPlayer2Avatar(avatar);
    }
  }

  const initializeGame = async (player1, player2, avatar1, avatar2) => {
    try {
      await axios.post(`${API_URL}/set-players`, {
        player1,
        player2,
        avatar1,
        avatar2,
      });
      const newGameResponse = await axios.post(`${API_URL}/new-game`);
      setGameState(newGameResponse.data.gameData);
      setCumulativeScores(newGameResponse.data.cumulativeScores);
    } catch (error) {
      console.error("Error initializing new game:", error);
    }
  };

  useEffect(() => {
    if (!showModal && player1Name && player2Name) {
      initializeGame(player1Name, player2Name, player1Avatar, player2Avatar);
    }
  }, [showModal, player1Name, player2Name, player1Avatar, player2Avatar]);

  const handleCardClick = (index) => {
    if (flippedCards.length === 1) {
      const [firstIndex] = flippedCards;
      axios
        .post(`${API_URL}/flip-card`, { index1: firstIndex, index2: index })
        .then((response) => {
          const newGameState = response.data;
          if (
            newGameState.board[firstIndex].card !==
            newGameState.board[index].card
          ) {
            setTimeout(() => {
              newGameState.board[firstIndex].flipped = false;
              newGameState.board[index].flipped = false;
              setGameState({ ...newGameState });
            }, 100); // Instant flip back delay
          }
          setGameState(newGameState);
          setFlippedCards([]);
        })
        .catch((error) => {
          console.error("Error flipping card:", error.response.data.error);
          setFlippedCards([]);
        });
    } else {
      setFlippedCards([index]);
      const newGameState = { ...gameState };
      newGameState.board[index].flipped = true;
      setGameState(newGameState);
    }
  };

  const handleNewGame = () => {
    axios
      .post(`${API_URL}/reset-game`)
      .then((response) => {
        setGameState(response.data.gameData);
        setCumulativeScores(response.data.cumulativeScores);
      })
      .catch((error) => {
        console.error("Error starting new game:", error);
      });
  };

  const handleModalSubmit = (event) => {
    event.preventDefault();
    if (player1Name && player2Name) {
      setShowModal(false);
    }
  };

  const handleResetCumulativeScores = () => {
    console.log("resetting scores");
    axios
      .post(`${API_URL}/reset-cumulative-scores`)
      .then((response) => {
        setCumulativeScores(response.data.cumulativeScores);
      })
      .catch((error) => {
        console.error("Error resetting cumulative scores:", error);
      });
  };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen py-2"
      style={{ backgroundColor: "black", color: "white", padding: "20px" }}
    >
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Enter Player Names</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="player1"
                >
                  Player 1 Name
                </label>
                <input
                  id="player1"
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <Select
  value={avatarOptions.find(option => option.value === player1Avatar)}
  onChange={(option) => setPlayer1Avatar(option.value)}
  options={avatarOptions}
  formatOptionLabel={(option) => (
    <div>
      <img src={option.image.avatar} alt={option.label} width={20} height={20} />
      
    </div>
  )}
/>
              <div className="mb-4"></div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="player2"
                >
                  Player 2 Name
                </label>
                <input
                  id="player2"
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <Select
  value={avatarOptions.find(option => option.value === player2Avatar)}
  onChange={(option) => setPlayer1Avatar(option.value)}
  options={avatarOptions}
  formatOptionLabel={(option) => (
    <div>
      <img src={option.image.avatar} alt={option.label} width={20} height={20} />
      
    </div>
  )}
/>
              <div className="mb-4"></div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Start Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center w-full">
        <h1 className="text-2xl font-bold">Memory Game</h1>
        <button
          onClick={handleNewGame}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          New Game
        </button>
        <button
          onClick={handleResetCumulativeScores}
          className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Reset Scores
        </button>
      </div>
      <div className="flex items-center justify-center w-full mt-4">
        <div className="px-4 py-2 bg-orange-500 rounded">
          <h2 className="text-xl font-bold">
            {player1Name}: {gameState.playerNames.player1}
          </h2>
          <Image src={player1Avatar} alt="Avatar 1" width={50} height={50} />
          <h2 className="text-xl font-bold">
            Score: {gameState.players.player1}
          </h2>
          <h2 className="text-xl font-bold">
            Cumulative Score: {cumulativeScores.player1}
          </h2>
        </div>
        <div className="ml-4 px-4 py-2 bg-orange-500 rounded">
          <h2 className="text-xl font-bold">
            {player2Name}: {gameState.playerNames.player2}
          </h2>
          <Image src={player2Avatar} alt="Avatar 2" width={50} height={50} />
          <h2 className="text-xl font-bold">
            Score: {gameState.players.player2}
          </h2>
          <h2 className="text-xl font-bold">
            Cumulative Score: {cumulativeScores.player2}
          </h2>
        </div>
      </div>
      <div className="mt-4">
        <h2
          className={`text-xl font-bold ${
            gameState.turn === "player1" ? "text-red-500" : "text-green-500"
          }`}
        >
          Current Turn:{" "}
          {gameState.turn === "player1" ? player1Name : player2Name}
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
        }}
      >
        {gameState.board.map((card, index) => (
          <div
            key={index}
            style={{
              width: "100px",
              height: "150px",
              border: "1px solid black",
              background: "gray",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: flippedCards.includes(index)
                ? "0 0 0 4px green"
                : "none",
            }}
            onClick={() => handleCardClick(index)}
          >
            {card.flipped || card.matched ? (
              <img
                src={`/cards/${card.card}.png`}
                alt={card.card}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <img
                src="/cards/back.png"
                alt="back"
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
