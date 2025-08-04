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

// 完整的德州扑克游戏状态
let gameState = {
    phase: 'waiting', // waiting, preflop, flop, turn, river, showdown
    dealer: 0, // 庄家位置
    smallBlind: 1, // 小盲位置
    bigBlind: 2, // 大盲位置
    currentPlayer: 0, // 当前行动玩家
    pot: 0, // 底池
    currentBet: 0, // 当前下注额
    smallBlindAmount: 5, // 小盲金额
    bigBlindAmount: 10, // 大盲金额
    players: [
        { id: 0, name: '玩家A', chips: 1000, bet: 0, folded: false, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false },
        { id: 1, name: '玩家B', chips: 1000, bet: 0, folded: false, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false },
        { id: 2, name: '玩家C', chips: 1000, bet: 0, folded: false, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false },
        { id: 3, name: '玩家D', chips: 1000, bet: 0, folded: false, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false },
        { id: 4, name: '你', chips: 1000, bet: 0, folded: false, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false }
    ],
    communityCards: [],
    deck: [],
    lastRaisePlayer: -1, // 最后加注的玩家
    minRaise: 10 // 最小加注额
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
    gameState.currentBet = 0;
    gameState.phase = 'waiting';
    gameState.lastRaisePlayer = -1;
    
    // 重置玩家状态
    gameState.players.forEach(player => {
        player.bet = 0;
        player.folded = false;
        player.cards = [];
        player.isDealer = false;
        player.isSmallBlind = false;
        player.isBigBlind = false;
    });
    
    // 生成德州扑克界面
    generateTexasUI();
    updateTexasDisplay();
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
        <div class="poker-table" id="poker-table">
            <!-- 五人座位布局 -->
            <div class="player-seat top-left-seat" id="seat-1">
                <div class="seat-info">
                    <div class="player-name">玩家A</div>
                    <div class="seat-number" id="seat-1-info">座位1</div>
                    <div class="player-chips" id="player-a-chips" style="display: none;">筹码: $1000</div>
                    <div class="player-cards" id="player-a-cards" style="display: none;"></div>
                </div>
            </div>
            
            <div class="player-seat top-right-seat" id="seat-3">
                <div class="seat-info">
                    <div class="player-name">玩家C</div>
                    <div class="seat-number" id="seat-3-info">座位3</div>
                    <div class="player-chips" id="player-c-chips" style="display: none;">筹码: $1000</div>
                    <div class="player-cards" id="player-c-cards" style="display: none;"></div>
                </div>
            </div>
            
            <div class="player-seat bottom-left-seat" id="seat-2">
                <div class="seat-info">
                    <div class="player-name">玩家B</div>
                    <div class="seat-number" id="seat-2-info">座位2</div>
                    <div class="player-chips" id="player-b-chips" style="display: none;">筹码: $1000</div>
                    <div class="player-cards" id="player-b-cards" style="display: none;"></div>
                </div>
            </div>
            
            <div class="player-seat bottom-right-seat" id="seat-4">
                <div class="seat-info">
                    <div class="player-name">玩家D</div>
                    <div class="seat-number" id="seat-4-info">座位4</div>
                    <div class="player-chips" id="player-d-chips" style="display: none;">筹码: $1000</div>
                    <div class="player-cards" id="player-d-cards" style="display: none;"></div>
                </div>
            </div>
            
            <div class="player-seat center-bottom-seat" id="seat-5">
                <div class="seat-info">
                    <div class="player-name">你的位置</div>
                    <div class="seat-number" id="seat-5-info">座位5</div>
                    <div class="player-chips" id="player-your-chips" style="display: none;">筹码: $1000</div>
                    <div class="player-cards" id="player-your-cards" style="display: none;"></div>
                </div>
            </div>
            
            <!-- 公共牌区域 -->
            <div class="community-area" id="community-area" style="display: none;">
                <h3>公共牌</h3>
                <div class="cards-container" id="community-cards"></div>
            </div>
            
            <!-- 你的手牌区域 -->
            <div class="your-hand-area" id="your-hand-area" style="display: none;">
                <h3>你的手牌</h3>
                <div class="cards-container" id="player-cards"></div>
            </div>
        </div>
        
        <div class="game-control-panel">
            <div class="pot-info" id="pot-info" style="display: none;">
                <span class="pot-label">底池:</span>
                <span class="pot-amount" id="pot-amount">$0</span>
            </div>
            <div class="button-group">
                <button class="primary-btn" id="main-action-btn" onclick="handleMainAction()">开始游戏</button>
                <button class="action-btn deal-btn" onclick="dealCards()" style="display: none;">发牌</button>
                <button class="action-btn call-btn" onclick="call()" style="display: none;">跟注</button>
                <button class="action-btn raise-btn" onclick="raise()" style="display: none;">加注</button>
                <button class="action-btn fold-btn" onclick="fold()" style="display: none;">弃牌</button>
            </div>
        </div>
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
    // 设置庄家和盲注位置
    gameState.dealer = 0; // 玩家A是庄家
    gameState.smallBlind = 1; // 玩家B是小盲
    gameState.bigBlind = 2; // 玩家C是大盲
    gameState.currentPlayer = 3; // 从大盲左边开始（玩家D）
    
    // 设置盲注
    gameState.players[gameState.smallBlind].isSmallBlind = true;
    gameState.players[gameState.bigBlind].isBigBlind = true;
    gameState.players[gameState.dealer].isDealer = true;
    
    // 扣除盲注
    gameState.players[gameState.smallBlind].chips -= gameState.smallBlindAmount;
    gameState.players[gameState.smallBlind].bet = gameState.smallBlindAmount;
    gameState.players[gameState.bigBlind].chips -= gameState.bigBlindAmount;
    gameState.players[gameState.bigBlind].bet = gameState.bigBlindAmount;
    
    gameState.pot = gameState.smallBlindAmount + gameState.bigBlindAmount;
    gameState.currentBet = gameState.bigBlindAmount;
    gameState.phase = 'preflop';
    
    // 发底牌
    dealHoleCards();
    
    updateTexasDisplay();
    updateStatus('游戏开始！翻牌前阶段，你的回合');
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

// 智能主按钮
function handleMainAction() {
    const mainBtn = document.getElementById('main-action-btn');
    const communityArea = document.getElementById('community-area');
    const yourHandArea = document.getElementById('your-hand-area');
    const potInfo = document.getElementById('pot-info');
    const dealBtn = document.querySelector('.deal-btn');
    const callBtn = document.querySelector('.call-btn');
    const raiseBtn = document.querySelector('.raise-btn');
    const foldBtn = document.querySelector('.fold-btn');
    
    if (gameState.gamePhase === 'waiting') {
        // 开始游戏 - 第一阶段到第二阶段
        startGame();
        mainBtn.textContent = '发牌';
        dealBtn.style.display = 'block';
        
        // 显示游戏区域
        communityArea.style.display = 'block';
        yourHandArea.style.display = 'block';
        potInfo.style.display = 'block';
        
        // 隐藏座位信息，显示筹码和手牌
        showGameElements();
        
        updateStatus('游戏开始！点击"发牌"发手牌');
    } else {
        // 其他游戏逻辑保持不变
        switch(gameState.gamePhase) {
            case 'preflop':
                dealCards();
                mainBtn.textContent = '发翻牌';
                break;
            case 'flop':
                dealCards();
                mainBtn.textContent = '发转牌';
                break;
            case 'turn':
                dealCards();
                mainBtn.textContent = '发河牌';
                break;
            case 'river':
                dealCards();
                mainBtn.textContent = '游戏结束';
                callBtn.style.display = 'block';
                raiseBtn.style.display = 'block';
                foldBtn.style.display = 'block';
                break;
            case 'showdown':
                resetGame();
                mainBtn.textContent = '开始游戏';
                // 隐藏游戏区域
                communityArea.style.display = 'none';
                yourHandArea.style.display = 'none';
                potInfo.style.display = 'none';
                dealBtn.style.display = 'none';
                callBtn.style.display = 'none';
                raiseBtn.style.display = 'none';
                foldBtn.style.display = 'none';
                hideGameElements();
                break;
        }
    }
}

// 显示游戏元素（第二阶段）
function showGameElements() {
    const players = ['a', 'b', 'c', 'd', 'your'];
    players.forEach(player => {
        const chipsElement = document.getElementById(`player-${player}-chips`);
        const cardsElement = document.getElementById(`player-${player}-cards`);
        const seatInfoElement = document.getElementById(`seat-${player === 'your' ? '5' : player === 'a' ? '1' : player === 'b' ? '2' : player === 'c' ? '3' : '4'}-info`);
        
        if (chipsElement) chipsElement.style.display = 'block';
        if (cardsElement) cardsElement.style.display = 'block';
        if (seatInfoElement) seatInfoElement.style.display = 'none';
    });
}

// 隐藏游戏元素（回到第一阶段）
function hideGameElements() {
    const players = ['a', 'b', 'c', 'd', 'your'];
    players.forEach(player => {
        const chipsElement = document.getElementById(`player-${player}-chips`);
        const cardsElement = document.getElementById(`player-${player}-cards`);
        const seatInfoElement = document.getElementById(`seat-${player === 'your' ? '5' : player === 'a' ? '1' : player === 'b' ? '2' : player === 'c' ? '3' : '4'}-info`);
        
        if (chipsElement) chipsElement.style.display = 'none';
        if (cardsElement) cardsElement.style.display = 'none';
        if (seatInfoElement) seatInfoElement.style.display = 'block';
    });
}

// 更新显示函数
function updateDisplay() {
    document.getElementById('pot-amount').textContent = gameState.pot;
    
    // 更新你的手牌
    const yourCardsContainer = document.getElementById('player-your-cards');
    if (yourCardsContainer) {
        yourCardsContainer.innerHTML = '';
        gameState.playerCards.forEach(card => {
            const cardElement = createCardElement(card);
            yourCardsContainer.appendChild(cardElement);
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

// 模拟其他玩家行动
function simulateOtherPlayers() {
    for (let i = 0; i < 4; i++) {
        if (!gameState.players[i].folded) {
            const action = Math.random();
            const player = gameState.players[i];
            
            if (action < 0.2) {
                // 20% 概率弃牌
                player.folded = true;
                updateStatus(`${player.name} 弃牌了`);
            } else if (action < 0.6) {
                // 40% 概率跟注
                const callAmount = gameState.currentBet - player.bet;
                if (callAmount > 0 && callAmount <= player.chips) {
                    player.chips -= callAmount;
                    player.bet += callAmount;
                    gameState.pot += callAmount;
                    updateStatus(`${player.name} 跟注了 $${callAmount}`);
                }
            } else {
                // 40% 概率加注
                const raiseAmount = gameState.minRaise;
                if (raiseAmount <= player.chips) {
                    player.chips -= raiseAmount;
                    player.bet += raiseAmount;
                    gameState.pot += raiseAmount;
                    gameState.currentBet = player.bet;
                    gameState.lastRaisePlayer = i;
                    updateStatus(`${player.name} 加注了 $${raiseAmount}`);
                }
            }
        }
    }
}

// 检查是否进入下一阶段
function checkNextPhase() {
    // 如果只剩一名未弃牌玩家，直接获胜
    const activePlayers = gameState.players.filter(p => !p.folded);
    if (activePlayers.length === 1) {
        updateStatus(`${activePlayers[0].name} 获胜，赢得底池 $${gameState.pot}`);
        gameState.phase = 'showdown';
        return;
    }
    // 判断是否所有玩家都已跟注或弃牌
    const allBetsEqual = activePlayers.every(p => p.bet === gameState.currentBet);
    if (allBetsEqual) {
        switch (gameState.phase) {
            case 'preflop':
                dealFlop();
                break;
            case 'flop':
                dealTurn();
                break;
            case 'turn':
                dealRiver();
                break;
            case 'river':
                // 进入摊牌
                gameState.phase = 'showdown';
                updateStatus('进入摊牌，亮牌比大小');
                // 这里可以调用牌型比较函数
                break;
        }
        // 重置每个玩家的 bet
        gameState.players.forEach(p => p.bet = 0);
    }
}

// 你可以继续完善 updateTexasDisplay、updateStatus、以及牌型比较等函数，
// 并根据 phase 控制按钮的显示和隐藏，实现完整的德州扑克流程。
