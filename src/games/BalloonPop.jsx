import { useState, useEffect, useRef, useCallback } from 'react';

// defaults — overridden by config prop
let _TOTAL = 20, _TARGET = 15, _TIME = 30;

const BALLOON_COLORS = [
  { body: '#ff6b9d', shadow: '#e0457a', string: '#ff6b9d' },
  { body: '#c44dff', shadow: '#9b1de0', string: '#c44dff' },
  { body: '#ffd700', shadow: '#e6b800', string: '#ffd700' },
  { body: '#ff8dc7', shadow: '#ff5fa0', string: '#ff8dc7' },
  { body: '#da70ff', shadow: '#b840ff', string: '#da70ff' },
  { body: '#ffb3d9', shadow: '#ff80bf', string: '#ffb3d9' },
];

const KEYFRAMES_CSS = `
  @keyframes floatUp {
    0%   { transform: translateY(0)   translateX(0); }
    20%  { transform: translateY(-18vh) translateX(6px); }
    40%  { transform: translateY(-36vh) translateX(-6px); }
    60%  { transform: translateY(-54vh) translateX(5px); }
    80%  { transform: translateY(-72vh) translateX(-4px); }
    100% { transform: translateY(-110vh) translateX(0); }
  }
  @keyframes popBurst {
    0%   { transform: scale(1);   opacity: 1; }
    40%  { transform: scale(1.9); opacity: 0.8; }
    100% { transform: scale(2.8); opacity: 0; }
  }
  @keyframes sway {
    0%, 100% { transform: rotate(-4deg); }
    50%       { transform: rotate(4deg); }
  }
  @keyframes shimmer {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes timerPulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.12); }
  }
  @keyframes scorePop {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes celebrate {
    0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50%       { opacity: 1; transform: scale(1); }
  }
  @keyframes btnHover {
    0%, 100% { box-shadow: 0 0 20px #ff6b9d88, 0 0 40px #c44dff44; }
    50%       { box-shadow: 0 0 35px #ff6b9dcc, 0 0 60px #c44dff88; }
  }
`;

let balloonIdCounter = 0;

let _speedFactor = 1.0; // set by BalloonPop component before spawning

function generateBalloon() {
  balloonIdCounter += 1;
  const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  const baseSpeed = 3 + Math.random() * 3; // 3–6s to float to top (fast)
  const speed = baseSpeed * _speedFactor;  // lower factor = faster
  const leftPct = 5 + Math.random() * 82;
  const sizeBase = 48 + Math.random() * 22;
  const size = sizeBase * (0.5 + _speedFactor * 0.5);
  return {
    id: balloonIdCounter,
    color,
    speed,
    leftPct,
    size,
    popped: false,
    popping: false,
  };
}

function BalloonSvg({ color, size }) {
  const w = size;
  const h = size * 1.3;
  return (
    <svg
      width={w}
      height={h + 20}
      viewBox={`0 0 ${w} ${h + 20}`}
      style={{ display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}
    >
      {/* Balloon body */}
      <ellipse
        cx={w / 2}
        cy={h * 0.48}
        rx={w * 0.46}
        ry={h * 0.48}
        fill={color.body}
      />
      {/* Highlight */}
      <ellipse
        cx={w * 0.35}
        cy={h * 0.28}
        rx={w * 0.12}
        ry={h * 0.14}
        fill="rgba(255,255,255,0.45)"
      />
      {/* Knot */}
      <ellipse
        cx={w / 2}
        cy={h * 0.97}
        rx={w * 0.07}
        ry={h * 0.05}
        fill={color.shadow}
      />
      {/* String */}
      <path
        d={`M ${w / 2} ${h * 1.02} Q ${w * 0.42} ${h * 1.1} ${w / 2} ${h + 18}`}
        stroke={color.string}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

function Balloon({ balloon, onPop }) {
  const animStyle = balloon.popping
    ? {
        animation: `popBurst 0.4s ease-out forwards`,
        pointerEvents: 'none',
        zIndex: 20,
      }
    : {
        animation: `floatUp ${balloon.speed}s linear forwards`,
        cursor: 'pointer',
      };

  return (
    <div
      onClick={() => !balloon.popping && onPop(balloon.id)}
      style={{
        position: 'absolute',
        left: `${balloon.leftPct}%`,
        bottom: '-10%',
        width: balloon.size,
        height: balloon.size * 1.5,
        userSelect: 'none',
        transformOrigin: 'center bottom',
        ...animStyle,
      }}
    >
      <BalloonSvg color={balloon.color} size={balloon.size} />
    </div>
  );
}

function ScoreBar({ popped, timeLeft, target }) {
  const urgentTime = timeLeft <= 10;
  const progress = (popped / target) * 100;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
        zIndex: 30,
        gap: 16,
      }}
    >
      {/* Score */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
        <div
          style={{
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
        >
          Đã bắn
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              flex: 1,
              height: 10,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
                borderRadius: 10,
                transition: 'width 0.3s ease',
                boxShadow: '0 0 8px #ff6b9d',
              }}
            />
          </div>
          <span
            style={{
              color: '#ffd700',
              fontWeight: 900,
              fontSize: 18,
              textShadow: '0 0 10px #ffd700',
              minWidth: 44,
              textAlign: 'right',
            }}
          >
            {popped}/{target}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: urgentTime ? `timerPulse 0.6s ease-in-out infinite` : 'none',
        }}
      >
        <div
          style={{
            color: urgentTime ? '#ff4444' : '#fff',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            textShadow: urgentTime ? '0 0 12px #ff4444' : '0 1px 4px rgba(0,0,0,0.5)',
          }}
        >
          Thời gian
        </div>
        <div
          style={{
            color: urgentTime ? '#ff4444' : '#ffd700',
            fontWeight: 900,
            fontSize: 28,
            lineHeight: 1,
            textShadow: urgentTime ? '0 0 20px #ff4444' : '0 0 10px #ffd700',
          }}
        >
          {timeLeft}s
        </div>
      </div>
    </div>
  );
}

