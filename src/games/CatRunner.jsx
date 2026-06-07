import { useState, useEffect, useRef, useCallback } from "react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 300;
const GROUND_Y = 240;
const CAT_X = 100;
const CAT_W = 36;
const CAT_H = 32;
const GRAVITY = 0.55;
const JUMP_VEL = -12;
const WIN_TIME = 20;

const COLORS = {
  primary: "#fbbf24",
  secondary: "#f97316",
  accent: "#ef4444",
  ground: "#92400e",
  groundLine: "#b45309",
  sky1: "#1c1917",
  sky2: "#292524",
  catBody: "#fbbf24",
  catEar: "#f97316",
  catEye: "#1c1917",
  catNose: "#f97316",
  text: "#fbbf24",
};

const OBSTACLE_PALETTE = [
  "#f97316",
  "#ef4444",
  "#a78bfa",
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#fb923c",
];

function randomObstacle(x) {
  const h = 30 + Math.random() * 45;
  const w = 18 + Math.random() * 22;
  const color = OBSTACLE_PALETTE[Math.floor(Math.random() * OBSTACLE_PALETTE.length)];
  return { x, y: GROUND_Y - h, w, h, color };
}

function drawCat(ctx, x, y, legPhase) {
  // Body
  ctx.fillStyle = COLORS.catBody;
  ctx.beginPath();
  ctx.roundRect(x, y, CAT_W, CAT_H, 6);
  ctx.fill();

  // Ears (triangles)
  ctx.fillStyle = COLORS.catEar;
  ctx.beginPath();
  ctx.moveTo(x + 4, y);
  ctx.lineTo(x + 4, y - 10);
  ctx.lineTo(x + 13, y);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + CAT_W - 4, y);
  ctx.lineTo(x + CAT_W - 4, y - 10);
  ctx.lineTo(x + CAT_W - 13, y);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = COLORS.catEye;
  ctx.beginPath();
  ctx.arc(x + 10, y + 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 26, y + 12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x + 11, y + 11, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 27, y + 11, 1, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = COLORS.catNose;
  ctx.beginPath();
  ctx.arc(x + 18, y + 19, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 19);
  ctx.lineTo(x + 2, y + 17);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 21);
  ctx.lineTo(x + 2, y + 23);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 19);
  ctx.lineTo(x + 34, y + 17);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 21);
  ctx.lineTo(x + 34, y + 23);
  ctx.stroke();

  // Tail
  ctx.strokeStyle = COLORS.catBody;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  const tailWag = Math.sin(legPhase * 0.15) * 8;
  ctx.moveTo(x, y + CAT_H - 8);
  ctx.quadraticCurveTo(x - 14, y + CAT_H - 4 + tailWag, x - 10, y + CAT_H - 18 + tailWag);
  ctx.stroke();

  // Legs (animated)
  ctx.fillStyle = COLORS.catEar;
  const leg1 = Math.sin(legPhase * 0.3) * 5;
  const leg2 = Math.sin(legPhase * 0.3 + Math.PI) * 5;
  ctx.beginPath();
  ctx.roundRect(x + 6, y + CAT_H - 2, 7, 10 + leg1, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + 16, y + CAT_H - 2, 7, 10 + leg2, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + 24, y + CAT_H - 2, 7, 10 + leg1, 3);
  ctx.fill();
}

