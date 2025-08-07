// games/golden.js
import { GameCore, BaseGame } from '../core.js';
import { UserService } from '../user-service.js';

export default class GoldenGame extends BaseGame {
  constructor() {
    super('golden');
    this.loadUserData();
  }
  
  loadUserData() {
    const user = UserService.getUser();
    this.gameState.playerCoins = user.coins;
    this.gameState.wins = user.wins || 0;
    this.gameState.games = user.games || 0;
  }
  
  saveUserData() {
    const user = UserService.getUser();
    user.coins = this.gameState.playerCoins;
    user.wins = this.gameState.wins;
    user.games = this.gameState.games;
    UserService.updateUser(user);
  }
  
  init() {
    this.gameState.reset();
    this.loadUserData();
    this.gameState.deck = GameCore.createDeck();
    this.gameState.playerCards = [];
    this.gameState.computerCards = [];
    this.gameState.pot = 0;
    this.gameState.playerBet = 0;
    this.gameState.computerBet = 0;
    this.gameState.phase = 'waiting';
    
    return this.generateUI();
  }
  
  generateUI() {
    return `
      <div class="golden-game">
        <!-- 电脑区域 -->
        <div class="computer-section">
          <div class="player-info">电脑</div>
          <div class="cards-container" id="computer-cards"></div>
          <div class="computer-bet">下注: ${this.gameState.computerBet}金币</div>
        </div>
        
        <!-- 底池显示 -->
        <div class="pot-display">
          底池: ${this.gameState.pot} 金币
        </div>
        
        <!-- 玩家区域 -->
        <div class="player-section">
          <div class="player-info">你 (金币: ${this.gameState.playerCoins})</div>
          <div class="cards-container" id="player-cards"></div>
          <div class="player-bet">下注: ${this.gameState.playerBet}金币</div>
        </div>
        
        <!-- 状态信息 -->
        <div class="status-message" id="status-message">
          请点击"开始游戏"按钮开始
        </div>
      </div>
    `;
  }
  
  initControls() {
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
    if (this.gameState.phase === 'waiting') {
      const startButton = document.createElement('button');
      startButton.className = 'control-btn';
      startButton.textContent = '开始游戏';
      startButton.onclick = () => this.startGame();
      gameControls.appendChild(startButton);
    }
  }
  