function StartScreen({ onStart, target, time }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(196,77,255,0.18) 0%, rgba(255,107,157,0.18) 100%)',
        zIndex: 40,
        gap: 24,
        animation: 'fadeInDown 0.5s ease',
      }}
    >
      <div style={{ fontSize: 72, lineHeight: 1 }}>🎈</div>
      <div
        style={{
          color: '#fff',
          fontSize: 34,
          fontWeight: 900,
          textAlign: 'center',
          textShadow: '0 0 30px #c44dff, 0 2px 8px rgba(0,0,0,0.5)',
          letterSpacing: 2,
        }}
      >
        Bắn Bóng Bay!
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 15,
          textAlign: 'center',
          maxWidth: 260,
          lineHeight: 1.6,
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}
      >
        Bắn <strong style={{ color: '#ffd700' }}>{target} bóng</strong> trước khi<br />
        hết <strong style={{ color: '#ff6b9d' }}>{time} giây</strong>!
      </div>
      <button
        onClick={onStart}
        style={{
          marginTop: 8,
          padding: '14px 44px',
          fontSize: 18,
          fontWeight: 800,
          color: '#fff',
          background: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
          border: 'none',
          borderRadius: 50,
          cursor: 'pointer',
          letterSpacing: 1.5,
          boxShadow: '0 0 20px #ff6b9d88, 0 0 40px #c44dff44',
          animation: 'btnHover 2s ease-in-out infinite',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        BẮT ĐẦU
      </button>
    </div>
  );
}

