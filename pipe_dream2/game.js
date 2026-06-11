const SIZE = 6;
const PREP_SECONDS = 15;
const FLOW_SECONDS = 10;
const STEP_MS = 420;

const PIPE_TYPES = [
  { name: "─", value: "h", dirs: [[0, 1], [0, -1]] },
  { name: "│", value: "v", dirs: [[1, 0], [-1, 0]] },
  { name: "└", value: "bl", dirs: [[-1, 0], [0, 1]] },
  { name: "┘", value: "br", dirs: [[-1, 0], [0, -1]] },
  { name: "┌", value: "tl", dirs: [[1, 0], [0, 1]] },
  { name: "┐", value: "tr", dirs: [[1, 0], [0, -1]] },
];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const nextPipeEl = document.getElementById("nextPipe");
const phaseLabelEl = document.getElementById("phaseLabel");
const timerEl = document.getElementById("timer");
const messageEl = document.getElementById("message");
const newGameBtn = document.getElementById("newGameBtn");

let board;
let nextPipe;
let phase = "ready";
let gameOver = false;
let prepLeft = PREP_SECONDS;
let flowLeft = FLOW_SECONDS;
let prepTimer = null;
let flowTimer = null;
let flowTimeout = null;
let fluid = null;
let shatterEffects = [];

function randomPipe() {
  const pipe = PIPE_TYPES[Math.floor(Math.random() * PIPE_TYPES.length)];
  return { ...pipe, dirs: pipe.dirs.map((dir) => [...dir]) };
}

function createEmptyBoard() {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
}