  startGame() {
    this.gameState.games++;
    this.gameState.deck = GameCore.createDeck();
    this.gameState.playerCards = this.drawCards(3);
    this.gameState.computerCards = this.drawCards(3);
    this.gameState.phase = 'betting';
    this.gameState.pot = 0;
    this.gameState.playerBet = 0;
    this.gameState.computerBet = 0;
    
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = this.generateUI();
    
    const playerCardsContainer = document.getElementById('player-cards');
    this.gameState.playerCards.forEach(card => {
      playerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    const computerCardsContainer = document.getElementById('computer-cards');
    for (let i = 0; i < 3; i++) {
      computerCardsContainer.appendChild(GameCore.renderCardBack());
    }
    
    document.getElementById('status-message').textContent = '请下注';
    this.updateControls();
  }
  
  drawCards(count) {
    return this.gameState.deck.splice(0, count);
  }
  
  updateControls() {
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
    if (this.gameState.phase === 'betting') {
      const bet10Button = document.createElement('button');
      bet10Button.className = 'control-btn';
      bet10Button.textContent = '下注 10金币';
      bet10Button.onclick = () => this.placeBet(10);
      gameControls.appendChild(bet10Button);
      
      const bet20Button = document.createElement('button');
      bet20Button.className = 'control-btn';
      bet20Button.textContent = '下注 20金币';
      bet20Button.onclick = () => this.placeBet(20);
      gameControls.appendChild(bet20Button);
      
      const openButton = document.createElement('button');
      openButton.className = 'control-btn';
      openButton.textContent = '开牌';
      openButton.onclick = () => this.openCards();
      gameControls.appendChild(openButton);
      
      const foldButton = document.createElement('button');
      foldButton.className = 'control-btn';
      foldButton.textContent = '弃牌';
      foldButton.onclick = () => this.fold();
      gameControls.appendChild(foldButton);
    } else if (this.gameState.phase === 'result') {
      const restartButton = document.createElement('button');
      restartButton.className = 'control-btn';
      restartButton.textContent = '再来一局';
      restartButton.onclick = () => this.init();
      gameControls.appendChild(restartButton);
      
      const homeButton = document.createElement('button');
      homeButton.className = 'control-btn';
      homeButton.textContent = '返回首页';
      homeButton.onclick = () => window.location.href = 'index.html';
      gameControls.appendChild(homeButton);
    }
  }
  
  placeBet(amount) {
    if (this.gameState.playerCoins < amount) {
      document.getElementById('status-message').textContent = '金币不足！';
      return;
    }
    
    this.gameState.playerCoins -= amount;
    this.gameState.playerBet += amount;
    this.gameState.pot += amount;
    
    let computerBet = 10;
    const computerHandValue = this.evaluateHand(this.gameState.computerCards).value;
    
    if (computerHandValue >= 4) {
      computerBet = amount;
    } else if (Math.random() > 0.3) {
      this.computerFold();
      return;
    }
    
    this.gameState.computerBet += computerBet;
    this.gameState.pot += computerBet;
    
    this.saveUserData();
    
    document.querySelector('.pot-display').textContent = `底池: ${this.gameState.pot} 金币`;
    document.querySelector('.player-info').textContent = `你 (金币: ${this.gameState.playerCoins})`;
    document.querySelector('.player-bet').textContent = `下注: ${this.gameState.playerBet}金币`;
    document.querySelector('.computer-bet').textContent = `下注: ${this.gameState.computerBet}金币`;
    
    document.getElementById('status-message').textContent = 
      `你下注${amount}金币，电脑下注${computerBet}金币`;
  }
  
  computerFold() {
    this.gameState.phase = 'result';
    this.gameState.playerCoins += this.gameState.pot;
    this.gameState.wins++;
    this.saveUserData();
    
    document.getElementById('status-message').textContent = '电脑弃牌，你赢了！';
    
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    this.updateControls();
  }
  
  fold() {
    this.gameState.phase = 'result';
    this.saveUserData();
    document.getElementById('status-message').textContent = '你弃牌了，电脑获胜！';
    
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    this.updateControls();
  }
  
  openCards() {
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    const playerHand = this.evaluateHand(this.gameState.playerCards);
    const computerHand = this.evaluateHand(this.gameState.computerCards);
    
    let winner = '';
    if (playerHand.value > computerHand.value) {
      winner = 'player';
    } else if (playerHand.value < computerHand.value) {
      winner = 'computer';
    } else {
      const playerMax = this.getMaxCardValue(this.gameState.playerCards);
      const computerMax = this.getMaxCardValue(this.gameState.computerCards);
      if (playerMax > computerMax) {
        winner = 'player';
      } else if (playerMax < computerMax) {
        winner = 'computer';
      } else {
        winner = 'tie';
      }
    }
    
    let message = '';
    if (winner === 'player') {
      message = `恭喜你赢了！你的牌型: ${playerHand.type}, 电脑牌型: ${computerHand.type}`;
      this.gameState.playerCoins += this.gameState.pot;
      this.gameState.wins++;
      this.saveResult('player', this.gameState.pot);
    } else if (winner === 'computer') {
      message = `电脑赢了！你的牌型: ${playerHand.type}, 电脑牌型: ${computerHand.type}`;
      this.saveResult('computer', -this.gameState.playerBet);
    } else {
      message = `平局！你的牌型: ${playerHand.type}, 电脑牌型: ${computerHand.type}`;
      this.gameState.playerCoins += this.gameState.playerBet;
      this.saveResult('tie', 0);
    }
    
    this.saveUserData();
    document.getElementById('status-message').textContent = message;
    document.querySelector('.player-info').textContent = `你 (金币: ${this.gameState.playerCoins})`;
    this.gameState.phase = 'result';
    this.updateControls();
  }
  
  evaluateHand(cards) {
    const sortedCards = [...cards].sort((a, b) => a.value - b.value);
    
    const isFlush = sortedCards.every(card => 
      card.suit === sortedCards[0].suit
    );
    
    let isStraight = false;
    if (
      sortedCards[2].value - sortedCards[1].value === 1 &&
      sortedCards[1].value - sortedCards[0].value === 1
    ) {
      isStraight = true;
    } else if (
      sortedCards[0].value === 2 &&
      sortedCards[1].value === 3 &&
      sortedCards[2].value === 14
    ) {
      isStraight = true;
      sortedCards[2].value = 1;
      sortedCards.sort((a, b) => a.value - b.value);
    }
    
    let isPair = false;
    let isThreeOfAKind = false;
    const rankCount = {};
    sortedCards.forEach(card => {
      rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
    });
    
    const counts = Object.values(rankCount);
    if (counts.includes(3)) {
      isThreeOfAKind = true;
    } else if (counts.includes(2)) {
      isPair = true;
    }
    
    if (isFlush && isStraight) {
      return { type: '同花顺', value: 6 };
    }
    if (isThreeOfAKind) {
      return { type: '豹子', value: 5 };
    }
    if (isFlush) {
      return { type: '同花', value: 4 };
    }
    if (isStraight) {
      return { type: '顺子', value: 3 };
    }
    if (isPair) {
      return { type: '对子', value: 2 };
    }
    
    return { type: '单张', value: 1 };
  }
  
  getMaxCardValue(cards) {
    return Math.max(...cards.map(card => card.value));
  }
  
  saveResult(winner, winAmount) {
    super.saveResult(winner, winAmount);
  }
}