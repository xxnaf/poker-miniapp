// main.js

// 初始化Telegram Web App
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Telegram Web App
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // 设置主题
        Telegram.WebApp.setHeaderColor('#0088cc');
        Telegram.WebApp.setBackgroundColor('#f5f5f5');
    }
    
    const loginBtn = document.getElementById('login-btn');
    
    if (loginBtn) {
        loginBtn.onclick = function() {
            // 检查是否在Telegram WebApp环境
            if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
                // 获取用户信息
                const user = Telegram.WebApp.initDataUnsafe.user;
                console.log('用户信息:', user);
                
                // 保存到localStorage
                localStorage.setItem('user', JSON.stringify(user));
                
                // 跳转首页
                window.location.href = 'index.html';
            } else {
                alert('请在Telegram内打开此Mini App进行登录');
            }
        }
    }
    
    // 检查是否已经登录
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        // 如果已经登录，直接跳转到首页
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    }
    
    // 如果在首页，显示用户信息
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        try {
            const user = JSON.parse(savedUser);
            const nicknameElement = document.getElementById('nickname');
            const avatarElement = document.getElementById('user-avatar'); // 使用正确的ID
            
            if (nicknameElement && user.first_name) {
                nicknameElement.textContent = user.first_name;
            }
            
            // 设置真实头像 - 使用Telegram Web App API
            if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
                const telegramUser = Telegram.WebApp.initDataUnsafe.user;
                if (avatarElement && telegramUser.photo_url) {
                    avatarElement.src = telegramUser.photo_url;
                }
            }
        } catch (e) {
            console.error('解析用户信息失败:', e);
        }
    }
});

// 跳转到个人中心
function goToProfile() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.showAlert('个人中心功能开发中...');
    } else {
        alert('个人中心功能开发中...');
    }
}

// 跳转到游戏
function goToGame(mode) {
    let gameType = '';
    switch(mode) {
        case 'texas':
            gameType = 'texas';
            break;
        case 'landlord':
            gameType = 'landlord';
            break;
        case 'golden':
            gameType = 'golden';
            break;
        case 'bull':
            gameType = 'bull';
            break;
        default:
            if (window.Telegram && Telegram.WebApp) {
                Telegram.WebApp.showAlert(`进入${mode}游戏模式，功能开发中...`);
            } else {
                alert(`进入${mode}游戏模式，功能开发中...`);
            }
            return;
    }
    
    // 跳转到通用游戏页面
    window.location.href = `game.html?type=${gameType}`;
}