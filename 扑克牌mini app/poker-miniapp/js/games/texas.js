import { GameState, GameCore } from '../core.js';
import { updateUserCoins, updateUserStats } from '../user.js';

export default class TexasGame {
  constructor() {
    this.gameState = new GameState('texas');
    this.loadUserData();
    this.SMALL_BLIND = 10;
    this.BIG_BLIND = 20;
    this.communityCards = [];
    this.playerHand = [];
    this.computerHand = [];
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
    this.communityCards = [];
    this.playerHand = [];
    this.computerHand = [];
    this.gameState.pot = 0;
    this.gameState.playerBet = 0;
    this.gameState.computerBet = 0;
    this.gameState.phase = 'preflop'; // preflop, flop, turn, river, showdown
    this.gameState.playerTurn = true;
    
    return this.generateUI();
  }
  
  generateUI() {
    return `
      <div class="texas-game">
        <!-- 电脑区域 -->
        <div class="computer-section">
          <div class="player-info">电脑</div>
          <div class="cards-container" id="computer-cards"></div>
          <div class="computer-bet">下注: ${this.gameState.computerBet}金币</div>
        </div>
        
        <!-- 公共牌区域 -->
        <div class="community-cards">
          <div class="section-title">公共牌</div>
          <div class="cards-container" id="community-cards"></div>
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
          ${this.getStatusMessage()}
        </div>
      </div>
    `;
  }
  
  getStatusMessage() {
    if (this.gameState.phase === 'preflop') {
      return "游戏开始！请下注（盲注：小盲10金币，大盲20金币）";
    } else if (this.gameState.phase === 'flop') {
      return "翻牌圈，请下注";
    } else if (this.gameState.phase === 'turn') {
      return "转牌圈，请下注";
    } else if (this.gameState.phase === 'river') {
      return "河牌圈，请下注";
    } else if (this.gameState.phase === 'showdown') {
      return "摊牌，比较牌型";
    }
    return "游戏进行中";
  }
  
  initControls() {
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
    if (this.gameState.phase === 'showdown') {
      this.showGameResult();
      return;
    }
    
    if (this.gameState.playerTurn) {
      // 下注按钮
      const callButton = document.createElement('button');
      callButton.className = 'control-btn';
      callButton.textContent = '跟注';
      callButton.onclick = () => this.playerCall();
      gameControls.appendChild(callButton);
      
      const raiseButton = document.createElement('button');
      raiseButton.className = 'control-btn';
      raiseButton.textContent = '加注 (50金币)';
      raiseButton.onclick = () => this.playerRaise(50);
      gameControls.appendChild(raiseButton);
      
      const foldButton = document.createElement('button');
      foldButton.className = 'control-btn';
      foldButton.textContent = '弃牌';
      foldButton.onclick = () => this.playerFold();
      gameControls.appendChild(foldButton);
    } else {
      // 电脑思考中...
      const thinking = document.createElement('div');
      thinking.className = 'thinking-message';
      thinking.textContent = "电脑思考中...";
      gameControls.appendChild(thinking);
      
      // 模拟电脑思考
      setTimeout(() => this.computerAction(), 1500);
    }
  }
  
  startGame() {
    // 更新游戏局数
    this.gameState.games++;
    
    // 发玩家两张牌
    this.gameState.playerCards = this.drawCards(2);
    
    // 发电脑两张牌
    this.gameState.computerCards = this.drawCards(2);
    
    // 初始下注（盲注）
    this.placeBlinds();
    
    // 渲染初始UI
    this.renderInitialCards();
    
    // 设置状态信息
    document.getElementById('status-message').textContent = this.getStatusMessage();
    
    // 初始化控制按钮
    this.initControls();
  }
  
  placeBlinds() {
    // 玩家下小盲注
    this.playerBet(this.SMALL_BLIND);
    
    // 电脑下大盲注
    this.computerBet(this.BIG_BLIND);
  }
  
  playerBet(amount) {
    if (this.gameState.playerCoins < amount) {
      document.getElementById('status-message').textContent = '金币不足！';
      return false;
    }
    
    this.gameState.playerCoins -= amount;
    this.gameState.playerBet += amount;
    this.gameState.pot += amount;
    
    this.saveUserData();
    this.updateUI();
    return true;
  }
  
  computerBet(amount) {
    this.gameState.computerBet += amount;
    this.gameState.pot += amount;
    this.updateUI();
  }
  
