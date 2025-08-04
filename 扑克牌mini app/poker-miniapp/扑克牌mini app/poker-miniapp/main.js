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
            const avatarElement = document.querySelector('.avatar');
            
            if (nicknameElement && user.first_name) {
                nicknameElement.textContent = user.first_name;
            }
            
            // 设置真实头像
            if (avatarElement && user.photo_url) {
                avatarElement.src = user.photo_url;
            }
        } catch (e) {
            console.error('解析用户信息失败:', e);
        }
    }
});

// 跳转到个人中心
function goToProfile() {
    alert('个人中心功能开发中...');
    // 这里可以跳转到个人中心页面
}

// 跳转到游戏
function goToGame(mode) {
    alert(`进入${mode}游戏模式，功能开发中...`);
    // 这里可以跳转到对应的游戏页面
}