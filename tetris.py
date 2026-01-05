"""
俄罗斯方块游戏
使用 tkinter 制作，无需安装额外库
"""

import tkinter as tk
import random
import time

# 游戏配置
GRID_WIDTH = 10  # 游戏区域宽度（列数）
GRID_HEIGHT = 20  # 游戏区域高度（行数）
CELL_SIZE = 30  # 每个方块的大小（像素）

# 颜色定义
COLORS = {
    0: '#000000',  # 黑色（空白）
    1: '#FF0000',  # 红色 - I型
    2: '#00FF00',  # 绿色 - O型
    3: '#0000FF',  # 蓝色 - T型
    4: '#FFFF00',  # 黄色 - S型
    5: '#FF00FF',  # 紫色 - Z型
    6: '#00FFFF',  # 青色 - J型
    7: '#FFA500',  # 橙色 - L型
}

# 俄罗斯方块的7种形状（每种形状有4个旋转状态）
SHAPES = [
    # I型（直线）
    [
        [[1,1,1,1]]
    ],
    # O型（方块）
    [
        [[2,2],
         [2,2]]
    ],
    # T型
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
    # S型
    [
        [[0,4,4],
         [4,4,0]],
        [[4,0],
         [4,4],
         [0,4]]
    ],
    # Z型
    [
        [[5,5,0],
         [0,5,5]],
        [[0,5],
         [5,5],
         [5,0]]
    ],
    # J型
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
    # L型
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
]


