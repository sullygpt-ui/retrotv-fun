"use client";

import { useEffect } from "react";

const SPARKLE_CHARS = ["✦", "✧", "⋆", "✶", "✷", "⭑", "✸"];
const COLORS = ["#FFB347", "#ff6b6b", "#51cf66", "#00ffff", "#ff69b4", "#ffff00"];

export default function SparkleTrail() {
  useEffect(() => {
    let lastSparkle = 0;
    const THROTTLE = 50; // ms between sparkles

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSparkle < THROTTLE) return;
      lastSparkle = now;

      const sparkle = document.createElement("span");
      sparkle.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
      sparkle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        pointer-events: none;
        z-index: 9999;
        font-size: ${8 + Math.random() * 14}px;
        color: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        text-shadow: 0 0 6px currentColor;
        animation: sparkle-fade 1s forwards;
        transform: translate(-50%, -50%);
      `;
      document.body.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 1000);
    };

    // Add animation keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes sparkle-fade {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        25% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.3) rotate(90deg); }
        50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1) rotate(180deg); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(360deg) translateY(-20px); }
      }
    `;
    document.head.appendChild(style);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      style.remove();
    };
  }, []);

  return null;
}