  renderInitialCards() {
    // 渲染玩家的牌
    const playerCardsContainer = document.getElementById('player-cards');
    playerCardsContainer.innerHTML = '';
    this.gameState.playerCards.forEach(card => {
      playerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 渲染电脑的牌（背面）
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    for (let i = 0; i < 2; i++) {
      computerCardsContainer.appendChild(GameCore.renderCardBack());
    }
    
    // 更新UI
    this.updateUI();
  }
  
  updateUI() {
    // 更新底池
    const potDisplay = document.querySelector('.pot-display');
    if (potDisplay) potDisplay.textContent = `底池: ${this.gameState.pot} 金币`;
    
    // 更新玩家信息
    const playerInfo = document.querySelector('.player-section .player-info');
    if (playerInfo) playerInfo.textContent = `你 (金币: ${this.gameState.playerCoins})`;
    
    // 更新玩家下注
    const playerBet = document.querySelector('.player-bet');
    if (playerBet) playerBet.textContent = `下注: ${this.gameState.playerBet}金币`;
    
    // 更新电脑下注
    const computerBet = document.querySelector('.computer-bet');
    if (computerBet) computerBet.textContent = `下注: ${this.gameState.computerBet}金币`;
  }
  
  playerCall() {
    const amountToCall = this.gameState.computerBet - this.gameState.playerBet;
    if (amountToCall <= 0) {
      // 无需跟注，直接进入下一阶段
      this.advanceGamePhase();
      return;
    }
    
    if (this.playerBet(amountToCall)) {
      this.advanceGamePhase();
    }
  }
  
  playerRaise(amount) {
    const totalAmount = (this.gameState.computerBet - this.gameState.playerBet) + amount;
    if (this.playerBet(totalAmount)) {
      this.gameState.playerTurn = false;
      this.initControls(); // 显示"电脑思考中"
    }
  }
  
  playerFold() {
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
    this.gameState.phase = 'showdown';
    this.updateControls();
  }
  
  computerAction() {
    // 简化版AI：随机决定跟注、加注或弃牌
    const action = Math.random();
    
    if (action < 0.6) { // 60%概率跟注
      const amountToCall = this.gameState.playerBet - this.gameState.computerBet;
      if (amountToCall > 0) {
        this.computerBet(amountToCall);
      }
      this.gameState.playerTurn = true;
      this.advanceGamePhase();
    } else if (action < 0.9) { // 30%概率加注
      const raiseAmount = 50;
      this.computerBet(raiseAmount);
      this.gameState.playerTurn = true;
      this.initControls();
    } else { // 10%概率弃牌
      this.computerFold();
    }
  }
  
  computerFold() {
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
    this.gameState.phase = 'showdown';
    this.updateControls();
  }
  
  advanceGamePhase() {
    if (this.gameState.phase === 'preflop') {
      // 进入翻牌圈，发三张公共牌
      this.communityCards = this.drawCards(3);
      this.gameState.phase = 'flop';
    } else if (this.gameState.phase === 'flop') {
      // 进入转牌圈，发一张公共牌
      this.communityCards.push(this.drawCards(1)[0]);
      this.gameState.phase = 'turn';
    } else if (this.gameState.phase === 'turn') {
      // 进入河牌圈，发一张公共牌
      this.communityCards.push(this.drawCards(1)[0]);
      this.gameState.phase = 'river';
    } else if (this.gameState.phase === 'river') {
      // 进入摊牌
      this.gameState.phase = 'showdown';
      this.showdown();
      return;
    }
    
    // 重置下注状态
    this.gameState.playerBet = 0;
    this.gameState.computerBet = 0;
    this.gameState.playerTurn = true;
    
    // 更新公共牌
    this.renderCommunityCards();
    
    // 更新状态信息
    document.getElementById('status-message').textContent = this.getStatusMessage();
    
    // 更新控制按钮
    this.initControls();
  }
  
  renderCommunityCards() {
    const communityContainer = document.getElementById('community-cards');
    communityContainer.innerHTML = '';
    this.communityCards.forEach(card => {
      communityContainer.appendChild(GameCore.renderCard(card));
    });
  }
  
  showdown() {
    // 显示电脑的牌
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    // 评估玩家和电脑的牌型
    const playerHand = this.evaluateHand([...this.gameState.playerCards, ...this.communityCards]);
    const computerHand = this.evaluateHand([...this.gameState.computerCards, ...this.communityCards]);
    
    // 比较牌型
    let resultMessage = `你的牌型: ${playerHand.type}, 电脑牌型: ${computerHand.type}。`;
    
    if (playerHand.strength > computerHand.strength) {
      resultMessage += "恭喜你赢了！";
      this.gameState.playerCoins += this.gameState.pot;
      this.gameState.wins++;
    } else if (playerHand.strength < computerHand.strength) {
      resultMessage += "电脑赢了！";
    } else {
      // 牌型相同，比较高牌
      if (playerHand.highCardValue > computerHand.highCardValue) {
        resultMessage += "恭喜你赢了（高牌）！";
        this.gameState.playerCoins += this.gameState.pot;
        this.gameState.wins++;
      } else if (playerHand.highCardValue < computerHand.highCardValue) {
        resultMessage += "电脑赢了（高牌）！";
      } else {
        resultMessage += "平局！平分底池。";
        this.gameState.playerCoins += this.gameState.pot / 2;
      }
    }
    
    // 保存用户数据
    this.saveUserData();
    
    // 显示结果
    this.showGameResult(resultMessage);
  }
  
  showGameResult(message) {
    // 更新状态信息
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) statusMessage.textContent = message;
    
    // 更新玩家金币显示
    const playerInfo = document.querySelector('.player-section .player-info');
    if (playerInfo) playerInfo.textContent = `你 (金币: ${this.gameState.playerCoins})`;
    
    // 更新控制按钮
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
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
  
  // 评估牌型（简化版）
  evaluateHand(cards) {
    // 在实际项目中，这里应该实现完整的德州扑克牌型评估
    // 这里仅作示例，返回随机结果
    
    const handTypes = [
      "高牌", "一对", "两对", "三条", "顺子", 
      "同花", "葫芦", "四条", "同花顺", "皇家同花顺"
    ];
    
    const randomType = handTypes[Math.floor(Math.random() * handTypes.length)];
    
    return {
      type: randomType,
      strength: Math.floor(Math.random() * 10),
      highCardValue: Math.floor(Math.random() * 14) + 2
    };
  }
  
  drawCards(count) {
    return this.gameState.deck.splice(0, count);
  }
}