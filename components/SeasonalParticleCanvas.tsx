'use client';

import React, { useEffect, useRef } from 'react';

export type SeasonalThemeType = 'cosmic' | 'rains' | 'snowfall' | 'springs' | 'autumn';

interface SeasonalParticleCanvasProps {
  theme: SeasonalThemeType;
}

export default function SeasonalParticleCanvas({ theme }: SeasonalParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const count = theme === 'rains' ? 80 : theme === 'snowfall' ? 55 : theme === 'springs' ? 35 : theme === 'autumn' ? 30 : 40;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1.5,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: Math.random() * 1.5 + 0.8,
      opacity: Math.random() * 0.6 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      oscillation: Math.random() * Math.PI * 2,
      color: '#ffffff',
    }));

    // Theme specific initializers
    if (theme === 'rains') {
      particles.forEach((p) => {
        p.speedX = -1.2;
        p.speedY = Math.random() * 12 + 10;
        p.size = Math.random() * 14 + 10;
        p.opacity = Math.random() * 0.4 + 0.15;
      });
    } else if (theme === 'snowfall') {
      particles.forEach((p) => {
        p.size = Math.random() * 3.5 + 1.5;
        p.speedY = Math.random() * 1.2 + 0.6;
        p.speedX = (Math.random() - 0.5) * 0.6;
        p.opacity = Math.random() * 0.7 + 0.3;
      });
    } else if (theme === 'springs') {
      const petalColors = ['#fbcfe8', '#f472b6', '#fda4af', '#ffffff'];
      particles.forEach((p) => {
        p.size = Math.random() * 6 + 4;
        p.speedY = Math.random() * 1.4 + 0.8;
        p.speedX = Math.random() * 1.2 + 0.4;
        p.color = petalColors[Math.floor(Math.random() * petalColors.length)];
        p.opacity = Math.random() * 0.65 + 0.35;
      });
    } else if (theme === 'autumn') {
      const leafColors = ['#f59e0b', '#d97706', '#b45309', '#ef4444', '#ca8a04'];
      particles.forEach((p) => {
        p.size = Math.random() * 7 + 5;
        p.speedY = Math.random() * 1.5 + 0.9;
        p.speedX = Math.random() * 1.4 + 0.2;
        p.color = leafColors[Math.floor(Math.random() * leafColors.length)];
        p.opacity = Math.random() * 0.7 + 0.3;
      });
    } else {
      // Cosmic starlight
      particles.forEach((p) => {
        p.speedX = (Math.random() - 0.5) * 0.15;
        p.speedY = (Math.random() - 0.5) * 0.15;
        p.size = Math.random() * 2 + 0.5;
        p.opacity = Math.random() * 0.8 + 0.2;
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.oscillation += 0.02;
        p.rotation += p.rotationSpeed;

        if (theme === 'rains') {
          // Render rain streaks
          p.x += p.speedX;
          p.y += p.speedY;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.size);
          ctx.stroke();

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * (width + 100);
          }
          if (p.x < -20) p.x = width + 20;

        } else if (theme === 'snowfall') {
          // Render snow flakes
          p.y += p.speedY;
          p.x += Math.sin(p.oscillation) * 0.8 + p.speedX;

          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

        } else if (theme === 'springs') {
          // Render blossom petal (ellipse with rotation)
          p.y += p.speedY;
          p.x += Math.sin(p.oscillation) * 1.5 + p.speedX;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y > height) {
            p.y = -15;
            p.x = Math.random() * (width - 100);
          }
          if (p.x > width + 20) p.x = -20;

        } else if (theme === 'autumn') {
          // Render autumn leaf
          p.y += p.speedY;
          p.x += Math.sin(p.oscillation * 1.2) * 1.8 + p.speedX;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          // Leaf shape
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.7, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.7, 0, 0, -p.size);
          ctx.fill();
          ctx.restore();

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;

        } else {
          // Cosmic twinkle
          p.x += p.speedX;
          p.y += p.speedY;
          const twinkle = Math.sin(p.oscillation) * 0.4 + 0.6;

          ctx.beginPath();
          ctx.fillStyle = `rgba(224, 242, 254, ${p.opacity * twinkle})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 w-full h-full"
    />
  );
}
