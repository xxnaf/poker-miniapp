// js/core.js
// 游戏类型枚举
import { UserService } from './user-service.js'; // 关键修复：添加导入

export const GAME_TYPES = {
  TEXAS: 'texas',
  LANDLORD: 'landlord',
  GOLDEN: 'golden',
  BULL: 'bull'
};

// 游戏状态管理
export class GameState {
  constructor(type) {
    this.type = type;
    this.deck = [];
    this.playerCards = [];
    this.computerCards = [];
    this.pot = 0;
    this.playerBet = 0;
    this.computerBet = 0;
    this.phase = 'waiting'; // waiting, betting, playing, result
    this.playerCoins = 1000;
  }
  
  reset() {
    this.deck = [];
    this.playerCards = [];
    this.computerCards = [];
    this.pot = 0;
    this.playerBet = 0;
    this.computerBet = 0;
    this.phase = 'waiting';
  }
}

// 通用游戏功能
export class GameCore {
  static createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ 
          suit, 
          rank, 
          value: this.cardValue(rank),
          color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
        });
      }
    }
    
    return this.shuffleDeck(deck);
  }
  
  static createLandlordDeck() {
    const deck = this.createDeck();
    deck.push({ suit: '🃏', rank: '小王', value: 15, color: 'black' });
    deck.push({ suit: '🃏', rank: '大王', value: 16, color: 'red' });
    return this.shuffleDeck(deck);
  }
  
  static shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
  
  static cardValue(rank) {
    const values = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, 
      '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank] || 0;
  }
  
  static renderCard(card, isSelected = false) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.color} ${isSelected ? 'selected' : ''}`;
    
    cardElement.innerHTML = `
      <div class="card-top">${card.rank}</div>
      <div class="card-suit">${card.suit}</div>
      <div class="card-bottom">${card.rank}</div>
    `;
    
    return cardElement;
  }
  
  static renderCardBack() {
    const cardElement = document.createElement('div');
    cardElement.className = 'card card-back';
    cardElement.textContent = '?';
    return cardElement;
  }
}

// 成就系统
export const AchievementSystem = {
  // 成就定义
  achievements: {
    first_win: {
      name: "首胜",
      description: "赢得第一场游戏"
    },
    rich: {
      name: "大富翁",
      description: "积累5000金币"
    },
    landlord_master: {
      name: "地主之王",
      description: "作为地主赢10次"
    },
    bull_king: {
      name: "斗牛之王",
      description: "拿到10次牛牛"
    }
  },
  
  // 检查并解锁成就
  checkAchievements(gameType, result, user) {
    // 首胜成就
    if (result === 'win' && user.wins === 1) {
      this.unlock('first_win', user);
    }
    
    // 大富翁成就
    if (user.coins >= 5000) {
      this.unlock('rich', user);
    }
    
    // 游戏特定成就
    if (gameType === 'landlord' && result === 'win' && user.landlordWins >= 10) {
      this.unlock('landlord_master', user);
    }
  },
  
  // 解锁成就
  unlock(achievementId, user) {
    if (!user.achievements.includes(achievementId)) {
      user.achievements.push(achievementId);
      return true;
    }
    return false;
  },
  
  // 显示成就弹窗
  showPopup(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return;
    
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
      <div>🎉 成就解锁!</div>
      <div><strong>${achievement.name}</strong></div>
      <div>${achievement.description}</div>
    `;
    
    document.body.appendChild(popup);
    
    // 3秒后移除
    setTimeout(() => {
      popup.remove();
    }, 3000);
  }
};

// 添加通用游戏基础类
export class BaseGame {
  constructor(gameType) {
    this.gameType = gameType;
    this.gameState = new GameState(gameType);
    this.user = UserService.getUser();
    
    // 确保有默认值
    this.gameState.playerCoins = this.user.coins || 1000;
    this.gameState.wins = this.user.wins || 0;
    this.gameState.games = this.user.games || 0;
  }
  
  // 保存游戏结果
  saveResult(winner, winAmount) {
    // 更新用户金币
    UserService.updateCoins(winAmount);
    
    // 更新游戏统计
    const wins = winner === 'player' ? 1 : 0;
    UserService.updateStats(wins, 1);
    
    // 检查成就
    this.checkAchievements(winner);
  }
  
  // 检查成就
  checkAchievements(winner) {
    const user = UserService.getUser();
    const result = winner === 'player' ? 'win' : 'lose';
    
    // 检查并解锁成就
    if (AchievementSystem.checkAchievements(this.gameType, result, user)) {
      // 如果解锁了新成就，保存用户数据
      UserService.updateUser(user);
      
      // 显示成就弹窗
      const achievementId = Object.keys(AchievementSystem.achievements)
        .find(key => !user.achievements.includes(key));
      
      if (achievementId) {
        AchievementSystem.showPopup(achievementId);
      }
    }
  }
}