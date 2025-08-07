// games/landlord.js
import { GameCore, BaseGame } from '../core.js';
import { UserService } from '../user-service.js';

export default class LandlordGame extends BaseGame {
  constructor() {
    super('landlord');
    this.loadUserData();
    this.playerRole = '';
    this.landlordCards = [];
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
    this.gameState.deck = GameCore.createLandlordDeck();
    this.gameState.playerCards = [];
    this.gameState.computerCards = [];
    this.gameState.computer2Cards = [];
    this.landlordCards = [];
    this.playerRole = '';
    this.gameState.phase = 'waiting'; // 初始阶段改为 waiting
    this.gameState.currentPlayer = '';
    this.gameState.pot = 1;
    
    return this.generateUI();
  }
  
  generateUI() {
    return `
      <div class="landlord-game">
        <!-- 电脑1区域 -->
        <div class="computer-section top-section">
          <div class="player-info">电脑1</div>
          <div class="cards-container" id="computer1-cards"></div>
        </div>
        
        <!-- 电脑2区域 -->
        <div class="computer-section right-section">
          <div class="player-info">电脑2</div>
          <div class="cards-container" id="computer2-cards"></div>
        </div>
        
        <!-- 底牌区域 -->
        <div class="landlord-cards">
          <div class="section-title">底牌</div>
          <div class="cards-container" id="landlord-cards"></div>
        </div>
        
        <!-- 底池显示 -->
        <div class="pot-display">
          当前倍数: ${this.gameState.pot}倍
        </div>
        
        <!-- 玩家区域 -->
        <div class="player-section">
          <div class="player-info">你 (${this.playerRole ? '地主' : '农民'})</div>
          <div class="cards-container" id="player-cards"></div>
        </div>
        
        <!-- 状态信息 -->
        <div class="status-message" id="status-message">
          游戏准备中...
        </div>
      </div>
    `;
  }
  
  initControls() {
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
    // 添加开始游戏按钮
    if (this.gameState.phase === 'waiting') {
      const startButton = document.createElement('button');
      startButton.className = 'control-btn';
      startButton.textContent = '开始游戏';
      startButton.onclick = () => this.startGame();
      gameControls.appendChild(startButton);
    }
    // 叫地主阶段按钮
    else if (this.gameState.phase === 'bidding') {
      const bid1Button = document.createElement('button');
      bid1Button.className = 'control-btn';
      bid1Button.textContent = '不叫';
      bid1Button.onclick = () => this.passBid();
      gameControls.appendChild(bid1Button);
      
      const bid2Button = document.createElement('button');
      bid2Button.className = 'control-btn';
      bid2Button.textContent = '叫地主 (1倍)';
      bid2Button.onclick = () => this.bid(1);
      gameControls.appendChild(bid2Button);
      
      const bid3Button = document.createElement('button');
      bid3Button.className = 'control-btn';
      bid3Button.textContent = '抢地主 (2倍)';
      bid3Button.onclick = () => this.bid(2);
      gameControls.appendChild(bid3Button);
    }
  }
  
