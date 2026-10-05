/* Nav-Buddy: offline study app. No login, no payments. Progress lives in this browser only. */
(function () {
  "use strict";
  const C = window.CONTENT;
  const M = C.modules.slice().sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
  const byId = Object.fromEntries(M.map(m => [m.id, m]));
  const allQ = M.flatMap(m => m.quiz.map(q => Object.assign({ mod: m.id }, q)));
  const qById = Object.fromEntries(allQ.map(q => [q.id, q]));
  const $ = s => document.querySelector(s);
  const view = $("#view");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PAPER_ORDER = ["TCN", "CN", "BE", "MET", "CHS", "SCS", "OR", "SIG"];

  /* ---------- storage (per browser) ---------- */
  const KEY = "smb.v1";
  let S = { read: {}, bm: {}, quiz: {}, theme: "" };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* private mode */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  /* ---------- theme ---------- */
  function applyTheme() { if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme; }
  applyTheme();
  $("#themeBtn").onclick = () => {
    const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    S.theme = dark ? "light" : "dark"; save(); applyTheme();
  };

  /* ---------- helpers ---------- */
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const paperName = p => (p === "OR" ? "Orals" : C.papers[p] || p);
  function modStats(m) {
    const n = m.quiz.length; let seen = 0, right = 0;
    m.quiz.forEach(q => { const r = S.quiz[q.id]; if (r) { seen++; if (r.last) right++; } });
    return { n, seen, right, read: !!S.read[m.id] };
  }
  function overall() {
    let seen = 0, right = 0; allQ.forEach(q => { const r = S.quiz[q.id]; if (r) { seen++; if (r.last) right++; } });
    return { modules: M.length, read: M.filter(m => S.read[m.id]).length, q: allQ.length, seen, right };
  }
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  function markDay() { S.days = S.days || {}; S.days[dayKey()] = (S.days[dayKey()] || 0) + 1; }
  function streak() { const days = S.days || {}; let n = 0; const d = new Date(); if (!days[dayKey(d)]) d.setDate(d.getDate() - 1); while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }
  const bar = p => `<div class="bar"><i style="width:${Math.min(100, p)}%"></i></div>`;
  let ACTIVE = "home";
  function setTab(t) { ACTIVE = t; if (typeof renderSidebar === "function") renderSidebar(t); }
  function title(t) { document.title = t ? `${t} | Nav-Buddy` : "Nav-Buddy"; }
  function moduleRow(m) {
    const st = modStats(m);
    const badge = st.read ? '<span class="pill ok">read</span>' : "";
    const qb = st.n ? `<span class="pill ${st.seen ? (pct(st.right, st.seen) >= 70 ? "ok" : "warn") : ""}">${st.seen ? pct(st.right, st.seen) + "% · " : ""}${st.n} Q</span>` : "";
    const qa = m.qa ? `<span class="pill">${m.qa.length} answers</span>` : "";
    return `<a class="row" href="#/m/${m.id}"><span class="grow"><span class="id">${m.id}</span><br>${esc(m.title)}</span>${badge} ${qb} ${qa}</a>`;
  }

  /* ---------- views ---------- */
  /* simple line icons for the UI (not content diagrams) */
  const IC = {
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    check: '<path d="M4 12l5 5L20 6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    file: '<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6"/>', calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
    hash: '<path d="M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16"/>', anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M7 11h10M4 14a8 8 0 0 0 16 0"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', ship: '<path d="M3 17l2 4h14l2-4zM6 17V9h12v8M12 3v6"/>',
    light: '<circle cx="12" cy="10" r="5"/><path d="M9 18h6M10 21h4M12 2v1M4 10H3M21 10h-1"/>', flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    scale: '<path d="M12 3v18M5 7h14M5 7l-3 7h6zM19 7l-3 7h6z"/>', repeat: '<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2M20 4v4h-4M4 20v-4h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', sigma: '<path d="M18 5H6l6 7-6 7h12"/>', play: '<path d="M7 4l12 8-12 8z"/>',
  };
  const icon = (k, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[k] || ""}</svg>`;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  function tiles(items) {
    return `<div class="tiles">${items.map(([href, ic, t, sub, badge]) => `<a class="ftile" href="${href}"><span class="ficon">${icon(ic)}</span><span class="ftext"><b>${t}</b><span>${sub}</span></span>${badge ? `<span class="pill">${badge}</span>` : ""}</a>`).join("")}</div>`;
  }

  /* ---------- study tree: function -> written / oral -> category -> topics ---------- */
  const g = (pfx, nums) => nums.map(n => `${pfx}-${String(n).padStart(2, "0")}`);
  const TREE = {
    F1: {
      icon: "anchor", short: "Navigation",
      written: [
        { p: "TCN", groups: [["Passage planning", g("F1-TCN", [1])], ["Position fixing", g("F1-TCN", [2, 3, 4])], ["Sailings, day's work and currents", g("F1-TCN", [5, 6, 7])], ["Tides", g("F1-TCN", [8])], ["Charts, publications and buoyage", g("F1-TCN", [9, 10])]] },
        { p: "CN", groups: [["Foundations: solar system, sphere, time", g("F1-CN", [1, 2, 3])], ["Sextant and altitude corrections", g("F1-CN", [4])], ["Position by sights", g("F1-CN", [6, 7, 8, 10, 11])], ["Compass error by sights", g("F1-CN", [9])], ["Twilight and polar phenomena", g("F1-CN", [5])]] },
        { p: "BE", groups: [["Compasses", g("F1-BE", [1, 2])], ["Navigation equipment", g("F1-BE", [3, 4, 5, 6, 7, 8])], ["Watchkeeping and bridge procedures", g("F1-BE", [9, 11, 12])], ["Emergencies, SAR and ship handling", g("F1-BE", [10, 13, 14])]] },
        { p: "MET", groups: [["Observations, instruments and reports", g("F1-MET", [1, 2, 4])], ["Atmosphere and wind", g("F1-MET", [3, 5])], ["Clouds, fog and weather systems", g("F1-MET", [6, 8])], ["Tropical revolving storms", g("F1-MET", [9])], ["Oceans, ice and weather routeing", g("F1-MET", [7, 10])]] },
      ],
      oral: [["COLREG rules", g("F1-OR", [1, 2, 3, 4, 5, 6, 7])], ["Lights, shapes and situations", g("F1-OR", [8, 9])], ["Signals and GMDSS", g("F1-OR", [10, 14])], ["Watchkeeping, emergencies, radar", g("F1-OR", [11, 12, 13])], ["Surveyor Q&A bank", g("F1-OR", [15])]],
      wtools: [["#/tools", "calc", "Calculators", "sailings, sights, tides"], ["#/numgen", "hash", "Numericals", "endless practice problems"], ["#/formulas", "sigma", "Formula sheet", "all working formulas"], ["#/buoyage", "anchor", "IALA buoyage", "marks and lights"]],
      otools: [["#/oralsim/F1", "mic", "Oral simulator", "mock F1 oral"], ["#/ror", "light", "Lights & shapes", "card trainer"], ["#/situations", "ship", "Collision situations", "who gives way"], ["#/colreg", "search", "Rule finder", "COLREG in plain words"], ["#/flags", "flag", "Signal flags", "A to Z"]],
    },
    F2: {
      icon: "ship", short: "Cargo",
      written: [
        { p: "CHS", groups: [["Cargo calculations", g("F2-CHS", [1, 2, 4])], ["Cargo gear", g("F2-CHS", [3])], ["Tankers, chemical and gas carriers", g("F2-CHS", [5, 6])], ["Dangerous goods and bulk cargoes", g("F2-CHS", [7, 8])], ["Containers, Ro-Ro and cargo securing", g("F2-CHS", [9, 10])], ["Cargo care and documents", g("F2-CHS", [11, 12])]] },
      ],
      oral: [["Cargo watch and preparation", g("F2-OR", [1, 2])], ["Tankers and dangerous goods", g("F2-OR", [3, 4])], ["Surveyor Q&A bank", g("F2-OR", [5])]],
      wtools: [["#/tools", "calc", "Calculators", "cargo and stability"], ["#/numgen", "hash", "Numericals", "endless practice problems"], ["#/formulas", "sigma", "Formula sheet", "all working formulas"]],
      otools: [["#/oralsim/F2", "mic", "Oral simulator", "mock F2 oral"]],
    },
    F3: {
      icon: "scale", short: "Ship operation",
      written: [
        { p: "SCS", groups: [["Stability", g("F3-SCS", [3, 1, 2])], ["Ship construction", g("F3-SCS", [8, 4])], ["Safety and pollution prevention", g("F3-SCS", [6, 5, 7])], ["Law, leadership and the human element", g("F3-SCS", [9, 10])]] },
      ],
      oral: [["Stability", g("F3-OR", [1])], ["Life-saving and fire-fighting", g("F3-OR", [2, 3])], ["Pollution prevention", g("F3-OR", [4])], ["Certificates, security and amendments", g("F3-OR", [5, 7, 8])], ["Medical care", g("F3-OR", [6])], ["Surveyor Q&A bank", g("F3-OR", [9])]],
      wtools: [["#/tools", "calc", "Calculators", "stability and trim"], ["#/numgen", "hash", "Numericals", "endless practice problems"], ["#/formulas", "sigma", "Formula sheet", "all working formulas"]],
      otools: [["#/oralsim/F3", "mic", "Oral simulator", "mock F3 oral"]],
    },
  };
  const ids = arr => arr.filter(id => byId[id]);
  const fWritten = f => TREE[f].written.flatMap(w => w.groups.flatMap(x => ids(x[1])));
  const fOral = f => TREE[f].oral.flatMap(x => ids(x[1]));
  const paperIds = (f, p) => TREE[f].written.find(w => w.p === p).groups.flatMap(x => ids(x[1]));
  function setStats(list) {
    let n = 0, seen = 0, right = 0, read = 0;
    list.forEach(id => { const s = modStats(byId[id]); n += s.n; seen += s.seen; right += s.right; if (s.read) read++; });
    return { topics: list.length, n, seen, right, read, done: pct(read, list.length) };
  }
  const statLine = s => `${plural(s.topics, "topic")} · ${s.n} Q${s.seen ? ` · ${pct(s.right, s.seen)}% right` : ""}`;
  const crumbs = items => `<nav class="crumbs">${items.map(([h, l], i) => i < items.length - 1 ? `<a href="${h}">${esc(l)}</a>` : `<span>${esc(l)}</span>`).join('<span class="sep">›</span>')}</nav>`;
  /* Elec-Buddy style: section header, big welcome cards, topic card grids */
  const DESC = {
    F1: { w: "Study notes, numericals and past papers for the four F1 papers: Terrestrial & Coastal, Celestial, Bridge Equipment & Watchkeeping, and Meteorology.", o: "Notes, quizzes and surveyor Q&A for the F1 oral: COLREG, lights and situations, signals, GMDSS and watchkeeping.", home: "Terrestrial, coastal and celestial navigation, bridge equipment, watchkeeping, meteorology and the COLREG oral." },
    F2: { w: "Study notes, numericals and past papers for Cargo Handling & Stowage.", o: "Notes, quizzes and surveyor Q&A for the F2 oral: cargo watch, hold preparation, tankers and dangerous goods.", home: "Cargo calculations, cargo gear, tankers, dangerous goods, bulk, containers and cargo care." },
    F3: { w: "Study notes, numericals and past papers for Ship Construction & Stability.", o: "Notes, quizzes and surveyor Q&A for the F3 oral: stability, LSA, fire-fighting, pollution, certificates, medical and security.", home: "Stability and trim, ship construction, safety, pollution prevention, maritime law and leadership." },
  };
  const secHead = (ic, h, sub) => `<div class="sec-head"><span class="sec-ic">${icon(ic)}</span><h1>${h}</h1><p>${sub}</p></div>`;
  const back = (href, label) => `<a class="anc-btn" href="${href}">‹ ${esc(label)}</a>`;
  function wcard(href, ic, h, p, badge, tone) {
    return `<a class="welcome-card" href="${href}"><span class="wc-icon">${icon(ic)}</span><h3>${h}</h3><p>${p}</p>${badge ? `<span class="wc-badge ${tone || ""}">${badge}</span>` : ""}</a>`;
  }
  function topicCard(id, mode) {
    const m = byId[id], st = modStats(m);
    const href = mode === "quiz" ? `#/quiz/m:${id}` : `#/m/${id}`;
    const short = m.title.split(":")[0];
    let line, fill;
    if (mode === "quiz") { line = st.seen ? `${st.seen}/${st.n} tried · ${pct(st.right, st.seen)}% correct` : `${st.n} questions · not started`; fill = pct(st.seen, st.n); }
    else { line = (st.read ? "Read" : "Not started yet") + (st.n ? ` · ${st.n} quiz questions` : ""); fill = st.read ? 100 : 0; }
    return `<a class="qcat-btn" href="${href}" data-s="${esc((m.id + " " + m.title).toLowerCase())}"><span class="cat-id">${m.id}</span><span class="cat-name">${esc(short)}</span><span class="cat-count">${line}</span><span class="cat-bar"><i style="width:${fill}%"></i></span></a>`;
  }
  function catGrids(groups, mode) {
    return groups.map(([name, list]) => { const l = ids(list); if (!l.length) return ""; return `<div class="cat-block"><div class="cat-label">${esc(name)}</div><div class="qcat-grid">${l.map(id => topicCard(id, mode)).join("")}</div></div>`; }).join("");
  }
  const homeCards = () => `<div class="welcome-grid">${["F1", "F2", "F3"].map(f => {
      const s = setStats(fWritten(f).concat(fOral(f)));
      return wcard(`#/f/${f}`, TREE[f].icon, `Function ${f[1]}: ${esc(C.funcs[f])}`, DESC[f].home, `${s.topics} topics · ${s.read} read`);
    }).join("")}${wcard("#/f/SIG", "light", "Signals: Morse", "Morse by flashing light for the signals examination, with a light trainer and a code quiz.", "Morse trainer", "green")}</div>`;
  const ORAL_BANK = { F1: "F1-OR-15", F2: "F2-OR-05", F3: "F3-OR-09" };
  function picker(f, kind, mode) {
    const T = TREE[f], fname = `Function ${f[1]}`, sect = kind === "written" ? "Written" : "Oral";
    const isQuiz = mode === "quiz";
    let body = "";
    if (kind === "written") {
      body = T.written.map(w => `${T.written.length > 1 ? `<h2 class="paper-head">${esc(paperName(w.p))}${isQuiz ? ` <a class="anc-btn sm" href="#/quiz/p:${w.p}">Paper mock test</a>` : ""}</h2>` : ""}${catGrids(w.groups, mode)}`).join("");
    } else {
      body = catGrids(T.oral.filter(x => !(x[1].length === 1 && x[1][0] === ORAL_BANK[f])), mode);
    }
    const all = isQuiz ? `<a class="qcat-btn all-btn" href="#/quiz/${kind === "written" ? "fw" : "fo"}:${f}"><span class="cat-name">All ${fname} ${sect.toLowerCase()} questions</span><span class="cat-count">${kind === "written" ? "30 random questions, 30 minutes" : "20 random oral questions"}</span></a>` : "";
    view.innerHTML = `<div class="pick-head">${back(`#/f/${f}/${kind}`, `${sect} section`)}<h2>${isQuiz ? "Quiz Practice" : "Study Notes"}: select topic</h2></div>
      <input class="pick-search" type="search" placeholder="Search ${fname} ${sect.toLowerCase()} topics…" id="pickq">
      ${all ? `<div class="qcat-grid">${all}</div>` : ""}${body}`;
    $("#pickq").oninput = e => { const v = e.target.value.trim().toLowerCase(); view.querySelectorAll(".qcat-btn[data-s]").forEach(c => c.hidden = v && !c.dataset.s.includes(v)); view.querySelectorAll(".cat-block").forEach(bk => bk.hidden = ![...bk.querySelectorAll(".qcat-btn")].some(c => !c.hidden)); };
  }
  function hub(f, kind, sub) {
    if (f === "SIG") {
      setTab("SIG"); title("Signals");
      const sq = byId["SIG-01"].quiz.length;
      view.innerHTML = `${back("#/", "Home")}${secHead("light", "Signals: Morse", "2nd Mate (FG) CoC · signals examination · Morse by flashing light")}
        <div class="welcome-grid">${wcard("#/m/SIG-01", "book", "Study Notes", "The Morse alphabet and numerals, procedure signals and how the signals exam is run.", "2 topics")}
        ${wcard("#/morse", "light", "Morse Trainer", "Read single characters and five-letter groups flashed at exam speed.", "Light trainer", "green")}
        ${wcard("#/quiz/m:SIG-01", "check", "Quiz Practice", "Drill the code: letters, numerals and procedure signals.", `${sq} questions`, "purple")}
        ${wcard("#/flags", "flag", "Signal Flags", "International Code flags A to Z with their single-letter meanings.", "A to Z")}</div>`;
      return;
    }
    const T = TREE[f]; if (!T) return notFound();
    setTab(f);
    const fname = `Function ${f[1]}`;
    if (!kind) {
      title(fname);
      const sw = setStats(fWritten(f)), so = setStats(fOral(f));
      view.innerHTML = `${back("#/", "Home")}${secHead(T.icon, `${fname}: ${esc(C.funcs[f])}`, `2nd Mate (FG) CoC · ${sw.topics} written topics · ${so.topics} oral topics`)}
        <div class="welcome-grid">${wcard(`#/f/${f}/written`, "file", "Written Preparation", DESC[f].w, `${T.written.length > 1 ? T.written.length + " papers · " : ""}${sw.topics} topics`)}
        ${wcard(`#/f/${f}/oral`, "mic", "Oral Preparation", DESC[f].o, `${so.topics} topics`, "purple")}</div>`;
      return;
    }
    if (kind === "written") {
      if (sub === "notes" || sub === "quiz") { title(`${fname} written`); return picker(f, "written", sub); }
      if (sub && T.written.some(w => w.p === sub)) { location.replace(`#/f/${f}/written/notes`); return; }
      title(`${fname} written`);
      const s = setStats(fWritten(f));
      view.innerHTML = `${back(`#/f/${f}`, fname)}${secHead("file", `${fname}: Written Section`, T.written.map(w => esc(paperName(w.p))).join(" · "))}
        <div class="welcome-grid">${wcard(`#/f/${f}/written/notes`, "book", "Study Notes", "Structured notes, key theory and worked examples, grouped by the topic categories of each paper.", `${s.topics} topics ready`)}
        ${wcard(`#/f/${f}/written/quiz`, "check", "Quiz Practice", "Drill questions by topic or take a timed mock test. Instant feedback with explanations.", `${s.n} questions`, "green")}
        ${wcard("#/numgen", "hash", "Numericals", "Exam-style numerical problems, generated fresh each time, with step-by-step solutions.", "Endless problems", "purple")}
        ${wcard("#/tools", "calc", "Calculators", "Check your working: sailings, sights, tides, cargo, stability and trim.", "17 tools")}
        ${wcard("#/papers", "file", "Past Papers", "Real MMD question papers, searchable, each question tagged to its topic.", "351 papers", "orange")}
        ${wcard("#/exam", "clock", "Exam Mode", "Sit a real past paper against the clock, then mark yourself.", "Timed")}</div>`;
      return;
    }
    if (kind === "oral") {
      if (sub === "notes" || sub === "quiz") { title(`${fname} oral`); return picker(f, "oral", sub); }
      title(`${fname} oral`);
      const s = setStats(fOral(f)), bank = byId[ORAL_BANK[f]];
      const extra = f === "F1" ? [wcard("#/ror", "light", "Lights & Shapes", "ROR card trainer: identify vessels by their lights, shapes and signals.", `${(byId["F1-OR-08"].extras.cards.cards || []).length} cards`), wcard("#/situations", "ship", "Collision Situations", "Random encounters: decide who gives way and what action to take.", "Scenario trainer", "green"), wcard("#/colreg", "search", "Rule Finder", "Every COLREG rule and annex in plain words.", "Rules 1 to 41"), wcard("#/flags", "flag", "Signal Flags", "International Code flags A to Z.", "A to Z")] : [];
      view.innerHTML = `${back(`#/f/${f}`, fname)}${secHead("mic", `${fname}: Oral Section`, `2nd Mate (FG) CoC · ${s.topics} topics · surveyor's oral examination`)}
        <div class="welcome-grid">${wcard(`#/f/${f}/oral/notes`, "book", "Study Notes", "Oral notes for each topic, written the way a surveyor expects the answer.", `${s.topics - 1} topics ready`)}
        ${wcard(`#/f/${f}/oral/quiz`, "check", "Quiz Practice", "Drill oral questions by topic, with explanations after each answer.", `${s.n} questions`, "green")}
        ${bank && bank.qa ? wcard(`#/m/${bank.id}/qa`, "anchor", "Surveyor Q&A", "Real recollected MMD surveyor questions with model answers, cross-checked against the rules.", `${bank.qa.length} questions`, "purple") : ""}
        ${wcard(`#/oralsim/${f}`, "mic", "Oral Simulator", "A mock oral: answer aloud, reveal the model answer and mark yourself.", "Mock oral", "orange")}
        ${extra.join("")}</div>`;
      return;
    }
    notFound();
  }
  const branchOf = m => m.f === "SIG" ? [["#/f/SIG", "Signals"]] : m.paper === "OR" ? [[`#/f/${m.f}`, `Function ${m.f[1]}`], [`#/f/${m.f}/oral`, "Oral"], [`#/f/${m.f}/oral/notes`, "Study Notes"]] : [[`#/f/${m.f}`, `Function ${m.f[1]}`], [`#/f/${m.f}/written`, "Written"], [`#/f/${m.f}/written/notes`, "Study Notes"]];

  /* ---------- sidebar (desktop) / drawer (mobile), as in Elec-Buddy ---------- */
  function renderSidebar(active) {
    const sb = $("#sidebar"); if (!sb) return;
    const item = (href, ic, label, key, cls = "") => `<a class="sb-item ${cls} ${active === key ? "active" : ""}" href="${href}">${icon(ic)}<span class="label">${label}</span></a>`;
    const fn = f => {
      const open = active === f;
      return item(`#/f/${f}`, TREE[f].icon, `Function ${f[1]}<small>${esc(TREE[f].short)}</small>`, f) + (open ? item(`#/f/${f}/written`, "file", "Written", "", "sub") + item(`#/f/${f}/oral`, "mic", "Oral", "", "sub") : "");
    };
    sb.innerHTML = `<div class="sb-brand">Nav-<b>Buddy</b><small>2ND MATE EXAM PREP</small></div><div class="sb-section">Navigation</div>${item("#/", "play", "Home", "home")}
      <div class="sb-section">Functions</div>${["F1", "F2", "F3"].map(fn).join("")}${item("#/f/SIG", "light", "Signals<small>Morse</small>", "SIG")}
      <div class="sb-section">Practice</div>${item("#/practice", "check", "Quiz Bank", "practice")}${item("#/papers", "file", "Past Papers", "papers")}${item("#/exam", "clock", "Exam Mode", "exam")}${item("#/tools", "calc", "Calculators", "tools")}
      <div class="sb-section">My study</div>${item("#/progress", "scale", "Progress & planner", "progress")}${item("#/bookmarks", "book", "Bookmarks", "bookmarks")}${item("#/more", "search", "More", "more")}
      <div class="sb-foot small muted">Free · offline · no account</div>`;
  }
  const closeDrawer = () => document.body.classList.remove("drawer");
  $("#menuBtn").onclick = () => document.body.classList.toggle("drawer");
  $("#scrim").onclick = closeDrawer;

  function nextExam() {
    const plan = S.plan || {}; const today = new Date(); today.setHours(0, 0, 0, 0); let best = null;
    Object.entries(plan).forEach(([p, d]) => { if (!d) return; const days = Math.ceil((new Date(d) - today) / 864e5); if (days >= 0 && (!best || days < best.days)) best = { p, days }; });
    return best;
  }
  function home() {
    setTab("home"); title("");
    const last = S.lastModule && byId[S.lastModule];
    const due = window.NB_SRS ? window.NB_SRS.due(S).length : 0;
    const ne = nextExam();
    view.innerHTML = `<div class="welcome"><h1>Nav-<span>Buddy</span></h1>
      <p>2nd Mate (FG) CoC preparation. Your complete guide to the written, oral and signals examinations. Free, offline, no account.</p>
      ${homeCards()}
      <div class="home-strip">
        ${last ? `<a class="strip-item" href="#/m/${last.id}">${icon("play", "accent")}<span><span class="small muted">Continue reading</span><b>${esc(last.title.split(":")[0])}</b></span></a>` : ""}
        ${due ? `<a class="strip-item" href="#/quiz/review">${icon("repeat", "accent")}<span><span class="small muted">Spaced repetition</span><b>${plural(due, "question")} due</b></span></a>` : ""}
        <a class="strip-item" href="#/progress">${icon("clock", "accent")}<span><span class="small muted">${ne ? "Next exam" : "Exam dates"}</span><b>${ne ? (ne.days === 0 ? "Today" : plural(ne.days, "day") + " to go") : "Set your plan"}</b></span></a>
        <a class="strip-item" href="#/quiz/daily">${icon("check", "accent")}<span><span class="small muted">Quick practice</span><b>Daily 10</b></span></a>
      </div></div>`;
  }

  function study() { location.replace("#/"); }

  function moduleView(id, tab) {
    const m = byId[id]; if (!m) return notFound();
    setTab(m.f); title(m.title);
    S.lastModule = id; save();
    const tabs = [["notes", "Notes"]];
    if (m.quiz.length) tabs.push(["quiz", `Quiz (${m.quiz.length})`]);
    if (m.qa) tabs.push(["qa", `Surveyor Q&A (${m.qa.length})`]);
    if (m.extras && m.extras.cards) tabs.push(["cards", "Card trainer"]);
    if (m.extras && m.extras.numericals) tabs.push(["numericals", "Numericals"]);
    if (m.extras && (m.extras.morse || m.extras.drills)) tabs.push(["morse", "Trainer"]);
    tab = tabs.some(t => t[0] === tab) ? tab : "notes";
    const st = modStats(m);
    let body = "";
    if (tab === "notes") {
      const idx = M.indexOf(m), prev = M[idx - 1], next = M[idx + 1];
      body = `<nav class="note-anchors" id="anchors"></nav><div class="seg fontseg"><span class="small muted" style="align-self:center">Text size</span>${["S", "M", "L"].map(z => `<button class="${(S.font || "M") === z ? "on" : ""}" data-z="${z}">${z}</button>`).join("")}</div>
        <article class="notes font-${S.font || "M"}">${m.html}</article>
        <div class="btns"><button class="btn ${st.read ? "ghost" : ""}" id="markRead">${st.read ? "✓ Marked as read" : "Mark as read"}</button>
        ${m.quiz.length ? `<a class="btn ghost" href="#/quiz/m:${m.id}">Take the quiz</a>` : ""}</div>
        <div class="prevnext">${prev ? `<a class="tile" href="#/m/${prev.id}"><span class="small muted">‹ Previous</span><span class="t">${esc(prev.title.split(":")[0])}</span></a>` : "<span></span>"}${next ? `<a class="tile" href="#/m/${next.id}" style="text-align:right"><span class="small muted">Next ›</span><span class="t">${esc(next.title.split(":")[0])}</span></a>` : ""}</div>`;
    } else if (tab === "quiz") {
      body = `<div class="card"><p>${m.quiz.length} questions. ${st.seen ? `You've tried ${st.seen}; last-attempt accuracy ${pct(st.right, st.seen)}%.` : "Not tried yet."}</p>
        <div class="btns"><a class="btn" href="#/quiz/m:${m.id}">Start quiz</a>${st.seen - st.right > 0 ? `<a class="btn ghost" href="#/quiz/mw:${m.id}">Retry my mistakes (${st.seen - st.right})</a>` : ""}</div></div>`;
    } else if (tab === "qa") {
      body = qaList(m.qa);
    } else if (tab === "cards") { location.hash = "#/ror"; return; }
    else if (tab === "numericals") { location.hash = "#/numericals"; return; }
    else if (tab === "morse") { location.hash = "#/morse"; return; }
    const bm = S.bm["m:" + id];
    const [tt, ...rest] = m.title.split(":");
    view.innerHTML = `${crumbs([["#/", "Home"], ...branchOf(m), ["", m.id]])}
      <div class="note-title"><div class="nt-top"><span class="tag tag-blue">${m.id}</span><button class="nt-bm" id="bmBtn" aria-label="Bookmark">${bm ? "★" : "☆"}</button></div>
        <h1>${esc(tt)}</h1>${rest.length ? `<div class="nt-sub2">${esc(rest.join(":").trim())}</div>` : ""}
        <div class="sub">${esc(m.exam)}</div>
        <div class="tags"><span class="tag tag-purple">${m.f === "SIG" ? "Signals" : "Function " + m.f[1]}</span><span class="tag tag-green">${m.paper === "OR" ? "Oral" : m.f === "SIG" ? "Morse" : esc(paperName(m.paper))}</span>${m.freq ? `<span class="tag tag-red">🔥 Asked in ${m.freq.papers} past papers</span><span class="tag tag-orange">Last asked ${m.freq.last.split("-").reverse().join("/")}</span>` : ""}${st.read ? '<span class="tag tag-green">✓ Read</span>' : ""}</div></div>
      <div class="seg">${tabs.map(t => `<button class="${t[0] === tab ? "on" : ""}" data-t="${t[0]}">${t[1]}</button>`).join("")}</div>${body}`;
    view.querySelectorAll(".seg button").forEach(b => b.onclick = () => { location.hash = `#/m/${id}/${b.dataset.t}`; });
    const mr = $("#markRead"); if (mr) mr.onclick = () => { if (S.read[id]) delete S.read[id]; else { S.read[id] = Date.now(); markDay(); } save(); moduleView(id, tab); };
    view.querySelectorAll("[data-z]").forEach(b => b.onclick = () => { S.font = b.dataset.z; save(); moduleView(id, tab); });
    const art = view.querySelector("article.notes");
    if (art && window.NB_formatNotes) {
      const anc = window.NB_formatNotes(art), nav = $("#anchors");
      if (nav && anc.length > 1) { nav.innerHTML = `<span>Jump to section</span>${anc.map(([i, l]) => `<button class="anc-btn" data-j="${i}">${esc(l)}</button>`).join("")}`; nav.querySelectorAll("[data-j]").forEach(b => b.onclick = () => document.getElementById(b.dataset.j).scrollIntoView({ behavior: "smooth", block: "start" })); }
      else if (nav) nav.remove();
    }
    $("#bmBtn").onclick = () => { if (S.bm["m:" + id]) delete S.bm["m:" + id]; else S.bm["m:" + id] = Date.now(); save(); moduleView(id, tab); };
    wireQa();
  }

  function qaList(items, filter) {
    const topics = [...new Set(items.map(x => x.topic))];
    return `<input class="answer-input" style="font-size:15px;letter-spacing:0;text-transform:none;text-align:left" id="qaFilter" placeholder="Filter questions…" value="${esc(filter || "")}">` +
      topics.map(t => `<h2>${esc(t)}</h2>` + items.filter(x => x.topic === t).map(x => `
      <details class="qa" data-text="${esc((x.q + " " + x.recalled.join(" ")).toLowerCase())}"><summary>${esc(x.q)}</summary><div class="body">
      <p class="rec">Asked as: ${x.recalled.map(r => "“" + esc(r) + "”").join(" · ")}${byId[x.module] ? ` · <a href="#/m/${x.module}">${x.module}</a>` : ""}</p>
      <div class="notes" style="box-shadow:none;border:0;padding:0">${x.answer}</div>
      <div class="btns"><button class="btn sm ghost" data-bm="${x.id}">${S.bm["qa:" + x.id] ? "★ Saved" : "☆ Save"}</button></div></div></details>`).join("")).join("");
  }
  function wireQa() {
    const f = $("#qaFilter");
    if (f) f.oninput = () => { const v = f.value.toLowerCase(); view.querySelectorAll("details.qa").forEach(d => { d.style.display = !v || d.dataset.text.includes(v) || d.textContent.toLowerCase().includes(v) ? "" : "none"; }); };
    view.querySelectorAll("[data-bm]").forEach(b => b.onclick = e => { e.preventDefault(); const k = "qa:" + b.dataset.bm; if (S.bm[k]) delete S.bm[k]; else S.bm[k] = Date.now(); save(); b.textContent = S.bm[k] ? "★ Saved" : "☆ Save"; });
  }

  /* ---------- quiz runner ---------- */
  let Q = null;
  function buildSet(scope) {
    const [kind, arg] = scope.split(":");
    if (kind === "m") return { name: byId[arg].title, items: shuffle(byId[arg].quiz.map(q => qById[q.id])) };
    if (kind === "mw") return { name: "Mistakes: " + byId[arg].title, items: shuffle(byId[arg].quiz.filter(q => S.quiz[q.id] && !S.quiz[q.id].last).map(q => qById[q.id])) };
    if (kind === "daily") return { name: "Daily 10", items: shuffle(allQ).slice(0, 10) };
    if (kind === "p") return { name: "Mock test: " + paperName(arg), items: shuffle(allQ.filter(q => byId[q.mod].paper === arg)).slice(0, 30), timed: 30 * 60 };
    if (kind === "f") return { name: "Mock test: " + arg + " " + C.funcs[arg], items: shuffle(allQ.filter(q => byId[q.mod].f === arg)).slice(0, 30), timed: 30 * 60 };
    if (kind === "fw") return { name: `Function ${arg[1]} written mock`, items: shuffle(allQ.filter(q => byId[q.mod].f === arg && byId[q.mod].paper !== "OR")).slice(0, 30), timed: 30 * 60 };
    if (kind === "fo") return { name: `Function ${arg[1]} oral quiz`, items: shuffle(allQ.filter(q => byId[q.mod].f === arg && byId[q.mod].paper === "OR")).slice(0, 20) };
    if (kind === "wrong") return { name: "All my mistakes", items: shuffle(allQ.filter(q => S.quiz[q.id] && !S.quiz[q.id].last)).slice(0, 40) };
    if (kind === "review") { const due = window.NB_SRS ? window.NB_SRS.due(S) : []; return { name: "Review (spaced repetition)", items: shuffle(due.map(id => qById[id]).filter(Boolean)).slice(0, 25) }; }
    if (kind === "unseen") return { name: "Unseen questions", items: shuffle(allQ.filter(q => !S.quiz[q.id])).slice(0, 20) };
    return null;
  }
  function startQuiz(scope) {
    const set = buildSet(scope);
    if (!set || !set.items.length) { view.innerHTML = `<div class="empty"><p>No questions here yet.</p><a class="btn" href="#/practice">Back to practice</a></div>`; return; }
    Q = { scope, name: set.name, items: set.items, i: 0, right: 0, answers: [], start: Date.now(), timed: set.timed || 0 };
    renderQ();
  }
  let timerId = null;
  function renderQ() {
    clearInterval(timerId);
    setTab("practice"); title(Q.name);
    if (Q.i >= Q.items.length) return quizSummary();
    const q = Q.items[Q.i];
    const opts = shuffle(q.opts);
    view.innerHTML = `<div class="progress-line"><span class="qname">${esc(Q.name)}</span><span id="qtimer" class="qcount">${Q.i + 1} / ${Q.items.length}</span></div>
      ${bar(pct(Q.i, Q.items.length))}
      <div class="qcard" style="margin-top:12px"><div class="small muted">${q.mod} · ${esc(byId[q.mod].title)}</div>
      <div class="qtext">${esc(q.q)}</div>
      ${opts.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join("")}
      <div id="after"></div></div>
      <div class="btns"><a class="btn ghost sm" href="#/practice" id="quit">End quiz</a></div>`;
    if (Q.timed) {
      const tick = () => {
        const left = Q.timed - Math.floor((Date.now() - Q.start) / 1000);
        const el = $("#qtimer"); if (!el) return clearInterval(timerId);
        if (left <= 0) { clearInterval(timerId); Q.i = Q.items.length; return quizSummary(true); }
        el.textContent = `${Q.i + 1} / ${Q.items.length} · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      };
      tick(); timerId = setInterval(tick, 1000);
    }
    view.querySelectorAll(".opt").forEach((b, i) => { b.onclick = () => answer(q, b); b.insertAdjacentHTML("afterbegin", `<span class="key">${i + 1}</span>`); });
    $("#quit").onclick = e => { e.preventDefault(); clearInterval(timerId); quizSummary(); };
  }
  function answer(q, btn) {
    const ok = btn.dataset.o === q.a;
    view.querySelectorAll(".opt").forEach(b => { b.disabled = true; if (b.dataset.o === q.a) b.classList.add("right"); });
    if (!ok) btn.classList.add("wrong");
    markDay();
    const r = S.quiz[q.id] || { n: 0, c: 0 }; r.n++; if (ok) r.c++; r.last = ok; r.t = Date.now();
    if (window.NB_SRS) window.NB_SRS.update(r, ok);
    S.quiz[q.id] = r; save();
    if (ok) Q.right++;
    Q.answers.push({ q, pick: btn.dataset.o, ok });
    $("#after").innerHTML = `<div class="exp"><b>${ok ? "Correct." : "Not quite."}</b> ${q.exp ? esc(q.exp) : ""}</div>
      <div class="btns"><button class="btn" id="next">${Q.i + 1 < Q.items.length ? "Next question" : "See result"}</button></div>`;
    $("#next").onclick = () => { Q.i++; renderQ(); };
    $("#next").focus();
  }
  function quizSummary(timeUp) {
    clearInterval(timerId);
    const n = Q.answers.length, p = pct(Q.right, n);
    view.innerHTML = `<h1>${esc(Q.name)}</h1>
      ${timeUp ? '<div class="banner">Time is up.</div>' : ""}
      <div class="grid"><div class="tile"><span class="big">${Q.right}/${n}</span><span class="t">Correct</span></div>
      <div class="tile"><span class="big">${p}%</span><span class="t">${p >= 70 ? "Pass standard" : "Keep practising"}</span>${bar(p)}</div></div>
      <div class="btns"><button class="btn" id="again">Try again</button><a class="btn ghost" href="#/practice">Practice menu</a></div>
      <h2>Review</h2>
      ${Q.answers.map(a => `<div class="card"><div class="small muted">${a.q.mod}</div><b>${esc(a.q.q)}</b>
        <p style="margin:6px 0">${a.ok ? '<span class="pill ok">correct</span>' : `<span class="pill bad">you chose: ${esc(a.pick)}</span>`} <span class="pill ok">answer: ${esc(a.q.a)}</span></p>
        ${a.q.exp ? `<p class="small muted" style="margin:0">${esc(a.q.exp)}</p>` : ""}</div>`).join("") || '<p class="muted">No questions answered.</p>'}`;
    $("#again").onclick = () => startQuiz(Q.scope);
  }

  function practice() {
    setTab("practice"); title("Practice");
    const o = overall();
    const wrong = allQ.filter(q => S.quiz[q.id] && !S.quiz[q.id].last).length;
    const papers = ["TCN", "CN", "BE", "MET", "CHS", "SCS"];
    view.innerHTML = `<h1>Practice</h1>
      <div class="grid">
        <a class="tile" href="#/quiz/daily"><span class="t">Daily 10</span><span class="small muted">random mix</span></a>
        <a class="tile" href="#/quiz/unseen"><span class="t">Unseen</span><span class="small muted">${o.q - o.seen} not tried yet</span></a>
        <a class="tile" href="#/quiz/wrong"><span class="t">My mistakes</span><span class="small muted">${wrong} to fix</span></a>
        <a class="tile" href="#/quiz/review"><span class="t">Review due</span><span class="small muted">${window.NB_SRS ? window.NB_SRS.due(S).length : 0} (spaced repetition)</span></a>
        <a class="tile" href="#/numgen"><span class="t">Numericals</span><span class="small muted">generated problems</span></a>
        <a class="tile" href="#/tools"><span class="t">Calculators</span><span class="small muted">sailings, sights, stability</span></a>
        <a class="tile" href="#/papers"><span class="t">Past papers</span><span class="small muted">browse and search</span></a>
        <a class="tile" href="#/exam"><span class="t">Exam mode</span><span class="small muted">timed real paper + review</span></a>
      </div>
      <h2>Mock tests (30 questions, 30 minutes)</h2>
      <div class="list">${papers.map(p => `<a class="row" href="#/quiz/p:${p}"><span class="grow">${esc(paperName(p))}</span><span class="pill">${allQ.filter(q => byId[q.mod].paper === p).length} Q pool</span></a>`).join("")}
      ${["F1", "F2", "F3"].map(f => `<a class="row" href="#/quiz/f:${f}"><span class="grow">${f} all topics incl. orals</span><span class="pill">${allQ.filter(q => byId[q.mod].f === f).length} Q pool</span></a>`).join("")}</div>
      <h2>By topic</h2><p class="muted">Every topic has its own quiz on its page in <a href="#/study">Study</a>.</p>`;
  }

  function orals() {
    setTab("orals"); title("Orals");
    const banks = M.filter(m => m.qa);
    view.innerHTML = `<h1>Orals</h1><p class="muted">Pick a function's oral, or use a trainer.</p>
      <div class="welcome-grid">${["F1", "F2", "F3"].map(f => wcard(`#/f/${f}/oral`, "mic", `Function ${f[1]} oral`, DESC[f].o, `${setStats(fOral(f)).topics} topics`, "purple")).join("")}</div>
      <h2>Trainers</h2>
      <div class="grid">${banks.map(m => `<a class="tile" href="#/m/${m.id}/qa"><span class="big">${m.qa.length}</span><span class="t">${m.f} surveyor Q&A</span><span class="small muted">model answers</span></a>`).join("")}
      <a class="tile" href="#/ror"><span class="t">Lights & shapes</span><span class="small muted">${(byId["F1-OR-08"].extras.cards.cards || []).length} cards</span></a>
      <a class="tile" href="#/oralsim"><span class="t">Oral simulator</span><span class="small muted">10-question mock oral</span></a>
      <a class="tile" href="#/colreg"><span class="t">Rule finder</span><span class="small muted">COLREG in plain words</span></a>
      <a class="tile" href="#/situations"><span class="t">Collision situations</span><span class="small muted">scenario trainer</span></a>
      <a class="tile" href="#/flags"><span class="t">Signal flags</span><span class="small muted">A–Z trainer</span></a>
      <a class="tile" href="#/buoyage"><span class="t">IALA buoyage</span><span class="small muted">marks & lights</span></a>
      <a class="tile" href="#/morse"><span class="t">Morse</span><span class="small muted">signals exam</span></a></div>
`;
  }

  /* ---------- ROR trainer ---------- */
  let R = null;
  function ror() {
    setTab("orals"); title("Lights & shapes");
    const deck = byId["F1-OR-08"].extras.cards.cards;
    if (!R) R = { filter: "all", order: shuffle(deck.map((_, i) => i)), i: 0, reveal: false, mode: "flash" };
    const pool = R.order.filter(i => R.filter === "all" || (deck[i].view || "night") === R.filter);
    if (R.i >= pool.length) R.i = 0;
    const c = deck[pool[R.i]];
    let quizHtml = "";
    if (R.mode === "quiz") {
      if (!R.opts || R.optsFor !== c.id) {
        const others = shuffle(deck.filter(x => x.vessel !== c.vessel)).slice(0, 3).map(x => x.vessel);
        R.opts = shuffle([c.vessel, ...others]); R.optsFor = c.id; R.picked = null;
      }
      quizHtml = R.opts.map(o => `<button class="opt ${R.picked ? (o === c.vessel ? "right" : o === R.picked ? "wrong" : "") : ""}" data-v="${esc(o)}" ${R.picked ? "disabled" : ""}>${esc(o)}</button>`).join("");
    }
    view.innerHTML = `<h1>Lights & shapes</h1>
      <div class="seg">${["all", "night", "day"].map(f => `<button class="${R.filter === f ? "on" : ""}" data-f="${f}">${f[0].toUpperCase() + f.slice(1)}</button>`).join("")}
      <span style="width:12px"></span>${["flash", "quiz"].map(md => `<button class="${R.mode === md ? "on" : ""}" data-md="${md}">${md === "flash" ? "Flashcards" : "Quiz"}</button>`).join("")}</div>
      <div class="ror-wrap">${window.ROR.render(c)}
      <div class="small muted">Card ${R.i + 1} of ${pool.length} · ${esc(c.id)} · ${c.view === "day" ? "Day" : "Night"}</div></div>
      <div class="qcard" style="margin-top:12px">
        <div class="qtext">What vessel is this, and what do you do?</div>
        ${R.mode === "quiz" ? quizHtml : ""}
        ${R.reveal || (R.mode === "quiz" && R.picked) ? `<div class="exp"><p style="margin:0 0 6px"><b>${esc(c.vessel)}</b></p>
          ${c.aspect ? `<p style="margin:0 0 6px"><b>Aspect:</b> ${esc(c.aspect)}</p>` : ""}
          <p style="margin:0 0 6px"><b>Action:</b> ${esc(c.action || "")}</p>
          ${c.fog_signal && c.fog_signal !== "-" ? `<p style="margin:0 0 6px"><b>Fog signal:</b> ${esc(c.fog_signal)}</p>` : ""}
          <p style="margin:0"><b>Rules:</b> ${esc((c.rules || []).join(", "))}</p></div>` : (R.mode === "flash" ? '<button class="btn" id="reveal">Show answer</button>' : "")}
      </div>
      <div class="btns"><button class="btn ghost" id="prev">‹ Previous</button><button class="btn" id="nxt">Next card ›</button><button class="btn ghost" id="shuf">Shuffle</button></div>
      <p class="small muted">Drawings are schematic: positions show which lights are visible from this aspect, not exact Annex I spacing. ${esc(byId["F1-OR-08"].extras.cards.about || "")}</p>`;
    view.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { R.filter = b.dataset.f; R.i = 0; R.reveal = false; ror(); });
    view.querySelectorAll("[data-md]").forEach(b => b.onclick = () => { R.mode = b.dataset.md; R.reveal = false; R.picked = null; ror(); });
    view.querySelectorAll("[data-v]").forEach(b => b.onclick = () => { R.picked = b.dataset.v; ror(); });
    const rv = $("#reveal"); if (rv) rv.onclick = () => { R.reveal = true; ror(); };
    $("#nxt").onclick = () => { R.i = (R.i + 1) % pool.length; R.reveal = false; R.picked = null; ror(); };
    $("#prev").onclick = () => { R.i = (R.i - 1 + pool.length) % pool.length; R.reveal = false; R.picked = null; ror(); };
    $("#shuf").onclick = () => { R.order = shuffle(R.order); R.i = 0; R.reveal = false; R.picked = null; ror(); };
  }

  /* ---------- Morse trainer ---------- */
  const code = byId["SIG-01"].extras.morse.code;
  let MS = { tab: "learn", wpm: 6, cur: null, score: 0, tries: 0 };
  function morse() {
    setTab("orals"); title("Morse trainer"); window.MORSE.stop();
    const tabs = [["learn", "Learn"], ["practice", "Practice"], ["exam", "Exam set"], ["table", "Code table"]];
    let body = "";
    if (MS.tab === "table") {
      body = `<div class="morse-grid">${Object.entries(code).map(([k, v]) => `<div><b>${k}</b>${v.replace(/\./g, "•").replace(/-/g, "▬")}</div>`).join("")}</div>`;
    } else if (MS.tab === "learn" || MS.tab === "practice") {
      body = `<div class="lamp" id="lamp"></div>
        <div class="btns" style="justify-content:center"><button class="btn" id="play">${MS.cur ? "Repeat" : "Flash a character"}</button><button class="btn ghost" id="newc">New character</button></div>
        <input class="answer-input" id="ans" maxlength="1" placeholder="?" autocomplete="off">
        <div id="res" style="text-align:center;margin-top:8px"></div>
        <p class="small muted" style="text-align:center">${MS.tab === "learn" ? "Learn mode shows the code after each answer." : "Practice mode: answer from the light only."} Score <span id="msScore">${MS.score}/${MS.tries}</span>.</p>`;
    } else {
      const sets = byId["SIG-02"].extras.drills.sets;
      MS.set = MS.set != null ? MS.set : Math.floor(Math.random() * sets.length);
      const s = sets[MS.set];
      body = `<p class="muted">Exam format: 60 single characters (1 mark each) and 8 five-letter groups (5 marks each, all five letters correct). Pass 70/100. Set ${s.id}.</p>
        <div class="lamp" id="lamp"></div>
        <div class="btns" style="justify-content:center"><button class="btn" id="runExam">Start flashing</button><button class="btn ghost" id="stopExam">Stop</button><button class="btn ghost" id="newSet">Different set</button></div>
        <p class="small muted">Type what you read: singles separated by spaces, then the 8 groups.</p>
        <textarea class="answer-input" id="examAns" rows="4" style="font-size:16px;letter-spacing:2px;text-align:left" placeholder="W G N 2 M … then groups"></textarea>
        <div class="btns"><button class="btn" id="mark">Mark my answers</button></div><div id="examRes"></div>`;
    }
    view.innerHTML = `<h1>Morse trainer</h1>
      <div class="seg">${tabs.map(t => `<button class="${MS.tab === t[0] ? "on" : ""}" data-mt="${t[0]}">${t[1]}</button>`).join("")}</div>
      <div class="seg"><span class="small muted" style="align-self:center">Speed</span>${[4, 6, 8, 10].map(w => `<button class="${MS.wpm === w ? "on" : ""}" data-w="${w}">${w} wpm</button>`).join("")}</div>
      ${body}`;
    view.querySelectorAll("[data-mt]").forEach(b => b.onclick = () => { MS.tab = b.dataset.mt; MS.cur = null; morse(); });
    view.querySelectorAll("[data-w]").forEach(b => b.onclick = () => { MS.wpm = +b.dataset.w; morse(); });
    const lamp = $("#lamp");
    if (MS.tab === "learn" || MS.tab === "practice") {
      const keys = Object.keys(code);
      const play = () => { if (!MS.cur) MS.cur = keys[Math.floor(Math.random() * keys.length)]; window.MORSE.flash(lamp, MS.cur, code, MS.wpm); $("#ans").focus(); };
      $("#play").onclick = play;
      $("#newc").onclick = () => { MS.cur = null; $("#res").innerHTML = ""; $("#ans").value = ""; play(); };
      $("#ans").oninput = e => {
        const v = e.target.value.toUpperCase(); if (!v || !MS.cur) return;
        MS.tries++; const ok = v === MS.cur; if (ok) MS.score++;
        $("#res").innerHTML = `${ok ? '<span class="pill ok">Correct</span>' : `<span class="pill bad">It was ${MS.cur}</span>`} ${MS.tab === "learn" ? `<span class="pill">${MS.cur} = ${code[MS.cur].replace(/\./g, "•").replace(/-/g, "▬")}</span>` : ""}`;
        MS.cur = null; e.target.value = ""; const sc = $("#msScore"); if (sc) sc.textContent = `${MS.score}/${MS.tries}`;
        setTimeout(() => { if (location.hash.startsWith("#/morse") && MS.tab !== "exam") play(); }, 1200);
      };
    } else if (MS.tab === "exam") {
      const s = byId["SIG-02"].extras.drills.sets[MS.set];
      $("#runExam").onclick = async () => {
        for (const ch of s.singles) { if (!location.hash.startsWith("#/morse")) return; await window.MORSE.flash(lamp, ch, code, MS.wpm); await new Promise(r => setTimeout(r, 2500)); }
        for (const g of s.groups) { if (!location.hash.startsWith("#/morse")) return; await window.MORSE.flash(lamp, g, code, MS.wpm); await new Promise(r => setTimeout(r, 4000)); }
      };
      $("#stopExam").onclick = () => window.MORSE.stop();
      $("#newSet").onclick = () => { MS.set = null; window.MORSE.stop(); morse(); };
      $("#mark").onclick = () => {
        const toks = $("#examAns").value.toUpperCase().split(/\s+/).filter(Boolean);
        const singles = toks.slice(0, 60), groups = toks.slice(60, 68);
        let sc = 0; const sh = s.singles.map((c, i) => { const ok = singles[i] === c; if (ok) sc++; return `<span class="${ok ? "ok" : "bad"}">${c}</span>`; });
        const gr = s.groups.map((g, i) => { const ok = groups[i] === g; if (ok) sc += 5; return `<span class="pill ${ok ? "ok" : "bad"}">${g}${ok ? "" : " (you: " + esc(groups[i] || "-") + ")"}</span>`; });
        $("#examRes").innerHTML = `<div class="card"><b>Score ${sc}/100</b> ${sc >= 70 ? '<span class="pill ok">pass</span>' : '<span class="pill bad">below 70</span>'}<h3>Singles</h3><div class="sheet">${sh.join("")}</div><h3>Groups</h3><p>${gr.join(" ")}</p></div>`;
      };
    }
  }

  /* ---------- numericals ---------- */
  function numericals() {
    setTab("practice"); title("Numericals");
    const n = byId["F1-TCN-07"].extras.numericals;
    view.innerHTML = `<h1>Numericals: sailings</h1><p class="muted">${esc(n.about || "")}</p>
      ${n.problems.map(p => `<details class="qa"><summary>${esc(p.id)} · ${esc(p.type)}<br><span style="font-weight:400">${esc(p.q)}</span></summary><div class="body">
      <table class="plain">${Object.entries(p.answer).map(([k, v]) => `<tr><th>${esc(k.replace(/_/g, " "))}</th><td>${esc(typeof v === "boolean" ? (v ? "yes" : "no") : v)}</td></tr>`).join("")}</table></div></details>`).join("")}
      <p class="small muted">Worked method: see <a href="#/m/F1-TCN-07">F1-TCN-07 Sailings</a>.</p>`;
  }

  /* ---------- search ---------- */
  function search(term) {
    setTab(""); title("Search");
    const t = term.trim().toLowerCase(); const hits = [];
    if (t.length > 1) {
      const strip = h => h.replace(/<[^>]+>/g, " ");
      for (const m of M) {
        const txt = strip(m.html); const i = txt.toLowerCase().indexOf(t);
        if (m.title.toLowerCase().includes(t) || i >= 0) hits.push({ href: `#/m/${m.id}`, h: `${m.id} · ${m.title}`, s: i >= 0 ? txt.slice(Math.max(0, i - 70), i + 110) : "" });
        (m.qa || []).forEach(x => { if ((x.q + " " + x.recalled.join(" ") + strip(x.answer)).toLowerCase().includes(t)) hits.push({ href: `#/m/${m.id}/qa`, h: `Q&A · ${x.q}`, s: "" }); });
      }
      allQ.forEach(q => { if ((q.q + q.a + (q.exp || "")).toLowerCase().includes(t)) hits.push({ href: `#/m/${q.mod}/quiz`, h: `Quiz · ${q.q}`, s: "Answer: " + q.a }); });
    }
    const hl = s => esc(s).replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), x => `<span class="hl">${x}</span>`);
    view.innerHTML = `<h1>Search</h1><p class="muted">${hits.length} results for “${esc(term)}”</p>
      <div class="list">${hits.slice(0, 200).map(h => `<a class="row" href="${h.href}"><span class="grow"><b>${hl(h.h)}</b>${h.s ? `<br><span class="small muted">${hl(h.s)}</span>` : ""}</span></a>`).join("") || '<div class="empty">No results</div>'}</div>`;
  }
  let st;
  $("#searchBtn").onclick = () => { const sb = $("#searchbar"); sb.hidden = !sb.hidden; if (!sb.hidden) $("#q").focus(); };
  $("#q").oninput = e => { clearTimeout(st); const v = e.target.value; st = setTimeout(() => { if (v.trim().length > 1) location.hash = "#/search/" + encodeURIComponent(v); }, 300); };

  /* ---------- more ---------- */
  function bookmarks() {
    setTab("more"); title("Saved");
    const mods = Object.keys(S.bm).filter(k => k.startsWith("m:")).map(k => byId[k.slice(2)]).filter(Boolean);
    const qas = Object.keys(S.bm).filter(k => k.startsWith("qa:")).map(k => k.slice(3));
    const qaItems = M.flatMap(m => m.qa || []).filter(x => qas.includes(x.id));
    view.innerHTML = `<h1>Saved</h1><h2>Topics</h2>${mods.length ? `<div class="list">${mods.map(moduleRow).join("")}</div>` : '<p class="muted">Bookmark a topic with ☆ on its page.</p>'}
      <h2>Surveyor answers</h2>${qaItems.length ? qaList(qaItems) : '<p class="muted">Save answers with ☆ in the Q&A banks.</p>'}`;
    wireQa();
  }
  function diagrams() {
    setTab("more"); title("Diagram register");
    const D = C.diagrams; const f = location.hash.split("/")[2] || "P1";
    const rows = D.filter(d => f === "all" || d.priority === f);
    view.innerHTML = `<h1>Diagram register</h1><p class="muted">${D.length} diagrams planned for the app, with how often the exam asks for them. Drawings are original; Materials pages are reference only.</p>
      <div class="seg">${["P1", "P2", "P3", "all"].map(p => `<button class="${f === p ? "on" : ""}" onclick="location.hash='#/diagrams/${p}'">${p === "all" ? "All" : p} (${p === "all" ? D.length : D.filter(d => d.priority === p).length})</button>`).join("")}</div>
      <div class="list">${rows.map(d => `<a class="row" href="#/m/${d.module}"><span class="grow"><span class="id">${d.id} · ${d.module} · ${d.kind}</span><br><b>${esc(d.title)}</b><br><span class="small muted">${esc(d.shows)}</span></span><span class="pill ${d.asked_with_sketch >= 5 ? "warn" : ""}">${d.asked} asked · ${d.asked_with_sketch} sketch</span></a>`).join("")}</div>`;
  }
  function more() {
    setTab("more"); title("More");
    view.innerHTML = `<h1>More</h1>
      <div class="list">
        <a class="row" href="#/progress"><span class="grow">Progress & exam planner</span></a>
        <a class="row" href="#/bookmarks"><span class="grow">Saved topics and answers</span></a>
        <a class="row" href="#/backup"><span class="grow">Backup & restore progress</span></a>
        <a class="row" href="#/papers"><span class="grow">Past papers (351)</span></a>
        <a class="row" href="#/colreg"><span class="grow">COLREG rule finder</span></a>
        <a class="row" href="#/formulas"><span class="grow">Formula sheet</span></a>
        <a class="row" href="#/glossary"><span class="grow">Abbreviations</span></a>
        <a class="row" href="#/tools"><span class="grow">Calculators</span></a>
        <a class="row" href="#/numgen"><span class="grow">Numericals practice (generated)</span></a>
        <a class="row" href="#/symbols"><span class="grow">Symbols: flags, buoyage, light rhythms, fronts</span></a>
        <a class="row" href="#/numericals"><span class="grow">Numericals: sailings</span></a>
        <a class="row" href="#/diagrams/P1"><span class="grow">Diagram register (planned drawings)</span></a>
      </div>
      <h2>Settings</h2>
      <div class="card"><div class="btns"><button class="btn ghost" id="theme2">Toggle light/dark</button><button class="btn ghost" id="reset">Reset my progress</button></div>
      <p class="small muted">Progress is stored only in this browser. Nothing is sent anywhere.</p></div>
      <h2>About</h2>
      <div class="card kv"><span>Content</span><span>${M.length} topics · ${allQ.length} quiz questions · ${M.reduce((s, m) => s + (m.qa ? m.qa.length : 0), 0)} surveyor answers</span>
      <span>Built</span><span>${esc(C.built)}</span><span>Status</span><span>Draft v1, awaiting review by a serving officer. Always check figures against the official instruments.</span>
      <span>Offline</span><span>Add to home screen from your browser menu to use it like an app.</span></div>`;
    $("#theme2").onclick = () => $("#themeBtn").click();
    $("#reset").onclick = () => { if (confirm("Clear all read marks, quiz history and bookmarks on this device?")) { S = { read: {}, bm: {}, quiz: {}, theme: S.theme }; save(); more(); } };
  }
  function notFound() { view.innerHTML = '<div class="empty"><p>Page not found.</p><a class="btn" href="#/">Home</a></div>'; }

  /* ---------- helpers for feature modules (features.js) ---------- */
  const H = { C, M, byId, allQ, qById, view, $, esc, shuffle, pct, bar, setTab, title, moduleRow, paperName,
    get S() { return S; }, save, replaceState: d => { S = Object.assign({ read: {}, bm: {}, quiz: {}, theme: "" }, d); save(); applyTheme(); }, startQuiz: scope => { location.hash = "#/quiz/" + scope; }, qaList, wireQa };
  window.NB_H = H;

  /* ---------- router ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, "")); const p = h.split("/");
    $("#back").hidden = !h;
    if (!p[0]) home();
    else if (p[0] === "study") study();
    else if (p[0] === "f") hub(p[1], p[2], p[3]);
    else if (p[0] === "m") moduleView(p[1], p[2]);
    else if (p[0] === "quiz") startQuiz(p.slice(1).join("/"));
    else if (p[0] === "practice") practice();
    else if (p[0] === "orals") orals();
    else if (p[0] === "ror") ror();
    else if (p[0] === "morse") morse();
    else if (p[0] === "numericals") numericals();
    else if (p[0] === "search") search(p.slice(1).join("/"));
    else if (p[0] === "bookmarks") bookmarks();
    else if (p[0] === "diagrams") diagrams();
    else if (p[0] === "more") more();
    else if (window.NB_ROUTES && window.NB_ROUTES[p[0]]) window.NB_ROUTES[p[0]](H, p.slice(1));
    else notFound();
    if (p[0] !== "quiz") window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }
  $("#back").onclick = () => history.back();
  addEventListener("keydown", e => {
    if (e.target.matches("input,textarea,select") || e.ctrlKey || e.metaKey || e.altKey) return;
    if (location.hash.startsWith("#/quiz/")) {
      const opts = [...view.querySelectorAll(".opt:not([disabled])")];
      if (/^[1-4]$/.test(e.key) && opts[+e.key - 1]) { opts[+e.key - 1].click(); e.preventDefault(); }
      else if (e.key === "Enter" && $("#next")) { $("#next").click(); e.preventDefault(); }
    }
    if (e.key === "/" && !e.target.matches("input")) { e.preventDefault(); $("#searchBtn").click(); }
  });
  addEventListener("hashchange", () => { closeDrawer(); window.MORSE.stop(); clearInterval(timerId); route(); });
  route();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
