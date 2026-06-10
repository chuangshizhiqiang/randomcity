// 城市详情弹层（Apple 风格 sheet）
const CityCard = (() => {
  let overlay = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function hide() {
    if (!overlay) return;
    const el = overlay;
    overlay = null;
    el.classList.remove("show");
    setTimeout(() => el.remove(), 320);
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (e.key === "Escape") hide();
  }

  // opts: { onAgain, onSwitch } 不传则不显示对应按钮
  function show(city, opts = {}) {
    hide();
    const [g0, g1] = city.gradient;
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="city-sheet" role="dialog" aria-label="${esc(city.name)}">
        <div class="sheet-hero" style="background:linear-gradient(135deg,${esc(g0)},${esc(g1)})">
          <button class="sheet-close" aria-label="关闭">✕</button>
          <div class="hero-emoji">${esc(city.emoji)}</div>
          <h2>${esc(city.name)}</h2>
          <p class="sheet-sub">${esc(city.nameEn)} · ${esc(city.country)}</p>
          <div class="tag-row">${city.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        </div>
        <div class="sheet-body">
          <p class="city-desc">${esc(city.desc)}</p>
          <div class="info-grid">
            <div class="info-block">
              <h3>🏞 必游景点</h3>
              <ul>${city.attractions.map((a) => `<li data-icon="📍">${esc(a)}</li>`).join("")}</ul>
            </div>
            <div class="info-block">
              <h3>🍜 特色美食</h3>
              <ul>${city.foods.map((f) => `<li data-icon="🥢">${esc(f)}</li>`).join("")}</ul>
            </div>
          </div>
          <div class="season-row">🗓 最佳旅行时间：${esc(city.season)}</div>
          <div class="sheet-actions">
            ${opts.onAgain ? `<button class="btn-again">🎲 再抽一次</button>` : ""}
            ${opts.onSwitch ? `<button class="btn-switch">🕹 换个游戏</button>` : ""}
          </div>
        </div>
      </div>`;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hide();
    });
    overlay.querySelector(".sheet-close").addEventListener("click", hide);
    overlay.querySelector(".btn-again")?.addEventListener("click", () => {
      hide();
      opts.onAgain();
    });
    overlay.querySelector(".btn-switch")?.addEventListener("click", () => {
      hide();
      opts.onSwitch();
    });

    document.getElementById("modal-root").appendChild(overlay);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => requestAnimationFrame(() => overlay?.classList.add("show")));
  }

  return { show, hide };
})();
