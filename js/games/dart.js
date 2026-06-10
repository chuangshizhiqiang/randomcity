// 🎯 飞镖靶盘：靶盘缓慢旋转，掷出飞镖命中处即中选
window.GAMES = window.GAMES || {};

GAMES.dart = (() => {
  const COLORS = ["#667EEA", "#FA709A", "#43E97B", "#FDBB2D", "#30CFD0",
    "#F5576C", "#A18CD1", "#4FACFE", "#FF6A88", "#22C1C3"];
  const CX = 160, R = 150, LABEL_R = 100;
  const SPEED = 42; // 度/秒

  let ctx = null;
  let wrap = null, rotor = null, svg = null, throwBtn = null;
  let cities = [];
  let rotation = 0;
  let raf = null;
  let lastTs = 0;
  let busy = false;

  const rad = (d) => (d * Math.PI) / 180;
  const pt = (angle, r) => [CX + r * Math.sin(rad(angle)), CX - r * Math.cos(rad(angle))];
  const norm = (d) => ((d % 360) + 360) % 360;

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

  function renderSectors() {
    const k = cities.length;
    const step = 360 / k;
    let html = "";
    for (let i = 0; i < k; i++) {
      const a0 = i * step, a1 = (i + 1) * step, mid = a0 + step / 2;
      const [x0, y0] = pt(a0, R);
      const [x1, y1] = pt(a1, R);
      const [lx, ly] = pt(mid, LABEL_R);
      html += `<path d="M${CX},${CX} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${step > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z"
        fill="${COLORS[i % COLORS.length]}" stroke="rgba(255,255,255,0.5)" stroke-width="2" data-sector="${i}"></path>`;
      html += `<text class="wheel-label" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle"
        dominant-baseline="middle" data-label="${i}"
        transform="rotate(${(mid - 90).toFixed(2)},${lx.toFixed(2)},${ly.toFixed(2)})">${short(cities[i].name)}</text>`;
    }
    // 靶心装饰环
    html += `<circle cx="160" cy="160" r="34" fill="rgba(255,255,255,0.9)"></circle>
      <circle cx="160" cy="160" r="20" fill="#E63946"></circle>
      <circle cx="160" cy="160" r="8" fill="#fff"></circle>`;
    rotor.innerHTML = html;
  }

  function startRotation() {
    cancelAnimationFrame(raf);
    lastTs = 0;
    (function tick(ts) {
      if (lastTs) rotation = norm(rotation + (SPEED * (ts - lastTs)) / 1000);
      lastTs = ts;
      rotor.style.transform = `rotate(${rotation}deg)`;
      raf = requestAnimationFrame(tick);
    })(performance.now());
  }

  function throwDart() {
    if (busy || !ctx) return;
    const pool = ctx.getPool();
    if (pool.length < 2) return;
    busy = true;
    throwBtn.disabled = true;
    wrap.querySelector(".dart-projectile")?.remove();

    const k = cities.length;
    const step = 360 / k;
    const winner = ctx.pick();
    const flight = 620;                                       // 与 CSS transition 时长一致
    const impactAngle = Math.random() * 360;                  // 屏幕坐标系命中角
    const impactR = 55 + Math.random() * 70;                  // 命中半径（落在扇区标签带内）
    const rotAtImpact = norm(rotation + (SPEED * flight) / 1000);
    const hit = Math.floor(norm(impactAngle - rotAtImpact) / step) % k;

    // 把中选城市放进即将命中的扇区（保证对全池均匀抽样）
    cities[hit] = winner;
    const label = rotor.querySelector(`[data-label="${hit}"]`);
    if (label) label.textContent = short(winner.name);

    const [ix, iy] = pt(impactAngle, impactR);
    const dart = document.createElement("div");
    dart.className = "dart-projectile";
    dart.textContent = "📌";
    dart.style.left = "50%";
    dart.style.top = "112%";
    dart.style.fontSize = "46px";
    wrap.appendChild(dart);
    // 强制 reflow 后再设置终点，触发 CSS 飞行过渡
    void dart.offsetWidth;
    dart.style.left = `${(ix / 320) * 100}%`;
    dart.style.top = `${(iy / 320) * 100}%`;
    dart.style.fontSize = "26px";

    setTimeout(() => {
      cancelAnimationFrame(raf);                              // 命中即停转
      svg.classList.add("dart-board-shake");
      rotor.querySelectorAll("path[data-sector]").forEach((el, i) => {
        el.style.opacity = i === hit ? "1" : "0.35";
      });
      setTimeout(() => {
        svg.classList.remove("dart-board-shake");
        rotor.querySelectorAll("path[data-sector]").forEach((el) => (el.style.opacity = "1"));
        busy = false;
        throwBtn.disabled = false;
        ctx.onResult(winner);
        dart.remove();
        startRotation();                                      // 复位继续旋转
      }, 800);
    }, flight);
  }

  function mount(stage, gameCtx) {
    ctx = gameCtx;
    busy = false;
    stage.innerHTML = `
      <div class="dart-wrap">
        <svg viewBox="0 0 320 320" aria-label="飞镖靶盘" id="dart-svg">
          <g id="dart-rotor"></g>
          <circle cx="160" cy="160" r="149" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="3"></circle>
        </svg>
      </div>
      <button class="primary-btn" id="dart-throw">🎯 掷飞镖</button>
      <p class="game-hint">靶盘正在旋转，掷出飞镖命中你的下一站</p>`;
    wrap = stage.querySelector(".dart-wrap");
    svg = stage.querySelector("#dart-svg");
    rotor = stage.querySelector("#dart-rotor");
    throwBtn = stage.querySelector("#dart-throw");
    throwBtn.addEventListener("click", throwDart);

    const pool = ctx.getPool();
    cities = shuffle(pool).slice(0, Math.min(10, pool.length));
    rotation = Math.random() * 360;
    renderSectors();
    startRotation();
  }

  function unmount() {
    cancelAnimationFrame(raf);
    busy = false;
    ctx = null;
  }

  return { id: "dart", name: "飞镖", icon: "🎯", mount, unmount, spin: throwDart };
})();