  startGame() {
    this.gameState.games++;
    this.gameState.deck = GameCore.createLandlordDeck();
    this.gameState.playerCards = this.drawCards(17);
    this.gameState.computerCards = this.drawCards(17);
    this.gameState.computer2Cards = this.drawCards(17);
    this.landlordCards = this.drawCards(3);
    this.gameState.pot = 1;
    this.gameState.phase = 'bidding'; // 进入叫地主阶段
    
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = this.generateUI();
    
    const playerCardsContainer = document.getElementById('player-cards');
    this.gameState.playerCards.forEach(card => {
      playerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    const computer1Cards = document.getElementById('computer1-cards');
    for (let i = 0; i < 17; i++) {
      computer1Cards.appendChild(GameCore.renderCardBack());
    }
    
    const computer2Cards = document.getElementById('computer2-cards');
    for (let i = 0; i < 17; i++) {
      computer2Cards.appendChild(GameCore.renderCardBack());
    }
    
    const landlordCards = document.getElementById('landlord-cards');
    for (let i = 0; i < 3; i++) {
      landlordCards.appendChild(GameCore.renderCardBack());
    }
    
    document.getElementById('status-message').textContent = '请叫地主';
    this.initControls(); // 初始化叫地主按钮
  }
  
  drawCards(count) {
    return this.gameState.deck.splice(0, count);
  }
  
  bid(amount) {
    this.gameState.pot = amount;
    this.playerRole = 'landlord';
    this.gameState.playerCards = [...this.gameState.playerCards, ...this.landlordCards];
    
    document.querySelector('.pot-display').textContent = `当前倍数: ${this.gameState.pot}倍`;
    document.querySelector('.player-info').textContent = `你 (地主)`;
    
    const playerCardsContainer = document.getElementById('player-cards');
    playerCardsContainer.innerHTML = '';
    this.gameState.playerCards.forEach(card => {
      playerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    this.gameState.phase = 'playing';
    this.gameState.currentPlayer = 'player';
    document.getElementById('status-message').textContent = '请出牌';
    this.updateControls();
  }
  
  passBid() {
    const aiBid = Math.random() > 0.5 ? 1 : 0;
    
    if (aiBid > 0) {
      const computerIndex = Math.random() > 0.5 ? 'computer1' : 'computer2';
      this.playerRole = 'peasant';
      
      if (computerIndex === 'computer1') {
        this.gameState.computerCards = [...this.gameState.computerCards, ...this.landlordCards];
      } else {
        this.gameState.computer2Cards = [...this.gameState.computer2Cards, ...this.landlordCards];
      }
      
      this.gameState.pot = aiBid;
      document.querySelector('.pot-display').textContent = `当前倍数: ${this.gameState.pot}倍`;
      document.getElementById('status-message').textContent = 
        `电脑${computerIndex === 'computer1' ? '1' : '2'}成为地主`;
    } else {
      document.getElementById('status-message').textContent = '无人叫地主，重新开始';
      setTimeout(() => this.init(), 2000);
      return;
    }
    
    this.gameState.phase = 'playing';
    this.gameState.currentPlayer = computerIndex;
    setTimeout(() => this.computerPlay(), 1500);
  }
  
  updateControls() {
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
    if (this.gameState.phase === 'playing' && this.gameState.currentPlayer === 'player') {
      const playButton = document.createElement('button');
      playButton.className = 'control-btn';
      playButton.textContent = '出牌';
      playButton.onclick = () => this.playCards();
      gameControls.appendChild(playButton);
      
      const passButton = document.createElement('button');
      passButton.className = 'control-btn';
      passButton.textContent = '不出';
      passButton.onclick = () => this.pass();
      gameControls.appendChild(passButton);
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
  
  playCards() {
    const validCards = this.getValidCards();
    if (validCards.length === 0) {
      document.getElementById('status-message').textContent = '没有有效的牌可出';
      return;
    }
    
    const cardToPlay = validCards[Math.floor(Math.random() * validCards.length)];
    const cardIndex = this.gameState.playerCards.findIndex(
      card => card.suit === cardToPlay.suit && card.rank === cardToPlay.rank
    );
    if (cardIndex !== -1) {
      this.gameState.playerCards.splice(cardIndex, 1);
    }
    
    const playerCardsContainer = document.getElementById('player-cards');
    playerCardsContainer.innerHTML = '';
    this.gameState.playerCards.forEach(card => {
      playerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    if (this.gameState.playerCards.length === 0) {
      this.endGame('player');
      return;
    }
    
    this.gameState.currentPlayer = this.getNextPlayer();
    document.getElementById('status-message').textContent = '电脑思考中...';
    setTimeout(() => this.computerPlay(), 1500);
  }
  
  getValidCards() {
    return this.gameState.playerCards.map(card => ({...card}));
  }
  
  pass() {
    this.gameState.currentPlayer = this.getNextPlayer();
    document.getElementById('status-message').textContent = '电脑思考中...';
    setTimeout(() => this.computerPlay(), 1500);
  }
  
  getNextPlayer() {
    const players = ['player', 'computer1', 'computer2'];
    const currentIndex = players.indexOf(this.gameState.currentPlayer);
    return players[(currentIndex + 1) % players.length];
  }
  
  computerPlay() {
    const computer = this.gameState.currentPlayer;
    const cards = computer === 'computer1' ? 
      this.gameState.computerCards : this.gameState.computer2Cards;
    
    if (cards.length === 0) {
      this.endGame(computer);
      return;
    }
    
    const cardToPlay = cards[Math.floor(Math.random() * cards.length)];
    const cardIndex = cards.findIndex(
      card => card.suit === cardToPlay.suit && card.rank === cardToPlay.rank
    );
    
    if (cardIndex !== -1) {
      cards.splice(cardIndex, 1);
    }
    
    document.getElementById('status-message').textContent = 
      `${computer === 'computer1' ? '电脑1' : '电脑2'}出了一张牌`;
    
    this.gameState.currentPlayer = this.getNextPlayer();
    
    if (this.gameState.currentPlayer === 'player') {
      this.updateControls();
      document.getElementById('status-message').textContent = '请出牌';
    } else {
      setTimeout(() => this.computerPlay(), 1500);
    }
  }
  
  endGame(winner) {
    let message = '';
    let playerWon = false;
    
    if (winner === 'player') {
      message = '恭喜你赢了！';
      playerWon = true;
    } else {
      message = `${winner === 'computer1' ? '电脑1' : '电脑2'}赢了！`;
      playerWon = false;
    }
    
    const winAmount = playerWon ? 100 * this.gameState.pot : -50 * this.gameState.pot;
    this.gameState.playerCoins += winAmount;
    
    if (playerWon) {
      this.gameState.wins++;
    }
    
    this.saveUserData();
    
    document.getElementById('computer1-cards').innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      document.getElementById('computer1-cards').appendChild(GameCore.renderCard(card));
    });
    
    document.getElementById('computer2-cards').innerHTML = '';
    this.gameState.computer2Cards.forEach(card => {
      document.getElementById('computer2-cards').appendChild(GameCore.renderCard(card));
    });
    
    document.getElementById('landlord-cards').innerHTML = '';
    this.landlordCards.forEach(card => {
      document.getElementById('landlord-cards').appendChild(GameCore.renderCard(card));
    });
    
    document.getElementById('status-message').textContent = 
      `${message} ${winAmount > 0 ? '赢得' : '损失'}${Math.abs(winAmount)}金币`;
    
    this.saveResult(playerWon ? 'player' : 'computer', winAmount);
    
    this.gameState.phase = 'result';
    this.updateControls();
  }
  
  saveResult(winner, winAmount) {
    super.saveResult(winner, winAmount);
  }
}