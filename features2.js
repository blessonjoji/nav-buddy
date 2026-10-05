/* Nav-Buddy features, part 2: past papers browser, oral exam simulator, COLREG rule finder,
   progress backup/restore. */
(function () {
  "use strict";
  const routes = (window.NB_ROUTES = window.NB_ROUTES || {});
  const NAMES = { TCN: "Terrestrial & Coastal Navigation", CN: "Celestial Navigation", BE: "Bridge Equipment & Watchkeeping", MET: "Meteorology", CHS: "Cargo Handling & Stowage", SCS: "Ship Construction, Stability & Safety" };
  const fmtDate = d => { const [y, m, dd] = d.split("-"); return `${dd}/${m}/${y}`; };

  /* ---------- lazy loader for the 775 KB papers file ---------- */
  function withPapers(cb) {
    if (window.PAPERS) return cb(window.PAPERS);
    const s = document.createElement("script"); s.src = "data/papers.js"; s.onload = () => cb(window.PAPERS);
    s.onerror = () => { document.getElementById("view").innerHTML = '<div class="empty">Could not load past papers.</div>'; };
    document.head.appendChild(s);
  }

  /* ---------- past papers ---------- */
  routes.papers = (H, args) => {
    H.setTab("practice"); H.title("Past papers");
    H.view.innerHTML = '<div class="empty">Loading past papers…</div>';
    withPapers(P => {
      const code = args[0] && NAMES[args[0]] ? args[0] : null;
      if (code && args[1]) return paperView(H, P.find(p => p.c === code && p.d === args[1]));
      const S = H.S; const q0 = (S.papersQuery || "");
      const list = P.filter(p => !code || p.c === code);
      const years = [...new Set(list.map(p => p.d.slice(0, 4)))];
      H.view.innerHTML = `<h1>Past papers</h1><p class="muted">${P.length} MMD written papers, May 2017 to Nov 2025, as candidates recorded them. Each question is linked to the topic that covers it.</p>
        <div class="seg">${["all", ...Object.keys(NAMES)].map(c => `<button class="${(code || "all") === c ? "on" : ""}" onclick="location.hash='#/papers${c === "all" ? "" : "/" + c}'">${c === "all" ? "All" : c}</button>`).join("")}</div>
        <label class="fld"><span>Search every question</span><input id="pq" placeholder="e.g. Williamson turn, GZ curve, deck seal" value="${H.esc(q0)}"></label>
        <div id="pres"></div>
        <div id="plist">${years.map(y => `<h2>${y}</h2><div class="list">${list.filter(p => p.d.startsWith(y)).map(p => `<a class="row" href="#/papers/${p.c}/${p.d}"><span class="grow"><b>${NAMES[p.c]}</b><br><span class="small muted">${fmtDate(p.d)} · ${p.q.length} questions</span></span><span class="pill">${p.c}</span></a>`).join("")}</div>`).join("")}</div>`;
      const run = () => {
        const v = document.getElementById("pq").value.trim().toLowerCase(); S.papersQuery = v; H.save();
        const box = document.getElementById("pres"), pl = document.getElementById("plist");
        if (v.length < 3) { box.innerHTML = ""; pl.style.display = ""; return; }
        const hits = [];
        list.forEach(p => p.q.forEach(q => { if (q.t.toLowerCase().includes(v)) hits.push({ p, q }); }));
        pl.style.display = "none";
        const re = new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
        box.innerHTML = `<p class="muted">${hits.length} questions found${hits.length > 150 ? " (first 150 shown)" : ""}</p>` + hits.slice(0, 150).map(({ p, q }) => `<div class="card"><div class="small muted"><a href="#/papers/${p.c}/${p.d}">${p.c} · ${fmtDate(p.d)}</a> · Q${q.n}</div>
          <div>${H.esc(q.t).replace(re, x => `<span class="hl">${x}</span>`)}</div>${chips(H, q.m)}</div>`).join("");
      };
      const inp = document.getElementById("pq"); let tid; inp.oninput = () => { clearTimeout(tid); tid = setTimeout(run, 250); }; if (q0) run();
    });
  };
  const chips = (H, ids) => ids && ids.length ? `<div style="margin-top:6px">${ids.map(id => H.byId[id] ? `<a class="pill" style="text-decoration:none;margin:2px 4px 0 0" href="#/m/${id}">${id} · ${H.esc(H.byId[id].title.split(":")[0].slice(0, 40))}</a>` : "").join("")}</div>` : "";
  function paperView(H, p) {
    if (!p) { H.view.innerHTML = '<div class="empty">Paper not found.</div>'; return; }
    H.title(`${p.c} ${fmtDate(p.d)}`);
    H.view.innerHTML = `<div class="small muted"><a href="#/papers/${p.c}">← ${NAMES[p.c]} papers</a></div><h1>${NAMES[p.c]}</h1><p class="muted">${fmtDate(p.d)}${p.s ? " · " + H.esc(p.s) : ""}. Question text as recorded by candidates; check figures and data against the paper's fixed exam extracts (charts, ATT 1992, NA 1992, Hindship booklet).</p>
      ${p.q.map(q => `<div class="card"><b>Q${q.n}.</b> ${H.esc(q.t)}${chips(H, q.m)}</div>`).join("")}`;
  }

  /* ---------- oral exam simulator ---------- */
  const PASS = { F1: 70, F2: 60, F3: 60 };
  let O = null;
  routes.oralsim = (H, args) => {
    H.setTab("orals"); H.title("Oral simulator");
    const f = args[0];
    if (!f || !PASS[f]) {
      const hist = (H.S.oralHist || []).slice(-8).reverse();
      H.view.innerHTML = `<h1>Oral exam simulator</h1><p class="muted">Ten questions in the surveyor's style. Answer out loud as you would in the exam, then reveal the model answer and mark yourself honestly: full marks, part marks or nothing.</p>
        <div class="grid">${Object.keys(PASS).map(k => `<a class="tile" href="#/oralsim/${k}"><span class="big">${k}</span><span class="t">Function ${k[1]} oral</span><span class="small muted">pass ${PASS[k]}/100</span></a>`).join("")}</div>
        ${hist.length ? `<h2>Recent attempts</h2><div class="list">${hist.map(h => `<div class="row"><span class="grow">${h.f} · ${new Date(h.t).toLocaleDateString()}</span><span class="pill ${h.score >= PASS[h.f] ? "ok" : "bad"}">${h.score}/100</span></div>`).join("")}</div>` : ""}`;
      return;
    }
    if (!O || O.f !== f || args[1] === "new") {
      const bank = H.M.filter(m => m.f === f && m.qa).flatMap(m => m.qa.map(x => ({ kind: "qa", x })));
      const oralMods = H.M.filter(m => m.f === f && m.paper === "OR" && m.quiz.length);
      const mcq = oralMods.flatMap(m => m.quiz.map(q => ({ kind: "mcq", x: q, mod: m.id })));
      let items = H.shuffle(bank).slice(0, 7).concat(H.shuffle(mcq).slice(0, 3));
      if (f === "F1") { const cards = H.byId["F1-OR-08"].extras.cards.cards; items = items.slice(0, 7).concat(H.shuffle(cards).slice(0, 3).map(c => ({ kind: "card", x: c }))); }
      O = { f, items: H.shuffle(items), i: 0, marks: [], shown: false };
      if (args[1] === "new") { location.replace("#/oralsim/" + f); return; }
    }
    if (O.i >= O.items.length) {
      const score = Math.round(O.marks.reduce((a, b) => a + b, 0) * 10);
      const hist = H.S.oralHist || (H.S.oralHist = []); if (!O.saved) { hist.push({ f, score, t: Date.now() }); H.save(); O.saved = true; }
      H.view.innerHTML = `<h1>Function ${f[1]} oral: result</h1><div class="grid"><div class="tile"><span class="big">${score}/100</span><span class="t">${score >= PASS[f] ? "Pass standard" : "Below the pass mark of " + PASS[f]}</span>${H.bar(score)}</div></div>
        <div class="btns"><a class="btn" href="#/oralsim/${f}/new">New oral</a><a class="btn ghost" href="#/oralsim">Simulator home</a></div>
        <p class="muted small">Weak answers: revise the linked topics. Real orals are two surveyors and roughly ten questions each; regulations and practical situations dominate.</p>`;
      return;
    }
    const it = O.items[O.i];
    let qhtml = "", ans = "";
    if (it.kind === "qa") { qhtml = H.esc(it.x.q); ans = `<div class="notes" style="box-shadow:none;border:0;padding:0">${it.x.answer}</div>`; }
    else if (it.kind === "mcq") { qhtml = H.esc(it.x.q.replace(/:$/, "?")); ans = `<p><b>${H.esc(it.x.a)}</b></p><p class="small muted">${H.esc(it.x.exp || "")}</p><p class="small"><a href="#/m/${it.mod}">Revise ${it.mod}</a></p>`; }
    else { qhtml = "The surveyor shows you this. What vessel is it, which way is she heading, and what is your action?<div style='margin-top:8px'>" + window.ROR.render(it.x) + "</div>"; ans = `<p><b>${H.esc(it.x.vessel)}</b></p>${it.x.aspect ? `<p>${H.esc(it.x.aspect)}</p>` : ""}<p><b>Action:</b> ${H.esc(it.x.action || "")}</p><p class="small muted">Rules ${H.esc((it.x.rules || []).join(", "))}</p>`; }
    H.view.innerHTML = `<div class="progress-line"><span>Function ${f[1]} oral</span><span>Question ${O.i + 1} / ${O.items.length}</span></div>${H.bar(H.pct(O.i, O.items.length))}
      <div class="qcard" style="margin-top:12px"><div class="small muted">Surveyor:</div><div class="qtext">${qhtml}</div>
      ${O.shown ? `<div class="exp">${ans}</div><p><b>How did you do?</b></p><div class="btns"><button class="btn" data-m="1">Full answer</button><button class="btn ghost" data-m="0.5">Partly</button><button class="btn ghost" data-m="0">Missed it</button></div>`
        : `<p class="muted">Say your answer aloud first.</p><div class="btns"><button class="btn" id="rev">Reveal model answer</button></div>`}</div>`;
    const rv = document.getElementById("rev"); if (rv) rv.onclick = () => { O.shown = true; routes.oralsim(H, [f]); };
    H.view.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { O.marks.push(+b.dataset.m); O.i++; O.shown = false; routes.oralsim(H, [f]); window.scrollTo(0, 0); });
  };

  /* ---------- COLREG rule finder ---------- */
  routes.colreg = (H, args) => {
    H.setTab("orals"); H.title("COLREG rule finder");
    const q = decodeURIComponent(args[0] || "");
    H.view.innerHTML = `<h1>COLREG rule finder</h1><p class="muted">Every rule in one or two lines, in plain words. Learn the exact wording from your own copy of COLREG 1972.</p>
      <label class="fld"><span>Find a rule (number or words)</span><input id="cq" placeholder="e.g. 19, overtaking, anchor, fog" value="${H.esc(q)}"></label><div id="clist"></div>`;
    const draw = v => {
      v = v.trim().toLowerCase();
      document.getElementById("clist").innerHTML = window.COLREG.map(sec => {
        const rs = sec.rules.filter(([n, t, s]) => !v || String(n).toLowerCase() === v || (t + " " + s).toLowerCase().includes(v));
        return rs.length ? `<h2>${sec.part}</h2>` + rs.map(([n, t, s, mod]) => `<div class="card"><b>${typeof n === "number" ? "Rule " + n : "Annex " + n}: ${t}</b><p style="margin:6px 0">${H.esc(s)}</p><a class="small" href="#/m/${mod}">Full notes: ${mod}</a></div>`).join("") : "";
      }).join("") || '<div class="empty">No rule matches.</div>';
    };
    const inp = document.getElementById("cq"); inp.oninput = () => draw(inp.value); draw(q);
  };

  /* ---------- backup / restore ---------- */
  routes.backup = H => {
    H.setTab("more"); H.title("Backup");
    H.view.innerHTML = `<h1>Backup & restore</h1><p class="muted">Your progress lives only on this device. Save a backup file to move it to another phone or browser, or to keep it safe.</p>
      <div class="card"><div class="btns"><button class="btn" id="exp">Download backup</button></div>
      <label class="fld"><span>Restore from a backup file</span><input type="file" id="imp" accept="application/json,.json"></label><div id="bmsg"></div></div>`;
    document.getElementById("exp").onclick = () => {
      const blob = new Blob([JSON.stringify({ app: "Nav-Buddy", v: 1, saved: new Date().toISOString(), data: H.S }, null, 1)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `nav-buddy-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    document.getElementById("imp").onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      file.text().then(t => {
        try { const j = JSON.parse(t); if (j.app !== "Nav-Buddy" || !j.data) throw 0;
          if (!confirm("Replace the progress on this device with the backup?")) return;
          H.replaceState(j.data); document.getElementById("bmsg").innerHTML = '<p class="pill ok">Restored.</p>';
        } catch (err) { document.getElementById("bmsg").innerHTML = '<p class="pill bad">That file is not a Nav-Buddy backup.</p>'; }
      });
    };
  };
})();