function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`.trim();
}

function setPhaseLabel(text) {
  phaseLabelEl.textContent = text;
}

function updateNextPipeUI() {
  nextPipeEl.textContent = nextPipe ? nextPipe.name : "-";
}

function updateTimerUI() {
  if (phase === "ready") {
    timerEl.textContent = `${prepLeft}초`;
  } else if (phase === "flow") {
    timerEl.textContent = `${flowLeft}초`;
  } else {
    timerEl.textContent = "-";
  }
}

function resizeCanvasForDisplay() {
  const cssWidth = canvas.clientWidth || 384;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssWidth * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return cssWidth / SIZE;
}

function cellFromPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const cell = rect.width / SIZE;
  const x = Math.floor((event.clientX - rect.left) / cell);
  const y = Math.floor((event.clientY - rect.top) / cell);

  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return null;
  return { x, y };
}

function isStartCell(x, y) {
  return x === 0 && y === 0;
}

function getPipeDirs(cell) {
  if (!cell) return [];
  if (cell.type === "start") return [[0, 1]];
  return cell.dirs;
}

function sameDir(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function opposite(dir) {
  return [-dir[0], -dir[1]];
}

function hasDir(cell, dir) {
  return getPipeDirs(cell).some((candidate) => sameDir(candidate, dir));
}

function clearTimers() {
  if (prepTimer) clearInterval(prepTimer);
  if (flowTimer) clearInterval(flowTimer);
  if (flowTimeout) clearTimeout(flowTimeout);
  prepTimer = null;
  flowTimer = null;
  flowTimeout = null;
}

function startNewGame() {
  clearTimers();
  board = createEmptyBoard();
  board[0][0] = { type: "start" };
  nextPipe = randomPipe();
  phase = "ready";
  gameOver = false;
  prepLeft = PREP_SECONDS;
  flowLeft = FLOW_SECONDS;
  fluid = null;
  shatterEffects = [];

  setPhaseLabel("준비");
  setMessage("파이프를 놓으세요. 이미 놓은 파이프를 다시 누르면 새 파이프로 교체됩니다.");
  updateNextPipeUI();
  updateTimerUI();
  drawBoard();

  prepTimer = setInterval(() => {
    prepLeft -= 1;
    updateTimerUI();

    if (prepLeft <= 0) {
      clearInterval(prepTimer);
      prepTimer = null;
      startFlow();
    }
  }, 1000);
}

function placeOrReplacePipe(x, y) {
  if (phase !== "ready" || gameOver) {
    setMessage("물이 흐르는 동안에는 파이프를 바꿀 수 없습니다.");
    return;
  }

  if (isStartCell(x, y)) {
    setMessage("시작점 S에는 파이프를 놓을 수 없습니다.");
    return;
  }

  if (board[y][x]) {
    shatterEffects.push({ x, y, startedAt: performance.now(), duration: 300 });
    setMessage("기존 파이프가 깨지고 새 파이프로 바뀌었습니다.");
  } else {
    setMessage("파이프를 놓았습니다. 물이 흐르기 전에 길을 이어 주세요.");
  }

  board[y][x] = { ...nextPipe, dirs: nextPipe.dirs.map((dir) => [...dir]) };
  nextPipe = randomPipe();
  updateNextPipeUI();
  drawBoard();
}

function startFlow() {
  phase = "flow";
  flowLeft = FLOW_SECONDS;
  gameOver = false;
  fluid = {
    x: 0,
    y: 0,
    dir: [0, 1],
    steps: 0,
  };

  setPhaseLabel("물 흐름");
  setMessage(`${FLOW_SECONDS}초 동안 물이 멈추지 않으면 성공입니다.`);
  updateTimerUI();
  drawBoard();

  flowTimer = setInterval(() => {
    if (gameOver) return;

    flowLeft -= 1;
    updateTimerUI();

    if (flowLeft <= 0) {
      finishGame(true, "성공! 물이 정해진 시간 동안 멈추지 않고 흘렀습니다.");
    }
  }, 1000);

  flowStep();
}

function flowStep() {
  if (gameOver || phase !== "flow") return;

  const current = board[fluid.y][fluid.x];
  if (!current) {
    finishGame(false, "실패! 물이 파이프가 없는 칸에 도착했습니다.");
    return;
  }

  const incoming = opposite(fluid.dir);

  if (current.type !== "start" && !hasDir(current, incoming)) {
    finishGame(false, "실패! 현재 파이프의 입구 방향이 맞지 않습니다.");
    return;
  }

  const outDirs = getPipeDirs(current).filter((dir) => !sameDir(dir, incoming));
  if (outDirs.length === 0) {
    finishGame(false, "실패! 물이 나갈 방향이 없습니다.");
    return;
  }

  const nextDir = outDirs[0];
  const nx = fluid.x + nextDir[1];
  const ny = fluid.y + nextDir[0];

  if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) {
    finishGame(false, "실패! 물이 게임판 밖으로 나갔습니다.");
    return;
  }

  const nextCell = board[ny][nx];
  if (!nextCell) {
    finishGame(false, "실패! 다음 칸에 파이프가 없습니다.");
    return;
  }

  if (nextCell.type === "start" && fluid.steps > 0) {
    finishGame(false, "실패! 물이 시작점으로 되돌아왔습니다.");
    return;
  }

  if (!hasDir(nextCell, opposite(nextDir))) {
    finishGame(false, "실패! 다음 파이프의 연결 방향이 맞지 않습니다.");
    return;
  }

  fluid.x = nx;
  fluid.y = ny;
  fluid.dir = nextDir;
  fluid.steps += 1;
  drawBoard();

  flowTimeout = setTimeout(flowStep, STEP_MS);
}

function finishGame(success, text) {
  if (gameOver) return;

  gameOver = true;
  phase = "end";
  clearTimers();

  setPhaseLabel(success ? "성공" : "실패");
  setMessage(text, success ? "success" : "fail");
  nextPipe = null;
  updateNextPipeUI();
  updateTimerUI();
  drawBoard();
}

function drawBoard() {
  const cell = resizeCanvasForDisplay();
  const width = cell * SIZE;

  ctx.clearRect(0, 0, width, width);
  drawBackground(cell);
  drawGrid(cell);

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const item = board[y][x];
      if (item) drawPipe(x, y, item, cell);
    }
  }

  drawShatterEffects(cell);

  if (fluid && (phase === "flow" || phase === "end")) {
    drawFluid(cell);
  }
}

function drawBackground(cell) {
  const width = cell * SIZE;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, width, width);

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#263449" : "#223047";
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
}

function drawGrid(cell) {
  ctx.strokeStyle = "rgba(226, 232, 240, 0.26)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= SIZE; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(SIZE * cell, i * cell);
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, SIZE * cell);
    ctx.stroke();
  }
}

function drawPipe(x, y, pipe, cell) {
  const cx = x * cell + cell / 2;
  const cy = y * cell + cell / 2;
  const arm = cell * 0.32;
  const lineWidth = Math.max(10, cell * 0.18);

  ctx.save();
  ctx.translate(cx, cy);

  if (pipe.type === "start") {
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(0, 0, cell * 0.33, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${cell * 0.34}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", 0, 1);
    ctx.restore();
    return;
  }

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  if (pipe.value === "h") {
    ctx.moveTo(-arm, 0);
    ctx.lineTo(arm, 0);
  } else if (pipe.value === "v") {
    ctx.moveTo(0, -arm);
    ctx.lineTo(0, arm);
  } else if (pipe.value === "bl") {
    ctx.moveTo(0, -arm);
    ctx.lineTo(0, 0);
    ctx.lineTo(arm, 0);
  } else if (pipe.value === "br") {
    ctx.moveTo(0, -arm);
    ctx.lineTo(0, 0);
    ctx.lineTo(-arm, 0);
  } else if (pipe.value === "tl") {
    ctx.moveTo(0, arm);
    ctx.lineTo(0, 0);
    ctx.lineTo(arm, 0);
  } else if (pipe.value === "tr") {
    ctx.moveTo(0, arm);
    ctx.lineTo(0, 0);
    ctx.lineTo(-arm, 0);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(14, 165, 233, 0.45)";
  ctx.lineWidth = Math.max(4, lineWidth * 0.36);
  ctx.stroke();

  ctx.restore();
}

function drawFluid(cell) {
  const cx = fluid.x * cell + cell / 2;
  const cy = fluid.y * cell + cell / 2;

  ctx.save();
  ctx.fillStyle = "#38bdf8";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, cell * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawShatterEffects(cell) {
  const now = performance.now();
  shatterEffects = shatterEffects.filter((effect) => now - effect.startedAt < effect.duration);

  shatterEffects.forEach((effect) => {
    const elapsed = now - effect.startedAt;
    const ratio = elapsed / effect.duration;
    const cx = effect.x * cell + cell / 2;
    const cy = effect.y * cell + cell / 2;

    ctx.save();
    ctx.globalAlpha = 1 - ratio;
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 18 - ratio * 8, cy - 12);
    ctx.lineTo(cx - 4, cy + 4);
    ctx.lineTo(cx - 14, cy + 18 + ratio * 6);
    ctx.moveTo(cx + 14 + ratio * 8, cy - 16);
    ctx.lineTo(cx + 2, cy - 2);
    ctx.lineTo(cx + 18, cy + 14 + ratio * 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, cell * (0.28 + ratio * 0.22), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });

  if (shatterEffects.length > 0) {
    requestAnimationFrame(drawBoard);
  }
}

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  const cell = cellFromPointer(event);
  if (!cell) return;
  placeOrReplacePipe(cell.x, cell.y);
});

newGameBtn.addEventListener("click", startNewGame);
window.addEventListener("resize", drawBoard);

startNewGame();