function drawBackground(ctx, bgOffset) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, "#1c1917");
  grad.addColorStop(1, "#292524");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Parallax dots (stars/particles) — slow layer
  ctx.fillStyle = "rgba(251,191,36,0.18)";
  const slowOffset = bgOffset * 0.15;
  for (let i = 0; i < 40; i++) {
    const px = ((i * 137 + slowOffset) % (CANVAS_WIDTH + 20)) - 10;
    const py = 10 + (i * 53) % (GROUND_Y - 20);
    const r = 0.8 + (i % 3) * 0.6;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Parallax dots — fast layer
  ctx.fillStyle = "rgba(249,115,22,0.12)";
  const fastOffset = bgOffset * 0.4;
  for (let i = 0; i < 20; i++) {
    const px = ((i * 211 + fastOffset) % (CANVAS_WIDTH + 20)) - 10;
    const py = 20 + (i * 79) % (GROUND_Y - 40);
    ctx.beginPath();
    ctx.arc(px, py, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moving grid lines (horizon depth effect)
  ctx.strokeStyle = "rgba(251,191,36,0.05)";
  ctx.lineWidth = 1;
  const lineSpacing = 80;
  const lineOffset = bgOffset * 0.25 % lineSpacing;
  for (let lx = -lineOffset; lx < CANVAS_WIDTH + lineSpacing; lx += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, GROUND_Y);
    ctx.stroke();
  }

  // Ground
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, "#292524");
  groundGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

  // Ground line
  ctx.strokeStyle = COLORS.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = COLORS.primary;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Ground dashes (moving)
  ctx.strokeStyle = "rgba(251,191,36,0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([18, 14]);
  ctx.lineDashOffset = -(bgOffset * 0.8 % 32);
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 6);
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 6);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawObstacle(ctx, obs) {
  ctx.shadowColor = obs.color;
  ctx.shadowBlur = 8;

  // Main block
  ctx.fillStyle = obs.color;
  ctx.beginPath();
  ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 4);
  ctx.fill();

  // Highlight stripe
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.roundRect(obs.x + 3, obs.y + 3, obs.w - 6, 6, 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}

