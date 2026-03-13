import time
import random
import os
import sys
import select

# Configuration
WIDTH = 20
HEIGHT = 10
SNAKE_CHAR = 'O'
FOOD_CHAR = '*'
EMPTY_CHAR = ' '
BORDER_CHAR = '#'

def clear_screen():
    # Clear terminal screen based on OS
    os.system('cls' if os.name == 'nt' else 'clear')

def get_input():
    # Non-blocking input for Unix-like systems
    if os.name == 'nt':
        import msvcrt
        if msvcrt.kbhit():
            return msvcrt.getch().decode('utf-8').lower()
    else:
        dr, dw, de = select.select([sys.stdin], [], [], 0)
        if dr:
            return sys.stdin.read(1).lower()
    return None

def main():
    # Initial state
    snake = [(5, 5), (5, 4), (5, 3)]
    direction = 'd' # w, a, s, d
    food = (random.randint(1, HEIGHT-2), random.randint(1, WIDTH-2))
    score = 0
    game_over = False

    # Set terminal to non-canonical mode if on Unix
    if os.name != 'nt':
        import tty
        import termios
        old_settings = termios.tcgetattr(sys.stdin)
        tty.setcbreak(sys.stdin.fileno())

    try:
        while not game_over:
            # 1. Handle Input
            inp = get_input()
            if inp in ['w', 'a', 's', 'd']:
                # Prevent reversing direction
                if (inp == 'w' and direction != 's') or \
                   (inp == 's' and direction != 'w') or \
                   (inp == 'a' and direction != 'd') or \
                   (inp == 'd' and direction != 'a'):
                    direction = inp

            # 2. Update State
            head_y, head_x = snake[0]
            if direction == 'w': head_y -= 1
            elif direction == 's': head_y += 1
            elif direction == 'a': head_x -= 1
            elif direction == 'd': head_x += 1

            new_head = (head_y, head_x)

            # Check collisions
            if (head_y <= 0 or head_y >= HEIGHT - 1 or 
                head_x <= 0 or head_x >= WIDTH - 1 or 
                new_head in snake):
                game_over = True
                break

            snake.insert(0, new_head)

            # Check food
            if new_head == food:
                score += 10
                while True:
                    food = (random.randint(1, HEIGHT-2), random.randint(1, WIDTH-2))
                    if food not in snake:
                        break
            else:
                snake.pop()

            # 3. Render
            clear_screen()
            print(f"Score: {score} | Controls: WASD | Ctrl+C to Quit")
            
            for y in range(HEIGHT):
                row = ""
                for x in range(WIDTH):
                    if y == 0 or y == HEIGHT - 1 or x == 0 or x == WIDTH - 1:
                        row += BORDER_CHAR
                    elif (y, x) == snake[0]:
                        row += SNAKE_CHAR
                    elif (y, x) in snake:
                        row += 'o'
                    elif (y, x) == food:
                        row += FOOD_CHAR
                    else:
                        row += EMPTY_CHAR
                print(row)

            time.sleep(0.15)

        print("\n" + "="*20)
        print("   GAME OVER")
        print(f"   Final Score: {score}")
        print("="*20)

    except KeyboardInterrupt:
        print("\nGame exited.")
    finally:
        # Restore terminal settings on Unix
        if os.name != 'nt':
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)

if __name__ == "__main__":
    main()
