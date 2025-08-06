import { GameState, GameCore } from '../core.js';
import { updateUserCoins } from '../user.js';

export default class GoldenGame {
  constructor() {
    this.gameState = new GameState('golden');
    this.loadUserData();
  }
  
  // 加载用户数据
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
  
  // 保存用户数据
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
    // 更新游戏局数
    this.gameState.games++;
    
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
      // 下注按钮
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
      
      // 开牌按钮
      const openButton = document.createElement('button');
      openButton.className = 'control-btn';
      openButton.textContent = '开牌';
      openButton.onclick = () => this.openCards();
      gameControls.appendChild(openButton);
      
      // 弃牌按钮
      const foldButton = document.createElement('button');
      foldButton.className = 'control-btn';
      foldButton.textContent = '弃牌';
      foldButton.onclick = () => this.fold();
      gameControls.appendChild(foldButton);
      
    } else if (this.gameState.phase === 'result') {
      // 再来一局按钮
      const restartButton = document.createElement('button');
      restartButton.className = 'control-btn';
      restartButton.textContent = '再来一局';
      restartButton.onclick = () => this.init();
      gameControls.appendChild(restartButton);
      
      // 返回首页按钮
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
    
    // 玩家下注
    this.gameState.playerCoins -= amount;
    this.gameState.playerBet += amount;
    this.gameState.pot += amount;
    
    // 电脑AI下注逻辑
    let computerBet = 10;
    const computerHandValue = this.evaluateHand(this.gameState.computerCards).value;
    
    // 根据牌型决定下注金额
    if (computerHandValue >= 4) { // 好牌
      computerBet = amount; // 跟注
    } else if (Math.random() > 0.3) { // 30%概率弃牌
      this.computerFold();
      return;
    }
    
    // 电脑下注
    this.gameState.computerBet += computerBet;
    this.gameState.pot += computerBet;
    
    // 保存用户数据
    this.saveUserData();
    
    // 更新UI
    document.querySelector('.pot-display').textContent = `底池: ${this.gameState.pot} 金币`;
    document.querySelector('.player-info').textContent = `你 (金币: ${this.gameState.playerCoins})`;
    document.querySelector('.player-bet').textContent = `下注: ${this.gameState.playerBet}金币`;
    document.querySelector('.computer-bet').textContent = `下注: ${this.gameState.computerBet}金币`;
    
    // 更新状态信息
    document.getElementById('status-message').textContent = 
      `你下注${amount}金币，电脑下注${computerBet}金币`;
  }
  
  computerFold() {
    this.gameState.phase = 'result';
    
    // 玩家赢得底池
    this.gameState.playerCoins += this.gameState.pot;
    this.gameState.wins++;
    
    // 保存用户数据
    this.saveUserData();
    
    // 更新状态
    document.getElementById('status-message').textContent = '电脑弃牌，你赢了！';
    
    // 显示电脑的牌
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 更新控制按钮
    this.updateControls();
  }
  
  fold() {
    this.gameState.phase = 'result';
    
    // 电脑赢得底池
    this.gameState.computerCoins += this.gameState.pot;
    
    // 保存用户数据
    this.saveUserData();
    
    // 更新状态
    document.getElementById('status-message').textContent = '你弃牌了，电脑获胜！';
    
    // 显示电脑的牌
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 更新控制按钮
    this.updateControls();
  }
  
  openCards() {
    // 显示电脑的牌
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 比较牌型
    const playerHand = this.evaluateHand(this.gameState.playerCards);
    const computerHand = this.evaluateHand(this.gameState.computerCards);
    
    let winner = '';
    if (playerHand.value > computerHand.value) {
      winner = 'player';
    } else if (playerHand.value < computerHand.value) {
      winner = 'computer';
    } else {
      // 牌型相同，比较最大单张
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
    
    // 处理游戏结果
    let message = '';
    if (winner === 'player') {
      message = `恭喜你赢了！你的牌型: ${playerHand.type}, 电脑牌型: ${computerHand.type}`;
      this.gameState.playerCoins += this.gameState.pot;
      this.gameState.wins++;
    } else if (winner === 'computer') {
      message = `电脑赢了！你的牌型: ${playerHand.type}, 电脑牌型: ${computerHand.type}`;
    } else {
      message = `平局！你的牌型: ${playerHand.type}, 电脑牌型: ${computerHand.type}`;
      this.gameState.playerCoins += this.gameState.playerBet;
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
  
  // 评估牌型
  evaluateHand(cards) {
    // 复制卡片以避免修改原数组
    const sortedCards = [...cards].sort((a, b) => a.value - b.value);
    
    // 检查花色是否相同（同花）
    const isFlush = sortedCards.every(card => 
      card.suit === sortedCards[0].suit
    );
    
    // 检查是否为顺子
    let isStraight = false;
    if (
      sortedCards[2].value - sortedCards[1].value === 1 &&
      sortedCards[1].value - sortedCards[0].value === 1
    ) {
      isStraight = true;
    }
    // 特殊顺子：A23
    else if (
      sortedCards[0].value === 2 &&
      sortedCards[1].value === 3 &&
      sortedCards[2].value === 14
    ) {
      isStraight = true;
      // 将A的值改为1以便比较
      sortedCards[2].value = 1;
      sortedCards.sort((a, b) => a.value - b.value);
    }
    
    // 检查对子
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
    
    // 确定牌型
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
  
  // 获取最大牌值
  getMaxCardValue(cards) {
    return Math.max(...cards.map(card => card.value));
  }
}