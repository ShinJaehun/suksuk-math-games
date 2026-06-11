const board = document.getElementById('board');
const resetBtn = document.getElementById('resetBtn');
const levelEl = document.getElementById('level');
const size = 6;
const cellSize = 62;

const levels = [
  {
    level: 1,
    positions: [
      { id: 'R', x: 1, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 0, y: 1, len: 3, horizontal: false },
      { id: 'B', x: 0, y: 0, len: 2, horizontal: true },
      { id: 'C', x: 0, y: 4, len: 2, horizontal: false },
      { id: 'D', x: 3, y: 1, len: 3, horizontal: false },
      { id: 'E', x: 4, y: 4, len: 2, horizontal: true },
      { id: 'F', x: 2, y: 5, len: 3, horizontal: true },
      { id: 'G', x: 5, y: 0, len: 3, horizontal: false }
    ]
  },
  {
    level: 2,
    positions: [
      { id: 'R', x: 0, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 0, y: 0, len: 2, horizontal: false },
      { id: 'B', x: 0, y: 3, len: 3, horizontal: true },
      { id: 'C', x: 0, y: 5, len: 2, horizontal: true },
      { id: 'D', x: 2, y: 4, len: 2, horizontal: false },
      { id: 'E', x: 3, y: 0, len: 3, horizontal: true },
      { id: 'F', x: 3, y: 1, len: 2, horizontal: false },
      { id: 'G', x: 4, y: 2, len: 2, horizontal: false },
      { id: 'H', x: 5, y: 1, len: 3, horizontal: false },
      { id: 'I', x: 4, y: 4, len: 2, horizontal: true },
      { id: 'J', x: 3, y: 5, len: 2, horizontal: true }
    ]
  },
  {
    level: 3,
    positions: [
      { id: 'R', x: 1, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 3, y: 2, len: 3, horizontal: false },
      { id: 'B', x: 1, y: 3, len: 2, horizontal: true },
      { id: 'C', x: 1, y: 4, len: 2, horizontal: false },
      { id: 'D', x: 2, y: 5, len: 2, horizontal: true },
      { id: 'E', x: 5, y: 3, len: 3, horizontal: false }
    ]
  },
  {
    level: 4,
    positions: [
      { id: 'R', x: 1, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 0, y: 0, len: 3, horizontal: false },
      { id: 'B', x: 3, y: 0, len: 3, horizontal: false },
      { id: 'C', x: 2, y: 3, len: 2, horizontal: false },
      { id: 'D', x: 3, y: 3, len: 3, horizontal: true },
      { id: 'E', x: 2, y: 5, len: 3, horizontal: true },
      { id: 'F', x: 5, y: 4, len: 2, horizontal: false }
    ]
  },
  {
    level: 5,
    positions: [
      { id: 'R', x: 1, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 0, y: 0, len: 2, horizontal: true },
      { id: 'B', x: 0, y: 1, len: 3, horizontal: false },
      { id: 'C', x: 0, y: 4, len: 2, horizontal: false },
      { id: 'D', x: 1, y: 3, len: 3, horizontal: true },
      { id: 'E', x: 3, y: 0, len: 3, horizontal: false },
      { id: 'F', x: 4, y: 1, len: 3, horizontal: false },
      { id: 'G', x: 5, y: 0, len: 2, horizontal: false },
      { id: 'H', x: 5, y: 2, len: 2, horizontal: false },
      { id: 'I', x: 4, y: 4, len: 2, horizontal: true },
      { id: 'J', x: 4, y: 5, len: 2, horizontal: true }
    ]
  },
  {
    level: 6,
    positions: [
      { id: 'R', x: 1, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 0, y: 0, len: 2, horizontal: true },
      { id: 'B', x: 0, y: 1, len: 2, horizontal: true },
      { id: 'C', x: 0, y: 3, len: 2, horizontal: true },
      { id: 'D', x: 0, y: 4, len: 2, horizontal: false },
      { id: 'E', x: 2, y: 3, len: 2, horizontal: false },
      { id: 'F', x: 3, y: 0, len: 2, horizontal: false },
      { id: 'G', x: 3, y: 2, len: 3, horizontal: false },
      { id: 'H', x: 3, y: 5, len: 3, horizontal: true },
      { id: 'I', x: 4, y: 1, len: 3, horizontal: false },
      { id: 'J', x: 5, y: 1, len: 3, horizontal: false }
    ]
  },
  {
    level: 7,
    positions: [
      { id: 'R', x: 1, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 1, y: 0, len: 2, horizontal: false },
      { id: 'B', x: 2, y: 0, len: 2, horizontal: true },
      { id: 'C', x: 3, y: 1, len: 2, horizontal: false },
      { id: 'D', x: 2, y: 3, len: 2, horizontal: true },
      { id: 'E', x: 3, y: 4, len: 2, horizontal: false },
      { id: 'F', x: 4, y: 0, len: 2, horizontal: false },
      { id: 'G', x: 5, y: 0, len: 2, horizontal: false },
      { id: 'H', x: 5, y: 2, len: 2, horizontal: false }
    ]
  },
  {
    level: 8,
    positions: [
      { id: 'A', x: 3, y: 0, len: 2, horizontal: true },
      { id: 'B', x: 5, y: 0, len: 3, horizontal: false },
      { id: 'C', x: 2, y: 1, len: 2, horizontal: true },
      { id: 'D', x: 4, y: 1, len: 2, horizontal: false },
      { id: 'R', x: 0, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'E', x: 2, y: 2, len: 2, horizontal: false },
      { id: 'F', x: 3, y: 2, len: 2, horizontal: false },
      { id: 'G', x: 0, y: 3, len: 2, horizontal: true },
      { id: 'H', x: 4, y: 3, len: 2, horizontal: true },
      { id: 'I', x: 0, y: 4, len: 2, horizontal: true },
      { id: 'J', x: 2, y: 4, len: 2, horizontal: false },
      { id: 'K', x: 3, y: 4, len: 3, horizontal: true },
      { id: 'L', x: 3, y: 5, len: 3, horizontal: true },
      { id: 'M', x: 0, y: 5, len: 2, horizontal: true }
    ]
  },
  {
    level: 9,
    positions: [
      { id: 'R', x: 0, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 1, y: 0, len: 2, horizontal: false },
      { id: 'B', x: 2, y: 0, len: 2, horizontal: true },
      { id: 'C', x: 4, y: 0, len: 2, horizontal: true },
      { id: 'D', x: 3, y: 1, len: 2, horizontal: false },
      { id: 'E', x: 4, y: 1, len: 2, horizontal: true },
      { id: 'F', x: 5, y: 2, len: 2, horizontal: false },
      { id: 'G', x: 1, y: 3, len: 3, horizontal: true },
      { id: 'H', x: 4, y: 2, len: 3, horizontal: false },
      { id: 'I', x: 0, y: 3, len: 3, horizontal: false },
      { id: 'J', x: 2, y: 4, len: 2, horizontal: false },
      { id: 'K', x: 5, y: 4, len: 2, horizontal: false }
    ]
  },
  {
    level: 10,
    positions: [
      { id: 'R', x: 1, y: 2, len: 2, horizontal: true, isRed: true },
      { id: 'A', x: 0, y: 0, len: 2, horizontal: true },
      { id: 'B', x: 2, y: 0, len: 2, horizontal: false },
      { id: 'C', x: 4, y: 0, len: 2, horizontal: true },
      { id: 'D', x: 0, y: 1, len: 2, horizontal: true },
      { id: 'E', x: 0, y: 2, len: 3, horizontal: false },
      { id: 'F', x: 1, y: 3, len: 3, horizontal: true },
      { id: 'G', x: 5, y: 1, len: 3, horizontal: false },
      { id: 'H', x: 0, y: 5, len: 2, horizontal: true },
      { id: 'I', x: 3, y: 4, len: 2, horizontal: false },
      { id: 'J', x: 4, y: 4, len: 2, horizontal: true },
      { id: 'K', x: 4, y: 5, len: 2, horizontal: true }
    ]
  }
];

