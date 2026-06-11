const board = document.getElementById("board");
const resetBtn = document.getElementById("resetBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const levelLabel = document.getElementById("levelLabel");
const message = document.getElementById("message");

const COLORS = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#8b5cf6"
};

const levels = [
  {
    name: "1단계 - 튜토리얼",
    size: 5,
    dots: {
      red: [[0, 0], [0, 4]],
      blue: [[1, 0], [1, 4]],
      green: [[2, 0], [2, 4]],
      yellow: [[3, 0], [3, 4]],
      purple: [[4, 0], [4, 4]]
    }
  },
  {
    name: "2단계 - 첫 꺾기",
    size: 5,
    dots: {
      red: [[0, 0], [3, 3]],
      blue: [[0, 4], [2, 3]],
      green: [[1, 1], [4, 0]],
      yellow: [[1, 4], [4, 4]],
      purple: [[2, 1], [4, 3]]
    }
  },
  {
    name: "3단계 - 돌아가기",
    size: 5,
    dots: {
      red: [[0, 0], [2, 2]],
      blue: [[1, 2], [2, 4]],
      green: [[1, 0], [4, 1]],
      yellow: [[1, 3], [3, 4]],
      purple: [[3, 1], [4, 4]]
    }
  },
  {
    name: "4단계 - 6x6 확장",
    size: 6,
    dots: {
      red: [[0, 0], [2, 2]],
      blue: [[0, 5], [3, 4]],
      purple: [[1, 0], [4, 1]],
      green: [[2, 3], [3, 5]],
      yellow: [[4, 0], [5, 5]]
    }
  },
  {
    name: "5단계 - 어려움",
    size: 6,
    dots: {
      red: [[0, 0], [3, 3]],
      blue: [[2, 3], [5, 5]],
      green: [[1, 1], [5, 2]],
      yellow: [[1, 4], [5, 3]],
      purple: [[2, 1], [4, 3]]
    }
  },
  {
    name: "6단계 - 6x6 길게 돌아가기",
    size: 6,
    dots: {
      red: [[0, 0], [4, 3]],
      blue: [[0, 5], [3, 2]],
      yellow: [[1, 1], [5, 3]],
      green: [[1, 5], [5, 4]],
      purple: [[2, 5], [5, 5]]
    }
  },
  {
    name: "7단계 - 6x6 가로 지그재그",
    size: 6,
    dots: {
      red: [[0, 0], [0, 5]],
      blue: [[1, 5], [2, 0]],
      green: [[2, 1], [3, 3]],
      yellow: [[3, 2], [4, 3]],
      purple: [[4, 4], [5, 0]]
    }
  },
  {
    name: "8단계 - 6x6 세로 지그재그",
    size: 6,
    dots: {
      red: [[0, 0], [5, 1]],
      blue: [[4, 1], [1, 2]],
      green: [[2, 2], [2, 3]],
      yellow: [[1, 3], [4, 4]],
      purple: [[5, 4], [0, 5]]
    }
  },
  {
    name: "9단계 - 7x7 확장",
    size: 7,
    dots: {
      red: [[0, 0], [1, 5]],
      blue: [[1, 4], [2, 4]],
      green: [[2, 5], [4, 0]],
      yellow: [[4, 1], [5, 3]],
      purple: [[5, 2], [6, 6]]
    }
  },
  {
    name: "10단계 - 7x7 세로 미로",
    size: 7,
    dots: {
      red: [[0, 0], [4, 1]],
      blue: [[3, 1], [5, 2]],
      green: [[6, 2], [0, 4]],
      yellow: [[1, 4], [3, 5]],
      purple: [[2, 5], [6, 6]]
    }
  }
];

let currentLevelIndex = 0;
let currentLevel;
let paths;
let activeColor = null;
let isDrawing = false;
let lastCellKey = null;
let dotByCell;
let levelCleared = false;

function cellKey(row, col) {
  return `${row},${col}`;
}

function parseCellKey(key) {
  return key.split(",").map(Number);
}

