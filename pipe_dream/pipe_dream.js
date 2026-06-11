const SIZE = 6;
const CELL = 60;
const START = [0, 0];
const GOAL = [SIZE - 1, SIZE - 1];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const nextElem = document.getElementById("nextPipe");
const msgElem = document.getElementById("msg");
const timerElem = document.getElementById("timer");
const startFlowBtn = document.getElementById("startFlowBtn");
const resetBtn = document.getElementById("resetBtn");

const PIPE_TYPES = [
  { name: "─", value: "h", dirs: [[0, 1], [0, -1]] },
  { name: "│", value: "v", dirs: [[1, 0], [-1, 0]] },
  { name: "└", value: "bl", dirs: [[-1, 0], [0, 1]] },
  { name: "┘", value: "br", dirs: [[-1, 0], [0, -1]] },
  { name: "┌", value: "tl", dirs: [[1, 0], [0, 1]] },
  { name: "┐", value: "tr", dirs: [[1, 0], [0, -1]] }
];

let board = [];
let nextPipe = null;
let phase = "build"; // build, flow, end
let fluidY = START[0];
let fluidX = START[1];
let fluidDir = [0, 1];
let visited = new Set();
let flowTimer = null;

function key(row, col) {
  return `${row},${col}`;
}

function samePosition(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function randomPipe() {
  return PIPE_TYPES[Math.floor(Math.random() * PIPE_TYPES.length)];
}

function getPipeDirs(cell) {
  if (!cell) return [];
  if (cell.type === "start") return [[0, 1]];
  if (cell.type === "goal") return [[0, -1], [-1, 0]];
  return cell.dirs || [];
}

function setMessage(text, status = "") {
  msgElem.textContent = text;
  msgElem.className = `message ${status}`;
}

function updateButtons() {
  startFlowBtn.disabled = phase !== "build";
}

function initBoard() {
  board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
  board[START[0]][START[1]] = { type: "start" };
  board[GOAL[0]][GOAL[1]] = { type: "goal" };
}

function resetGame() {
  if (flowTimer) {
    clearInterval(flowTimer);
    flowTimer = null;
  }

  phase = "build";
  fluidY = START[0];
  fluidX = START[1];
  fluidDir = [0, 1];
  visited = new Set([key(fluidY, fluidX)]);
  initBoard();
  nextPipe = randomPipe();
  timerElem.textContent = "준비 단계";
  setMessage("빈 칸을 터치해서 파이프를 놓고, S에서 G까지 길을 만드세요.");
  updateNextPipeUI();
  updateButtons();
  drawBoard();
}

function cellFromPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor(((event.clientX - rect.left) * scaleX) / CELL);
  const y = Math.floor(((event.clientY - rect.top) * scaleY) / CELL);

  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return null;
  return [y, x];
}

function placePipe(event) {
  if (phase !== "build") return;

  event.preventDefault();

  const cell = cellFromPointer(event);
  if (!cell) return;

  const [y, x] = cell;
  if (samePosition(cell, START) || samePosition(cell, GOAL)) return;
  if (board[y][x]) return;

  board[y][x] = { ...nextPipe };
  nextPipe = randomPipe();
  updateNextPipeUI();
  drawBoard();
}

function startFlow() {
  if (phase !== "build") return;

  phase = "flow";
  fluidY = START[0];
  fluidX = START[1];
  fluidDir = [0, 1];
  visited = new Set([key(fluidY, fluidX)]);
  timerElem.textContent = "물 흐르는 중";
  setMessage("물이 흐르기 시작했습니다. 이제 파이프를 더 놓을 수 없습니다.");
  updateButtons();
  drawBoard();

  if (flowTimer) clearInterval(flowTimer);
  flowTimer = setInterval(stepFluid, 420);
}

function canEnter(cell, dir) {
  return getPipeDirs(cell).some(([dy, dx]) => dy === -dir[0] && dx === -dir[1]);
}

