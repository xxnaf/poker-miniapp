// game.js - 通用游戏逻辑

// 游戏类型
const GAME_TYPES = {
    TEXAS: 'texas',
    LANDLORD: 'landlord', 
    GOLDEN: 'golden',
    BULL: 'bull'
};

// 当前游戏类型
let currentGameType = '';

// 游戏状态
let gameState = {
    deck: [],
    playerCards: [],
    communityCards: [],
    pot: 0,
    currentPlayer: 'player',
    gamePhase: 'waiting'
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从URL参数获取游戏类型
    const urlParams = new URLSearchParams(window.location.search);
    currentGameType = urlParams.get('type') || 'texas';
    
    // 初始化游戏
    initGame();
});

// 初始化游戏
function initGame() {
    // 设置游戏标题
    const gameTitle = document.getElementById('game-title');
    switch(currentGameType) {
        case GAME_TYPES.TEXAS:
            gameTitle.textContent = '德州扑克';
            initTexasGame();
            break;
        case GAME_TYPES.LANDLORD:
            gameTitle.textContent = '斗地主';
            initLandlordGame();
            break;
        case GAME_TYPES.GOLDEN:
            gameTitle.textContent = '炸金花';
            initGoldenGame();
            break;
        case GAME_TYPES.BULL:
            gameTitle.textContent = '斗牛';
            initBullGame();
            break;
    }
    
    updateDisplay();
    updateStatus('游戏已初始化，点击"开始游戏"开始');
}

// 德州扑克初始化
function initTexasGame() {
    gameState.deck = createDeck();
    gameState.playerCards = [];
    gameState.communityCards = [];
    gameState.pot = 0;
    gameState.gamePhase = 'waiting';
    
    // 生成德州扑克界面
    generateTexasUI();
}

// 斗地主初始化
function initLandlordGame() {
    gameState.deck = createLandlordDeck();
    gameState.playerCards = [];
    gameState.pot = 0;
    gameState.gamePhase = 'waiting';
    
    // 生成斗地主界面
    generateLandlordUI();
}

// 炸金花初始化
function initGoldenGame() {
    gameState.deck = createDeck();
    gameState.playerCards = [];
    gameState.pot = 0;
    gameState.gamePhase = 'waiting';
    
    // 生成炸金花界面
    generateGoldenUI();
}

// 斗牛初始化
function initBullGame() {
    gameState.deck = createDeck();
    gameState.playerCards = [];
    gameState.pot = 0;
    gameState.gamePhase = 'waiting';
    
    // 生成斗牛界面
    generateBullUI();
}

// 生成德州扑克界面
function generateTexasUI() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="community-cards">
            <h3>公共牌</h3>
            <div class="cards-container" id="community-cards"></div>
        </div>
        <div class="player-cards">
            <h3>你的手牌</h3>
            <div class="cards-container" id="player-cards"></div>
        </div>
        <div class="game-phase" id="game-phase">等待开始</div>
        <div class="hand-type" id="hand-type">牌型: 等待发牌</div>
    `;
    
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = `
        <button class="game-btn" onclick="startGame()">开始游戏</button>
        <button class="game-btn" onclick="dealCards()">发牌</button>
        <button class="game-btn" onclick="fold()">弃牌</button>
        <button class="game-btn" onclick="call()">跟注</button>
        <button class="game-btn" onclick="raise()">加注</button>
    `;
}

// 生成斗地主界面
function generateLandlordUI() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="landlord-cards">
            <h3>你的手牌</h3>
            <div class="cards-container" id="player-cards"></div>
        </div>
        <div class="landlord-info">
            <p>地主牌: <span id="landlord-cards"></span></p>
        </div>
    `;
    
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = `
        <button class="game-btn" onclick="startLandlordGame()">开始游戏</button>
        <button class="game-btn" onclick="dealLandlordCards()">发牌</button>
        <button class="game-btn" onclick="playCards()">出牌</button>
        <button class="game-btn" onclick="pass()">过牌</button>
    `;
}

// 生成炸金花界面
function generateGoldenUI() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="golden-cards">
            <h3>你的手牌</h3>
            <div class="cards-container" id="player-cards"></div>
        </div>
    `;
    
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = `
        <button class="game-btn" onclick="startGoldenGame()">开始游戏</button>
        <button class="game-btn" onclick="dealGoldenCards()">发牌</button>
        <button class="game-btn" onclick="bet()">下注</button>
        <button class="game-btn" onclick="fold()">弃牌</button>
    `;
}

// 生成斗牛界面
function generateBullUI() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bull-cards">
            <h3>你的手牌</h3>
            <div class="cards-container" id="player-cards"></div>
        </div>
        <div class="bull-result" id="bull-result"></div>
    `;
    
    const gameControls = document.getElementById('game-controls');
    gameControls.innerHTML = `
        <button class="game-btn" onclick="startBullGame()">开始游戏</button>
        <button class="game-btn" onclick="dealBullCards()">发牌</button>
        <button class="game-btn" onclick="calculateBull()">计算牛数</button>
    `;
}

