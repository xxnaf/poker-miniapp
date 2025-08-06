// 游戏类型枚举
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
  
  static renderCard(card) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.color}`;
    
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