const activityMap = {
  "opening-night": "Opening Night",
  "city-game": "Clickbait City Game",
  "clickbait-dinner": "Scandalous Dinner",
  party: "Final Boss Party"
};

const params = new URLSearchParams(window.location.search);
const selectedActivity = activityMap[params.get("activity") || ""];
const activitySelect = document.querySelector("#activity-select");
const themeToggle = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("lustrum-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
}

function syncThemeToggle() {
  if (!themeToggle) return;
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.querySelector(".toggle-label").textContent = isDark ? "Light" : "Dark";
}

themeToggle?.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("lustrum-theme", isDark ? "dark" : "light");
  syncThemeToggle();
});

syncThemeToggle();

if (activitySelect && selectedActivity) {
  activitySelect.value = selectedActivity;
}

document.querySelectorAll(".activity-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    card.style.transform = `translate(${x / 80}px, ${y / 80}px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d"];

window.addEventListener("keydown", (event) => {
  if (gameKeys.includes(event.key)) {
    event.preventDefault();
  }
});

function initSnake() {
  const canvas = document.querySelector("#snake-board");
  const startButton = document.querySelector("#snake-start");
  const scoreEl = document.querySelector("#snake-score");
  if (!canvas || !startButton || !scoreEl) return;

  const ctx = canvas.getContext("2d");
  const size = 16;
  const cell = canvas.width / size;
  let snake;
  let direction;
  let nextDirection;
  let food;
  let score;
  let timer;

  function randomFood() {
    let item;
    do {
      item = {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size)
      };
    } while (snake.some((part) => part.x === item.x && part.y === item.y));
    return item;
  }

  function reset() {
    snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    score = 0;
    food = randomFood();
    scoreEl.textContent = score;
    draw();
  }

  function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
    ctx.strokeStyle = "#101118";
    ctx.lineWidth = 2;
    ctx.strokeRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
  }

  function draw() {
    ctx.fillStyle = "#1b1d2b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i <= size; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, canvas.height);
      ctx.moveTo(0, i * cell);
      ctx.lineTo(canvas.width, i * cell);
      ctx.stroke();
    }
    drawBlock(food.x, food.y, "#ff3c8a");
    snake.forEach((part, index) => drawBlock(part.x, part.y, index ? "#d6ff2f" : "#20d9ff"));
  }

  function step() {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const crashed =
      head.x < 0 ||
      head.x >= size ||
      head.y < 0 ||
      head.y >= size ||
      snake.some((part) => part.x === head.x && part.y === head.y);

    if (crashed) {
      clearInterval(timer);
      timer = null;
      startButton.textContent = "Restart";
      draw();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = score;
      food = randomFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function setDirection(x, y) {
    if (direction.x + x === 0 && direction.y + y === 0) return;
    nextDirection = { x, y };
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") setDirection(0, -1);
    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") setDirection(0, 1);
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") setDirection(-1, 0);
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") setDirection(1, 0);
  });

  startButton.addEventListener("click", () => {
    clearInterval(timer);
    reset();
    timer = setInterval(step, 125);
    startButton.textContent = "Restart";
  });

  reset();
}