function nextDirectionFrom(cell, incomingDir) {
  const dirs = getPipeDirs(cell);

  if (cell.type === "goal") return null;

  return dirs.find(([dy, dx]) => !(dy === -incomingDir[0] && dx === -incomingDir[1])) || null;
}

function fail(text) {
  phase = "end";
  if (flowTimer) {
    clearInterval(flowTimer);
    flowTimer = null;
  }
  setMessage(text, "fail");
  timerElem.textContent = "실패";
  updateButtons();
  drawBoard();
}

function success() {
  phase = "end";
  if (flowTimer) {
    clearInterval(flowTimer);
    flowTimer = null;
  }
  setMessage("성공! 물이 G에 정확히 도착했습니다.", "success");
  timerElem.textContent = "성공";
  updateButtons();
  drawBoard();
}

function stepFluid() {
  if (phase !== "flow") return;

  const currentCell = board[fluidY][fluidX];
  const nextDir = nextDirectionFrom(currentCell, fluidDir);

  if (!nextDir) {
    fail("실패! 파이프가 중간에서 끊겼습니다.");
    return;
  }

  const ny = fluidY + nextDir[0];
  const nx = fluidX + nextDir[1];

  if (ny < 0 || nx < 0 || ny >= SIZE || nx >= SIZE) {
    fail("실패! 물이 판 밖으로 새어 나갔습니다.");
    return;
  }

  const nextCell = board[ny][nx];

  if (!nextCell || !canEnter(nextCell, nextDir)) {
    fail("실패! 다음 파이프와 방향이 맞지 않습니다.");
    return;
  }

  const nextKey = key(ny, nx);
  if (visited.has(nextKey) && !samePosition([ny, nx], GOAL)) {
    fail("실패! 물이 같은 곳을 빙빙 돌고 있습니다.");
    return;
  }

  fluidY = ny;
  fluidX = nx;
  fluidDir = nextDir;
  visited.add(nextKey);
  drawBoard();

  if (samePosition([fluidY, fluidX], GOAL)) {
    success();
  }
}

function updateNextPipeUI() {
  nextElem.textContent = `다음 파이프: ${nextPipe.name}`;
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#1f2937" : "#253044";
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }

  ctx.strokeStyle = "rgba(226, 232, 240, 0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(SIZE * CELL, i * CELL);
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, SIZE * CELL);
    ctx.stroke();
  }

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = board[y][x];
      if (cell) drawPipe(x, y, cell);
    }
  }

  if (phase === "flow" || phase === "end") {
    drawFluid();
  }
}

function drawPipe(x, y, cell) {
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;

  ctx.save();
  ctx.translate(cx, cy);

  if (cell.type === "start" || cell.type === "goal") {
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, 2 * Math.PI);
    ctx.fillStyle = cell.type === "start" ? "#22c55e" : "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cell.type === "start" ? "S" : "G", 0, 0);
    ctx.restore();
    return;
  }

  ctx.lineWidth = 13;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#cbd5e1";

  if (cell.value === "h") drawLine(-22, 0, 22, 0);
  if (cell.value === "v") drawLine(0, -22, 0, 22);
  if (cell.value === "bl") drawCorner(0, -22, 0, 0, 22, 0);
  if (cell.value === "br") drawCorner(0, -22, 0, 0, -22, 0);
  if (cell.value === "tl") drawCorner(0, 22, 0, 0, 22, 0);
  if (cell.value === "tr") drawCorner(0, 22, 0, 0, -22, 0);

  ctx.restore();
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawCorner(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.stroke();
}

function drawFluid() {
  ctx.save();
  ctx.fillStyle = "#38bdf8";
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(fluidX * CELL + CELL / 2, fluidY * CELL + CELL / 2, 17, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

canvas.addEventListener("pointerdown", placePipe);
startFlowBtn.addEventListener("click", startFlow);
resetBtn.addEventListener("click", resetGame);

resetGame();
