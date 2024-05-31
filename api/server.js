

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

let gameData = {
  gameId: 1,
  board: [],
  players: { player1: 0, player2: 0 },
  turn: 'player1',
  pairsFound: 0,
  playerNames: { player1: '', player2: '' },
  playerAvatars: { player1: '', player2: '' }
};


let cumulativeScores = { player1: 0, player2: 0 };

app.post('/reset-game', (req, res) => {
  cumulativeScores.player1 += gameData.players.player1;
  cumulativeScores.player2 += gameData.players.player2;
  initializeGame();
  res.json({ gameData, cumulativeScores });
});


const cards = [
  'AS', 'AH', 'AD', 'AC', '2S', '2H', '2D', '2C',
  '3S', '3H', '3D', '3C', '4S', '4H', '4D', '4C',
  '5S', '5H', '5D', '5C', '6S', '6H', '6D', '6C',
  '7S', '7H', '7D', '7C', '8S', '8H', '8D', '8C',
  '9S', '9H', '9D', '9C', '10S', '10H', '10D', '10C',
  'JS', 'JH', 'JD', 'JC', 'QS', 'QH', 'QD', 'QC',
  'KS', 'KH', 'KD', 'KC',
];

function initializeGame() {
  gameData.board = [];
  const selectedCards = cards.sort(() => 0.5 - Math.random()).slice(0, 10);
  const shuffledDeck = [...selectedCards, ...selectedCards].sort(() => 0.5 - Math.random());
  shuffledDeck.forEach((card, index) => {
    gameData.board.push({ id: index, card, flipped: false, matched: false });
  });
  gameData.players.player1 = 0;
  gameData.players.player2 = 0;
  gameData.turn = Math.random() < 0.5 ? 'player1' : 'player2';
  gameData.pairsFound = 0;
  gameData.playerNames = { player1: '', player2: '' };
  gameData.playerAvatars = { player1: '', player2: '' };
  console.log('Game initialized:', gameData);
}


app.post('/set-players', (req, res) => {
  const { player1, player2, avatar1, avatar2 } = req.body;
  gameData.playerNames.player1 = player1;
  gameData.playerNames.player2 = player2;
  gameData.playerAvatars.player1 = avatar1;
  gameData.playerAvatars.player2 = avatar2;
  res.json(gameData);
});


app.post('/new-game', (req, res) => {
 // res.status(200).send({ message: 'New game created' });
  initializeGame();
  res.json({ gameData, cumulativeScores });
});

app.post('/flip-card', (req, res) => {
  const { index1, index2 } = req.body;
  const { board, turn } = gameData;

  if (index1 === index2) {
    return res.status(400).json({ error: 'Cannot flip the same card twice.' });
  }
  if (index1 < 0 || index1 >= board.length || index2 < 0 || index2 >= board.length) {
    return res.status(400).json({ error: 'Card index out of range.' });
  }
  if (board[index1].flipped || board[index2].flipped) {
    return res.status(400).json({ error: 'Card already flipped.' });
  }

  board[index1].flipped = true;
  board[index2].flipped = true;

  if (board[index1].card === board[index2].card) {
    board[index1].matched = true;
    board[index2].matched = true;
    // console.log('game turn ~~~~', gameData.players[turn]);
    // gameData.players[turn] += 1;
    gameData.players[turn] += 1; // Correctly assigning the score to the current player
    gameData.pairsFound += 1;
  } else {
    setTimeout(() => {
      board[index1].flipped = false;
      board[index2].flipped = false;
      gameData.turn = turn === 'player1' ? 'player2' : 'player1';
    }, 100); // Delay of 1 second
  }

  res.json(gameData);
});


app.get('/game-state', (req, res) => {
  res.json(gameData);
});


app.post('/reset-cumulative-scores', (req, res) => {
  cumulativeScores.player1 = 0;
  cumulativeScores.player2 = 0;
  res.json({ message: 'Cumulative scores reset.', cumulativeScores });
});


app.post('/reset-game', (req, res) => {
  cumulativeScores.player1 += gameData.players.player1;
  cumulativeScores.player2 += gameData.players.player2;
  initializeGame();
  res.json({ gameData, cumulativeScores });
});

initializeGame();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
