// 游戏配置
const GRID_WIDTH = 10;  // 游戏区域宽度（列数）
const GRID_HEIGHT = 20;  // 游戏区域高度（行数）
const CELL_SIZE = 30;  // 每个方块的大小（像素）

// 颜色定义
const COLORS = {
    0: '#000000',  // 黑色（空白）
    1: '#FF0000',  // 红色 - I型
    2: '#00FF00',  // 绿色 - O型
    3: '#0000FF',  // 蓝色 - T型
    4: '#FFFF00',  // 黄色 - S型
    5: '#FF00FF',  // 紫色 - Z型
    6: '#00FFFF',  // 青色 - J型
    7: '#FFA500',  // 橙色 - L型
};

// 俄罗斯方块的7种形状（每种形状有多个旋转状态）
const SHAPES = [
    // I型（直线）
    [
        [[1,1,1,1]]
    ],
    // O型（方块）
    [
        [[2,2],
         [2,2]]
    ],
    // T型
    [
        [[0,3,0],
         [3,3,3]],
        [[0,3,0],
         [0,3,3],
         [0,3,0]],
        [[3,3,3],
         [0,3,0]],
        [[0,3,0],
         [3,3,0],
         [0,3,0]]
    ],
    // S型
    [
        [[0,4,4],
         [4,4,0]],
        [[4,0],
         [4,4],
         [0,4]]
    ],
    // Z型
    [
        [[5,5,0],
         [0,5,5]],
        [[0,5],
         [5,5],
         [5,0]]
    ],
    // J型
    [
        [[6,0,0],
         [6,6,6]],
        [[0,6,6],
         [0,6,0],
         [0,6,0]],
        [[6,6,6],
         [0,0,6]],
        [[0,6,0],
         [0,6,0],
         [6,6,0]]
    ],
    // L型
    [
        [[0,0,7],
         [7,7,7]],
        [[0,7,0],
         [0,7,0],
         [0,7,7]],
        [[7,7,7],
         [7,0,0]],
        [[7,7,0],
         [0,7,0],
         [0,7,0]]
    ]
];

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.currentRotation = 0;
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.gameLoop = null;
        this.fallTime = 0;
        this.fallSpeed = 500; // 下落速度（毫秒）
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // 初始化游戏区域
        this.grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.updateScore();
        this.updateStatus('游戏进行中', 'playing');
        this.spawnPiece();
        this.spawnNextPiece();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (!this.paused) this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (!this.paused) this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (!this.paused) this.dropPiece();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (!this.paused) this.rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.gameOver) {
                this.init();
                this.start();
            } else if (this.paused) {
                this.togglePause();
            }
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.init();
            this.start();
        });
    }
    
    spawnPiece() {
        if (this.nextPiece === null) {
            this.spawnNextPiece();
        }
        
        const shapeIndex = this.nextPiece;
        const shapeRotations = SHAPES[shapeIndex];
        this.currentPiece = shapeRotations[0];
        this.currentRotation = 0;
        this.currentX = Math.floor(GRID_WIDTH / 2) - Math.floor(this.currentPiece[0].length / 2);
        this.currentY = 0;
        
        // 生成下一个方块
        this.spawnNextPiece();
        
        // 检查游戏是否结束
        if (this.checkCollision(this.currentPiece, this.currentX, this.currentY)) {
            this.gameOver = true;
            this.updateStatus('游戏结束!', 'game-over');
            this.stop();
        }
    }
    
    spawnNextPiece() {
        this.nextPiece = Math.floor(Math.random() * SHAPES.length);
        this.drawNextPiece();
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece !== null) {
            const shape = SHAPES[this.nextPiece][0];
            const size = 20;
            const offsetX = (this.nextCanvas.width - shape[0].length * size) / 2;
            const offsetY = (this.nextCanvas.height - shape.length * size) / 2;
            
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col] !== 0) {
                        this.nextCtx.fillStyle = COLORS[shape[row][col]];
                        this.nextCtx.fillRect(
                            offsetX + col * size,
                            offsetY + row * size,
                            size - 2,
                            size - 2
                        );
                    }
                }
            }
        }
    }
    
    checkCollision(piece, x, y) {
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col] !== 0) {
                    const gridX = x + col;
                    const gridY = y + row;
                    
                    // 检查边界
                    if (gridX < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT) {
                        return true;
                    }
                    
                    // 检查与已放置方块的碰撞
                    if (gridY >= 0 && this.grid[gridY][gridX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    placePiece() {
        for (let row = 0; row < this.currentPiece.length; row++) {
            for (let col = 0; col < this.currentPiece[row].length; col++) {
                if (this.currentPiece[row][col] !== 0) {
                    const gridX = this.currentX + col;
                    const gridY = this.currentY + row;
                    if (gridY >= 0) {
                        this.grid[gridY][gridX] = this.currentPiece[row][col];
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        let y = GRID_HEIGHT - 1;
        
        while (y >= 0) {
            if (this.grid[y].every(cell => cell !== 0)) {
                // 删除这一行
                this.grid.splice(y, 1);
                // 在顶部添加新的空行
                this.grid.unshift(Array(GRID_WIDTH).fill(0));
                linesCleared++;
            } else {
                y--;
            }
        }
        
        // 计分
        if (linesCleared === 1) {
            this.score += 10;
        } else if (linesCleared === 2) {
            this.score += 30;
        } else if (linesCleared === 3) {
            this.score += 60;
        } else if (linesCleared === 4) {
            this.score += 100;
        }
        
        this.updateScore();
    }
    
    rotatePiece() {
        if (this.currentPiece === null) return;
        
        // 找到当前形状的所有旋转状态
        let shapeIndex = null;
        for (let i = 0; i < SHAPES.length; i++) {
            if (SHAPES[i].includes(this.currentPiece)) {
                shapeIndex = i;
                break;
            }
        }
        
        if (shapeIndex === null) return;
        
        const shapeRotations = SHAPES[shapeIndex];
        const nextRotation = (this.currentRotation + 1) % shapeRotations.length;
        const nextPiece = shapeRotations[nextRotation];
        
        // 检查旋转后是否会碰撞
        if (!this.checkCollision(nextPiece, this.currentX, this.currentY)) {
            this.currentPiece = nextPiece;
            this.currentRotation = nextRotation;
            this.draw();
        }
    }
    
    movePiece(dx, dy) {
        if (this.currentPiece === null || this.gameOver) return false;
        
        const newX = this.currentX + dx;
        const newY = this.currentY + dy;
        
        if (!this.checkCollision(this.currentPiece, newX, newY)) {
            this.currentX = newX;
            this.currentY = newY;
            this.draw();
            return true;
        }
        return false;
    }
    
    dropPiece() {
        if (!this.movePiece(0, 1)) {
            // 无法下落，放置方块
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
            this.draw();
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateStatus(text, className) {
        const statusEl = document.getElementById('status');
        statusEl.textContent = text;
        statusEl.className = 'status-text ' + className;
    }
    
    togglePause() {
        if (this.gameOver) return;
        
        this.paused = !this.paused;
        if (this.paused) {
            this.updateStatus('游戏已暂停', 'paused');
            this.stop();
        } else {
            this.updateStatus('游戏进行中', 'playing');
            this.start();
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制已放置的方块
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (this.grid[y][x] !== 0) {
                    this.ctx.fillStyle = COLORS[this.grid[y][x]];
                    this.ctx.fillRect(
                        x * CELL_SIZE,
                        y * CELL_SIZE,
                        CELL_SIZE - 1,
                        CELL_SIZE - 1
                    );
                }
            }
        }
        
        // 绘制当前下落的方块
        if (this.currentPiece) {
            for (let row = 0; row < this.currentPiece.length; row++) {
                for (let col = 0; col < this.currentPiece[row].length; col++) {
                    if (this.currentPiece[row][col] !== 0) {
                        const gridX = this.currentX + col;
                        const gridY = this.currentY + row;
                        
                        if (gridY >= 0) {
                            this.ctx.fillStyle = COLORS[this.currentPiece[row][col]];
                            this.ctx.fillRect(
                                gridX * CELL_SIZE,
                                gridY * CELL_SIZE,
                                CELL_SIZE - 2,
                                CELL_SIZE - 2
                            );
                            
                            // 添加边框
                            this.ctx.strokeStyle = '#fff';
                            this.ctx.lineWidth = 1;
                            this.ctx.strokeRect(
                                gridX * CELL_SIZE,
                                gridY * CELL_SIZE,
                                CELL_SIZE - 2,
                                CELL_SIZE - 2
                            );
                        }
                    }
                }
            }
        }
    }
    
    gameStep() {
        if (!this.paused && !this.gameOver) {
            const now = Date.now();
            if (now - this.fallTime >= this.fallSpeed) {
                this.dropPiece();
                this.fallTime = now;
            }
        }
        this.draw();
    }
    
    start() {
        if (this.gameLoop) return;
        this.fallTime = Date.now();
        this.gameLoop = setInterval(() => {
            this.gameStep();
        }, 50);
    }
    
    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
}

// 初始化游戏
const game = new TetrisGame();
game.start();

