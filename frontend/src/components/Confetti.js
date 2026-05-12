import React, { useEffect, useRef } from "react";

export default function Confetti({ trigger }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * -H,
        r: Math.random() * 8 + 4,
        d: Math.random() * 80 + 40,
        color: `hsl(${Math.random() * 360}, 90%, 60%)`,
        tilt: Math.random() * 10 - 10,
        tiltAngle: 0,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05
      });
    }

    let angle = 0;
    let animationFrame;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      angle += 0.01;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += (Math.cos(angle + p.d) + 3 + p.r / 2) * 0.8;
        p.x += Math.sin(angle);
        p.tiltAngle += p.tiltAngleIncremental;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
      }
      animationFrame = requestAnimationFrame(draw);
    }

    draw();
    const stopTimer = setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, W, H);
    }, 2200);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(stopTimer);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999
      }}
    />
  );
}