function initDinoRun() {
  const canvas = document.querySelector("#dino-board");
  const startButton = document.querySelector("#dino-start");
  const scoreEl = document.querySelector("#dino-score");
  if (!canvas || !startButton || !scoreEl) return;

  const ctx = canvas.getContext("2d");
  const ground = 172;
  let player;
  let obstacle;
  let running = false;
  let score = 0;
  let frameId;
  let lastFrame = 0;

  function reset() {
    player = { x: 54, y: ground - 38, w: 34, h: 38, vy: 0 };
    obstacle = { x: canvas.width + 80, y: ground - 34, w: 28, h: 34 };
    score = 0;
    scoreEl.textContent = score;
    draw();
  }

  function jump() {
    if (!running) {
      running = true;
      startButton.textContent = "Restart";
      lastFrame = performance.now();
      frameId = requestAnimationFrame(loop);
    }
    if (player.y >= ground - player.h) {
      player.vy = -10.5;
    }
  }

  function drawPixelRunner() {
    ctx.fillStyle = "#d6ff2f";
    ctx.fillRect(player.x, player.y + 10, 28, 24);
    ctx.fillRect(player.x + 18, player.y, 20, 18);
    ctx.fillRect(player.x + 26, player.y + 4, 4, 4);
    ctx.fillRect(player.x + 4, player.y + 32, 8, 12);
    ctx.fillRect(player.x + 22, player.y + 32, 8, 12);
    ctx.strokeStyle = "#101118";
    ctx.lineWidth = 4;
    ctx.strokeRect(player.x, player.y + 10, 28, 24);
    ctx.strokeRect(player.x + 18, player.y, 20, 18);
  }

  function draw() {
    ctx.fillStyle = "#fff7da";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#20d9ff";
    ctx.fillRect(0, 0, canvas.width, 68);
    ctx.fillStyle = "#101118";
    ctx.fillRect(0, ground, canvas.width, 5);
    ctx.fillStyle = "#ff3c8a";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    ctx.fillStyle = "#ff9d1e";
    ctx.fillRect(obstacle.x + 8, obstacle.y - 16, 12, 18);
    ctx.strokeStyle = "#101118";
    ctx.lineWidth = 4;
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    drawPixelRunner();
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function loop(timestamp) {
    const step = Math.min((timestamp - lastFrame) / 16.67, 2);
    lastFrame = timestamp;

    player.vy += 0.48 * step;
    player.y += player.vy * step;
    if (player.y > ground - player.h) {
      player.y = ground - player.h;
      player.vy = 0;
    }

    obstacle.x -= (3.4 + Math.min(score / 900, 2.2)) * step;
    if (obstacle.x + obstacle.w < 0) {
      obstacle.x = canvas.width + 120 + Math.random() * 220;
      score += 10;
      scoreEl.textContent = Math.floor(score);
    }

    if (overlaps(player, obstacle)) {
      running = false;
      cancelAnimationFrame(frameId);
      startButton.textContent = "Restart";
      draw();
      return;
    }

    score += step;
    scoreEl.textContent = Math.floor(score);
    draw();
    frameId = requestAnimationFrame(loop);
  }

  startButton.addEventListener("click", () => {
    cancelAnimationFrame(frameId);
    reset();
    running = true;
    startButton.textContent = "Restart";
    lastFrame = performance.now();
    frameId = requestAnimationFrame(loop);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp") jump();
  });
  canvas.addEventListener("pointerdown", jump);
  reset();
}

function initMinesweeper() {
  const boardEl = document.querySelector("#mine-board");
  const resetButton = document.querySelector("#mine-reset");
  const statusEl = document.querySelector("#mine-status");
  const countEl = document.querySelector("#mine-count");
  if (!boardEl || !resetButton || !statusEl || !countEl) return;

  const width = 9;
  const mineTotal = 10;
  let cells = [];
  let gameOver = false;

  function neighbors(index) {
    const x = index % width;
    const y = Math.floor(index / width);
    const found = [];
    for (let yy = y - 1; yy <= y + 1; yy += 1) {
      for (let xx = x - 1; xx <= x + 1; xx += 1) {
        if (xx === x && yy === y) continue;
        if (xx >= 0 && xx < width && yy >= 0 && yy < width) {
          found.push(yy * width + xx);
        }
      }
    }
    return found;
  }

  function render() {
    boardEl.innerHTML = "";
    cells.forEach((cell, index) => {
      const button = document.createElement("button");
      button.className = "mine-cell";
      button.type = "button";
      if (cell.revealed) button.classList.add("revealed");
      if (cell.flagged) button.classList.add("flagged");
      if (cell.hit) button.classList.add("mine-hit");
      button.textContent = cell.flagged ? "!" : cell.revealed ? cell.mine ? "X" : cell.count || "" : "";
      button.addEventListener("click", () => reveal(index));
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        flag(index);
      });
      boardEl.append(button);
    });
    const flags = cells.filter((cell) => cell.flagged).length;
    countEl.textContent = Math.max(mineTotal - flags, 0);
  }

  function reveal(index) {
    const cell = cells[index];
    if (gameOver || cell.flagged || cell.revealed) return;
    cell.revealed = true;
    if (cell.mine) {
      cell.hit = true;
      gameOver = true;
      cells.forEach((item) => {
        if (item.mine) item.revealed = true;
      });
      statusEl.textContent = "Headline exploded. Reset?";
      render();
      return;
    }
    if (cell.count === 0) {
      neighbors(index).forEach(reveal);
    }
    const safeCells = cells.filter((item) => !item.mine);
    if (safeCells.every((item) => item.revealed)) {
      gameOver = true;
      statusEl.textContent = "You found the clean story.";
    }
    render();
  }

  function flag(index) {
    const cell = cells[index];
    if (gameOver || cell.revealed) return;
    cell.flagged = !cell.flagged;
    render();
  }

  function reset() {
    const mineIndexes = new Set();
    while (mineIndexes.size < mineTotal) {
      mineIndexes.add(Math.floor(Math.random() * width * width));
    }
    cells = Array.from({ length: width * width }, (_, index) => ({
      mine: mineIndexes.has(index),
      revealed: false,
      flagged: false,
      hit: false,
      count: 0
    }));
    cells.forEach((cell, index) => {
      cell.count = neighbors(index).filter((neighbor) => cells[neighbor].mine).length;
    });
    gameOver = false;
    statusEl.textContent = "Left click reveal, right click flag.";
    render();
  }

  resetButton.addEventListener("click", reset);
  reset();
}

