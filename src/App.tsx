/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { lofiPlayer } from './utils/lofiAudio';

interface Puzzle {
  question: string;
  options: string[];
  correctIndex: number;
  hintWrong: string;
  hintRight: string;
}

const PUZZLES: Puzzle[] = [
  {
    question: 'Akshara kisi ko compliment kaise deti hai?',
    options: [
      'Seedha bol deti hai, bina lag lapet ke',
      'Taane maar ke, par matlab genuine hota hai',
      'Bilkul nahi deti, actions se dikhati hai',
      'Sirf close logo ko hi deti hai',
    ],
    correctIndex: 1,
    hintWrong: 'Nahi... thoda aur socho 🤔',
    hintRight: 'Bilkul sahi! ✨',
  },
  {
    question: 'Jab Akshara gussa hoti hai, sabse pehle kya karti hai?',
    options: [
      'Silent treatment de deti hai',
      'Seedha sunaa deti hai',
      'Sarcastic taane maarti hai',
      'Ignore kar deti hai',
    ],
    correctIndex: 2,
    hintWrong: 'Nahi yaar, aur socho 😏',
    hintRight: 'Bilkul sahi pakda! 🎯',
  },
  {
    question: 'Akshara ka favourite singer kaun hai?',
    options: ['Karan Aujla', 'Divine', 'Krsna', 'Cheema/Gur Sidhu'],
    correctIndex: 3,
    hintWrong: 'Nahi yaar, aur socho 🎧',
    hintRight: 'Ekdum sahi! 🎶',
  },
  {
    question:
      'Jab usne 77 lakh ke plot ki amiri dikhayi thi, toh bhai ne sabse pehle kya reaction diya tha?',
    options: [
      '💸 Legal team bula ke property papers verify karwane laga tha',
      '🥱 Bola ki ab itna rich hone ke baad baat karne ka koi fayda nahi',
      '🥂 Amir banne ki khushi mein chupchap sone ka bol diya tha',
      '😎 Apni empire build karne ki baat karke side ho gaya tha',
    ],
    correctIndex: 0,
    hintWrong: 'Arre nahi, wahi wala nahi tha 😂',
    hintRight: 'Hahaha bilkul sahi pakda! 💸',
  },
];

const ROAST_CARDS = [
  {
    front: 'Tu duniya ki sabse zyada attitude wali insaan hai',
    back: 'Isiliye tu kisi ke fake pyaar mein kabhi nahi aati',
  },
  {
    front: 'Teri sarcasm kisi hathiyar se kam nahi',
    back: 'Par usi sarcasm ne mujhe sabse zyada hasaya hai',
  },
  {
    front: 'Tu kisi ki bakwaas 2 second bhi bardaasht nahi karti',
    back: 'Isiliye jab tu kisi ko sunti hai, pata chalta hai wo genuine hai',
  },
  {
    front: 'Teri taang kheenchne ki fitrat legendary hai',
    back: 'Par jab zarurat padi, sabse pehle khadi bhi tu hoti hai',
  },
  {
    front: 'Random topics pe behas start karna teri favorite hobby hai',
    back: 'Aur unhe funny note pe khatam karna tera superpower hai',
  },
  {
    front: 'Night drives pe tera vibe kuch alag hi level ka hota hai',
    back: 'Kyunki tab tu sabse zyada real aur unfiltered hoti hai — wahi version best hai',
  },
];

const LETTER_TEXT = `Akshara,

From the day we became friends, life just got a little brighter, a little louder, and a lot more fun. I built this whole little mystery for one simple reason — to see that smile of yours, because honestly, you deserve every reason to smile.

You're not just a friend, you're the kind of person people wish they had in their corner. Thank you for always showing up, for the laughs, the late-night talks, and for being exactly who you are.

This one's for you, Akshara. Just for you. ✨

Your friend, always,
Aman`;

