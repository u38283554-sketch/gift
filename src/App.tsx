/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

interface Puzzle {
  question: string;
  options: string[];
  correctIndex: number;
  hintWrong: string;
  hintRight: string;
}

const PUZZLES: Puzzle[] = [
  {
    question: "Hum dono pehli baar kaise dost bane the?",
    options: [
      "School/College mein saath baithne se",
      "Common friend ke through",
      "Social media par",
      "Kisi party mein",
    ],
    correctIndex: 2,
    hintWrong: "Nahi... thoda aur socho 🤔",
    hintRight: "Bilkul sahi! ✨",
  },
  {
    question: "Raat 2 baje Akshara sabse zyada kya karna pasand karegi?",
    options: [
      "Long drive pe nikal jana",
      "Random topic pe bahes chhedna",
      "Ghanto bina filter ke baatein karna",
      "Sabko ignore karke so jana",
    ],
    correctIndex: 3,
    hintWrong: "Kuch aur try karo 😉",
    hintRight: "Yehi toh magic hai humari dosti ka! 🌟",
  },
];

const ROAST_CARDS = [
  {
    front: "Tu duniya ki sabse zyada attitude wali insaan hai",
    back: "Isiliye tu kisi ke fake pyaar mein kabhi nahi aati",
  },
  {
    front: "Teri sarcasm kisi hathiyar se kam nahi",
    back: "Par usi sarcasm ne mujhe sabse zyada hasaya hai",
  },
  {
    front: "Tu kisi ki bakwaas 2 second bhi bardaasht nahi karti",
    back: "Isiliye jab tu kisi ko sunti hai, pata chalta hai wo genuine hai",
  },
  {
    front: "Teri taang kheenchne ki fitrat legendary hai",
    back: "Par jab zarurat padi, sabse pehle khadi bhi tu hoti hai",
  },
  {
    front: "Random topics pe behas start karna teri favorite hobby hai",
    back: "Aur unhe funny note pe khatam karna tera superpower hai",
  },
  {
    front: "Night drives pe tera vibe kuch alag hi level ka hota hai",
    back: "Kyunki tab tu sabse zyada real aur unfiltered hoti hai — wahi version best hai",
  },
];

const STAR_POSITIONS = [
  { x: '10%', y: '20%' },
  { x: '70%', y: '15%' },
  { x: '40%', y: '55%' },
  { x: '85%', y: '65%' },
  { x: '20%', y: '75%' },
  { x: '55%', y: '25%' },
];

