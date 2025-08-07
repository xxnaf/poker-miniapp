// games/texas.js
import { GameCore, BaseGame } from '../core.js';
import { UserService } from '../user-service.js';

export default class TexasGame extends BaseGame {
  constructor() {
    super('texas');
    this.loadUserData();
    this.communityCards = [];
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
    this.communityCards = [];
    this.gameState.pot = 0;
    this.gameState.playerBet = 0;
    this.gameState.computerBet = 0;
    this.gameState.phase = 'preflop';
    
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
          游戏准备中...
        </div>
      </div>
    `;
  }
  
  initControls() {
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = '';
    
    if (this.gameState.phase === 'preflop') {
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
    this.gameState.playerCards = this.drawCards(2);
    this.gameState.computerCards = this.drawCards(2);
    this.communityCards = [];
    this.gameState.pot = 0;
    this.gameState.playerBet = 0;
    this.gameState.computerBet = 0;
    this.gameState.phase = 'betting';
    
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = this.generateUI();
    
    const playerCardsContainer = document.getElementById('player-cards');
    this.gameState.playerCards.forEach(card => {
      playerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    const computerCardsContainer = document.getElementById('computer-cards');
    for (let i = 0; i < 2; i++) {
      computerCardsContainer.appendChild(GameCore.renderCardBack());
    }
    
    const communityCardsContainer = document.getElementById('community-cards');
    for (let i = 0; i < 5; i++) {
      communityCardsContainer.appendChild(GameCore.renderCardBack());
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
      
      const checkButton = document.createElement('button');
      checkButton.className = 'control-btn';
      checkButton.textContent = '过牌';
      checkButton.onclick = () => this.check();
      gameControls.appendChild(checkButton);
      
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
    if (Math.random() > 0.3) {
      computerBet = amount;
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
    
    // 进入下一轮
    this.nextRound();
  }
  
  nextRound() {
    if (this.communityCards.length === 0) {
      this.communityCards = this.drawCards(3);
      this.gameState.phase = 'flop';
      this.revealCommunityCards();
    } else if (this.communityCards.length === 3) {
      this.communityCards.push(...this.drawCards(1));
      this.gameState.phase = 'turn';
      this.revealCommunityCards();
    } else if (this.communityCards.length === 4) {
      this.communityCards.push(...this.drawCards(1));
      this.gameState.phase = 'river';
      this.revealCommunityCards();
      setTimeout(() => this.showDown(), 1000);
    }
  }
  
  revealCommunityCards() {
    const communityCardsContainer = document.getElementById('community-cards');
    communityCardsContainer.innerHTML = '';
    
    // 修复: 正确处理社区牌显示
    for (let i = 0; i < 5; i++) {
      if (i < this.communityCards.length) {
        communityCardsContainer.appendChild(GameCore.renderCard(this.communityCards[i]));
      } else {
        communityCardsContainer.appendChild(GameCore.renderCardBack());
      }
    }
  }
  
  check() {
    document.getElementById('status-message').textContent = '你选择了过牌';
    this.nextRound();
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
  
  showDown() {
    const computerCardsContainer = document.getElementById('computer-cards');
    computerCardsContainer.innerHTML = '';
    this.gameState.computerCards.forEach(card => {
      computerCardsContainer.appendChild(GameCore.renderCard(card));
    });
    
    const playerHand = this.evaluateHand([...this.gameState.playerCards, ...this.communityCards]);
    const computerHand = this.evaluateHand([...this.gameState.computerCards, ...this.communityCards]);
    
    let winner = '';
    if (playerHand.value > computerHand.value) {
      winner = 'player';
    } else if (playerHand.value < computerHand.value) {
      winner = 'computer';
    } else {
      winner = 'tie';
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
    // 简化的牌型评估
    if (cards.length < 5) return { type: '不足5张', value: 0 };
    
    // 实际实现需要复杂的牌型判断逻辑
    // 这里仅作示例
    const hasPair = this.hasPair(cards);
    const hasTwoPair = this.hasTwoPair(cards);
    const hasThreeOfAKind = this.hasThreeOfAKind(cards);
    
    if (hasThreeOfAKind) {
      return { type: '三条', value: 4 };
    } else if (hasTwoPair) {
      return { type: '两对', value: 3 };
    } else if (hasPair) {
      return { type: '一对', value: 2 };
    }
    
    return { type: '高牌', value: 1 };
  }
  
  hasPair(cards) {
    const rankCount = {};
    cards.forEach(card => {
      rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
    });
    return Object.values(rankCount).some(count => count >= 2);
  }
  
  hasTwoPair(cards) {
    const rankCount = {};
    cards.forEach(card => {
      rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
    });
    const pairs = Object.values(rankCount).filter(count => count >= 2);
    return pairs.length >= 2;
  }
  
  hasThreeOfAKind(cards) {
    const rankCount = {};
    cards.forEach(card => {
      rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
    });
    return Object.values(rankCount).some(count => count >= 3);
  }
  
  saveResult(winner, winAmount) {
    super.saveResult(winner, winAmount);
  }
}