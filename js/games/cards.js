// 🃏 卡牌翻翻乐：洗牌后凭直觉翻开一张
window.GAMES = window.GAMES || {};

GAMES.cards = (() => {
  let ctx = null;
  let grid = null;
  let dealBtn = null;
  let cities = [];
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function deal(withJiggle) {
    const pool = ctx.getPool();
    cities = shuffle(pool).slice(0, Math.min(12, pool.length));
    locked = false;
    grid.innerHTML = cities
      .map(
        (c, i) => `
      <div class="flip-card" data-i="${i}" style="--jig:${((Math.random() - 0.5) * 16).toFixed(1)}deg">
        <div class="flip-inner">
          <div class="flip-face flip-back">🌏</div>
          <div class="flip-face flip-front" style="background:linear-gradient(145deg,${esc(c.gradient[0])},${esc(c.gradient[1])})">
            <span class="ff-emoji">${esc(c.emoji)}</span>
            <span class="ff-name">${esc(c.name)}</span>
          </div>
        </div>
      </div>`
      )
      .join("");

    if (withJiggle) {
      grid.querySelectorAll(".flip-card").forEach((el) => {
        el.classList.add("shuffling");
        el.addEventListener("animationend", () => el.classList.remove("shuffling"), { once: true });
      });
    }

    grid.querySelectorAll(".flip-card").forEach((el) => {
      el.addEventListener("click", () => reveal(el));
    });
  }

  function reveal(el) {
    if (locked || !ctx) return;
    locked = true;
    const winner = cities[Number(el.dataset.i)];
    el.classList.add("flipped");
    setTimeout(() => {
      grid.querySelectorAll(".flip-card").forEach((other) => {
        if (other !== el) other.classList.add("flipped", "dimmed");
      });
    }, 450);
    setTimeout(() => ctx.onResult(winner), 1000);
  }

  function redeal() {
    if (!ctx) return;
    deal(true);
  }

  function mount(stage, gameCtx) {
    ctx = gameCtx;
    stage.innerHTML = `
      <div class="cards-wrap">
        <div class="cards-grid" id="cards-grid"></div>
        <button class="primary-btn" id="cards-shuffle">🔀 重新洗牌</button>
        <p class="game-hint">凭直觉翻开一张牌，看看你的下一站</p>
      </div>`;
    grid = stage.querySelector("#cards-grid");
    dealBtn = stage.querySelector("#cards-shuffle");
    dealBtn.addEventListener("click", redeal);
    deal(false);
  }

  function unmount() {
    locked = false;
    ctx = null;
  }

  return { id: "cards", name: "卡牌", icon: "🃏", mount, unmount, spin: redeal };
})();