export default function App() {
  const [currentScene, setCurrentScene] = useState<
    'intro' | 'cluelist' | 'puzzle1' | 'puzzle2' | 'puzzle3' | 'puzzle4' | 'final'
  >('intro');
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<{
    [puzzleNum: number]: { index: number; correct: boolean };
  }>({});
  const [hints, setHints] = useState<{ [puzzleNum: number]: string }>({});

  // Final scene states
  const [isBoxOpened, setIsBoxOpened] = useState<boolean>(false);
  const [prankStage, setPrankStage] = useState<'loading' | 'wrong' | 'fixed'>(
    'loading'
  );
  const [isPrankShaking, setIsPrankShaking] = useState<boolean>(false);
  const [flippedCards, setFlippedCards] = useState<{ [index: number]: boolean }>(
    {}
  );
  const [constellationDrawn, setConstellationDrawn] = useState<boolean>(false);
  const [litStars, setLitStars] = useState<{ [index: number]: boolean }>({});
  const [typedLetter, setTypedLetter] = useState<string>('');
  const [thankYouClicked, setThankYouClicked] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  // Teardown audio on unmount
  useEffect(() => {
    return () => {
      lofiPlayer.stop();
    };
  }, []);

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

  const startTypewriter = () => {
    let index = 0;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    typingTimerRef.current = window.setInterval(() => {
      index++;
      setTypedLetter(LETTER_TEXT.slice(0, index));
      if (index >= LETTER_TEXT.length && typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    }, 16);
  };

  const handleStartPuzzles = () => {
    setProgressIndex(0);
    setCurrentScene('cluelist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartFromClueList = () => {
    setProgressIndex(1);
    setCurrentScene('puzzle1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOptionClick = (puzzleNum: 1 | 2 | 3 | 4, optionIndex: number) => {
    const puzzle = PUZZLES[puzzleNum - 1];
    const isCorrect = optionIndex === puzzle.correctIndex;

    setSelectedOption((prev) => ({
      ...prev,
      [puzzleNum]: { index: optionIndex, correct: isCorrect },
    }));

    if (isCorrect) {
      setHints((prev) => ({ ...prev, [puzzleNum]: puzzle.hintRight }));
      setTimeout(() => {
        if (puzzleNum < PUZZLES.length) {
          const nextPuzzleNum = (puzzleNum + 1) as 2 | 3 | 4;
          setProgressIndex(nextPuzzleNum);
          setCurrentScene(`puzzle${nextPuzzleNum}` as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setProgressIndex(5);
          setCurrentScene('final');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            setIsBoxOpened(true);
            lofiPlayer.play();
            launchConfetti();
            startFloatingHearts();
            setConstellationDrawn(true);
            const letters = ['A', 'K', 'S', 'H', 'A', 'R', 'A'];
            letters.forEach((_, idx) => {
              setTimeout(() => {
                setLitStars((prev) => ({ ...prev, [idx]: true }));
              }, 250 * idx + 200);
            });
            setTimeout(() => {
              setIsPrankShaking(true);
              setPrankStage('wrong');
            }, 1600);
            setTimeout(() => {
              startTypewriter();
            }, 1200);
          }, 400);
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

  const toggleAudioMute = () => {
    const muted = lofiPlayer.toggleMute();
    setIsAudioMuted(muted);
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

      {/* Progress Constellation (5 dots, 4 lines) */}
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
        <div className={`p-dot ${progressIndex >= 3 ? 'done' : ''}`} data-dot="3"></div>
        <div className={`p-line ${progressIndex >= 4 ? 'done' : ''}`} data-line="3">
          <i></i>
        </div>
        <div className={`p-dot ${progressIndex >= 5 ? 'done' : ''}`} data-dot="4"></div>
      </div>

      <main>
        {/* SCENE 0 : INTRO */}
        {currentScene === 'intro' && (
          <section
            className="scene active"
            id="scene-intro"
            style={{ position: 'relative' }}
          >
            <div className="top-corner-icons">
              <div className="icon-circle">💗</div>
              <div className="icon-circle">✨</div>
            </div>
            <div className="script-lead">A little something for</div>
            <div className="name-hero">Akshara ♥</div>
            <div className="name-underline"></div>
            <p className="lede" style={{ marginBottom: '6px' }}>
              Kuch cheezein lafzon se nahi,
              <br />
              feel karke samajhni padti hain…
            </p>
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
            <div className="msg-card">
              <p style={{ margin: 0 }}>
                Ek chhota sa mystery box hai…
                <br />
                <span className="accent">Sirf tumhare liye.</span>
              </p>
            </div>
            <button className="btn unlock-btn" onClick={handleStartPuzzles}>
              🔒 Mystery Unlock Karo →
            </button>
            <div className="dot-divider">♥</div>
            <p className="ready-text">Ready for some fun? 😏</p>
          </section>
        )}

        {/* SCENE 0.5 : CLUE LIST */}
        {currentScene === 'cluelist' && (
          <section className="scene active" id="scene-cluelist">
            <div className="clue-header">
              <h1 className="display">Wahh! Tumne box khol diya ✨</h1>
              <p>
                Par asli surprise tak pahunchne ke liye,
                <br />
                <span className="accent">4 clues</span> dhoondne honge.
              </p>
            </div>
            <div className="clue-list">
              <div className="clue-row">
                <div className="clue-num">01</div>
                <div className="clue-icon">🧩</div>
                <div className="clue-text">
                  Hum dost kaise bane —<br />
                  <span className="sub">yaadon ka pehla panna.</span>
                </div>
                <div className="clue-arrow">›</div>
              </div>
              <div className="clue-row">
                <div className="clue-num">02</div>
                <div className="clue-icon">🌙</div>
                <div className="clue-text">
                  Raat 2 baje ka mood —<br />
                  <span className="sub">thoda sa raaz hai isme.</span>
                </div>
                <div className="clue-arrow">›</div>
              </div>
              <div className="clue-row">
                <div className="clue-num">03</div>
                <div className="clue-icon">🎧</div>
                <div className="clue-text">
                  Kaano mein basne wala naam —<br />
                  <span className="sub">tumhare favourite ka pata.</span>
                </div>
                <div className="clue-arrow">›</div>
              </div>
              <div className="clue-row">
                <div className="clue-num">04</div>
                <div className="clue-icon">💸</div>
                <div className="clue-text">
                  Ek chhota sa kissa —<br />
                  <span className="sub">jo hamesha yaad rahega.</span>
                </div>
                <div className="clue-arrow">›</div>
              </div>
            </div>
            <button
              className="btn"
              style={{ width: '100%' }}
              onClick={handleStartFromClueList}
            >
              Clues Solve Karte Hain →
            </button>
          </section>
        )}

        {/* SCENE 1 : PUZZLE 1 */}
        {currentScene === 'puzzle1' && (
          <section className="scene active" id="scene-puzzle1">
            <div className="eyebrow">Clue 01 / 04</div>
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
            <div className="eyebrow">Clue 02 / 04</div>
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

        {/* SCENE 3 : PUZZLE 3 */}
        {currentScene === 'puzzle3' && (
          <section className="scene active" id="scene-puzzle3">
            <div className="eyebrow">Clue 03 / 04</div>
            <div className="card">
              <h2 className="display" style={{ fontSize: '1.4rem' }} id="p3-question">
                {PUZZLES[2].question}
              </h2>
              <div className="options" id="p3-options">
                {PUZZLES[2].options.map((opt, i) => {
                  const isSelected = selectedOption[3]?.index === i;
                  const isCorrect = selectedOption[3]?.correct;
                  return (
                    <button
                      key={i}
                      className={`opt ${
                        isSelected ? (isCorrect ? 'correct' : 'wrong') : ''
                      }`}
                      onClick={() => handleOptionClick(3, i)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div
                className="hint"
                id="p3-hint"
                style={{
                  color: selectedOption[3]?.correct ? '#8ffcb0' : 'var(--gold)',
                }}
              >
                {hints[3]}
              </div>
            </div>
          </section>
        )}

        {/* SCENE 4 : PUZZLE 4 */}
        {currentScene === 'puzzle4' && (
          <section className="scene active" id="scene-puzzle4">
            <div className="eyebrow">Clue 04 / 04</div>
            <div className="card">
              <h2 className="display" style={{ fontSize: '1.4rem' }} id="p4-question">
                {PUZZLES[3].question}
              </h2>
              <div className="options" id="p4-options">
                {PUZZLES[3].options.map((opt, i) => {
                  const isSelected = selectedOption[4]?.index === i;
                  const isCorrect = selectedOption[4]?.correct;
                  return (
                    <button
                      key={i}
                      className={`opt ${
                        isSelected ? (isCorrect ? 'correct' : 'wrong') : ''
                      }`}
                      onClick={() => handleOptionClick(4, i)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div
                className="hint"
                id="p4-hint"
                style={{
                  color: selectedOption[4]?.correct ? '#8ffcb0' : 'var(--gold)',
                }}
              >
                {hints[4]}
              </div>
            </div>
          </section>
        )}

        {/* SCENE 5 : FINAL REVEAL */}
        {currentScene === 'final' && (
          <section
            className={`scene active ${isBoxOpened ? 'opened' : ''}`}
            id="scene-final"
          >
            <div className="surprise-header">
              <div className="eyebrow">You did it, Akshara 🎉</div>
              <div className="script-lead">Yeh lo… tumhara</div>
              <div className="big-word">SURPRISE! ♥</div>
              <div
                className="lofi-audio-pill"
                onClick={toggleAudioMute}
                title="Toggle soft background lo-fi music"
                role="button"
                tabIndex={0}
              >
                <span>{isAudioMuted ? '🔇' : '🎵'}</span>
                <span>{isAudioMuted ? 'Lo-Fi: Muted' : 'Lo-Fi Track: Playing'}</span>
                <div className="lofi-equalizer" aria-hidden="true">
                  <span className={`lofi-bar ${isAudioMuted ? 'muted' : ''}`}></span>
                  <span className={`lofi-bar ${isAudioMuted ? 'muted' : ''}`}></span>
                  <span className={`lofi-bar ${isAudioMuted ? 'muted' : ''}`}></span>
                  <span className={`lofi-bar ${isAudioMuted ? 'muted' : ''}`}></span>
                </div>
              </div>
            </div>

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

            {/* AKSHARA Name Constellation */}
            <div className="constellation-wrap">
              <div className="constellation-label">
                Sitaron ne mil kar ek naam banaya...
              </div>
              <div
                className={`constellation-track ${
                  constellationDrawn ? 'drawn' : ''
                }`}
                id="constellationTrack"
              >
                {['A', 'K', 'S', 'H', 'A', 'R', 'A'].map((letter, idx) => (
                  <span
                    key={idx}
                    className={`name-star ${litStars[idx] ? 'lit' : ''}`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>

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
              {/* EDIT HERE: FINAL LETTER — typewriter effect */}
              <div className="letter" id="letterText">
                {typedLetter || LETTER_TEXT}
              </div>
            </div>

            {/* Final Polaroid */}
            <div className="final-polaroid">
              <div className="ph-inner">🎁</div>
              <span className="caption">Hope you like it! 🤍</span>
            </div>

            {/* Closing Card */}
            <div className="closing-card">
              <div className="heart-icon">💗</div>
              <p>
                Bas itna hi…{' '}
                <span className="accent">zyada emotional hone ki zarurat nahi hai</span>{' '}
                😅
                <br />
                Enjoy your surprise! ✨
              </p>
            </div>

            {/* Thank You CTA Button */}
            <button
              className="btn"
              style={{ width: '100%' }}
              disabled={thankYouClicked}
              onClick={() => setThankYouClicked(true)}
            >
              {thankYouClicked ? 'Yayy! 🥹💜' : 'Yay! Thank You 🥹'}
            </button>

            <footer className="note">Made with 💜 just for you</footer>
          </section>
        )}
      </main>
    </>
  );
}