let currentLevel = 0;
let cars = [];
let levelCleared = false;

function getRandomColor() {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function createGrid() {
  board.innerHTML = '';

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.left = `${x * cellSize}px`;
      cell.style.top = `${y * cellSize}px`;
      board.appendChild(cell);
    }
  }

  const exit = document.createElement('div');
  exit.className = 'exit';
  exit.textContent = 'EXIT';

  board.appendChild(exit);
}

function isCollision(car, x, y) {
  const occupied = new Set();

  cars.forEach(other => {
    if (other.id !== car.id) {
      for (let i = 0; i < other.len; i++) {
        const ox = other.horizontal ? other.x + i : other.x;
        const oy = other.horizontal ? other.y : other.y + i;
        occupied.add(`${ox},${oy}`);
      }
    }
  });

  for (let i = 0; i < car.len; i++) {
    const cx = car.horizontal ? x + i : x;
    const cy = car.horizontal ? y : y + i;

    if (cx < 0 || cx >= size || cy < 0 || cy >= size) {
      continue;
    }

    if (occupied.has(`${cx},${cy}`)) {
      return true;
    }
  }

  return false;
}

function checkWinCondition() {
  if (levelCleared) return;

  const redCar = cars.find(c => c.isRed);

  if (redCar && redCar.horizontal && redCar.x >= size) {
    levelCleared = true;

    if (confirm("🎉 클리어! 빨간 차가 출구에 도착했습니다. 다음 단계로 넘어갈까요?")) {
      nextGame();
    }
  }
}