export default function CatRunner({ onWin, onLose, config = {} }) {
  const WIN_TIME_C = config.surviveSecs ?? WIN_TIME;
  const SPEED_MULT = config.speedMult ?? 1.0;
  const BASE_SPEED = 4.5 * SPEED_MULT;
  const BASE_SPAWN = config.spawnInterval ?? 90;
  const OBS_H_MULT = config.obstacleHeightMult ?? 1.0;

  const canvasRef = useRef(null);
  const stateRef = useRef({
    catY: GROUND_Y - CAT_H,
    catVY: 0,
    onGround: true,
    obstacles: [],
    bgOffset: 0,
    speed: BASE_SPEED,
    spawnTimer: 0,
    spawnInterval: 90,
    elapsed: 0,
    legPhase: 0,
    running: false,
    dead: false,
    won: false,
    lastTime: null,
  });
  const rafRef = useRef(null);
  const [phase, setPhase] = useState("start"); // start | playing | dead | won
  const [displayTime, setDisplayTime] = useState(0);
  const callbacksRef = useRef({ onWin, onLose });

  useEffect(() => {
    callbacksRef.current = { onWin, onLose };
  }, [onWin, onLose]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.running && s.onGround && !s.dead && !s.won) {
      s.catVY = JUMP_VEL;
      s.onGround = false;
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.catY = GROUND_Y - CAT_H;
    s.catVY = 0;
    s.onGround = true;
    s.obstacles = [];
    s.bgOffset = 0;
    s.speed = BASE_SPEED;
    s.spawnTimer = 0;
    s.spawnInterval = BASE_SPAWN;
    s.elapsed = 0;
    s.legPhase = 0;
    s.running = true;
    s.dead = false;
    s.won = false;
    s.lastTime = null;
    setPhase("playing");
    setDisplayTime(0);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const loop = (ts) => {
      const s = stateRef.current;
      if (!s.running) return;

      if (s.lastTime === null) s.lastTime = ts;
      const dt = Math.min((ts - s.lastTime) / 1000, 0.05);
      s.lastTime = ts;

      s.elapsed += dt;
      setDisplayTime(Math.min(s.elapsed, WIN_TIME_C));

      // Win check
      if (s.elapsed >= WIN_TIME_C && !s.dead) {
        s.running = false;
        s.won = true;
        setPhase("won");
        setTimeout(() => callbacksRef.current.onWin && callbacksRef.current.onWin(), 800);
        return;
      }

      // Speed ramp (harder = ramps faster)
      s.speed = BASE_SPEED + (s.elapsed / WIN_TIME_C) * BASE_SPEED * SPEED_MULT;
      s.spawnInterval = Math.max(BASE_SPAWN * 0.55, BASE_SPAWN - s.elapsed * 1.5);

      // Background
      s.bgOffset += s.speed;

      // Cat physics
      if (!s.onGround) {
        s.catVY += GRAVITY;
        s.catY += s.catVY;
        if (s.catY >= GROUND_Y - CAT_H) {
          s.catY = GROUND_Y - CAT_H;
          s.catVY = 0;
          s.onGround = true;
        }
      }

      s.legPhase += s.onGround ? s.speed : 0;

      // Spawn obstacles
      s.spawnTimer++;
      if (s.spawnTimer >= s.spawnInterval) {
        s.spawnTimer = 0;
        const obs = randomObstacle(CANVAS_WIDTH + 20);
        obs.h = obs.h * OBS_H_MULT; obs.y = GROUND_Y - obs.h;
        s.obstacles.push(obs);
        // Occasionally double obstacle (more frequent on hard)
        const doubleChance = 0.15 + (SPEED_MULT - 1) * 0.2;
        if (Math.random() < doubleChance && s.elapsed > 5) {
          const obs2 = randomObstacle(CANVAS_WIDTH + 60 + Math.random() * 30);
          obs2.h = obs2.h * OBS_H_MULT; obs2.y = GROUND_Y - obs2.h;
          s.obstacles.push(obs2);
        }
      }

      // Move + cull obstacles
      s.obstacles = s.obstacles
        .map((o) => ({ ...o, x: o.x - s.speed }))
        .filter((o) => o.x + o.w > -10);

      // Collision detection
      const catLeft = CAT_X + 4;
      const catRight = CAT_X + CAT_W - 4;
      const catTop = s.catY + 4;
      const catBottom = s.catY + CAT_H;

      for (const obs of s.obstacles) {
        if (
          catRight > obs.x + 3 &&
          catLeft < obs.x + obs.w - 3 &&
          catBottom > obs.y + 4 &&
          catTop < obs.y + obs.h
        ) {
          s.running = false;
          s.dead = true;
          setPhase("dead");
          const survivedSecs = parseFloat(s.elapsed.toFixed(1));
          setTimeout(() => callbacksRef.current.onLose && callbacksRef.current.onLose({ score: survivedSecs, total: WIN_TIME_C, unit: 'giây' }), 900);
          // Draw death frame then return
          drawFrame(ctx, s);
          return;
        }
      }

      drawFrame(ctx, s);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  function drawFrame(ctx, s) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBackground(ctx, s.bgOffset);

    for (const obs of s.obstacles) drawObstacle(ctx, obs);

    if (s.dead) {
      // Flash red tint
      ctx.fillStyle = "rgba(239,68,68,0.18)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // X eyes
      drawCatDead(ctx, CAT_X, s.catY);
    } else {
      drawCat(ctx, CAT_X, s.catY, s.legPhase);
    }
  }

  function drawCatDead(ctx, x, y) {
    ctx.fillStyle = COLORS.catBody;
    ctx.beginPath();
    ctx.roundRect(x, y, CAT_W, CAT_H, 6);
    ctx.fill();

    ctx.fillStyle = COLORS.catEar;
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 4, y - 10);
    ctx.lineTo(x + 13, y);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + CAT_W - 4, y);
    ctx.lineTo(x + CAT_W - 4, y - 10);
    ctx.lineTo(x + CAT_W - 13, y);
    ctx.closePath();
    ctx.fill();

    // X eyes
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    [[x + 7, y + 9, x + 13, y + 15], [x + 23, y + 9, x + 29, y + 15],
     [x + 13, y + 9, x + 7, y + 15], [x + 29, y + 9, x + 23, y + 15]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
  }

  // Draw idle frame (before start)
  useEffect(() => {
    if (phase !== "start") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;
    s.bgOffset = 0;
    drawBackground(ctx, 0);
    drawCat(ctx, CAT_X, GROUND_Y - CAT_H, 0);
  }, [phase]);

  const fmtTime = (t) => t.toFixed(1);

  const progressPct = Math.min((displayTime / WIN_TIME_C) * 100, 100);

  return (
    <>
      <style>{`
        .cat-runner-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
        }
        .cat-runner-hud {
          width: ${CANVAS_WIDTH}px;
          max-width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(28,25,23,0.9);
          border: 1px solid rgba(251,191,36,0.25);
          border-bottom: none;
          border-radius: 10px 10px 0 0;
          box-sizing: border-box;
        }
        .cat-runner-score {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.04em;
        }
        .cat-runner-progress-bar {
          flex: 1;
          margin: 0 14px;
          height: 6px;
          background: rgba(251,191,36,0.15);
          border-radius: 99px;
          overflow: hidden;
        }
        .cat-runner-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #fbbf24, #f97316);
          transition: width 0.1s linear;
          box-shadow: 0 0 6px #fbbf2480;
        }
        .cat-runner-canvas {
          display: block;
          border-left: 1px solid rgba(251,191,36,0.25);
          border-right: 1px solid rgba(251,191,36,0.25);
          width: ${CANVAS_WIDTH}px;
          max-width: 100%;
        }
        .cat-runner-footer {
          width: ${CANVAS_WIDTH}px;
          max-width: 100%;
          padding: 6px 12px;
          background: rgba(28,25,23,0.9);
          border: 1px solid rgba(251,191,36,0.25);
          border-top: none;
          border-radius: 0 0 10px 10px;
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }
        .cat-runner-hint {
          font-size: 11px;
          color: rgba(251,191,36,0.5);
          font-family: 'Courier New', monospace;
          letter-spacing: 0.05em;
        }
        .cat-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: rgba(28,25,23,0.82);
          border-radius: 2px;
        }
        .cat-overlay-title {
          font-family: 'Courier New', monospace;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cat-overlay-sub {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: rgba(251,191,36,0.7);
          letter-spacing: 0.04em;
          text-align: center;
          line-height: 1.6;
        }
        .cat-btn {
          padding: 10px 28px;
          border: 2px solid #fbbf24;
          background: transparent;
          color: #fbbf24;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .cat-btn:hover {
          background: #fbbf24;
          color: #1c1917;
          box-shadow: 0 0 16px #fbbf2460;
        }
      `}</style>
      <div className="cat-runner-wrap">
        <div className="cat-runner-hud">
          <span className="cat-runner-score">
            {fmtTime(displayTime)} / {WIN_TIME_C}s
          </span>
          <div className="cat-runner-progress-bar">
            <div
              className="cat-runner-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="cat-runner-score" style={{ color: "#f97316" }}>
            {phase === "playing"
              ? `Còn ${Math.max(0, WIN_TIME_C - displayTime).toFixed(1)}s`
              : phase === "won"
              ? "THẮNG RỒI! 🎉"
              : phase === "dead"
              ? "THUA RỒI!"
              : "SẴN SÀNG"}
          </span>
        </div>

        <div style={{ position: "relative", display: "block", lineHeight: 0 }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="cat-runner-canvas"
            onClick={phase === "playing" ? jump : undefined}
            style={{ cursor: phase === "playing" ? "pointer" : "default" }}
          />

          {phase === "start" && (
            <div className="cat-overlay">
              <div
                className="cat-overlay-title"
                style={{ color: "#fbbf24", textShadow: "0 0 20px #fbbf2460" }}
              >
                Mèo Nhảy
              </div>
              <div className="cat-overlay-sub">
                Sống sót {WIN_TIME_C} giây để thắng!<br />
                Click hoặc nhấn Space để nhảy
              </div>
              <button className="cat-btn" onClick={startGame}>
                Bắt Đầu
              </button>
            </div>
          )}

          {phase === "dead" && (
            <div className="cat-overlay">
              <div
                className="cat-overlay-title"
                style={{ color: "#ef4444", textShadow: "0 0 20px #ef444460" }}
              >
                Thất Bại
              </div>
              <div className="cat-overlay-sub">
                Sống sót được {fmtTime(displayTime)}s / {WIN_TIME_C}s<br />
                Chướng ngại vật quá nhanh!
              </div>
              <button className="cat-btn" style={{ borderColor: "#f97316", color: "#f97316" }} onClick={startGame}>
                Thử Lại
              </button>
            </div>
          )}

          {phase === "won" && (
            <div className="cat-overlay">
              <div
                className="cat-overlay-title"
                style={{ color: "#fbbf24", textShadow: "0 0 24px #fbbf2480" }}
              >
                Thắng Rồi! 🎉
              </div>
              <div className="cat-overlay-sub">
                Chú mèo đã sống sót suốt {WIN_TIME_C} giây!<br />
                Nhanh thật đó!
              </div>
              <button className="cat-btn" onClick={startGame}>
                Chơi Lại
              </button>
            </div>
          )}
        </div>

        <div className="cat-runner-footer">
          <span className="cat-runner-hint">
            {phase === "playing"
              ? "CLICK hoặc SPACE để nhảy"
              : `Nhấn BẮT ĐẦU — sống sót ${WIN_TIME_C} giây để thắng!`}
          </span>
        </div>
      </div>
    </>
  );
}