export default function App() {
  const [currentScene, setCurrentScene] = useState<
    'intro' | 'puzzle1' | 'puzzle2' | 'puzzle3' | 'final'
  >('intro');
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<{
    [puzzleNum: number]: { index: number; correct: boolean };
  }>({});
  const [hints, setHints] = useState<{ [puzzleNum: number]: string }>({});

  // Star game state
  const [correctStarIndex, setCorrectStarIndex] = useState<number>(0);
  const [hitStars, setHitStars] = useState<number[]>([]);
  const [starHint, setStarHint] = useState<{ text: string; isCorrect: boolean }>({
    text: '',
    isCorrect: false,
  });

  // Final scene states
  const [isBoxOpened, setIsBoxOpened] = useState<boolean>(false);
  const [prankStage, setPrankStage] = useState<'loading' | 'wrong' | 'fixed'>(
    'loading'
  );
  const [isPrankShaking, setIsPrankShaking] = useState<boolean>(false);
  const [flippedCards, setFlippedCards] = useState<{ [index: number]: boolean }>(
    {}
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background starfield effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let stars: Array<{
      x: number;
      y: number;
      r: number;
      a: number;
      speed: number;
    }> = [];

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    function resize() {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.floor((w * h) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.015 + 0.003,
      }));
    }

    window.addEventListener('resize', resize);
    resize();

    let mx = 0;
    let my = 0;
    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX - w / 2) / w;
      my = (e.clientY - h / 2) / h;
    };
    window.addEventListener('mousemove', onMouseMove);

    let animationFrameId: number;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.a += s.speed;
        const tw = (Math.sin(s.a) + 1) / 2;
        ctx.beginPath();
        const px = s.x + mx * 10;
        const py = s.y + my * 10;
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.25 + tw * 0.6})`;
        ctx.fill();
      });
      if (!reduceMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const launchConfetti = () => {
    const colors = ['#ff5fa2', '#a855f7', '#ffd166', '#f8ecff'];
    for (let i = 0; i < 70; i++) {
      setTimeout(() => {
        const c = document.createElement('div');
        c.className = 'confetti';
        const size = 6 + Math.random() * 6;
        c.style.width = size + 'px';
        c.style.height = size * 0.4 + 'px';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDuration = 2.5 + Math.random() * 2 + 's';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 5000);
      }, i * 30);
    }
  };

  const startFloatingHearts = () => {
    const items = ['💗', '✨', '💜', '🌸', '⭐'];
    const interval = setInterval(() => {
      const h = document.createElement('div');
      h.className = 'float-heart';
      h.textContent = items[Math.floor(Math.random() * items.length)];
      h.style.left = Math.random() * 100 + 'vw';
      h.style.fontSize = 14 + Math.random() * 14 + 'px';
      h.style.setProperty('--drift', Math.random() * 80 - 40 + 'px');
      h.style.animationDuration = 6 + Math.random() * 4 + 's';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 11000);
    }, 550);
    return interval;
  };

  const handleStartPuzzles = () => {
    setProgressIndex(1);
    setCurrentScene('puzzle1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOptionClick = (puzzleNum: 1 | 2, optionIndex: number) => {
    const puzzle = PUZZLES[puzzleNum - 1];
    const isCorrect = optionIndex === puzzle.correctIndex;

    setSelectedOption((prev) => ({
      ...prev,
      [puzzleNum]: { index: optionIndex, correct: isCorrect },
    }));

    if (isCorrect) {
      setHints((prev) => ({ ...prev, [puzzleNum]: puzzle.hintRight }));
      setTimeout(() => {
        if (puzzleNum === 1) {
          setProgressIndex(2);
          setCurrentScene('puzzle2');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setProgressIndex(3);
          // init star game
          setCorrectStarIndex(
            Math.floor(Math.random() * STAR_POSITIONS.length)
          );
          setHitStars([]);
          setStarHint({ text: '', isCorrect: false });
          setCurrentScene('puzzle3');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 900);
    } else {
      setHints((prev) => ({ ...prev, [puzzleNum]: puzzle.hintWrong }));
      setTimeout(() => {
        setSelectedOption((prev) => {
          const next = { ...prev };
          delete next[puzzleNum];
          return next;
        });
      }, 700);
    }
  };

  const handleStarClick = (index: number) => {
    if (hitStars.includes(index)) return;

    if (index === correctStarIndex) {
      setStarHint({
        text: 'Yehi hai woh sitara! Raaz khul raha hai... 💫',
        isCorrect: true,
      });
      setHitStars(STAR_POSITIONS.map((_, i) => i));
      setProgressIndex(4);

      setTimeout(() => {
        setCurrentScene('final');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Trigger box opening + prank + hearts
        setTimeout(() => {
          setIsBoxOpened(true);
          launchConfetti();
          startFloatingHearts();
          // Stage 2: "wrong Akshara" prank reveal after 1.6s
          setTimeout(() => {
            setIsPrankShaking(true);
            setPrankStage('wrong');
          }, 1600);
        }, 400);
      }, 1100);
    } else {
      setHitStars((prev) => [...prev, index]);
      setStarHint({
        text: 'Ye wala nahi... aur dhoondo ✨',
        isCorrect: false,
      });
    }
  };

  const handleFixSystem = () => {
    setPrankStage('fixed');
    setIsPrankShaking(false);
    launchConfetti();
  };

  const toggleCardFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <canvas id="stars-canvas" ref={canvasRef}></canvas>

      {/* Progress Constellation */}
      <div id="progress" aria-hidden="true">
        <div className={`p-dot ${progressIndex >= 0 ? 'done' : ''}`} data-dot="0"></div>
        <div className={`p-line ${progressIndex >= 1 ? 'done' : ''}`} data-line="0">
          <i></i>
        </div>
        <div className={`p-dot ${progressIndex >= 1 ? 'done' : ''}`} data-dot="1"></div>
        <div className={`p-line ${progressIndex >= 2 ? 'done' : ''}`} data-line="1">
          <i></i>
        </div>
        <div className={`p-dot ${progressIndex >= 2 ? 'done' : ''}`} data-dot="2"></div>
        <div className={`p-line ${progressIndex >= 3 ? 'done' : ''}`} data-line="2">
          <i></i>
        </div>
        <div className={`p-dot ${progressIndex >= 4 ? 'done' : ''}`} data-dot="3"></div>
      </div>

      <main>
        {/* SCENE 0 : INTRO */}
        {currentScene === 'intro' && (
          <section className="scene active" id="scene-intro">
            <div className="eyebrow">Ek raaz hai tumhare liye</div>
            <div className="box-stage">
              <div className="box3d" id="introBox" onClick={handleStartPuzzles}>
                <div className="face front">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face back">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face right">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face left">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face top">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face bottom">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
              </div>
            </div>
            <h1 className="display" style={{ fontSize: '2rem' }}>
              Akshara, ek raaz hai tumhare liye…
            </h1>
            <p className="lede">
              Is mystery ko suljhao, teen chhote clues paar karo, aur ek surprise
              tumhara intezaar kar raha hai. Taiyaar ho?
            </p>
            <button className="btn" onClick={handleStartPuzzles}>
              Raaz Suljhao →
            </button>
          </section>
        )}

        {/* SCENE 1 : PUZZLE 1 */}
        {currentScene === 'puzzle1' && (
          <section className="scene active" id="scene-puzzle1">
            <div className="eyebrow">Clue 01 / 03</div>
            <div className="card">
              <h2 className="display" style={{ fontSize: '1.4rem' }} id="p1-question">
                {PUZZLES[0].question}
              </h2>
              <div className="options" id="p1-options">
                {PUZZLES[0].options.map((opt, i) => {
                  const isSelected = selectedOption[1]?.index === i;
                  const isCorrect = selectedOption[1]?.correct;
                  return (
                    <button
                      key={i}
                      className={`opt ${
                        isSelected ? (isCorrect ? 'correct' : 'wrong') : ''
                      }`}
                      onClick={() => handleOptionClick(1, i)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div
                className="hint"
                id="p1-hint"
                style={{
                  color: selectedOption[1]?.correct ? '#8ffcb0' : 'var(--gold)',
                }}
              >
                {hints[1]}
              </div>
            </div>
          </section>
        )}

        {/* SCENE 2 : PUZZLE 2 */}
        {currentScene === 'puzzle2' && (
          <section className="scene active" id="scene-puzzle2">
            <div className="eyebrow">Clue 02 / 03</div>
            <div className="card">
              <h2 className="display" style={{ fontSize: '1.4rem' }} id="p2-question">
                {PUZZLES[1].question}
              </h2>
              <div className="options" id="p2-options">
                {PUZZLES[1].options.map((opt, i) => {
                  const isSelected = selectedOption[2]?.index === i;
                  const isCorrect = selectedOption[2]?.correct;
                  return (
                    <button
                      key={i}
                      className={`opt ${
                        isSelected ? (isCorrect ? 'correct' : 'wrong') : ''
                      }`}
                      onClick={() => handleOptionClick(2, i)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div
                className="hint"
                id="p2-hint"
                style={{
                  color: selectedOption[2]?.correct ? '#8ffcb0' : 'var(--gold)',
                }}
              >
                {hints[2]}
              </div>
            </div>
          </section>
        )}

        {/* SCENE 3 : PUZZLE 3 (star tap game) */}
        {currentScene === 'puzzle3' && (
          <section className="scene active" id="scene-puzzle3">
            <div className="eyebrow">Clue 03 / 03</div>
            <div className="card">
              <h2 className="display" style={{ fontSize: '1.4rem' }}>
                Sahi sitare chuno ✨
              </h2>
              <p className="lede" style={{ marginBottom: 0 }}>
                In sitaron mein sirf ek hai jo humari dosti ka असली रंग batata
                hai. Sahi wala dhoondo.
              </p>
              <div className="star-field" id="starField">
                {STAR_POSITIONS.map((pos, i) => (
                  <div
                    key={i}
                    className={`star-target ${
                      hitStars.includes(i) ? 'hit' : ''
                    }`}
                    style={{ left: pos.x, top: pos.y }}
                    onClick={() => handleStarClick(i)}
                  >
                    ✨
                  </div>
                ))}
              </div>
              <div
                className="hint"
                id="p3-hint"
                style={{
                  color: starHint.isCorrect ? '#8ffcb0' : 'var(--gold)',
                }}
              >
                {starHint.text}
              </div>
            </div>
          </section>
        )}

        {/* SCENE 4 : FINAL REVEAL */}
        {currentScene === 'final' && (
          <section
            className={`scene active ${isBoxOpened ? 'opened' : ''}`}
            id="scene-final"
          >
            <div className="eyebrow">Mubarak ho, Akshara 🎉</div>
            <div className="box-stage" style={{ marginBottom: '10px' }}>
              <div className="burst"></div>
              <div className="box3d">
                <div className="face front">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face back">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face right">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face left">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face top">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
                <div className="face bottom">
                  <div className="ribbon-v"></div>
                  <div className="ribbon-h"></div>
                </div>
              </div>
            </div>

            <h1 className="display" style={{ fontSize: '2rem' }}>
              Tumne raaz suljha liya! 💜
            </h1>

            {/* Cute Cat Mascot */}
            <div className="cat-wrap">
              <div className="cat-emoji">🐱</div>
              <div className="cat-bubble">yayy tumne kar diya! 🐾</div>
            </div>

            {/* PRANK: "Galat Akshara" gag */}
            <div
              className={`card prank-card ${isPrankShaking ? 'prank-shake' : ''}`}
              id="prankCard"
            >
              <div id="prankStage1">
                {prankStage === 'loading' && (
                  <>
                    <div className="prank-spinner">🔄</div>
                    <p className="lede" style={{ margin: '10px 0 0' }}>
                      Loading Akshara ka surprise...
                    </p>
                  </>
                )}

                {prankStage === 'wrong' && (
                  <>
                    <div className="prank-avatar">🤦‍♀️</div>
                    <div className="prank-name">
                      AKSHARA VERMA · Class 9-B · Kota
                    </div>
                    <div className="prank-msg">
                      Ruko ruko... system ne galat Akshara load kar di! 😳
                      <br />
                      Ye toh koi aur nikli!
                    </div>
                    <button
                      className="btn"
                      id="fixSystemBtn"
                      style={{ fontSize: '0.75rem', padding: '11px 22px' }}
                      onClick={handleFixSystem}
                    >
                      System Theek Karo 🔧
                    </button>
                  </>
                )}

                {prankStage === 'fixed' && (
                  <>
                    <div className="prank-avatar">💜</div>
                    <div className="prank-name">SYSTEM FIXED ✓</div>
                    <div className="prank-msg">
                      Just kidding! 😂
                      <br />
                      Bas tujhe pakane ka mann tha, Akshara.
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ROAST & REAL TALK flip cards */}
            <div className="roast-section">
              <h2 className="display roast-title">Kuch Taane, Kuch Sach 😏</h2>
              <div className="roast-sub-wrap">
                <span className="roast-sub">Tap karo palatne ke liye</span>
              </div>
              <div className="roast-grid" id="roastGrid">
                {ROAST_CARDS.map((card, i) => (
                  <div
                    key={i}
                    className={`flip-card ${flippedCards[i] ? 'flipped' : ''}`}
                    onClick={() => toggleCardFlip(i)}
                  >
                    <div className="flip-inner">
                      <div className="flip-face flip-front">{card.front}</div>
                      <div className="flip-face flip-back">{card.back}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ textAlign: 'left' }}>
              {/* EDIT HERE: FINAL LETTER — apna message yahan likho */}
              <div className="letter">
                Akshara,
                {'\n\n'}
                From the day we became friends, life just got a little brighter,
                a little louder, and a lot more fun. I built this whole little
                mystery for one simple reason — to see that smile of yours,
                because honestly, you deserve every reason to smile.
                {'\n\n'}
                You're not just a friend, you're the kind of person people wish
                they had in their corner. Thank you for always showing up, for
                the laughs, the late-night talks, and for being exactly who you
                are.
                {'\n\n'}
                This one's for you, Akshara. Just for you. ✨
                {'\n\n'}
                Your friend, always,
                {'\n'}
                Aman
              </div>
            </div>

            <footer className="note">Made with 💜 just for you</footer>
          </section>
        )}
      </main>
    </>
  );
}
