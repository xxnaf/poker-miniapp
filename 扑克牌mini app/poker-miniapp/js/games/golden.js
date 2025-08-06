import { GameState, GameCore } from '../core.js';

export default class GoldenGame {
  constructor() {
    this.gameState = new GameState('golden');
    this.gameState.playerCoins = 1000; // 初始金币
  }
  
  init() {
    this.gameState.reset();
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
        </div>
        
        <!-- 底池显示 -->
        <div class="pot-display">
          底池: ${this.gameState.pot} 金币
        </div>
        
        <!-- 玩家区域 -->
        <div class="player-section">
          <div class="player-info">你</div>
          <div class="cards-container" id="player-cards"></div>
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
    // 洗牌
    this.gameState.deck = GameCore.createDeck();
    
    // 发牌
    this.gameState.playerCards = this.drawCards(3);
    this.gameState.computerCards = this.drawCards(3);
    
    this.gameState.phase = 'betting';
    this.gameState.pot = 0;
    this.gameState.playerBet = 0;
    this.gameState.computerBet = 0;
    
    // 重新渲染UI
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = this.generateUI();
    
    // 渲染玩家的牌
    const playerCardsContainer = document.getElementById('player-cards');
    this.gameState.playerCards.forEach(card => {
      playerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 渲染电脑的牌（背面）
    const computerCardsContainer = document.getElementById('computer-cards');
    for (let i = 0; i < 3; i++) {
      computerCardsContainer.appendChild(GameCore.renderCardBack());
    }
    
    // 更新状态信息
    document.getElementById('status-message').textContent = '请下注';
    
    // 更新控制按钮
    this.updateControls();
  }
  
  drawCards(count) {
    return this.gameState.deck.splice(0, count);
  }
  
  updateControls() {
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
    if (this.gameState.phase === 'betting') {
      const betButton = document.createElement('button');
      betButton.className = 'control-btn';
      betButton.textContent = '下注 (10金币)';
      betButton.onclick = () => this.placeBet(10);
      gameControls.appendChild(betButton);
      
      const openButton = document.createElement('button');
      openButton.className = 'control-btn';
      openButton.textContent = '开牌';
      openButton.onclick = () => this.openCards();
      gameControls.appendChild(openButton);
    }
  }
  
  placeBet(amount) {
    // 在实际应用中，这里应该调用updateUserCoins
    this.gameState.playerCoins -= amount;
    this.gameState.playerBet += amount;
    this.gameState.pot += amount;
    
    // 电脑跟注
    this.gameState.computerBet += amount;
    this.gameState.pot += amount;
    
    // 更新底池显示
    document.querySelector('.pot-display').textContent = `底池: ${this.gameState.pot} 金币`;
    
    // 更新状态信息
    document.getElementById('status-message').textContent = `你下注了${amount}金币，电脑跟注`;
  }
  
  openCards() {
    // 显示电脑的牌
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 比较牌型（简化版）
    const playerMax = Math.max(...this.gameState.playerCards.map(c => c.value));
    const computerMax = Math.max(...this.gameState.computerCards.map(c => c.value));
    
    let winner = '';
    if (playerMax > computerMax) {
      winner = 'player';
    } else if (playerMax < computerMax) {
      winner = 'computer';
    } else {
      winner = 'tie';
    }
    
    // 更新状态
    let message = '';
    if (winner === 'player') {
      message = '恭喜你赢了！';
      this.gameState.playerCoins += this.gameState.pot;
    } else if (winner === 'computer') {
      message = '电脑赢了！';
    } else {
      message = '平局！';
      this.gameState.playerCoins += this.gameState.playerBet;
    }
    
    document.getElementById('status-message').textContent = message;
    
    // 更新控制按钮
    this.gameState.phase = 'result';
    this.updateControls();
    
    const restartButton = document.createElement('button');
    restartButton.className = 'control-btn';
    restartButton.textContent = '再来一局';
    restartButton.onclick = () => this.init();
    gameControls.appendChild(restartButton);
  }
}