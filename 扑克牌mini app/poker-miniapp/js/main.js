import { updateUserInfo } from './user.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
  console.log("页面加载完成:", window.location.pathname);
  
  // 初始化Telegram Web App
  initTelegramWebApp();
  
  // 设置登录按钮事件
  setupLoginButton();
  
  // 检查登录状态
  checkLoginStatus();
  
  // 更新用户信息
  updateUserInfo();
});

// 初始化Telegram Web App - 移除所有页面的主按钮
function initTelegramWebApp() {
  if (window.Telegram && Telegram.WebApp) {
    console.log("检测到Telegram WebApp环境");
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    
    // 设置主题
    Telegram.WebApp.setHeaderColor('#0088cc');
    Telegram.WebApp.setBackgroundColor('#f5f5f5');
    
    // 完全禁用主按钮
    Telegram.WebApp.MainButton.hide();
  } else {
    console.log("不在Telegram环境中");
  }
}

// 设置登录按钮事件
function setupLoginButton() {
  const loginBtn = document.getElementById('login-btn');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
    console.log("登录按钮事件已设置");
  }
}

// 处理登录
function handleLogin() {
  console.log("登录按钮被点击");
  
  // 检查是否在Telegram WebApp环境
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    console.log('用户信息:', user);
    
    // 创建用户数据对象
    const userData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      photoUrl: user.photo_url || 'assets/placeholder.png',
      coins: 1000, // 初始金币
      wins: 0,
      games: 0
    };
    
    // 保存到localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("用户数据已保存");
    
    // 跳转首页
    window.location.href = 'index.html';
  } else {
    showAlert('请在Telegram内打开此Mini App进行登录');
  }
}

// 检查登录状态
function checkLoginStatus() {
  const savedUser = localStorage.getItem('user');
  
  if (savedUser) {
    console.log("用户已登录");
    // 已登录用户如果在登录页，跳转到首页
    if (window.location.pathname.includes('login.html')) {
      console.log("重定向到首页");
      window.location.href = 'index.html';
    }
  } else {
    console.log("用户未登录");
    // 未登录用户如果在首页或个人中心，跳转到登录页
    if (!window.location.pathname.includes('login.html')) {
      console.log("重定向到登录页");
      window.location.href = 'login.html';
    }
  }
}

// 跳转到个人中心
window.goToProfile = function() {
  console.log("跳转到个人中心");
  window.location.href = 'profile.html';
}

// 跳转到游戏
window.goToGame = function(mode) {
  console.log("跳转到游戏:", mode);
  const gameTypes = ['texas', 'landlord', 'golden', 'bull'];
  
  if (gameTypes.includes(mode)) {
    window.location.href = `game.html?type=${mode}`;
  } else {
    showAlert(`进入${mode}游戏模式，功能开发中...`);
  }
}

// 返回上一页
window.goBack = function() {
  console.log("返回上一页");
  window.history.back();
}

// 退出登录
window.logout = function() {
  console.log("用户退出登录");
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// 打开商店
window.openShop = function() {
  showAlert('商店功能开发中...');
}

// 显示游戏记录
window.showHistory = function() {
  showAlert('游戏记录功能开发中...');
}

// 显示设置
window.showSettings = function() {
  showAlert('设置功能开发中...');
}

// 通用警告函数
function showAlert(message) {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.showAlert(message);
  } else {
    alert(message);
  }
}