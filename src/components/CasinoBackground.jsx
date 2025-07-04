import React, { useEffect, useRef } from "react";

// AnimatedCasinoBackground: dark, animated, interactive casino+stocks vibe
const AnimatedCasinoBackground = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const lines = useRef([]);
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Helper: random color from casino palette
  const casinoColors = [
    "#1a0f13", // deep maroon
    "#0d1b2a", // dark blue
    "#2d6a4f", // velvet green
    "#ffd700", // gold
    "#a259ff", // neon purple
    "#ff2d55", // ruby
    "#00eaff", // neon blue
  ];

  // Helper: random float
  const rand = (a, b) => a + Math.random() * (b - a);

  // Animate particles (chips, dots)
  function createParticles() {
    particles.current = Array.from({ length: 40 }, () => ({
      x: rand(0, width),
      y: rand(0, height),
      r: rand(2, 7),
      color: casinoColors[Math.floor(rand(0, casinoColors.length))],
      dx: rand(-0.2, 0.2),
      dy: rand(0.1, 0.5),
      alpha: rand(0.2, 0.7),
    }));
  }

  // Animate lines (profit/loss graph)
  function createLines() {
    lines.current = Array.from({ length: 3 }, (_, i) => ({
      points: Array.from({ length: 30 }, (_, j) => ({
        x: (j / 29) * width,
        y: height / 2 + Math.sin(j / 4 + i) * rand(30, 80) + rand(-30, 30),
      })),
      color: casinoColors[3 + i],
      width: rand(2, 4),
      speed: rand(0.002, 0.008),
      phase: rand(0, Math.PI * 2),
    }));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let mouse = { x: width / 2, y: height / 2 };

    createParticles();
    createLines();

    function animate() {
      ctx.clearRect(0, 0, width, height);
      // Draw dark gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#1a0f13");
      grad.addColorStop(1, "#0d1b2a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Animate lines (profit/loss)
      lines.current.forEach((line, i) => {
        ctx.save();
        ctx.beginPath();
        line.points.forEach((pt, j) => {
          const y = pt.y + Math.sin(Date.now() * line.speed + j + line.phase) * 8;
          if (j === 0) ctx.moveTo(pt.x, y);
          else ctx.lineTo(pt.x, y);
        });
        ctx.strokeStyle = line.color + "cc";
        ctx.lineWidth = line.width;
        ctx.shadowColor = line.color;
        ctx.shadowBlur = 16;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.restore();
      });
      ctx.globalAlpha = 1;

      // Animate particles (casino chips/dots)
      particles.current.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
        // Move
        p.x += p.dx + (mouse.x - width / 2) * 0.00005;
        p.y += p.dy + (mouse.y - height / 2) * 0.00005;
        if (p.y > height + 10) {
          p.y = -10;
          p.x = rand(0, width);
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    // Mouse interaction: glow effect
    function handleMove(e) {
      mouse.x = e.touches ? e.touches[0].clientX : e.clientX;
      mouse.y = e.touches ? e.touches[0].clientY : e.clientY;
    }
    function handleClick(e) {
      // Ripple effect: burst particles
      for (let i = 0; i < 10; i++) {
        particles.current.push({
          x: mouse.x,
          y: mouse.y,
          r: rand(3, 8),
          color: casinoColors[Math.floor(rand(0, casinoColors.length))],
          dx: rand(-2, 2),
          dy: rand(-2, 2),
          alpha: 0.8,
        });
      }
      setTimeout(() => {
        particles.current.splice(-10, 10);
      }, 800);
    }
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("click", handleClick);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
        background: "none",
      }}
    />
  );
};

export default AnimatedCasinoBackground; 