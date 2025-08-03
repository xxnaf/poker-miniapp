// main.js

document.addEventListener('DOMContentLoaded', function() {
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
        window.location.href = 'index.html';
    }
});

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在首页
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            // 如果没有登录，跳转到登录页
            window.location.href = 'login.html';
            return;
        }
        
        // 显示用户信息
        try {
            const user = JSON.parse(savedUser);
            const nicknameElement = document.getElementById('nickname');
            if (nicknameElement && user.first_name) {
                nicknameElement.textContent = user.first_name;
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