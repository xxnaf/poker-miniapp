// js/game-loader.js
import { GAME_TYPES } from './core.js';

export class GameLoader {
  constructor() {
    this.currentGame = null;
    this.gameModules = {};
  }
  
  async loadGame(gameType) {
    try {
      switch(gameType) {
        case GAME_TYPES.TEXAS:
          if (!this.gameModules.texas) {
            const { default: TexasGame } = await import('./games/texas.js');
            this.gameModules.texas = TexasGame;
          }
          this.currentGame = new this.gameModules.texas();
          break;
          
        case GAME_TYPES.LANDLORD:
          if (!this.gameModules.landlord) {
            const { default: LandlordGame } = await import('./games/landlord.js');
            this.gameModules.landlord = LandlordGame;
          }
          this.currentGame = new this.gameModules.landlord();
          break;
          
        case GAME_TYPES.GOLDEN:
          if (!this.gameModules.golden) {
            const { default: GoldenGame } = await import('./games/golden.js');
            this.gameModules.golden = GoldenGame;
          }
          this.currentGame = new this.gameModules.golden();
          break;
          
        case GAME_TYPES.BULL:
          if (!this.gameModules.bull) {
            const { default: BullGame } = await import('./games/bull.js');
            this.gameModules.bull = BullGame;
          }
          this.currentGame = new this.gameModules.bull();
          break;
          
        default:
          throw new Error(`未知游戏类型: ${gameType}`);
      }
      
      this.loadGameCSS(gameType);
      return this.currentGame;
    } catch (error) {
      console.error('游戏加载失败:', error);
      throw error;
    }
  }
  
  loadGameCSS(gameType) {
    const head = document.head;
    const linkId = `game-${gameType}-css`;
    
    const oldLink = document.getElementById(linkId);
    if (oldLink) oldLink.remove();
    
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `css/${gameType}.css`;
    head.appendChild(link);
  }
  
  getCurrentGame() {
    return this.currentGame;
  }
}