function EndScreen({ win, popped, onRestart, target }) {
  const sparkles = ['✨', '🌟', '💫', '⭐', '🎉', '🎊'];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: win
          ? 'linear-gradient(135deg, rgba(196,77,255,0.25) 0%, rgba(255,107,157,0.25) 100%)'
          : 'linear-gradient(135deg, rgba(60,0,60,0.45) 0%, rgba(100,0,0,0.45) 100%)',
        zIndex: 40,
        gap: 20,
      }}
    >
      <div
        style={{
          animation: 'celebrate 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 80 }}>{win ? '🎉' : '💨'}</div>
        <div
          style={{
            color: win ? '#ffd700' : '#ff8888',
            fontSize: 38,
            fontWeight: 900,
            textShadow: win
              ? '0 0 30px #ffd700, 0 0 60px #c44dff'
              : '0 0 20px #ff4444',
            letterSpacing: 2,
            textAlign: 'center',
          }}
        >
          {win ? 'THẮNG RỒI! 🎉' : 'HẾT GIỜ!'}
        </div>

        {win && (
          <div style={{ display: 'flex', gap: 6, fontSize: 22 }}>
            {sparkles.map((s, i) => (
              <span
                key={i}
                style={{
                  animation: `sparkle 1.2s ease-in-out ${i * 0.18}s infinite`,
                  display: 'inline-block',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 16,
            textAlign: 'center',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        >
          You popped{' '}
          <strong style={{ color: '#ffd700', fontSize: 22 }}>{popped}</strong>{' '}
          balloon{popped !== 1 ? 's' : ''}
          {win ? ' 🎈' : ` out of ${target} needed`}
        </div>

        <button
          onClick={onRestart}
          style={{
            marginTop: 8,
            padding: '13px 40px',
            fontSize: 16,
            fontWeight: 800,
            color: '#fff',
            background: win
              ? 'linear-gradient(135deg, #ffd700 0%, #ff6b9d 100%)'
              : 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
            border: 'none',
            borderRadius: 50,
            cursor: 'pointer',
            letterSpacing: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          CHƠI LẠI
        </button>
      </div>
    </div>
  );
}

export default function BalloonPop({ onWin, onLose, config = {} }) {
  const TOTAL_BALLOONS = config.totalBalloons ?? _TOTAL;
  const BALLOONS_TO_WIN = config.target ?? _TARGET;
  const GAME_DURATION = config.time ?? _TIME;
  const SPAWN_BATCH = config.spawnBatch ?? 2;
  const SPAWN_INTERVAL = GAME_DURATION / Math.ceil(TOTAL_BALLOONS / SPAWN_BATCH);
  _speedFactor = config.balloonSpeedFactor ?? 1.0;

  const [phase, setPhase] = useState('idle');
  const [balloons, setBalloons] = useState([]);
  const [popped, setPopped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [win, setWin] = useState(false);

  const spawnedRef = useRef(0);
  const spawnTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const gameEndedRef = useRef(false);

  const endGame = useCallback(
    (didWin, finalPopped) => {
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;

      clearInterval(spawnTimerRef.current);
      clearInterval(countdownRef.current);

      setWin(didWin);
      setPhase('ended');

      if (didWin) {
        onWin && onWin(finalPopped);
      } else {
        onLose && onLose({ score: finalPopped, total: BALLOONS_TO_WIN, unit: 'bóng' });
      }
    },
    [onWin, onLose]
  );

  const handlePop = useCallback(
    (id) => {
      setBalloons(prev =>
        prev.map(b => (b.id === id ? { ...b, popping: true } : b))
      );
      setPopped(prev => {
        const next = prev + 1;
        if (next >= BALLOONS_TO_WIN) {
          // Use setTimeout so state settles first
          setTimeout(() => endGame(true, next), 420);
        }
        return next;
      });

      // Remove balloon after pop animation
      setTimeout(() => {
        setBalloons(prev => prev.filter(b => b.id !== id));
      }, 420);
    },
    [endGame]
  );

  const startGame = useCallback(() => {
    balloonIdCounter = 0;
    spawnedRef.current = 0;
    gameEndedRef.current = false;

    setBalloons([]);
    setPopped(0);
    setTimeLeft(GAME_DURATION);
    setWin(false);
    setPhase('playing');
  }, []);

  // Spawn balloons
  useEffect(() => {
    if (phase !== 'playing') return;

    const spawnNext = () => {
      if (spawnedRef.current >= TOTAL_BALLOONS) {
        clearInterval(spawnTimerRef.current);
        return;
      }
      const count = Math.min(SPAWN_BATCH, TOTAL_BALLOONS - spawnedRef.current);
      const batch = Array.from({ length: count }, generateBalloon);
      setBalloons(prev => [...prev, ...batch]);
      spawnedRef.current += count;
    };

    // Spawn first balloon immediately
    spawnNext();

    spawnTimerRef.current = setInterval(spawnNext, SPAWN_INTERVAL * 1000);

    return () => clearInterval(spawnTimerRef.current);
  }, [phase]);

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') return;

    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          // Read current popped via ref trick — check via state updater
          setPopped(currentPopped => {
            if (!gameEndedRef.current) {
              const didWin = currentPopped >= BALLOONS_TO_WIN;
              endGame(didWin, currentPopped);
            }
            return currentPopped;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current);
  }, [phase, endGame]);

  // Remove balloons that have floated past the top
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      setBalloons(prev =>
        prev.filter(b => {
          // We can't easily track per-balloon elapsed time here without complex state.
          // Instead, rely on the animation ending and the balloon auto-removing.
          return true;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 420,
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, #1a0030 0%, #2d0050 30%, #4a0080 60%, #6b00b3 100%)',
        borderRadius: 'inherit',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Keyframe styles */}
      <style>{KEYFRAMES_CSS}</style>

      {/* Background stars */}
      <BackgroundStars />

      {/* Balloons */}
      {phase === 'playing' &&
        balloons.map(b => (
          <Balloon key={b.id} balloon={b} onPop={handlePop} />
        ))}

      {/* HUD */}
      {phase === 'playing' && (
        <ScoreBar popped={popped} timeLeft={timeLeft} target={BALLOONS_TO_WIN} />
      )}

      {/* Screens */}
      {phase === 'idle' && <StartScreen onStart={startGame} target={BALLOONS_TO_WIN} time={GAME_DURATION} />}
      {phase === 'ended' && (
        <EndScreen win={win} popped={popped} onRestart={startGame} target={BALLOONS_TO_WIN} />
      )}
    </div>
  );
}

function BackgroundStars() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#fff',
            animation: `shimmer ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