function initSudoku() {
  const boardEl = document.querySelector("#sudoku-board");
  const checkButton = document.querySelector("#sudoku-check");
  const resetButton = document.querySelector("#sudoku-reset");
  const statusEl = document.querySelector("#sudoku-status");
  if (!boardEl || !checkButton || !resetButton || !statusEl) return;

  const puzzle = [
    5, 3, 0, 0, 7, 0, 0, 0, 0,
    6, 0, 0, 1, 9, 5, 0, 0, 0,
    0, 9, 8, 0, 0, 0, 0, 6, 0,
    8, 0, 0, 0, 6, 0, 0, 0, 3,
    4, 0, 0, 8, 0, 3, 0, 0, 1,
    7, 0, 0, 0, 2, 0, 0, 0, 6,
    0, 6, 0, 0, 0, 0, 2, 8, 0,
    0, 0, 0, 4, 1, 9, 0, 0, 5,
    0, 0, 0, 0, 8, 0, 0, 7, 9
  ];
  const solution = [
    5, 3, 4, 6, 7, 8, 9, 1, 2,
    6, 7, 2, 1, 9, 5, 3, 4, 8,
    1, 9, 8, 3, 4, 2, 5, 6, 7,
    8, 5, 9, 7, 6, 1, 4, 2, 3,
    4, 2, 6, 8, 5, 3, 7, 9, 1,
    7, 1, 3, 9, 2, 4, 8, 5, 6,
    9, 6, 1, 5, 3, 7, 2, 8, 4,
    2, 8, 7, 4, 1, 9, 6, 3, 5,
    3, 4, 5, 2, 8, 6, 1, 7, 9
  ];

  function build() {
    boardEl.innerHTML = "";
    puzzle.forEach((value, index) => {
      const input = document.createElement("input");
      input.className = "sudoku-cell";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.setAttribute("aria-label", `Sudoku cell ${index + 1}`);
      if (value) {
        input.value = value;
        input.disabled = true;
        input.classList.add("given");
      }
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^1-9]/g, "").slice(0, 1);
        input.classList.remove("wrong");
        statusEl.textContent = "Editing";
      });
      boardEl.append(input);
    });
    statusEl.textContent = "Ready";
  }

  function check() {
    const inputs = [...boardEl.querySelectorAll(".sudoku-cell")];
    let complete = true;
    let correct = true;
    inputs.forEach((input, index) => {
      input.classList.remove("wrong");
      if (!input.value) complete = false;
      if (input.value && Number(input.value) !== solution[index]) {
        correct = false;
        input.classList.add("wrong");
      }
    });
    if (correct && complete) statusEl.textContent = "Solved";
    if (correct && !complete) statusEl.textContent = "So far so clicky";
    if (!correct) statusEl.textContent = "Suspicious numbers";
  }

  checkButton.addEventListener("click", check);
  resetButton.addEventListener("click", build);
  build();
}

