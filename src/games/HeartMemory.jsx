import { useState, useEffect, useCallback, useRef } from "react";

const SYMBOLS = ["💕", "💖", "💗", "💝", "🌹", "💌", "😻", "🌸"];

function createDeck() {
  const deck = [...SYMBOLS, ...SYMBOLS].map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const TOTAL_TIME = 90;
const TOTAL_PAIRS = 8;

function createDeckN(pairs) {
  const syms = SYMBOLS.slice(0, pairs)
  const deck = [...syms, ...syms].map((symbol, index) => ({ id: index, symbol, isFlipped: false, isMatched: false }))
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]] }
  return deck
}

export default function HeartMemory({ onWin, onLose, config = {} }) {
  const PAIRS = config.pairs ?? TOTAL_PAIRS;
  const GAME_TIME = config.time ?? TOTAL_TIME;
  const FLIP_DELAY = config.flipDelay ?? 800;

  const [cards, setCards] = useState(() => createDeckN(PAIRS));
  const [flipped, setFlipped] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongFlips, setWrongFlips] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null); // "win" | "lose"
  const [isChecking, setIsChecking] = useState(false);
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          setGameOver(true);
          setGameResult("lose");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [gameOver, stopTimer]);

  useEffect(() => {
    if (gameResult === "lose") {
      const t = setTimeout(() => onLose && onLose({ score: matchedCount, total: PAIRS, unit: 'cặp' }), 1500);
      return () => clearTimeout(t);
    }
    if (gameResult === "win") {
      const t = setTimeout(() => onWin && onWin(), 1500);
      return () => clearTimeout(t);
    }
  }, [gameResult, onWin, onLose]);

  const handleCardClick = useCallback(
    (clickedId) => {
      if (gameOver || isChecking) return;

      setCards((prev) => {
        const card = prev.find((c) => c.id === clickedId);
        if (!card || card.isFlipped || card.isMatched) return prev;
        return prev.map((c) =>
          c.id === clickedId ? { ...c, isFlipped: true } : c
        );
      });

      setFlipped((prevFlipped) => {
        const card = cards.find((c) => c.id === clickedId);
        if (!card || card.isFlipped || card.isMatched) return prevFlipped;
        if (prevFlipped.length === 1 && prevFlipped[0] === clickedId)
          return prevFlipped;

        const newFlipped = [...prevFlipped, clickedId];

        if (newFlipped.length === 2) {
          setIsChecking(true);
          const [firstId, secondId] = newFlipped;
          const firstCard = cards.find((c) => c.id === firstId);
          const secondCard = card;

          if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
            // Match
            setTimeout(() => {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === firstId || c.id === secondId
                    ? { ...c, isMatched: true }
                    : c
                )
              );
              setMatchedCount((prev) => {
                const next = prev + 1;
                if (next === PAIRS) {
                  stopTimer();
                  setGameOver(true);
                  setGameResult("win");
                }
                return next;
              });
              setFlipped([]);
              setIsChecking(false);
            }, 400);
          } else {
            // No match
            setWrongFlips((prev) => prev + 1);
            setTimeout(() => {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === firstId || c.id === secondId
                    ? { ...c, isFlipped: false }
                    : c
                )
              );
              setFlipped([]);
              setIsChecking(false);
            }, FLIP_DELAY);
          }
          return newFlipped;
        }

        return newFlipped;
      });
    },
    [gameOver, isChecking, cards, stopTimer]
  );

  const handleRestart = () => {
    stopTimer();
    setCards(createDeckN(PAIRS));
    setFlipped([]);
    setMatchedCount(0);
    setWrongFlips(0);
    setTimeLeft(GAME_TIME);
    setGameOver(false);
    setGameResult(null);
    setIsChecking(false);
  };

  const timerPercent = (timeLeft / GAME_TIME) * 100;
  const timerColor =
    timeLeft > 30 ? "#ec4899" : timeLeft > 10 ? "#f97316" : "#ef4444";

  return (
    <>
      <style>{`
        .hm-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          padding: 24px 16px;
          font-family: 'Segoe UI', sans-serif;
          user-select: none;
        }

        .hm-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #ec4899;
          text-shadow: 0 0 16px #f9a8d4aa;
          letter-spacing: 1px;
          margin: 0;
        }

        .hm-stats {
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hm-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .hm-stat-label {
          font-size: 0.68rem;
          color: #f9a8d4;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .hm-stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fce7f3;
        }

        .hm-timer-bar-wrap {
          width: 220px;
          height: 6px;
          background: #3b0764;
          border-radius: 99px;
          overflow: hidden;
        }

        .hm-timer-bar {
          height: 100%;
          border-radius: 99px;
          transition: width 0.9s linear, background-color 0.4s;
        }

        .hm-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          width: min(360px, 92vw);
        }

        .hm-card-wrapper {
          aspect-ratio: 1;
          perspective: 600px;
          cursor: pointer;
        }

        .hm-card-wrapper.matched {
          cursor: default;
        }

        .hm-card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 12px;
        }

        .hm-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .hm-card-face {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .hm-card-back {
          background: linear-gradient(135deg, #1e0533 0%, #2d0a4e 50%, #1a0530 100%);
          border: 1.5px solid #7e22ce44;
          box-shadow: inset 0 0 12px #7c3aed22;
          font-size: 1.3rem;
          letter-spacing: 2px;
          color: #a855f755;
          flex-wrap: wrap;
          overflow: hidden;
        }

        .hm-back-pattern {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          place-items: center;
          font-size: 0.85rem;
          opacity: 0.18;
          pointer-events: none;
        }

        .hm-card-front {
          background: linear-gradient(135deg, #fce7f3 0%, #fdf2f8 60%, #fbcfe8 100%);
          border: 2px solid #f9a8d4;
          transform: rotateY(180deg);
          font-size: 1.9rem;
          flex-direction: column;
          gap: 2px;
        }

        .hm-card-front.matched-glow {
          background: linear-gradient(135deg, #fce7f3 0%, #fff1f9 60%, #fda4af 100%);
          border-color: #ec4899;
          box-shadow:
            0 0 10px #ec489966,
            0 0 24px #f9a8d444,
            inset 0 0 8px #fce7f344;
          animation: hm-pulse 1.6s ease-in-out infinite;
        }

        @keyframes hm-pulse {
          0%, 100% { box-shadow: 0 0 10px #ec489966, 0 0 24px #f9a8d444; }
          50% { box-shadow: 0 0 18px #ec4899aa, 0 0 36px #f9a8d488; }
        }

        .hm-card-wrapper:not(.matched):not(.flipped-active):hover .hm-card-back {
          border-color: #a855f7;
          box-shadow: 0 0 14px #ec489944, inset 0 0 12px #7c3aed22;
        }

        .hm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 0, 20, 0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          animation: hm-fadein 0.4s ease;
        }

        @keyframes hm-fadein {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        .hm-result-box {
          background: linear-gradient(160deg, #1e0533 0%, #2d0a4e 100%);
          border: 2px solid #ec4899;
          border-radius: 24px;
          padding: 40px 48px;
          text-align: center;
          box-shadow: 0 0 40px #ec489966, 0 0 80px #f9a8d422;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          min-width: 260px;
        }

        .hm-result-emoji {
          font-size: 3.2rem;
          animation: hm-bounce 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes hm-bounce {
          0%, 100% { transform: scale(1); }
          40% { transform: scale(1.35); }
          70% { transform: scale(0.9); }
        }

        .hm-result-title {
          font-size: 1.8rem;
          font-weight: 900;
          margin: 0;
        }

        .hm-result-title.win { color: #ec4899; text-shadow: 0 0 20px #f9a8d4; }
        .hm-result-title.lose { color: #f97316; text-shadow: 0 0 20px #fed7aa; }

        .hm-result-sub {
          font-size: 0.95rem;
          color: #f9a8d4;
          margin: 0;
        }

        .hm-btn {
          margin-top: 8px;
          padding: 10px 28px;
          background: linear-gradient(135deg, #ec4899, #be185d);
          color: white;
          border: none;
          border-radius: 99px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 14px #ec489955;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .hm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px #ec489977;
        }

        .hm-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="hm-root">
        <h2 className="hm-title">💖 Heart Memory 💖</h2>

        <div className="hm-stats">
          <div className="hm-stat">
            <span className="hm-stat-label">Matched</span>
            <span className="hm-stat-value">{matchedCount}/{PAIRS}</span>
          </div>
          <div className="hm-stat">
            <span className="hm-stat-label">Wrong flips</span>
            <span className="hm-stat-value">{wrongFlips}</span>
          </div>
          <div className="hm-stat">
            <span className="hm-stat-label">Time</span>
            <span className="hm-stat-value" style={{ color: timerColor }}>
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="hm-timer-bar-wrap">
          <div
            className="hm-timer-bar"
            style={{
              width: `${timerPercent}%`,
              backgroundColor: timerColor,
            }}
          />
        </div>

        <div className="hm-grid">
          {cards.map((card) => {
            const isActive = card.isFlipped || card.isMatched;
            return (
              <div
                key={card.id}
                className={`hm-card-wrapper${card.isMatched ? " matched" : ""}${isActive ? " flipped-active" : ""}`}
                onClick={() => handleCardClick(card.id)}
                role="button"
                aria-label={isActive ? card.symbol : "Hidden card"}
                tabIndex={gameOver || card.isMatched ? -1 : 0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleCardClick(card.id);
                }}
              >
                <div className={`hm-card-inner${isActive ? " flipped" : ""}`}>
                  <div className="hm-card-face hm-card-back">
                    <div className="hm-back-pattern">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <span key={i}>♥</span>
                      ))}
                    </div>
                  </div>
                  <div
                    className={`hm-card-face hm-card-front${card.isMatched ? " matched-glow" : ""}`}
                  >
                    {card.symbol}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {gameOver && (
        <div className="hm-overlay">
          <div className="hm-result-box">
            <div className="hm-result-emoji">
              {gameResult === "win" ? "🎉" : "💔"}
            </div>
            <h3 className={`hm-result-title ${gameResult}`}>
              {gameResult === "win" ? "Thắng Rồi! 🎉" : "Hết Giờ!"}
            </h3>
            <p className="hm-result-sub">
              {gameResult === "win"
                ? `Lật đúng hết ${PAIRS} cặp! Sai ${wrongFlips} lần, còn ${timeLeft}s!`
                : `Bạn lật được ${matchedCount}/${PAIRS} cặp. Cố lên lần sau!`}
            </p>
            <button className="hm-btn" onClick={handleRestart}>
              Chơi Lại
            </button>
          </div>
        </div>
      )}
    </>
  );
}
