// 应用主逻辑：分组多选、游戏切换、抽选结果与历史
(() => {
  const GAME_ORDER = ["wheel", "dart", "slot", "cards"];
  const LS_GROUPS = "rc_groups";
  const LS_HISTORY = "rc_history";

  const cityById = new Map(CITIES.map((c) => [c.id, c]));
  const stage = document.getElementById("game-stage");
  const tabsEl = document.getElementById("game-tabs");
  const chipsEl = document.getElementById("group-chips");
  const historySection = document.getElementById("history-section");
  const historyList = document.getElementById("history-list");
  const toastEl = document.getElementById("toast");

  const state = {
    groups: loadGroups(),
    game: "wheel",
    history: loadJson(LS_HISTORY, []),
  };

  function loadJson(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  function loadGroups() {
    const valid = new Set(CITY_GROUPS.map((g) => g.id));
    const saved = loadJson(LS_GROUPS, null);
    const ids = Array.isArray(saved) ? saved.filter((id) => valid.has(id)) : [];
    if (ids.length) return new Set(ids);
    return new Set(CITY_GROUPS.filter((g) => g.default).map((g) => g.id));
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function pool() {
    return CITIES.filter((c) => state.groups.has(c.group));
  }

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------- 分组芯片 ---------- */
  function renderChips() {
    chipsEl.innerHTML = "";
    for (const g of CITY_GROUPS) {
      const count = CITIES.filter((c) => c.group === g.id).length;
      const btn = document.createElement("button");
      btn.className = "chip" + (state.groups.has(g.id) ? " on" : "");
      btn.innerHTML = `<span>${g.emoji} ${g.name}</span><span class="chip-count">${count}</span><span class="chip-check">✓</span>`;
      btn.addEventListener("click", () => toggleGroup(g.id));
      chipsEl.appendChild(btn);
    }
    updatePoolCount();
  }

  function toggleGroup(id) {
    if (state.groups.has(id)) {
      if (state.groups.size === 1) {
        chipsEl.classList.remove("shake");
        void chipsEl.offsetWidth;
        chipsEl.classList.add("shake");
        toast("至少保留一个城市分组");
        return;
      }
      state.groups.delete(id);
    } else {
      state.groups.add(id);
    }
    save(LS_GROUPS, [...state.groups]);
    renderChips();
    mountGame(state.game); // 候选池变化，重建当前游戏
  }

  function updatePoolCount() {
    const n = pool().length;
    const text = `候选 ${n} 座城市`;
    document.getElementById("pool-count").textContent = text;
    document.getElementById("nav-pool").textContent = text;
  }

  /* ---------- 游戏切换 ---------- */
  function renderTabs() {
    tabsEl.innerHTML = "";
    for (const id of GAME_ORDER) {
      const game = GAMES[id];
      const btn = document.createElement("button");
      btn.role = "tab";
      btn.className = id === state.game ? "on" : "";
      btn.innerHTML = `<span class="seg-icon">${game.icon}</span>${game.name}`;
      btn.addEventListener("click", () => {
        if (state.game === id) return;
        state.game = id;
        renderTabs();
        mountGame(id);
      });
      tabsEl.appendChild(btn);
    }
  }

  const gameCtx = {
    getPool: pool,
    pick() {
      const p = pool();
      return p[(Math.random() * p.length) | 0];
    },
    onResult: handleResult,
  };

  function mountGame(id) {
    for (const gid of GAME_ORDER) GAMES[gid].unmount?.();
    stage.classList.remove("game-enter");
    void stage.offsetWidth;
    stage.classList.add("game-enter");
    GAMES[id].mount(stage, gameCtx);
  }

  /* ---------- 抽选结果与历史 ---------- */
  function handleResult(city) {
    state.history.unshift({ id: city.id, t: Date.now() });
    state.history = state.history.slice(0, 30);
    save(LS_HISTORY, state.history);
    renderHistory();
    Confetti.burst();
    showCity(city);
  }

  function showCity(city) {
    CityCard.show(city, {
      onAgain: () => GAMES[state.game].spin?.(),
      onSwitch: () => {
        const next = GAME_ORDER[(GAME_ORDER.indexOf(state.game) + 1) % GAME_ORDER.length];
        state.game = next;
        renderTabs();
        mountGame(next);
        document.getElementById("game-tabs").scrollIntoView({ behavior: "smooth", block: "center" });
      },
    });
  }

  function renderHistory() {
    const items = state.history.filter((h) => cityById.has(h.id));
    historySection.hidden = items.length === 0;
    historyList.innerHTML = "";
    for (const h of items) {
      const city = cityById.get(h.id);
      const chip = document.createElement("button");
      chip.className = "history-chip";
      const time = new Date(h.t);
      const hh = String(time.getHours()).padStart(2, "0");
      const mm = String(time.getMinutes()).padStart(2, "0");
      chip.innerHTML = `<span>${city.emoji} ${city.name}</span><time>${hh}:${mm}</time>`;
      chip.addEventListener("click", () => CityCard.show(city, {}));
      historyList.appendChild(chip);
    }
  }

  document.getElementById("clear-history").addEventListener("click", () => {
    state.history = [];
    save(LS_HISTORY, []);
    renderHistory();
    toast("历史已清空");
  });

  /* ---------- 启动 ---------- */
  renderChips();
  renderTabs();
  mountGame(state.game);
  renderHistory();
})();
