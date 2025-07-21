// components/ui/wavy-background.tsx
"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react"; // Added useCallback
import { createNoise3D } from "simplex-noise"; // Ensure simplex-noise is installed

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  let animationFrameId: number;
  let nt = 0; // Noise time

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const waveColors = colors ?? [
    "#38bdf8", // light blue
    "#818cf8", // light purple
    "#c084fc", // purple
    "#e879f9", // pink
    "#22d3ee", // cyan
  ];

  const drawWave = useCallback((n: number) => {
    if (!context) return;
    context.beginPath();
    context.lineWidth = waveWidth || 50;
    context.strokeStyle = waveColors[n % waveColors.length];
    context.globalAlpha = waveOpacity; // Apply waveOpacity per wave

    for (let x = 0; x < dimensions.width; x += 5) {
      const y = noise(x / 800, 0.3 * n, nt) * 100;
      context.lineTo(x, y + dimensions.height * 0.5); // Adjust for height
    }
    context.stroke();
    context.closePath();
  }, [context, waveWidth, waveColors, waveOpacity, dimensions, noise, nt]); // nt is a dependency for useCallback, but updated externally

  const render = useCallback(() => {
    if (!context) return;

    context.fillStyle = backgroundFill || "black";
    context.globalAlpha = 1; // Fill background opaque first
    context.fillRect(0, 0, dimensions.width, dimensions.height);

    nt += getSpeed(); // Update noise time for animation

    for (let i = 0; i < 5; i++) { // Always draw 5 waves as per original logic
      drawWave(i);
    }

    animationFrameId = requestAnimationFrame(render);
  }, [context, dimensions, backgroundFill, getSpeed, drawWave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setContext(canvas.getContext("2d"));

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize(); // Set initial dimensions
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Run once on mount to set up canvas and listeners

  useEffect(() => {
    if (context) {
      // Re-initialize nt when context changes (e.g., component remounts or hot-reloads)
      nt = 0;
      cancelAnimationFrame(animationFrameId); // Clear any old animation frame
      animationFrameId = requestAnimationFrame(render); // Start new animation loop
    }
  }, [context, render]);


  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center relative", // Added relative
        containerClassName
      )}
      {...props}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          filter: `blur(${blur}px)`, // Apply blur via CSS for performance/compatibility
          width: "100%", // Ensure canvas takes full width
          height: "100%", // Ensure canvas takes full height
        }}
      ></canvas>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};