// 创建扑克牌
function createDeck() {
    let deck = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return shuffleDeck(deck);
}

// 创建斗地主牌组
function createLandlordDeck() {
    let deck = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
    
    // 斗地主有54张牌（包括大小王）
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    // 添加大小王
    deck.push({ suit: '', rank: '小王' });
    deck.push({ suit: '', rank: '大王' });
    
    return shuffleDeck(deck);
}

// 洗牌
function shuffleDeck(deck) {
    let shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 通用游戏函数
function startGame() {
    switch(currentGameType) {
        case GAME_TYPES.TEXAS:
            startTexasGame();
            break;
        case GAME_TYPES.LANDLORD:
            startLandlordGame();
            break;
        case GAME_TYPES.GOLDEN:
            startGoldenGame();
            break;
        case GAME_TYPES.BULL:
            startBullGame();
            break;
    }
}

function dealCards() {
    switch(currentGameType) {
        case GAME_TYPES.TEXAS:
            dealTexasCards();
            break;
        case GAME_TYPES.LANDLORD:
            dealLandlordCards();
            break;
        case GAME_TYPES.GOLDEN:
            dealGoldenCards();
            break;
        case GAME_TYPES.BULL:
            dealBullCards();
            break;
    }
}

// 德州扑克游戏函数
function startTexasGame() {
    gameState.gamePhase = 'preflop';
    gameState.pot = 100;
    updateDisplay();
    updateStatus('德州扑克游戏开始！点击"发牌"发手牌');
}

function dealTexasCards() {
    if (gameState.gamePhase === 'preflop') {
        // 发手牌
        gameState.playerCards = [gameState.deck.pop(), gameState.deck.pop()];
        gameState.gamePhase = 'flop';
        updateDisplay();
        updateStatus('手牌已发，点击"发翻牌"继续');
    } else if (gameState.gamePhase === 'flop') {
        // 发翻牌（3张公共牌）
        gameState.communityCards = [
            gameState.deck.pop(),
            gameState.deck.pop(),
            gameState.deck.pop()
        ];
        gameState.gamePhase = 'turn';
        updateDisplay();
        updateStatus('翻牌已发，点击"发转牌"继续');
    } else if (gameState.gamePhase === 'turn') {
        // 发转牌
        gameState.communityCards.push(gameState.deck.pop());
        gameState.gamePhase = 'river';
        updateDisplay();
        updateStatus('转牌已发，点击"发河牌"继续');
    } else if (gameState.gamePhase === 'river') {
        // 发河牌
        gameState.communityCards.push(gameState.deck.pop());
        gameState.gamePhase = 'showdown';
        updateDisplay();
        updateStatus('河牌已发，游戏结束！');
    }
}

// 斗地主游戏函数
function startLandlordGame() {
    gameState.gamePhase = 'dealing';
    updateDisplay();
    updateStatus('斗地主游戏开始！点击"发牌"发手牌');
}

function dealLandlordCards() {
    gameState.playerCards = [];
    for (let i = 0; i < 17; i++) {
        gameState.playerCards.push(gameState.deck.pop());
    }
    updateDisplay();
    updateStatus('手牌已发，共17张牌');
}

// 炸金花游戏函数
function startGoldenGame() {
    gameState.gamePhase = 'dealing';
    updateDisplay();
    updateStatus('炸金花游戏开始！点击"发牌"发手牌');
}

function dealGoldenCards() {
    gameState.playerCards = [
        gameState.deck.pop(),
        gameState.deck.pop(),
        gameState.deck.pop()
    ];
    updateDisplay();
    updateStatus('手牌已发，共3张牌');
}

// 斗牛游戏函数
function startBullGame() {
    gameState.gamePhase = 'dealing';
    updateDisplay();
    updateStatus('斗牛游戏开始！点击"发牌"发手牌');
}

function dealBullCards() {
    gameState.playerCards = [
        gameState.deck.pop(),
        gameState.deck.pop(),
        gameState.deck.pop(),
        gameState.deck.pop(),
        gameState.deck.pop()
    ];
    updateDisplay();
    updateStatus('手牌已发，共5张牌');
}

// 通用函数
function fold() {
    updateStatus('你选择了弃牌');
}

function call() {
    gameState.pot += 50;
    updateDisplay();
    updateStatus('你跟注了 $50');
}

function raise() {
    gameState.pot += 100;
    updateDisplay();
    updateStatus('你加注了 $100');
}

function playCards() {
    updateStatus('出牌功能开发中...');
}

function pass() {
    updateStatus('你选择了过牌');
}

function bet() {
    gameState.pot += 50;
    updateDisplay();
    updateStatus('你下注了 $50');
}

function calculateBull() {
    // 简单的斗牛计算逻辑
    const cards = gameState.playerCards;
    let sum = 0;
    cards.forEach(card => {
        const rank = card.rank;
        if (rank === 'J' || rank === 'Q' || rank === 'K') {
            sum += 10;
        } else if (rank === 'A') {
            sum += 1;
        } else {
            sum += parseInt(rank);
        }
    });
    
    const bullNumber = sum % 10;
    const resultElement = document.getElementById('bull-result');
    resultElement.innerHTML = `<h3>牛数: ${bullNumber}</h3>`;
    updateStatus(`计算完成，牛数为 ${bullNumber}`);
}

// 更新显示
function updateDisplay() {
    document.getElementById('pot-amount').textContent = gameState.pot;
    
    // 更新游戏阶段显示
    const gamePhaseElement = document.getElementById('game-phase');
    if (gamePhaseElement) {
        const phaseNames = {
            'waiting': '等待开始',
            'preflop': '翻牌前',
            'flop': '翻牌',
            'turn': '转牌',
            'river': '河牌',
            'showdown': '摊牌'
        };
        gamePhaseElement.textContent = phaseNames[gameState.gamePhase] || '未知阶段';
    }
    
    // 更新牌型显示
    const handTypeElement = document.getElementById('hand-type');
    if (handTypeElement && currentGameType === 'texas') {
        const handType = evaluateTexasHand(gameState.playerCards, gameState.communityCards);
        handTypeElement.textContent = `牌型: ${handType}`;
    }
    
    // 更新玩家手牌
    const playerCardsContainer = document.getElementById('player-cards');
    if (playerCardsContainer) {
        playerCardsContainer.innerHTML = '';
        gameState.playerCards.forEach(card => {
            const cardElement = createCardElement(card);
            playerCardsContainer.appendChild(cardElement);
        });
    }
    
    // 更新公共牌
    const communityCardsContainer = document.getElementById('community-cards');
    if (communityCardsContainer) {
        communityCardsContainer.innerHTML = '';
        gameState.communityCards.forEach(card => {
            const cardElement = createCardElement(card);
            communityCardsContainer.appendChild(cardElement);
        });
    }
}

// 创建牌元素
function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.style.color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
    cardElement.textContent = card.rank + card.suit;
    return cardElement;
}

