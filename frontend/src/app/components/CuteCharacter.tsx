import React, { useEffect, useRef, useState } from "react";

const CHARACTER_SIZE = 64;
const GROUND_Y = window.innerHeight - 120;
const MOVE_SPEED = 4;
const JUMP_POWER = 15;
const GRAVITY = 0.8;

// より統一感のあるカラーパレット
const COLORS = {
  primary: "#FFB6A3",    // メインカラー（体）- 柔らかい暖色
  secondary: "#FF8E76",  // アクセントカラー（耳、足など）
  outline: "#4A3B37",    // 輪郭 - 暖かみのあるダークカラー
  detail: "#FFFFFF",     // 細部（目の光など）
  nose: "#FFA0A0",      // 鼻
};

export default function CuteCharacter() {
  const [x, setX] = useState(200);
  const [y, setY] = useState(GROUND_Y);
  const [vy, setVy] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isMoving, setIsMoving] = useState(false);
  const [walkPhase, setWalkPhase] = useState(0); // 歩行アニメーションのフェーズ
  const keys = useRef({ left: false, right: false, space: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowLeft") {
        keys.current.left = true;
        setDirection("left");
        setIsMoving(true);
      }
      if (e.key === "ArrowRight") {
        keys.current.right = true;
        setDirection("right");
        setIsMoving(true);
      }
      if (e.key === " ") {
        keys.current.space = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        keys.current.left = false;
        if (!keys.current.right) setIsMoving(false);
      }
      if (e.key === "ArrowRight") {
        keys.current.right = false;
        if (!keys.current.left) setIsMoving(false);
      }
      if (e.key === " ") keys.current.space = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationId: number;
    let walkTimer: number;

    const updateWalkPhase = () => {
      if (isMoving) {
        setWalkPhase(prev => (prev + 1) % 4); // 4フェーズの歩行アニメーション
      }
    };

    const loop = () => {
      setX((prevX) => {
        let nextX = prevX;
        if (keys.current.left) nextX -= MOVE_SPEED;
        if (keys.current.right) nextX += MOVE_SPEED;
        return Math.max(0, Math.min(nextX, window.innerWidth - CHARACTER_SIZE));
      });

      setY((prevY) => {
        let nextY = prevY;
        let nextVy = vy;
        if (keys.current.space && !isJumping && prevY === GROUND_Y) {
          nextVy = -JUMP_POWER;
          setIsJumping(true);
        }
        nextVy += GRAVITY;
        nextY += nextVy;
        if (nextY >= GROUND_Y) {
          nextY = GROUND_Y;
          nextVy = 0;
          setIsJumping(false);
        }
        setVy(nextVy);
        return nextY;
      });

      animationId = requestAnimationFrame(loop);
    };

    walkTimer = window.setInterval(updateWalkPhase, 150); // 歩行アニメーションの更新
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(walkTimer);
    };
  }, [vy, isJumping]);

  // 歩行フェーズに基づく足の位置の計算
  const getFeetPositions = () => {
    const phase = isMoving ? walkPhase : 0;
    const lift = 4; // 足を上げる高さ
    
    return {
      frontFoot: phase === 1 || phase === 2 ? -lift : 0,
      backFoot: phase === 0 || phase === 3 ? -lift : 0,
    };
  };

  const { frontFoot, backFoot } = getFeetPositions();

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: CHARACTER_SIZE,
        height: CHARACTER_SIZE,
        transform: `scaleX(${direction === "left" ? -1 : 1})`,
        transition: "transform 0.1s",
        filter: isJumping ? "brightness(1.1)" : "none",
      }}
    >
      <svg width={CHARACTER_SIZE} height={CHARACTER_SIZE} viewBox="0 0 64 64" style={{filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))"}}>
        {/* 体 */}
        <path
          d="M12 40 C12 28 20 24 32 24 C44 24 52 28 52 40 C52 48 44 52 32 52 C20 52 12 48 12 40Z"
          fill={COLORS.primary}
          stroke={COLORS.outline}
          strokeWidth="2"
        />
        {/* 頭 */}
        <path
          d="M28 24 C28 16 32 12 40 12 C48 12 52 16 52 24 C52 32 48 36 40 36 C32 36 28 32 28 24Z"
          fill={COLORS.primary}
          stroke={COLORS.outline}
          strokeWidth="2"
        />
        {/* 耳 */}
        <path
          d="M36 14 L40 8 L44 14 Z"
          fill={COLORS.secondary}
          stroke={COLORS.outline}
          strokeWidth="2"
        />
        <path
          d="M44 14 L48 8 L52 14 Z"
          fill={COLORS.secondary}
          stroke={COLORS.outline}
          strokeWidth="2"
        />
        {/* 目 */}
        <circle cx="44" cy="20" r="2" fill={COLORS.outline} />
        <circle cx="44.5" cy="19.5" r="0.5" fill={COLORS.detail} />
        {/* 鼻 */}
        <path
          d="M48 24 L50 24 L49 26 Z"
          fill={COLORS.nose}
          stroke={COLORS.outline}
          strokeWidth="1"
        />
        {/* しっぽ */}
        <path
          d="M12 44 C8 44 4 40 8 36"
          stroke={COLORS.secondary}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* 前足 */}
        <line
          x1="44" y1="40" x2="44" y2={50 + frontFoot}
          stroke={COLORS.outline}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="36" y1="40" x2="36" y2={50 + backFoot}
          stroke={COLORS.outline}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* 後ろ足 */}
        <line
          x1="20" y1="40" x2="20" y2={50 + frontFoot}
          stroke={COLORS.outline}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="28" y1="40" x2="28" y2={50 + backFoot}
          stroke={COLORS.outline}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
} 