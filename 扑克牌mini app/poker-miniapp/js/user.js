// 更新用户信息显示
export function updateUserInfo() {
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      console.log("没有找到用户数据");
      return;
    }
    
    const user = JSON.parse(savedUser);
    console.log("更新用户信息:", user);
    
    // 首页元素
    const nicknameElement = document.getElementById('nickname');
    const avatarElement = document.getElementById('user-avatar');
    const coinsElement = document.getElementById('user-coins');
    
    // 个人中心元素
    const profileNickname = document.getElementById('profile-nickname');
    const profileAvatar = document.getElementById('profile-avatar');
    const coinsDisplay = document.getElementById('coins');
    const winsElement = document.getElementById('wins');
    const gamesElement = document.getElementById('games');
    
    // 更新首页显示
    if (nicknameElement) nicknameElement.textContent = user.firstName;
    if (avatarElement) avatarElement.src = user.photoUrl;
    if (coinsElement) coinsElement.textContent = user.coins;
    
    // 更新个人中心显示
    if (profileNickname) profileNickname.textContent = user.firstName;
    if (profileAvatar) profileAvatar.src = user.photoUrl;
    if (coinsDisplay) coinsDisplay.textContent = user.coins;
    if (winsElement) winsElement.textContent = user.wins;
    if (gamesElement) gamesElement.textContent = user.games;
    
  } catch (e) {
    console.error('更新用户信息失败:', e);
  }
}

// 更新用户金币
export function updateUserCoins(amount) {
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    
    const user = JSON.parse(savedUser);
    user.coins += amount;
    
    // 保存更新后的用户数据
    localStorage.setItem('user', JSON.stringify(user));
    
    // 更新显示
    updateUserInfo();
    
    return user.coins;
  } catch (e) {
    console.error('更新用户金币失败:', e);
    return 0;
  }
}