class TetrisGame:
    def __init__(self, root):
        self.root = root
        self.root.title("俄罗斯方块")
        self.root.resizable(False, False)
        
        # 游戏状态
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = None
        self.current_x = 0
        self.current_y = 0
        self.current_rotation = 0
        self.score = 0
        self.game_over = False
        self.fall_time = 0
        self.fall_speed = 0.5  # 方块下落速度（秒）
        
        # 创建界面
        self.create_widgets()
        
        # 绑定键盘事件
        self.root.bind('<KeyPress>', self.on_key_press)
        self.root.focus_set()
        
        # 开始游戏
        self.spawn_piece()
        self.update()
    
    def create_widgets(self):
        """创建游戏界面"""
        # 主框架
        main_frame = tk.Frame(self.root)
        main_frame.pack(padx=10, pady=10)
        
        # 游戏区域画布
        self.canvas = tk.Canvas(
            main_frame,
            width=GRID_WIDTH * CELL_SIZE,
            height=GRID_HEIGHT * CELL_SIZE,
            bg='black',
            highlightthickness=2,
            highlightbackground='white'
        )
        self.canvas.pack(side=tk.LEFT, padx=5)
        
        # 右侧信息面板
        info_frame = tk.Frame(main_frame)
        info_frame.pack(side=tk.LEFT, padx=10)
        
        # 得分标签
        self.score_label = tk.Label(
            info_frame,
            text=f"得分: {self.score}",
            font=('Arial', 16),
            fg='white',
            bg='black'
        )
        self.score_label.pack(pady=10)
        
        # 游戏说明
        instructions = tk.Label(
            info_frame,
            text="操作说明:\n\n"
                 "← → : 左右移动\n"
                 "↑ : 旋转\n"
                 "↓ : 快速下落\n"
                 "空格: 暂停/继续",
            font=('Arial', 12),
            fg='white',
            bg='black',
            justify=tk.LEFT
        )
        instructions.pack(pady=10)
        
        # 游戏状态标签
        self.status_label = tk.Label(
            info_frame,
            text="游戏进行中",
            font=('Arial', 14),
            fg='green',
            bg='black'
        )
        self.status_label.pack(pady=10)
        
        # 设置窗口背景
        self.root.configure(bg='black')
        info_frame.configure(bg='black')
    
    def spawn_piece(self):
        """生成新的方块"""
        shape_index = random.randint(0, len(SHAPES) - 1)
        shape_rotations = SHAPES[shape_index]
        self.current_piece = shape_rotations[0]
        self.current_rotation = 0
        self.current_x = GRID_WIDTH // 2 - len(self.current_piece[0]) // 2
        self.current_y = 0
        
        # 检查游戏是否结束
        if self.check_collision(self.current_piece, self.current_x, self.current_y):
            self.game_over = True
            self.status_label.config(text="游戏结束!", fg='red')
    
    def check_collision(self, piece, x, y):
        """检查碰撞"""
        for row in range(len(piece)):
            for col in range(len(piece[row])):
                if piece[row][col] != 0:
                    grid_x = x + col
                    grid_y = y + row
                    
                    # 检查边界
                    if grid_x < 0 or grid_x >= GRID_WIDTH or grid_y >= GRID_HEIGHT:
                        return True
                    
                    # 检查与已放置方块的碰撞
                    if grid_y >= 0 and self.grid[grid_y][grid_x] != 0:
                        return True
        return False
    
    def place_piece(self):
        """将当前方块放置到游戏区域"""
        for row in range(len(self.current_piece)):
            for col in range(len(self.current_piece[row])):
                if self.current_piece[row][col] != 0:
                    grid_x = self.current_x + col
                    grid_y = self.current_y + row
                    if grid_y >= 0:
                        self.grid[grid_y][grid_x] = self.current_piece[row][col]
    
    def clear_lines(self):
        """清除满行并计分"""
        lines_cleared = 0
        y = GRID_HEIGHT - 1
        
        while y >= 0:
            if all(self.grid[y][x] != 0 for x in range(GRID_WIDTH)):
                # 删除这一行
                del self.grid[y]
                # 在顶部添加新的空行
                self.grid.insert(0, [0 for _ in range(GRID_WIDTH)])
                lines_cleared += 1
            else:
                y -= 1
        
        # 计分：清除1行10分，2行30分，3行60分，4行100分
        if lines_cleared == 1:
            self.score += 10
        elif lines_cleared == 2:
            self.score += 30
        elif lines_cleared == 3:
            self.score += 60
        elif lines_cleared == 4:
            self.score += 100
        
        self.score_label.config(text=f"得分: {self.score}")
    
    def rotate_piece(self):
        """旋转当前方块"""
        if self.current_piece is None:
            return
        
        # 找到当前形状的所有旋转状态
        shape_index = None
        for i, shape_group in enumerate(SHAPES):
            if self.current_piece in shape_group:
                shape_index = i
                break
        
        if shape_index is None:
            return
        
        shape_rotations = SHAPES[shape_index]
        next_rotation = (self.current_rotation + 1) % len(shape_rotations)
        next_piece = shape_rotations[next_rotation]
        
        # 检查旋转后是否会碰撞
        if not self.check_collision(next_piece, self.current_x, self.current_y):
            self.current_piece = next_piece
            self.current_rotation = next_rotation
    
    def move_piece(self, dx, dy):
        """移动当前方块"""
        if self.current_piece is None or self.game_over:
            return
        
        new_x = self.current_x + dx
        new_y = self.current_y + dy
        
        if not self.check_collision(self.current_piece, new_x, new_y):
            self.current_x = new_x
            self.current_y = new_y
            return True
        return False
    
    def drop_piece(self):
        """让方块下落"""
        if not self.move_piece(0, 1):
            # 无法下落，放置方块
            self.place_piece()
            self.clear_lines()
            self.spawn_piece()
    
    def on_key_press(self, event):
        """处理键盘输入"""
        if self.game_over:
            return
        
        key = event.keysym
        if key == 'Left':
            self.move_piece(-1, 0)
        elif key == 'Right':
            self.move_piece(1, 0)
        elif key == 'Down':
            self.drop_piece()
        elif key == 'Up':
            self.rotate_piece()
    
    def draw_grid(self):
        """绘制游戏区域"""
        self.canvas.delete("all")
        
        # 绘制已放置的方块
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                if self.grid[y][x] != 0:
                    color = COLORS[self.grid[y][x]]
                    self.canvas.create_rectangle(
                        x * CELL_SIZE,
                        y * CELL_SIZE,
                        (x + 1) * CELL_SIZE,
                        (y + 1) * CELL_SIZE,
                        fill=color,
                        outline='gray',
                        width=1
                    )
        
        # 绘制当前下落的方块
        if self.current_piece:
            for row in range(len(self.current_piece)):
                for col in range(len(self.current_piece[row])):
                    if self.current_piece[row][col] != 0:
                        grid_x = self.current_x + col
                        grid_y = self.current_y + row
                        
                        if grid_y >= 0:
                            color = COLORS[self.current_piece[row][col]]
                            self.canvas.create_rectangle(
                                grid_x * CELL_SIZE,
                                grid_y * CELL_SIZE,
                                (grid_x + 1) * CELL_SIZE,
                                (grid_y + 1) * CELL_SIZE,
                                fill=color,
                                outline='white',
                                width=2
                            )
    
    def update(self):
        """游戏主循环"""
        if not self.game_over:
            current_time = time.time()
            
            # 自动下落
            if current_time - self.fall_time >= self.fall_speed:
                self.drop_piece()
                self.fall_time = current_time
        
        # 绘制游戏画面
        self.draw_grid()
        
        # 继续游戏循环
        self.root.after(50, self.update)


def main():
    """主函数"""
    root = tk.Tk()
    game = TetrisGame(root)
    root.mainloop()


if __name__ == "__main__":
    main()
