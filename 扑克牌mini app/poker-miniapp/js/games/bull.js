import { GameState, GameCore } from '../core.js';
import { updateUserCoins } from '../user.js';

export default class BullGame {
  constructor() {
    this.gameState = new GameState('bull');
    this.loadUserData();
    this.playerCards = [];
    this.computerCards = [];
    this.playerHand = [];
    this.computerHand = [];
  }
  
  loadUserData() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.gameState.playerCoins = user.coins;
      this.gameState.wins = user.wins || 0;
      this.gameState.games = user.games || 0;
    } else {
      this.gameState.playerCoins = 1000;
      this.gameState.wins = 0;
      this.gameState.games = 0;
    }
  }
  
  saveUserData() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      user.coins = this.gameState.playerCoins;
      user.wins = this.gameState.wins;
      user.games = this.gameState.games;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
  init() {
    this.gameState.reset();
    this.loadUserData();
    this.gameState.deck = GameCore.createDeck();
    this.playerCards = [];
    this.computerCards = [];
    this.gameState.pot = 0;
    this.gameState.playerBet = 0;
    this.gameState.phase = 'betting';
    
    return this.generateUI();
  }
  
  generateUI() {
    return `
      <div class="bull-game">
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
          请下注开始游戏
        </div>
      </div>
    `;
  }
  
  initControls() {
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
      
      const bet50Button = document.createElement('button');
      bet50Button.className = 'control-btn';
      bet50Button.textContent = '下注 50金币';
      bet50Button.onclick = () => this.placeBet(50);
      gameControls.appendChild(bet50Button);
    }
  }
  
  startGame() {
    this.gameState.games++;
    
    // 洗牌
    this.gameState.deck = GameCore.createDeck();
    
    // 发牌
    this.playerCards = this.drawCards(5);
    this.computerCards = this.drawCards(5);
    
    this.gameState.phase = 'playing';
    
    // 渲染UI
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = this.generateUI();
    
    // 渲染玩家的牌
    const playerCardsContainer = document.getElementById('player-cards');
    this.playerCards.forEach(card => {
      playerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 渲染电脑的牌（背面）
    const computerCardsContainer = document.getElementById('computer-cards');
    for (let i = 0; i < 5; i++) {
      computerCardsContainer.appendChild(GameCore.renderCardBack());
    }
    
    // 更新状态信息
    document.getElementById('status-message').textContent = '请开牌';
    
    // 更新控制按钮
    this.updateControls();
  }
  
  drawCards(count) {
    return this.gameState.deck.splice(0, count);
  }
  
  placeBet(amount) {
    if (this.gameState.playerCoins < amount) {
      document.getElementById('status-message').textContent = '金币不足！';
      return;
    }
    
    // 玩家下注
    this.gameState.playerCoins -= amount;
    this.gameState.playerBet = amount;
    this.gameState.pot = amount * 2; // 电脑跟注相同金额
    
    // 保存用户数据
    this.saveUserData();
    
    // 开始游戏
    this.startGame();
  }
  
  updateControls() {
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
    if (this.gameState.phase === 'playing') {
      const openButton = document.createElement('button');
      openButton.className = 'control-btn';
      openButton.textContent = '开牌';
      openButton.onclick = () => this.openCards();
      gameControls.appendChild(openButton);
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
  
  openCards() {
    // 显示电脑的牌
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 计算牛几
    const playerBull = this.calculateBull(this.playerCards);
    const computerBull = this.calculateBull(this.computerCards);
    
    // 比较结果
    let message = `你的牌: ${playerBull.type}, 电脑的牌: ${computerBull.type}。`;
    let playerWon = false;
    
    if (playerBull.value > computerBull.value) {
      message += "你赢了！";
      playerWon = true;
    } else if (playerBull.value < computerBull.value) {
      message += "电脑赢了！";
    } else {
      // 同牛比较最大牌
      const playerMax = Math.max(...this.playerCards.map(card => card.value));
      const computerMax = Math.max(...this.computerCards.map(card => card.value));
      
      if (playerMax > computerMax) {
        message += "你赢了（最大牌）！";
        playerWon = true;
      } else if (playerMax < computerMax) {
        message += "电脑赢了（最大牌）！";
      } else {
        message += "平局！";
      }
    }
    
    // 处理游戏结果
    if (playerWon) {
      this.gameState.playerCoins += this.gameState.pot;
      this.gameState.wins++;
    } else if (playerBull.value !== computerBull.value) {
      // 输掉赌注（平局不扣钱）
      this.gameState.playerCoins -= this.gameState.playerBet;
    }
    
    // 保存用户数据
    this.saveUserData();
    
    // 更新状态信息
    document.getElementById('status-message').textContent = message;
    document.querySelector('.player-info').textContent = `你 (金币: ${this.gameState.playerCoins})`;
    
    // 更新控制按钮
    this.gameState.phase = 'result';
    this.updateControls();
  }
  
  // 计算牛几
  calculateBull(cards) {
    const values = cards.map(card => Math.min(card.value, 10));
    let maxBull = 0;
    let bullType = '无牛';
    
    // 检查所有可能的3张组合
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 4; j++) {
        for (let k = j + 1; k < 5; k++) {
          const sum = values[i] + values[j] + values[k];
          if (sum % 10 === 0) {
            // 计算剩余2张的和
            const remainingSum = values.reduce((total, val, index) => {
              return index !== i && index !== j && index !== k ? total + val : total;
            }, 0) % 10;
            
            const bullValue = remainingSum === 0 ? 10 : remainingSum;
            
            if (bullValue > maxBull) {
              maxBull = bullValue;
              bullType = bullValue === 10 ? '牛牛' : `牛${bullValue}`;
            }
          }
        }
      }
    }
    
    // 特殊牌型：五花牛（五张牌均为J、Q、K）
    if (cards.every(card => card.value >= 11)) {
      maxBull = 11;
      bullType = '五花牛';
    }
    
    // 特殊牌型：炸弹（四张相同点数的牌）
    const rankCount = {};
    cards.forEach(card => {
      rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
    });
    if (Object.values(rankCount).includes(4)) {
      maxBull = 12;
      bullType = '炸弹';
    }
    
    return { type: bullType, value: maxBull };
  }
}