// 更新状态
function updateStatus(message) {
    document.getElementById('game-status').textContent = message;
}

// 返回首页
function goBack() {
    window.location.href = 'index.html';
}

// 在 game.js 中添加牌型判断函数

// 评估德州扑克牌型
function evaluateTexasHand(playerCards, communityCards) {
    const allCards = [...playerCards, ...communityCards];
    if (allCards.length < 5) return '等待更多牌';
    
    const ranks = allCards.map(card => card.rank);
    const suits = allCards.map(card => card.suit);
    
    // 检查同花顺
    if (isFlush(suits) && isStraight(ranks)) return '同花顺';
    // 检查四条
    if (hasFourOfAKind(ranks)) return '四条';
    // 检查葫芦
    if (hasFullHouse(ranks)) return '葫芦';
    // 检查同花
    if (isFlush(suits)) return '同花';
    // 检查顺子
    if (isStraight(ranks)) return '顺子';
    // 检查三条
    if (hasThreeOfAKind(ranks)) return '三条';
    // 检查两对
    if (hasTwoPair(ranks)) return '两对';
    // 检查一对
    if (hasOnePair(ranks)) return '一对';
    // 高牌
    return '高牌';
}

// 牌型判断辅助函数
function isFlush(suits) {
    const uniqueSuits = [...new Set(suits)];
    return uniqueSuits.length === 1;
}

function isStraight(ranks) {
    const rankValues = ranks.map(rank => getRankValue(rank)).sort((a, b) => a - b);
    for (let i = 1; i < rankValues.length; i++) {
        if (rankValues[i] !== rankValues[i-1] + 1) return false;
    }
    return true;
}

function hasFourOfAKind(ranks) {
    const counts = {};
    ranks.forEach(rank => counts[rank] = (counts[rank] || 0) + 1);
    return Object.values(counts).some(count => count === 4);
}

function hasFullHouse(ranks) {
    const counts = {};
    ranks.forEach(rank => counts[rank] = (counts[rank] || 0) + 1);
    const values = Object.values(counts);
    return values.includes(3) && values.includes(2);
}

function hasThreeOfAKind(ranks) {
    const counts = {};
    ranks.forEach(rank => counts[rank] = (counts[rank] || 0) + 1);
    return Object.values(counts).some(count => count === 3);
}

function hasTwoPair(ranks) {
    const counts = {};
    ranks.forEach(rank => counts[rank] = (counts[rank] || 0) + 1);
    const pairs = Object.values(counts).filter(count => count === 2);
    return pairs.length === 2;
}

function hasOnePair(ranks) {
    const counts = {};
    ranks.forEach(rank => counts[rank] = (counts[rank] || 0) + 1);
    return Object.values(counts).some(count => count === 2);
}

function getRankValue(rank) {
    const values = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return values[rank] || 0;
}
