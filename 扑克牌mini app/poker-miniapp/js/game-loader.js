// js/game-loader.js
import { GAME_TYPES } from './core.js';
import { UserService } from './user-service.js'; // 确保导入UserService

export class GameLoader {
  constructor() {
    this.currentGame = null;
    this.gameModules = {};
  }
  
  async loadGame(gameType) {
    try {
      // 确保UserService可用
      if (typeof UserService === 'undefined') {
        throw new Error('UserService is not initialized');
      }
      
      // 动态加载游戏模块
      if (!this.gameModules[gameType]) {
        switch(gameType) {
          case GAME_TYPES.TEXAS:
            const { default: TexasGame } = await import('./games/texas.js');
            this.gameModules[gameType] = TexasGame;
            break;
          case GAME_TYPES.LANDLORD:
            const { default: LandlordGame } = await import('./games/landlord.js');
            this.gameModules[gameType] = LandlordGame;
            break;
          case GAME_TYPES.GOLDEN:
            const { default: GoldenGame } = await import('./games/golden.js');
            this.gameModules[gameType] = GoldenGame;
            break;
          case GAME_TYPES.BULL:
            const { default: BullGame } = await import('./games/bull.js');
            this.gameModules[gameType] = BullGame;
            break;
          default:
            throw new Error(`未知游戏类型: ${gameType}`);
        }
      }
      
      // 先加载CSS
      this.loadGameCSS(gameType);
      
      // 创建游戏实例
      this.currentGame = new this.gameModules[gameType]();
      return this.currentGame;
    } catch (error) {
      console.error('游戏加载失败:', error);
      throw new Error(`加载游戏失败: ${error.message}`);
    }
  }
  
  // 加载游戏特定CSS
  loadGameCSS(gameType) {
    const head = document.head;
    const linkId = `game-${gameType}-css`;
    
    // 移除旧样式
    const oldLink = document.getElementById(linkId);
    if (oldLink) oldLink.remove();
    
    // 创建新样式链接
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