function sameCell(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function isAdjacent(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function getCellSize() {
  return board.clientWidth / currentLevel.size;
}

function getCellFromPointer(event) {
  const rect = board.getBoundingClientRect();
  const cellSize = getCellSize();
  const col = Math.floor((event.clientX - rect.left) / cellSize);
  const row = Math.floor((event.clientY - rect.top) / cellSize);

  if (row < 0 || col < 0 || row >= currentLevel.size || col >= currentLevel.size) {
    return null;
  }

  return [row, col];
}

function buildDotLookup() {
  dotByCell = new Map();
  Object.entries(currentLevel.dots).forEach(([color, pair]) => {
    pair.forEach(([row, col]) => {
      dotByCell.set(cellKey(row, col), color);
    });
  });
}

function makeInitialPaths() {
  const result = {};
  Object.keys(currentLevel.dots).forEach((color) => {
    result[color] = [];
  });
  return result;
}

function isEndpointForColor(color, cell) {
  return currentLevel.dots[color].some((endpoint) => sameCell(endpoint, cell));
}

function findColorAtCell(cell) {
  return dotByCell.get(cellKey(cell[0], cell[1])) || null;
}

function occupiedByOtherColor(cell, color) {
  const key = cellKey(cell[0], cell[1]);

  for (const [otherColor, path] of Object.entries(paths)) {
    if (otherColor !== color && path.some((p) => cellKey(p[0], p[1]) === key)) {
      return true;
    }
  }

  const dotColor = findColorAtCell(cell);
  return dotColor !== null && dotColor !== color;
}

function startPath(color, cell) {
  activeColor = color;
  isDrawing = true;
  paths[color] = [cell];
  lastCellKey = cellKey(cell[0], cell[1]);
  render();
}

function trimPathTo(color, index) {
  paths[color] = paths[color].slice(0, index + 1);
}

function addCellToPath(color, cell) {
  const path = paths[color];
  const key = cellKey(cell[0], cell[1]);

  if (key === lastCellKey) return;

  const previous = path[path.length - 1];
  if (!previous || !isAdjacent(previous, cell)) return;

  const existingIndex = path.findIndex((p) => cellKey(p[0], p[1]) === key);
  if (existingIndex >= 0) {
    trimPathTo(color, existingIndex);
    lastCellKey = key;
    render();
    return;
  }

  if (occupiedByOtherColor(cell, color)) {
    setMessage("다른 색 점이나 선은 지나갈 수 없습니다.");
    return;
  }

  path.push(cell);
  lastCellKey = key;
  setMessage("같은 색 점끼리 선으로 연결하고 모든 칸을 채우세요.");
  render();
  checkWin();
}

function endDrawing() {
  isDrawing = false;
  activeColor = null;
  lastCellKey = null;
}

function isConnected(color) {
  const path = paths[color];
  const endpoints = currentLevel.dots[color];
  if (path.length < 2) return false;

  const first = path[0];
  const last = path[path.length - 1];

  return (
    (sameCell(first, endpoints[0]) && sameCell(last, endpoints[1])) ||
    (sameCell(first, endpoints[1]) && sameCell(last, endpoints[0]))
  );
}

function allConnected() {
  return Object.keys(currentLevel.dots).every(isConnected);
}

function filledCellCount() {
  const filled = new Set();

  Object.values(paths).forEach((path) => {
    path.forEach(([row, col]) => filled.add(cellKey(row, col)));
  });

  return filled.size;
}

function isBoardFilled() {
  return filledCellCount() === currentLevel.size * currentLevel.size;
}

function checkWin() {
  if (!allConnected()) return;

  if (!isBoardFilled()) {
    setMessage("점은 모두 연결됐지만, 아직 빈 칸이 있습니다.");
    return;
  }

  levelCleared = true;
  updateNavButtons();

  message.textContent = "🎉 클리어! 모든 점을 연결하고 모든 칸을 채웠습니다.";
  message.classList.add("win");
}

function updateNavButtons() {
  prevBtn.disabled = currentLevelIndex === 0;
  nextBtn.disabled = !levelCleared;
}

function setMessage(text) {
  message.textContent = text;
  message.classList.remove("win");
}

function directionClass(from, to) {
  if (to[0] < from[0]) return "up";
  if (to[0] > from[0]) return "down";
  if (to[1] < from[1]) return "left";
  return "right";
}

function renderGrid() {
  for (let row = 0; row < currentLevel.size; row += 1) {
    for (let col = 0; col < currentLevel.size; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.left = `calc(${col} * var(--cell-size))`;
      cell.style.top = `calc(${row} * var(--cell-size))`;
      board.appendChild(cell);
    }
  }
}

function appendPathSegment(piece, direction) {
  const segment = document.createElement("div");
  segment.className = `path-segment ${direction}`;
  piece.appendChild(segment);
}

function renderPaths() {
  Object.entries(paths).forEach(([color, path]) => {
    path.forEach((cell, index) => {
      const piece = document.createElement("div");
      const previous = path[index - 1];
      const next = path[index + 1];

      piece.className = "path-piece";
      piece.style.setProperty("--path-color", COLORS[color]);
      piece.style.left = `calc(${cell[1]} * var(--cell-size))`;
      piece.style.top = `calc(${cell[0]} * var(--cell-size))`;

      const center = document.createElement("div");
      center.className = "path-center";
      piece.appendChild(center);

      if (previous) appendPathSegment(piece, directionClass(cell, previous));
      if (next) appendPathSegment(piece, directionClass(cell, next));

      board.appendChild(piece);
    });
  });
}

function renderDots() {
  Object.entries(currentLevel.dots).forEach(([color, pair]) => {
    pair.forEach(([row, col], index) => {
      const dot = document.createElement("div");
      dot.className = `dot ${isConnected(color) ? "connected" : ""}`;
      dot.style.setProperty("--dot-color", COLORS[color]);
      dot.style.left = `calc(${col} * var(--cell-size) + var(--cell-size) / 2)`;
      dot.style.top = `calc(${row} * var(--cell-size) + var(--cell-size) / 2)`;
      dot.textContent = index + 1;
      dot.dataset.color = color;
      board.appendChild(dot);
    });
  });
}

function resizeBoardForLevel() {
  board.style.setProperty("--grid-size", currentLevel.size);
  board.style.width = `calc(${currentLevel.size} * var(--cell-size))`;
  board.style.height = `calc(${currentLevel.size} * var(--cell-size))`;
}

function render() {
  board.innerHTML = "";
  resizeBoardForLevel();
  renderGrid();
  renderPaths();
  renderDots();
  levelLabel.textContent = currentLevel.name;
}

function loadLevel(index) {
  currentLevelIndex = (index + levels.length) % levels.length;
  currentLevel = levels[currentLevelIndex];
  paths = makeInitialPaths();
  activeColor = null;
  isDrawing = false;
  levelCleared = false;
  buildDotLookup();
  setMessage("같은 색 점끼리 선으로 연결하고 모든 칸을 채우세요.");
  render();
  updateNavButtons();
}

board.addEventListener("pointerdown", (event) => {
  if (levelCleared) return;

  const cell = getCellFromPointer(event);
  if (!cell) return;

  const color = findColorAtCell(cell);
  if (!color) return;

  board.setPointerCapture(event.pointerId);
  startPath(color, cell);
});

board.addEventListener("pointermove", (event) => {
  if (!isDrawing || !activeColor) return;

  const cell = getCellFromPointer(event);
  if (!cell) return;

  addCellToPath(activeColor, cell);
});

board.addEventListener("pointerup", endDrawing);
board.addEventListener("pointercancel", endDrawing);

resetBtn.addEventListener("click", () => loadLevel(currentLevelIndex));
prevBtn.addEventListener("click", () => {
  if (currentLevelIndex === 0) return;
  loadLevel(currentLevelIndex - 1);
});
nextBtn.addEventListener("click", () => {
  if (!levelCleared) {
    setMessage("먼저 모든 점을 연결하고 모든 칸을 채워야 다음 단계로 갈 수 있습니다.");
    return;
  }
   if (currentLevelIndex === levels.length - 1) {
    setMessage("🎉 모든 단계를 끝냈습니다. 다시 하려면 리셋을 누르세요.");
    nextBtn.disabled = true;
    return;
  }

  loadLevel(currentLevelIndex + 1);
});

loadLevel(0);