function initTetris() {
  const canvas = document.querySelector("#tetris-board");
  const startButton = document.querySelector("#tetris-start");
  const scoreEl = document.querySelector("#tetris-score");
  if (!canvas || !startButton || !scoreEl) return;

  const ctx = canvas.getContext("2d");
  const cols = 10;
  const rows = 20;
  const cell = canvas.width / cols;
  const colors = ["#20d9ff", "#d6ff2f", "#ff3c8a", "#ff9d1e", "#713cff", "#00c875", "#fff7da"];
  const shapes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]]
  ];
  let board;
  let piece;
  let score;
  let running = false;
  let timer;

  function emptyBoard() {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  function randomPiece() {
    const index = Math.floor(Math.random() * shapes.length);
    const matrix = shapes[index].map((row) => [...row]);
    return {
      matrix,
      color: colors[index],
      x: Math.floor(cols / 2) - Math.ceil(matrix[0].length / 2),
      y: 0
    };
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
    ctx.strokeStyle = "#101118";
    ctx.lineWidth = 2;
    ctx.strokeRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
  }

  function draw() {
    ctx.fillStyle = "#1b1d2b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    for (let x = 0; x <= cols; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * cell, 0);
      ctx.lineTo(x * cell, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell);
      ctx.lineTo(canvas.width, y * cell);
      ctx.stroke();
    }
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) drawCell(x, y, color);
      });
    });
    piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) drawCell(piece.x + x, piece.y + y, piece.color);
      });
    });
  }

  function collides(testPiece = piece) {
    return testPiece.matrix.some((row, y) =>
      row.some((value, x) => {
        if (!value) return false;
        const boardX = testPiece.x + x;
        const boardY = testPiece.y + y;
        return boardX < 0 || boardX >= cols || boardY >= rows || Boolean(board[boardY]?.[boardX]);
      })
    );
  }

  function merge() {
    piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value && board[piece.y + y]) {
          board[piece.y + y][piece.x + x] = piece.color;
        }
      });
    });
  }

  function clearLines() {
    let cleared = 0;
    board = board.filter((row) => {
      if (row.every(Boolean)) {
        cleared += 1;
        return false;
      }
      return true;
    });
    while (board.length < rows) {
      board.unshift(Array(cols).fill(null));
    }
    if (cleared) {
      score += [0, 100, 300, 500, 800][cleared] || cleared * 250;
      scoreEl.textContent = score;
    }
  }

  function spawn() {
    piece = randomPiece();
    if (collides()) {
      running = false;
      clearInterval(timer);
      timer = null;
      startButton.textContent = "Restart";
    }
  }

  function tick() {
    if (!running) return;
    piece.y += 1;
    if (collides()) {
      piece.y -= 1;
      merge();
      clearLines();
      spawn();
    }
    draw();
  }

  function move(dx) {
    if (!running) return;
    piece.x += dx;
    if (collides()) piece.x -= dx;
    draw();
  }

  function softDrop() {
    if (!running) return;
    piece.y += 1;
    if (collides()) piece.y -= 1;
    draw();
  }

  function hardDrop() {
    if (!running) return;
    while (!collides()) {
      piece.y += 1;
      score += 2;
    }
    piece.y -= 1;
    scoreEl.textContent = score;
    merge();
    clearLines();
    spawn();
    draw();
  }

  function rotate() {
    if (!running) return;
    const rotated = piece.matrix[0].map((_, index) => piece.matrix.map((row) => row[index]).reverse());
    const original = piece.matrix;
    piece.matrix = rotated;
    if (collides()) {
      piece.x += piece.x < cols / 2 ? 1 : -1;
      if (collides()) {
        piece.matrix = original;
      }
    }
    draw();
  }

  function start() {
    clearInterval(timer);
    board = emptyBoard();
    score = 0;
    scoreEl.textContent = score;
    running = true;
    startButton.textContent = "Restart";
    spawn();
    draw();
    timer = setInterval(tick, 620);
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
    if (event.key === "ArrowDown") softDrop();
    if (event.key === "ArrowUp") rotate();
    if (event.key === " ") hardDrop();
  });

  startButton.addEventListener("click", start);
  board = emptyBoard();
  piece = randomPiece();
  score = 0;
  draw();
}