function moveCarOneCellAtATime(car, targetX, targetY) {
  while (car.x !== targetX || car.y !== targetY) {
    const nextX = car.x + Math.sign(targetX - car.x);
    const nextY = car.y + Math.sign(targetY - car.y);
    if (isCollision(car, nextX, nextY)) {
      break;
    }
    car.x = nextX;
    car.y = nextY;
  }
}

function placeCars() {
  cars.forEach(car => {
    const el = document.createElement('div');
    el.className = 'car';
    el.textContent = car.id;
    el.style.width = car.horizontal ? `${cellSize * car.len - 2}px` : `${cellSize - 2}px`;
    el.style.height = car.horizontal ? `${cellSize - 2}px` : `${cellSize * car.len - 2}px`;
    el.style.left = `${car.x * cellSize}px`;
    el.style.top = `${car.y * cellSize}px`;
    el.style.background = car.isRed ? 'crimson' : getRandomColor();
    board.appendChild(el);

    let startX;
    let startY;
    let initX;
    let initY;

    const startDrag = (x, y) => {
      startX = x;
      startY = y;
      initX = car.x;
      initY = car.y;
    };

    const duringDrag = (x, y) => {
      const dx = x - startX;
      const dy = y - startY;
      let newX = car.x;
      let newY = car.y;

      if (car.horizontal) {
        const moved = Math.round(dx / cellSize);
        const maxX = car.isRed && car.y === 2 ? size : size - car.len;
        newX = Math.max(0, Math.min(maxX, initX + moved));

        moveCarOneCellAtATime(car, newX, car.y);
      } else {
        const moved = Math.round(dy / cellSize);
        newY = Math.max(0, Math.min(size - car.len, initY + moved));

        moveCarOneCellAtATime(car, car.x, newY);
      }

      el.style.left = `${car.x * cellSize}px`;
      el.style.top = `${car.y * cellSize}px`;
      checkWinCondition();
    };

    el.addEventListener('pointerdown', event => {
      if (levelCleared) return;
      event.preventDefault();

      startDrag(event.clientX, event.clientY);


      el.setPointerCapture(event.pointerId);

      const onPointerMove = pointerMoveEvent => {
        pointerMoveEvent.preventDefault();
        duringDrag(pointerMoveEvent.clientX, pointerMoveEvent.clientY);
      };

      const onPointerUp = () => {
        if (el.hasPointerCapture(event.pointerId)) {
          el.releasePointerCapture(event.pointerId);
        }
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerUp);
      };

      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointercancel', onPointerUp);
    });
  });
}

function loadLevel(index) {
  currentLevel = index % levels.length;
  levelCleared = false;
  
  levelEl.textContent = levels[currentLevel].level;
  cars = JSON.parse(JSON.stringify(levels[currentLevel].positions));
  createGrid();
  placeCars();
}

function resetGame() {
  loadLevel(currentLevel);
}

function nextGame() {
  currentLevel += 1;

  if (currentLevel >= levels.length) {
    if (confirm("🎉 끝~~~")) {
      currentLevel = 0;
      loadLevel(currentLevel);
    }
  } else {
    loadLevel(currentLevel);
  }
}

resetBtn.addEventListener('click', resetGame);

resetGame();
