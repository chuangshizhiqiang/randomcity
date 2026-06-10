// 轻量彩带庆祝动效（Canvas，无依赖）
const Confetti = (() => {
  const COLORS = ["#FF6A88", "#FDBB2D", "#43E97B", "#4FACFE", "#A18CD1", "#F5576C", "#22C1C3"];
  let raf = null;

  function burst() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.display = "block";

    const pieces = [];
    const spawn = (x, y, angle, spread, count) => {
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const speed = 7 + Math.random() * 9;
        pieces.push({
          x, y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          w: 6 + Math.random() * 6,
          h: 8 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          life: 1,
        });
      }
    };
    spawn(0, innerHeight * 0.7, -Math.PI / 3, 0.9, 70);
    spawn(innerWidth, innerHeight * 0.7, Math.PI + Math.PI / 3, 0.9, 70);

    const start = performance.now();
    cancelAnimationFrame(raf);
    (function tick(now) {
      const t = (now - start) / 2400;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of pieces) {
        p.vy += 0.28;          // 重力
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = 1 - t;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        canvas.style.display = "none";
      }
    })(start);
  }

  return { burst };
})();