function initFlappy() {
  const canvas = document.querySelector("#flappy-board");
  const startButton = document.querySelector("#flappy-start");
  const scoreEl = document.querySelector("#flappy-score");
  if (!canvas || !startButton || !scoreEl) return;

  const ctx = canvas.getContext("2d");
  const pipeGap = 116;
  const pipeSpeed = 1.8;
  const bird = { x: 88, y: 130, size: 26, vy: 0 };
  let pipes = [];
  let running = false;
  let frameId;
  let lastFrame = 0;
  let score = 0;

  function reset() {
    bird.y = 130;
    bird.vy = 0;
    pipes = [{ x: canvas.width + 60, gapY: 118, scored: false }];
    score = 0;
    scoreEl.textContent = score;
    draw();
  }

  function drawBird() {
    ctx.fillStyle = "#d6ff2f";
    ctx.fillRect(bird.x, bird.y, bird.size, bird.size);
    ctx.fillStyle = "#ff9d1e";
    ctx.fillRect(bird.x + bird.size - 2, bird.y + 10, 12, 8);
    ctx.fillStyle = "#101118";
    ctx.fillRect(bird.x + 17, bird.y + 6, 5, 5);
    ctx.strokeStyle = "#101118";
    ctx.lineWidth = 4;
    ctx.strokeRect(bird.x, bird.y, bird.size, bird.size);
  }

  function drawPipe(pipe) {
    const pipeWidth = 48;
    const topHeight = pipe.gapY - pipeGap / 2;
    const bottomY = pipe.gapY + pipeGap / 2;
    ctx.fillStyle = "#00c875";
    ctx.fillRect(pipe.x, 0, pipeWidth, topHeight);
    ctx.fillRect(pipe.x, bottomY, pipeWidth, canvas.height - bottomY);
    ctx.fillStyle = "#20d9ff";
    ctx.fillRect(pipe.x - 6, topHeight - 16, pipeWidth + 12, 16);
    ctx.fillRect(pipe.x - 6, bottomY, pipeWidth + 12, 16);
    ctx.strokeStyle = "#101118";
    ctx.lineWidth = 4;
    ctx.strokeRect(pipe.x, -4, pipeWidth, topHeight + 4);
    ctx.strokeRect(pipe.x, bottomY, pipeWidth, canvas.height - bottomY + 4);
  }

  function draw() {
    ctx.fillStyle = "#20d9ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff7da";
    ctx.fillRect(0, canvas.height - 42, canvas.width, 42);
    ctx.fillStyle = "#713cff";
    ctx.fillRect(0, canvas.height - 46, canvas.width, 5);
    pipes.forEach(drawPipe);
    drawBird();
  }

  function hitPipe(pipe) {
    const pipeWidth = 48;
    const birdRight = bird.x + bird.size;
    const birdBottom = bird.y + bird.size;
    const insidePipeX = birdRight > pipe.x && bird.x < pipe.x + pipeWidth;
    const outsideGap = bird.y < pipe.gapY - pipeGap / 2 || birdBottom > pipe.gapY + pipeGap / 2;
    return insidePipeX && outsideGap;
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frameId);
    startButton.textContent = "Restart";
    draw();
  }

  function loop(timestamp) {
    const step = Math.min((timestamp - lastFrame) / 16.67, 2);
    lastFrame = timestamp;

    bird.vy += 0.28 * step;
    bird.y += bird.vy * step;

    pipes.forEach((pipe) => {
      pipe.x -= pipeSpeed * step;
      if (!pipe.scored && pipe.x + 48 < bird.x) {
        pipe.scored = true;
        score += 1;
        scoreEl.textContent = score;
      }
    });

    if (pipes[pipes.length - 1].x < canvas.width - 230) {
      pipes.push({
        x: canvas.width + 20,
        gapY: 96 + Math.random() * 96,
        scored: false
      });
    }

    pipes = pipes.filter((pipe) => pipe.x > -70);

    if (bird.y < 0 || bird.y + bird.size > canvas.height - 42 || pipes.some(hitPipe)) {
      stop();
      return;
    }

    draw();
    frameId = requestAnimationFrame(loop);
  }

  function flap() {
    if (!running) {
      reset();
      running = true;
      startButton.textContent = "Restart";
      lastFrame = performance.now();
      frameId = requestAnimationFrame(loop);
    }
    bird.vy = -5.6;
  }

  startButton.addEventListener("click", () => {
    reset();
    running = true;
    startButton.textContent = "Restart";
    cancelAnimationFrame(frameId);
    lastFrame = performance.now();
    frameId = requestAnimationFrame(loop);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp") flap();
  });
  canvas.addEventListener("pointerdown", flap);
  reset();
}

initSnake();
initDinoRun();
initMinesweeper();
initSudoku();
initTetris();
initFlappy();
