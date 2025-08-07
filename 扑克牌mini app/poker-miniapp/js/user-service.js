// js/user-service.js
const USER_KEY = 'user';

export const UserService = {
  // 获取当前用户
  getUser() {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : this.createDefaultUser();
  },
  
  // 创建默认用户
  createDefaultUser() {
    return {
      id: 0,
      firstName: 'Guest',
      lastName: '',
      username: '',
      photoUrl: 'assets/placeholder.png',
      coins: 1000,
      wins: 0,
      games: 0,
      achievements: []
    };
  },
  
  updateUser(user) {
    // 确保有必要的字段
    const defaultUser = this.createDefaultUser();
    const updatedUser = {
      ...defaultUser,
      ...user,
      achievements: user.achievements || []
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },
  
  // 更新金币
  updateCoins(delta) {
    const user = this.getUser();
    user.coins += delta;
    return this.updateUser(user);
  },
  
  // 更新游戏统计
  updateStats(wins = 0, games = 0) {
    const user = this.getUser();
    user.wins = (user.wins || 0) + wins;
    user.games = (user.games || 0) + games;
    return this.updateUser(user);
  },
  
  // 添加成就
  addAchievement(achievementName) {
    const user = this.getUser();
    if (!user.achievements) {
      user.achievements = [];
    }
    if (!user.achievements.includes(achievementName)) {
      user.achievements.push(achievementName);
      this.updateUser(user);
      return true;
    }
    return false;
  }
};