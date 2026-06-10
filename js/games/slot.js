// 🎰 城市老虎机：三列滚轮，以中间列停下的城市为准
window.GAMES = window.GAMES || {};

GAMES.slot = (() => {
  const CELL_H = 59.33;       // 与 CSS .reel-cell 高度一致
  const CELLS = 26;           // 每列滚动序列长度

  let ctx = null;
  let strips = [];
  let pullBtn = null;
  let windowEl = null;
  let busy = false;
  let raf = null;

  const randOf = (arr) => arr[(Math.random() * arr.length) | 0];

  function cellHtml(city) {
    return `<div class="reel-cell">${city.emoji} ${city.name}</div>`;
  }

  function buildStrip(strip, pool, finalCity) {
    const cells = [];
    for (let i = 0; i < CELLS; i++) cells.push(randOf(pool));
    cells[CELLS - 2] = finalCity;     // 终点时位于中间行
    strip.innerHTML = cells.map(cellHtml).join("");
    strip.style.transform = "translateY(0px)";
    return cells;
  }

  // 带轻微回弹的缓出
  function easeOutBackSoft(t) {
    const c = 0.9;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }

  function pull() {
    if (busy || !ctx) return;
    const pool = ctx.getPool();
    if (pool.length < 2) return;
    busy = true;
    pullBtn.disabled = true;
    windowEl.classList.remove("slot-win");

    const winner = ctx.pick();
    const finals = [randOf(pool), winner, randOf(pool)];
    strips.forEach((s, i) => buildStrip(s, pool, finals[i]));

    const target = -(CELLS - 3) * CELL_H;
    const durs = [1700, 2300, 2900];
    const start = performance.now();
    cancelAnimationFrame(raf);
    (function tick(now) {
      let done = true;
      strips.forEach((s, i) => {
        const t = Math.min((now - start) / durs[i], 1);
        if (t < 1) done = false;
        s.style.transform = `translateY(${target * easeOutBackSoft(t)}px)`;
      });
      if (!done) {
        raf = requestAnimationFrame(tick);
      } else {
        windowEl.classList.add("slot-win");
        strips[1].children[CELLS - 2].classList.add("center-hit");
        setTimeout(() => {
          busy = false;
          pullBtn.disabled = false;
          ctx.onResult(winner);
        }, 700);
      }
    })(start);
  }

  function mount(stage, gameCtx) {
    ctx = gameCtx;
    busy = false;
    cancelAnimationFrame(raf);
    stage.innerHTML = `
      <div class="slot-wrap">
        <div class="slot-window" id="slot-window">
          <div class="reel"><div class="reel-strip"></div></div>
          <div class="reel"><div class="reel-strip"></div></div>
          <div class="reel"><div class="reel-strip"></div></div>
          <div class="slot-marker"></div>
        </div>
        <button class="primary-btn" id="slot-pull">🎰 拉一把</button>
        <p class="game-hint">三列滚轮转起来，以中间列停下的城市为准</p>
      </div>`;
    windowEl = stage.querySelector("#slot-window");
    strips = Array.from(stage.querySelectorAll(".reel-strip"));
    pullBtn = stage.querySelector("#slot-pull");
    pullBtn.addEventListener("click", pull);

    const pool = ctx.getPool();
    strips.forEach((s) => {
      // 初始静态画面：中间行随机展示
      s.innerHTML = [randOf(pool), randOf(pool), randOf(pool)].map(cellHtml).join("");
    });
  }

  function unmount() {
    cancelAnimationFrame(raf);
    busy = false;
    ctx = null;
  }

  return { id: "slot", name: "老虎机", icon: "🎰", mount, unmount, spin: pull };
})();
