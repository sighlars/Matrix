/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Geist_Mono } from "next/font/google";
import MatrixRain from '../components/MatrixRain';
import { useAuth } from '../context/AuthContext';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showEnter, setShowEnter] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<{
    question: string;
    answer: number;
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('normal');
  const [matrixEffects, setMatrixEffects] = useState({
    speed: 1,
    density: 1,
    glitch: false
  });
  const [streak, setStreak] = useState(0);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(true);
  const [powerups, setPowerups] = useState({
    timeFreeze: 3,
    skipQuestion: 2,
    doublePoints: 1
  });
  const [activeEffects, setActiveEffects] = useState({
    doublePoints: false,
    matrixRainbow: false
  });
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const topics = [
    { name: "Addition", available: true },
    { name: "Subtraction", available: true },
    { name: "Multiplication", available: true },
    { name: "Division", available: true },
    { name: "Algebra", available: true },
    { name: "Geometry", available: true },
  ];

  const difficultyMultipliers = {
    easy: 1,
    normal: 2,
    hard: 3
  };

  useEffect(() => {
    // Matrix loading effect
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowEnter(true), 500);
    }, 2000);
  }, []);

  useEffect(() => {
    if (currentTopic && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 0) {
            setLives((lives: number) => lives - 1);
            setTimeLeft(60);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTopic, gameOver]);

  const generateProblem = (topic: string) => {
    const multiplier = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers];
    const num1 = Math.floor(Math.random() * 10 * multiplier) + 1;
    const num2 = Math.floor(Math.random() * 10 * multiplier) + 1;

    switch (topic) {
      case "Addition":
        return {
          question: `${num1} + ${num2} = ?`,
          answer: num1 + num2
        };
      case "Subtraction":
        return {
          question: `${num1 + num2} - ${num1} = ?`,
          answer: num2
        };
      case "Multiplication":
        return {
          question: `${num1} × ${num2} = ?`,
          answer: num1 * num2
        };
      case "Division":
        const dividend = num1 * num2; // Ensures clean division
        return {
          question: `${dividend} ÷ ${num1} = ?`,
          answer: num2
        };
      case "Algebra":
        const problemTypes = [
          // Linear equations
          () => {
            const x = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            return {
              question: `Solve for x: ${num1}x + ${b} = ${num1 * x + b}`,
              answer: x
            };
          },
          // Simple quadratic
          () => {
            const x = Math.floor(Math.random() * 5) + 1;
            return {
              question: `Find x: x² = ${x * x}`,
              answer: x
            };
          },
          // Number sequence
          () => {
            const start = Math.floor(Math.random() * 5) + 1;
            const diff = Math.floor(Math.random() * 3) + 2;
            return {
              question: `What comes next: ${start}, ${start + diff}, ${start + 2 * diff}, ${start + 3 * diff}, ?`,
              answer: start + 4 * diff
            };
          }
        ];
        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
      case "Geometry":
        const shapes = [
          // Rectangle area
          { type: "rectangle", w: num1, h: num2 },
          // Square perimeter
          { type: "square", side: num1 },
          // Circle circumference
          { type: "circle", radius: num1 },
          // Triangle area
          { type: "triangle", base: num1, height: num2 },
          // Cube volume
          { type: "cube", side: num1 }
        ];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        switch (shape.type) {
          case "rectangle":
            if (!shape.w || !shape.h) return null;
            return {
              question: `Find the area of a rectangle with width ${shape.w} and height ${shape.h}`,
              answer: shape.w * shape.h
            };
          case "square":
            if (!shape.side) return null;
            return {
              question: `Find the perimeter of a square with side length ${shape.side}`,
              answer: shape.side * 4
            };
          case "circle":
            if (!shape.radius) return null;
            return {
              question: `Find the approximate circumference of a circle with radius ${shape.radius} (use 3 for π)`,
              answer: 2 * 3 * shape.radius
            };
          case "triangle":
            if (!shape.base || !shape.height) return null;
            return {
              question: `Find the area of a triangle with base ${shape.base} and height ${shape.height}`,
              answer: (shape.base * shape.height) / 2
            };
          case "cube":
            if (!shape.side) return null;
            return {
              question: `Find the volume of a cube with side length ${shape.side}`,
              answer: Math.pow(shape.side, 3)
            };
        }
      default:
        return null;
    }
  };

  const handleTopicSelect = (topic: string) => {
    setCurrentTopic(topic);
    setCurrentProblem(generateProblem(topic));
  };

  const getEmoji = (score: number) => {
    if (score < 50) return '🌱';
    if (score < 100) return '⭐';
    if (score < 200) return '🔥';
    if (score < 500) return '💫';
    return '👑';
  };

  const activatePowerup = (type: keyof typeof powerups) => {
    if (powerups[type] > 0) {
      setPowerups(prev => ({ ...prev, [type]: prev[type] - 1 }));
      switch (type) {
        case 'timeFreeze':
          setTimeLeft(60);
          break;
        case 'skipQuestion':
          setCurrentProblem(generateProblem(currentTopic!));
          break;
        case 'doublePoints':
          setActiveEffects((prev: { doublePoints: boolean; matrixRainbow: boolean; }) => ({ ...prev, doublePoints: true }));
          setTimeout(() => {
            setActiveEffects((prev: { doublePoints: boolean; matrixRainbow: boolean; }) => ({ ...prev, doublePoints: false }));
          }, 30000);
          break;
      }
    }
  };

  const handleAnswerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (currentProblem && Number(userAnswer) === currentProblem.answer) {
      const newCombo = combo + 1;
      const newStreak = streak + 1;
      setCombo(newCombo);
      setStreak(newStreak);
      setLastResult('correct');

      let points = Math.floor(10 * (1 + (newCombo * 0.1)) *
        difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers]);
      if (activeEffects.doublePoints) points *= 2;

      setScore(score + points);

      const newXp = xp + points;
      const xpNeeded = level * 100;
      if (newXp >= xpNeeded) {
        setLevel((prev: number) => prev + 1);
        setXp(newXp - xpNeeded);
        setPowerups((prev: { timeFreeze: number; skipQuestion: number; doublePoints: number; }) => ({
          timeFreeze: prev.timeFreeze + 1,
          skipQuestion: prev.skipQuestion + 1,
          doublePoints: prev.doublePoints + 1
        }));
      } else {
        setXp(newXp);
      }

      setMatrixEffects((prev: { speed: number; density: number; glitch: boolean; }) => ({
        ...prev,
        speed: Math.min(2, 1 + (newCombo * 0.1)),
        glitch: true
      }));
      setTimeout(() => setMatrixEffects((prev: { speed: number; density: number; glitch: boolean; }) => ({ ...prev, glitch: false })), 500);
      setCurrentProblem(generateProblem(currentTopic!));
    } else {
      setCombo(0);
      setStreak(0);
      setLastResult('wrong');
      setLives(lives - 1);
      setMatrixEffects((prev: { speed: number; density: number; glitch: boolean; }) => ({ ...prev, speed: 1 }));
      if (lives <= 1) {
        setHighScore(Math.max(highScore, score));
        setGameOver(true);
      }
    }
    setUserAnswer("");
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentTopic(null);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setCurrentProblem(null);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setLoginError("Username must be at least 3 characters");
      return;
    }
    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters");
      return;
    }

    const success = login(username, password);
    if (!success) {
      setLoginError("Invalid password");
      return;
    }
    setLoginError("");
  };

  return (
    <div className={`${geistMono.variable} min-h-screen bg-black text-green-500 p-4 relative`}>
      <MatrixRain />
      {loading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-2xl font-mono animate-pulse">Loading System...</div>
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center h-screen space-y-8">
          <h1 className="text-4xl mb-8 typing-animation">Matrix Access</h1>
          <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md">
            <div className="bg-black/50 p-8 backdrop-blur-sm border border-green-500 rounded-lg">
              <input
                type="text"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                placeholder="Enter Username"
                className="w-full bg-black/50 border border-green-500 text-green-500 px-4 py-2 mb-4"
                autoFocus
              />
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full bg-black/50 border border-green-500 text-green-500 px-4 py-2 mb-4"
              />
              {loginError && (
                <div className="text-red-500 text-sm mb-4">{loginError}</div>
              )}
              <div className="text-sm mb-4 text-green-500">
                {isNewUser ? "New user? Your account will be created." : "Welcome back!"}
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 border border-green-500 hover:bg-green-500 hover:text-black transition-all duration-300"
              >
                {isNewUser ? "Create Access 🔐" : "Access System 🔓"}
              </button>
              <button
                type="button"
                onClick={() => setIsNewUser(!isNewUser)}
                className="w-full mt-2 px-6 py-3 border border-green-500/50 hover:border-green-500 text-green-500/50 hover:text-green-500 transition-all duration-300"
              >
                {isNewUser ? "Already have access? Login" : "Need access? Sign up"}
              </button>
            </div>
          </form>
        </div>
      ) : !gameStarted ? (
        <div className="flex flex-col items-center justify-center h-screen space-y-8">
          <h1 className="text-4xl mb-8 typing-animation">Welcome, {user}</h1>
          {showEnter && (
            <button
              onClick={() => setGameStarted(true)}
              className="px-8 py-4 border border-green-500 hover:bg-green-500 hover:text-black transition-all duration-300"
            >
              ENTER THE MATRIX
            </button>
          )}
        </div>
      ) : gameOver ? (
        <div className="flex flex-col items-center justify-center h-screen space-y-8">
          <div className="bg-black/50 p-8 backdrop-blur-sm border border-red-500 rounded-lg animate-glitch">
            <h2 className="text-3xl text-red-500 mb-4">SYSTEM FAILURE</h2>
            <p className="text-xl mb-2">{user}'s Final Score: {score}</p>
            <p className="text-lg mb-4">High Score: {highScore}</p>
            <button
              onClick={resetGame}
              className="w-full px-6 py-3 border border-green-500 hover:bg-green-500 hover:text-black transition-all duration-300"
            >
              Reconnect
            </button>
            <button
              onClick={logout}
              className="w-full mt-2 px-6 py-3 border border-red-500 hover:bg-red-500 hover:text-black transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      ) : !currentTopic ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="flex justify-between w-full max-w-2xl mb-8">
            <h2 className="text-2xl">Select Your Challenge:</h2>
            <button
              onClick={logout}
              className="px-4 py-2 border border-red-500 hover:bg-red-500 hover:text-black transition-all duration-300 text-sm"
            >
              Disconnect 🔌
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {topics.map((topic) => (
              <button
                key={topic.name}
                onClick={() => topic.available && handleTopicSelect(topic.name)}
                className={`px-6 py-3 border ${topic.available
                  ? "border-green-500 hover:bg-green-500 hover:text-black"
                  : "border-gray-500 text-gray-500 cursor-not-allowed"
                  } transition-all duration-300`}
              >
                {topic.name}
                {!topic.available && " (Coming Soon)"}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="relative z-10 bg-black/50 p-8 backdrop-blur-sm border border-green-500 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="text-xl">Lives: {"💚".repeat(lives)}</div>
                <div className="text-xl">{getEmoji(score)} Score: {score}</div>
              </div>
              <div className="text-xl text-yellow-400">
                Level {level} {level >= 10 ? '🌟' : ''}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="relative h-2 bg-green-900 rounded">
                <div
                  className="absolute h-full bg-green-500 rounded transition-all duration-300"
                  style={{ width: `${(xp / (level * 100)) * 100}%` }}
                />
              </div>
              <div className="relative h-2 bg-blue-900 rounded">
                <div
                  className="absolute h-full bg-blue-500 rounded transition-all duration-300"
                  style={{ width: `${(timeLeft / 60) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => activatePowerup('timeFreeze')}
                className={`px-3 py-1 rounded ${powerups.timeFreeze > 0
                  ? 'border border-blue-500 hover:bg-blue-500 hover:text-black'
                  : 'border border-gray-500 text-gray-500'
                  } transition-all duration-300`}
              >
                ⏰ {powerups.timeFreeze}
              </button>
              <button
                onClick={() => activatePowerup('skipQuestion')}
                className={`px-3 py-1 rounded ${powerups.skipQuestion > 0
                  ? 'border border-yellow-500 hover:bg-yellow-500 hover:text-black'
                  : 'border border-gray-500 text-gray-500'
                  } transition-all duration-300`}
              >
                ⏭️ {powerups.skipQuestion}
              </button>
              <button
                onClick={() => activatePowerup('doublePoints')}
                className={`px-3 py-1 rounded ${powerups.doublePoints > 0
                  ? 'border border-purple-500 hover:bg-purple-500 hover:text-black'
                  : 'border border-gray-500 text-gray-500'
                  } transition-all duration-300`}
              >
                2️⃣ {powerups.doublePoints}
              </button>
            </div>

            <div className={`
              relative p-6 border border-green-500/30 rounded-lg mb-6
              ${activeEffects.doublePoints ? 'animate-pulse-fast' : ''}
              ${matrixEffects.glitch ? 'animate-glitch' : ''}
            `}>
              <div className="text-2xl text-center">
                {currentProblem?.question}
              </div>
              {activeEffects.doublePoints && (
                <div className="absolute top-0 right-0 p-2 text-purple-500">
                  2x Points Active! ✨
                </div>
              )}
            </div>

            <form onSubmit={handleAnswerSubmit} className="space-y-4">
              <input
                type="number"
                value={userAnswer}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                className={`w-full bg-black/50 border text-green-500 px-4 py-2 text-center backdrop-blur-sm
                  ${lastResult === 'correct' ? 'border-green-500 animate-pulse' :
                    lastResult === 'wrong' ? 'border-red-500 animate-shake' : 'border-green-500'}`}
                autoFocus
              />
              <div className="h-6 text-center">
                {lastResult === 'correct' && <span className="text-green-500">✨ Correct! ✨</span>}
                {lastResult === 'wrong' && <span className="text-red-500">❌ Try again!</span>}
              </div>
              <button
                type="submit"
                className="block w-full px-6 py-3 border border-green-500 hover:bg-green-500 hover:text-black transition-all duration-300"
              >
                Submit 🚀
              </button>
            </form>

            <div className="mt-4 flex gap-2">
              <select
                value={difficulty}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setDifficulty(e.target.value)}
                className="bg-black/50 border border-green-500 text-green-500 px-2 py-1"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </select>

              <button
                onClick={resetGame}
                className="px-4 py-1 border border-red-500 hover:bg-red-500 hover:text-black transition-all duration-300"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
