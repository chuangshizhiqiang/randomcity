// 🎡 幸运轮盘
window.GAMES = window.GAMES || {};

GAMES.wheel = (() => {
  const COLORS = ["#FF6A88", "#FDBB2D", "#43E97B", "#4FACFE", "#A18CD1", "#F5576C",
    "#22C1C3", "#F76B1C", "#667EEA", "#FA709A", "#30CFD0", "#8FD3F4"];
  const CX = 160, R = 150, LABEL_R = 96;

  let ctx = null;
  let rotor = null;
  let goBtn = null;
  let rotation = 0;        // 累计旋转角度
  let spinning = false;
  let cities = [];         // 当前盘面上的城市
  let raf = null;

  const rad = (d) => ((d - 0) * Math.PI) / 180;
  const pt = (angle, r) => [CX + r * Math.sin(rad(angle)), CX - r * Math.cos(rad(angle))];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function short(name) {
    return name.length > 5 ? name.slice(0, 4) + "…" : name;
  }

  // 以 winner 为必含项，从池中抽样组成盘面
  function makeBoard(pool, winner) {
    const k = Math.min(12, pool.length);
    const others = shuffle(pool.filter((c) => c !== winner)).slice(0, k - 1);
    return shuffle(others.concat(winner));
  }

  function renderSectors() {
    const k = cities.length;
    const step = 360 / k;
    let svg = "";
    for (let i = 0; i < k; i++) {
      const a0 = i * step, a1 = (i + 1) * step, mid = a0 + step / 2;
      const [x0, y0] = pt(a0, R);
      const [x1, y1] = pt(a1, R);
      const large = step > 180 ? 1 : 0;
      const [lx, ly] = pt(mid, LABEL_R);
      svg += `<path d="M${CX},${CX} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z"
        fill="${COLORS[i % COLORS.length]}" stroke="rgba(255,255,255,0.55)" stroke-width="2" data-sector="${i}"></path>`;
      svg += `<text class="wheel-label" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}"
        text-anchor="middle" dominant-baseline="middle"
        transform="rotate(${(mid - 90).toFixed(2)},${lx.toFixed(2)},${ly.toFixed(2)})">${short(cities[i].name)}</text>`;
    }
    rotor.innerHTML = svg;
  }

  function spin() {
    if (spinning || !ctx) return;
    const pool = ctx.getPool();
    if (pool.length < 2) return;
    spinning = true;
    goBtn.disabled = true;

    const winner = ctx.pick();
    cities = makeBoard(pool, winner);
    renderSectors();

    const k = cities.length;
    const step = 360 / k;
    const w = cities.indexOf(winner);
    const desired = -((w + 0.5) * step);                       // 让中奖扇区中心对准顶部指针
    const jitter = (Math.random() - 0.5) * step * 0.6;
    let delta = ((desired - rotation) % 360 + 360) % 360;
    delta += 360 * 5 + jitter;

    const from = rotation;
    const dur = 4200;
    const start = performance.now();
    cancelAnimationFrame(raf);
    (function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const p = 1 - Math.pow(1 - t, 4);                        // easeOutQuart，模拟摩擦减速
      rotation = from + delta * p;
      rotor.style.transform = `rotate(${rotation}deg)`;
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        rotor.querySelectorAll("path").forEach((el, i) => {
          el.style.opacity = i === w ? "1" : "0.35";
        });
        setTimeout(() => {
          rotor.querySelectorAll("path").forEach((el) => (el.style.opacity = "1"));
          spinning = false;
          goBtn.disabled = false;
          ctx.onResult(winner);
        }, 650);
      }
    })(start);
  }

  function mount(stage, gameCtx) {
    ctx = gameCtx;
    cancelAnimationFrame(raf);
    spinning = false;
    rotation = 0;
    stage.innerHTML = `
      <div class="wheel-wrap">
        <div class="wheel-pointer">🔻</div>
        <svg viewBox="0 0 320 320" aria-label="幸运轮盘">
          <g id="wheel-rotor"></g>
          <circle cx="160" cy="160" r="149" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="3"></circle>
        </svg>
        <button class="wheel-hub" id="wheel-go">GO</button>
      </div>
      <p class="game-hint">点击 GO，轮盘转出你的下一站</p>`;
    rotor = stage.querySelector("#wheel-rotor");
    goBtn = stage.querySelector("#wheel-go");
    goBtn.addEventListener("click", spin);

    const pool = ctx.getPool();
    cities = makeBoard(pool, pool[(Math.random() * pool.length) | 0]);
    renderSectors();
  }

  function unmount() {
    cancelAnimationFrame(raf);
    spinning = false;
    ctx = null;
  }

  return { id: "wheel", name: "轮盘", icon: "🎡", mount, unmount, spin };
})();
