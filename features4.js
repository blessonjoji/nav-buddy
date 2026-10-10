/* Nav-Buddy feature module 4: COLREG Annexes I to IV in plain words, the light arcs trainer (Rules 21 and 22),
   and the Stability hub. Registered as extra routes. Learn the exact wording and figures from your own COLREG copy. */
(function () {
  "use strict";
  const routes = (window.NB_ROUTES = window.NB_ROUTES || {});

  /* ---------- Annexes I to IV ---------- */
  const ANNEX = [
    { n: "I", t: "Positioning and technical details of lights and shapes", mod: "F1-OR-05", s: [
      ["Height above the hull", "Measured from the uppermost continuous deck, vertically below the light."],
      ["Masthead light, power-driven vessel 20 m or more", "Forward (or only) masthead light at least 6 m above the hull; if the breadth is more than 6 m, at least the breadth, but it need not be more than 12 m."],
      ["Two masthead lights", "The after light at least 4.5 m vertically higher than the forward one. In normal trim the after light must be seen above and separate from the forward light from 1,000 m ahead at sea level."],
      ["Horizontal spacing of masthead lights", "At least half the vessel's length apart (need not be more than 100 m); the forward light not more than a quarter of the length from the stem."],
      ["Power-driven vessel 12 to 20 m", "Masthead light at least 2.5 m above the gunwale."],
      ["Under 12 m", "The uppermost light may be lower than 2.5 m above the gunwale, but at least 1 m above the sidelights."],
      ["Sidelights", "Not higher than three-quarters of the height of the forward masthead light, and not so low that deck lights interfere. On power-driven vessels of 20 m or more they are not in front of the forward masthead light and are at or near the side, with matt black inboard screens."],
      ["Two or three lights in a vertical line", "Vessels of 20 m or more: at least 2 m apart, the lowest at least 4 m above the hull (towing light excepted). Under 20 m: at least 1 m apart, the lowest at least 2 m above the gunwale. Three lights are equally spaced."],
      ["Fishing vessels", "The lower of the two all-round lights is above the sidelights by at least twice the distance between the two vertical lights."],
      ["Anchor lights (two)", "The forward light higher than the after one by at least 4.5 m; on vessels of 50 m or more the forward anchor light is at least 6 m above the hull."],
      ["Shapes", "Black. Ball: diameter at least 0.6 m. Cone: base diameter at least 0.6 m, height equal to the diameter. Cylinder: diameter at least 0.6 m, height twice the diameter. Diamond: two cones base to base. At least 1.5 m apart vertically. Vessels under 20 m may use smaller shapes and spacing."],
      ["Intensity", "Minimum luminous intensity from I = 3.43 × 10⁶ × T × D² × K⁻ᴰ (T = 2 × 10⁻⁷ lux, K = 0.8). Range 1, 2, 3, 4, 5, 6 miles needs about 0.9, 4.3, 12, 27, 52 and 94 candela."],
      ["Horizontal sectors", "Sidelights: full intensity forward, cutting off between 1° and 3° outside the sector. Masthead, stern and sidelights at 22.5° abaft the beam: full intensity to within 5° of the sector limits, then may fall by half up to the limit, and must cut off within 5° outside it. All-round lights must not be hidden by masts or other obstructions over arcs of more than 6°."],
      ["Vertical sectors", "Full intensity from 5° above to 5° below the horizontal, and at least 60 % from 7.5° above to 7.5° below (sailing vessels: at least 50 % from 25° above to 25° below), so lights stay visible when the vessel rolls."],
      ["Manoeuvring light (Rule 34(b))", "In the same fore-and-aft plane as the masthead lights, where practicable at least 2 m above the forward masthead light, and at least 2 m above or below the after masthead light."],
      ["High-speed craft", "The masthead light may be lower than the breadth rule, provided the base angles of the triangle formed by the sidelights and masthead light, seen end-on, are at least 27°."],
      ["Approval", "Construction of lights and shapes and the installation of lights on board must satisfy the flag Administration."]] },
    { n: "II", t: "Additional signals for fishing vessels fishing in close proximity", mod: "F1-OR-07", s: [
      ["The lights", "Placed where they are best seen, at least 0.9 m apart, lower than the Rule 26(b)(i) and (c)(i) lights; visible all round at least 1 mile but less than the Rule 22 range of the fishing lights."],
      ["Trawlers (20 m or more must, under 20 m may)", "Shooting nets: two white lights in a vertical line. Hauling nets: white over red. Net fast on an obstruction: two red lights in a vertical line."],
      ["Pair trawling", "Each vessel may direct a searchlight forward and towards the other vessel of the pair (in addition to the trawler signals above)."],
      ["Purse seiners", "Two yellow lights in a vertical line, flashing alternately every second with equal light and dark periods, only when hampered by their gear."]] },
    { n: "III", t: "Technical details of sound signal appliances", mod: "F1-OR-06", s: [
      ["Whistle frequency (fundamental, 70 to 700 Hz)", "200 m or more: 70 to 200 Hz. 75 to 200 m: 130 to 350 Hz. Under 75 m: 250 to 700 Hz. (Bigger ship, deeper note.)"],
      ["Whistle audibility range", "200 m or more: 2 miles. 75 to 200 m: 1.5 miles. 20 to 75 m: 1 mile. Under 20 m: 0.5 mile. (Sound pressure at 1 m: about 143, 138, 130 and 120 dB.)"],
      ["Direction", "Loudest straight ahead; within 45° either side of the axis not more than 4 dB down, elsewhere not more than 10 dB down. Fitted as high as practicable, clear of obstructions."],
      ["More than one whistle", "If fitted more than 100 m apart, only one is sounded at a time (or arranged so they cannot be sounded together)."],
      ["Bell and gong", "Sound pressure at least 110 dB at 1 m. Bell mouth at least 300 mm across on vessels of 20 m or more (200 mm for 12 to 20 m); a power-driven striker is recommended where practicable. The gong gives a similar sound to the bell but of a different tone."],
      ["Approval", "Construction, performance and installation to the satisfaction of the flag Administration."]] },
    { n: "IV", t: "Distress signals", mod: "F1-OR-06", s: [
      ["Sound", "A gun or other explosive signal fired at intervals of about a minute; a continuous sounding with any fog-signalling apparatus."],
      ["Visual by night", "Rockets or shells throwing red stars, fired one at a time at short intervals; flames on the vessel (for example a burning tar or oil barrel); a rocket parachute flare or hand flare showing a red light."],
      ["Visual by day", "Orange smoke signal; the signal N C (flags); a square flag with a ball, or anything like a ball, above or below it; slowly and repeatedly raising and lowering arms outstretched to each side."],
      ["Radio and Morse", "SOS (··· ▬▬▬ ···) by any signalling method; MAYDAY by radiotelephony; a DSC distress alert (VHF 70, MF/HF)."],
      ["Satellite and locating", "A distress alert by ship earth station (Inmarsat or other recognised mobile satellite service); signals from an EPIRB; approved signals from radiocommunication systems, including survival craft radar transponders (SART) and AIS-SART."],
      ["Also allowed to help location", "A piece of orange canvas with a black square and circle (seen from the air), and a dye marker."],
      ["Misuse", "Using any of these signals other than to show distress and need of help, or any signal that could be confused with them, is prohibited."]] },
  ];
  routes.annex = (H, args) => {
    H.setTab("annex"); H.title("COLREG Annexes");
    const pick = (args[0] || "").toUpperCase();
    const list = ANNEX.filter(a => !pick || a.n === pick);
    H.view.innerHTML = `<h1>COLREG Annexes I to IV</h1><p class="muted small">Plain-word summaries of the four annexes, with the figures examiners ask. Learn the exact wording from your own copy of COLREG 1972.</p>
      <div class="seg">${["", "I", "II", "III", "IV"].map(n => `<button class="${pick === n ? "on" : ""}" onclick="location.hash='#/annex${n ? "/" + n : ""}'">${n ? "Annex " + n : "All"}</button>`).join("")}</div>` +
      list.map(a => `<h2>Annex ${a.n}: ${a.t}</h2>` + a.s.map(([k, v]) => `<div class="card"><b>${H.esc(k)}</b><p style="margin:6px 0">${H.esc(v)}</p></div>`).join("") +
        `<p class="small"><a href="#/m/${a.mod}">Full notes: ${a.mod}</a></p>`).join("") +
      `<p class="small muted">See also: <a href="#/arcs">Light arcs</a> · <a href="#/ror">Lights & shapes cards</a> · <a href="#/colreg">Rule finder</a></p>`;
  };

  /* ---------- Light arcs (Rule 21 sectors, Rule 22 ranges) ---------- */
  const ARCS = [
    { k: "mast", name: "Masthead light", col: "#ffffff", from: -112.5, to: 112.5, r: 150, note: "White, 225°: right ahead to 22.5° abaft the beam on each side." },
    { k: "stbd", name: "Starboard sidelight", col: "#22c55e", from: 0, to: 112.5, r: 118, note: "Green, 112.5°: right ahead to 22.5° abaft the starboard beam." },
    { k: "port", name: "Port sidelight", col: "#ef4444", from: -112.5, to: 0, r: 118, note: "Red, 112.5°: right ahead to 22.5° abaft the port beam." },
    { k: "stern", name: "Sternlight", col: "#e5e7eb", from: 112.5, to: 247.5, r: 150, note: "White, 135°: 67.5° each side of right astern. A towing light (yellow) has the same arc." },
  ];
  const pt = (cx, cy, r, b) => [cx + r * Math.sin(b * Math.PI / 180), cy - r * Math.cos(b * Math.PI / 180)];
  const wedge = (cx, cy, r, a, b) => { const [x1, y1] = pt(cx, cy, r, a), [x2, y2] = pt(cx, cy, r, b); return `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`; };
  const seen = rb => {
    rb = ((rb % 360) + 360) % 360; const s = rb > 180 ? rb - 360 : rb; const out = [];
    if (Math.abs(s) <= 112.5) out.push("Masthead light (white)");
    if (s >= 0 && s <= 112.5) out.push("Starboard sidelight (green)");
    if (s <= 0 && s >= -112.5) out.push("Port sidelight (red)");
    if (Math.abs(s) >= 112.5) out.push("Sternlight (white)");
    return out;
  };
  routes.arcs = (H, args) => {
    H.setTab("arcs"); H.title("Light arcs");
    const rb = +(args[0] || 30);
    const cx = 170, cy = 170;
    const [ox, oy] = pt(cx, cy, 160, rb);
    const svg = `<svg viewBox="0 0 340 340" style="width:100%;max-width:380px;display:block;margin:8px auto;background:#0b1a2b;border-radius:12px" role="img" aria-label="Arcs of visibility of a power-driven vessel's lights">
      ${ARCS.map(a => `<path d="${wedge(cx, cy, a.r, a.from, a.to)}" fill="${a.col}" fill-opacity="${a.k === "mast" ? 0.12 : 0.28}" stroke="${a.col}" stroke-width="1.5"/>`).join("")}
      ${[0, 112.5, 247.5].map(b => { const [x, y] = pt(cx, cy, 160, b); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#94a3b8" stroke-dasharray="3 3" stroke-width="1"/>`; }).join("")}
      <path d="M${cx},${cy - 22} L${cx + 7},${cy - 8} L${cx + 7},${cy + 20} L${cx - 7},${cy + 20} L${cx - 7},${cy - 8} Z" fill="#cbd5e1"/>
      <circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="7" fill="#facc15"/>
      <text x="${cx}" y="14" fill="#cbd5e1" font-size="11" text-anchor="middle">Ahead</text>
      <text x="${cx}" y="334" fill="#cbd5e1" font-size="11" text-anchor="middle">Astern</text>
      <text x="${pt(cx, cy, 120, 112.5)[0]}" y="${pt(cx, cy, 120, 112.5)[1] + 16}" fill="#cbd5e1" font-size="10" text-anchor="middle">22.5° abaft beam</text></svg>`;
    H.view.innerHTML = `<h1>Light arcs</h1><p class="muted small">Rule 21 sectors seen from above (ship heading up the page). Move the observer (yellow) round the ship to see which lights show from that bearing.</p>
      ${svg}
      <label class="fld"><span>Observer's bearing from the ship, relative to her head: <b id="rbv">${rb}°</b></span><input type="range" id="rb" min="0" max="359" value="${rb}" style="width:100%"></label>
      <div class="card"><b>You would see:</b><p style="margin:6px 0">${seen(rb).join(" + ")}${(Math.abs(Math.abs(rb > 180 ? rb - 360 : rb) - 112.5) <= 1 || rb === 0) ? " (on a sector boundary: Annex I lets the lights overlap or cut off within a few degrees)" : ""}</p>
        <p class="small muted" style="margin:0">${rb > 112.5 && rb < 247.5 ? "You are more than 22.5° abaft her beam: if you are closing her, you are overtaking (Rule 13)." : rb === 0 ? "Right ahead: both sidelights and the masthead light(s): head-on (Rule 14)." : "Forward of 22.5° abaft her beam: crossing or head-on situation, depending on her heading."}</p></div>
      <h2>Arcs (Rule 21)</h2><div class="list">${ARCS.map(a => `<div class="row"><span class="grow"><b style="color:${a.k === "stern" || a.k === "mast" ? "inherit" : a.col}">${a.name}</b><br><span class="small muted">${a.note}</span></span></div>`).join("")}
        <div class="row"><span class="grow"><b>All-round light</b><br><span class="small muted">360°: anchor, NUC, RAM, CBD, fishing, pilot lights. Flashing light (Rule 21(f)): 120 or more flashes a minute.</span></span></div></div>
      <h2>Minimum ranges (Rule 22), miles</h2>
      <div class="n-tablewrap"><table class="n-table"><thead><tr><th>Length</th><th>Masthead</th><th>Sidelight</th><th>Stern</th><th>Towing</th><th>All-round</th></tr></thead><tbody>
        <tr><td>50 m or more</td><td>6</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
        <tr><td>12 to 50 m</td><td>5 (3 if under 20 m)</td><td>2</td><td>2</td><td>2</td><td>2</td></tr>
        <tr><td>Under 12 m</td><td>2</td><td>1</td><td>2</td><td>2</td><td>2</td></tr>
        <tr><td>Inconspicuous, partly submerged towed object</td><td colspan="5">White all-round light: 3</td></tr></tbody></table></div>
      <p class="small muted">Positions and screening: <a href="#/annex/I">Annex I</a>. Practise identifying vessels: <a href="#/ror">Lights & shapes cards</a>.</p>`;
    const r = document.getElementById("rb");
    r.oninput = () => { document.getElementById("rbv").textContent = r.value + "°"; };
    r.onchange = () => { history.replaceState(null, "", "#/arcs/" + r.value); routes.arcs(H, [r.value]); };
  };

  /* ---------- Syllabus checklist (tick off as you study) ---------- */
  routes.checklist = (H, args) => {
    H.setTab("checklist"); H.title("Syllabus checklist");
    const D = window.NB_CHECKLIST || []; const S = H.S; S.ck = S.ck || {};
    const open = args[0] !== undefined ? +args[0] : -1;
    const key = (pi, it) => pi + "|" + it;
    const count = pi => { let n = 0, d = 0; D[pi].secs.forEach(s => s.items.forEach(([it]) => { n++; if (S.ck[key(pi, it)]) d++; })); return [d, n]; };
    let tn = 0, td = 0; D.forEach((p, i) => { const [d, n] = count(i); td += d; tn += n; });
    H.view.innerHTML = `<h1>Syllabus checklist</h1><p class="muted small">Every item of the 2nd Mate (FG) syllabus, part by part. Tick each one when you can explain it without notes; tap a topic code to read it. For the orals, prepare each item at five levels: definition, principle, procedure, the rule that applies, and a scenario.</p>
      <div class="card"><b>${td} of ${tn} ticked</b> (${tn ? Math.round(100 * td / tn) : 0} %)${H.bar(tn ? 100 * td / tn : 0)}</div>
      <div class="list">${D.map((p, pi) => { const [d, n] = count(pi); return `<a class="row" href="#/checklist/${open === pi ? "" : pi}"><span class="grow"><b>${H.esc(p.t)}</b></span><span class="pill ${d === n ? "ok" : ""}">${d}/${n}</span></a>` +
        (open === pi ? p.secs.map(s => `<div class="card"><b>${H.esc(s.t)}</b>${s.items.map(([it, m]) => `<label style="display:flex;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--line)"><input type="checkbox" data-k="${H.esc(key(pi, it))}" ${S.ck[key(pi, it)] ? "checked" : ""}><span class="grow" style="flex:1">${H.esc(it)}</span>${m ? `<a class="small" href="#/m/${m}">${m}</a>` : ""}</label>`).join("")}</div>`).join("") : ""); }).join("")}</div>
      <p class="small muted">COLREG has four annexes (I to IV); lists that show an "Annex V" are mixing in the US Inland Rules. Ticks are saved on this device; use Backup in More to move them.</p>`;
    H.view.querySelectorAll("input[data-k]").forEach(c => c.onchange = () => { if (c.checked) S.ck[c.dataset.k] = 1; else delete S.ck[c.dataset.k]; H.save(); const y = window.scrollY; routes.checklist(H, [open]); window.scrollTo(0, y); });
  };

  /* ---------- Stability hub ---------- */
  routes.stability = H => {
    H.setTab("stability"); H.title("Stability");
    const ids = [["F3-SCS-03", "Start here"], ["F3-SCS-01", "Ship's booklet, GZ curve"], ["F3-SCS-02", "Trim and drafts"], ["F3-SCS-08", "Construction, load lines"], ["F3-OR-01", "Stability oral"]];
    const row = ([id, tag]) => { const m = H.byId[id]; if (!m) return ""; return `<a class="row" href="#/m/${id}"><span class="grow"><span class="id">${id} · ${tag}</span><br>${H.esc(m.title)}</span><span class="pill">${m.quiz.length} Q</span></a>`; };
    H.view.innerHTML = `<h1>Stability</h1><p class="muted">Everything on stability, trim and load lines in one place: notes, quizzes and calculators.</p>
      <h2>Notes</h2><div class="list">${ids.map(row).join("")}</div>
      <h2>Quizzes</h2><div class="grid">${ids.filter(([id]) => H.byId[id] && H.byId[id].quiz.length).map(([id, tag]) => `<a class="tile" href="#/quiz/m:${id}"><span class="t">${tag}</span><span class="small muted">${H.byId[id].quiz.length} questions</span></a>`).join("")}</div>
      <h2>Calculators</h2><div class="list">
        <a class="row" href="#/tools/list"><span class="grow">List, free surface & loll</span></a>
        <a class="row" href="#/tools/trim"><span class="grow">Trim: load or discharge one weight</span></a>
        <a class="row" href="#/tools/fwa"><span class="grow">FWA and DWA</span></a>
        <a class="row" href="#/numgen"><span class="grow">Generated practice problems (list, final drafts)</span></a>
        <a class="row" href="#/formulas"><span class="grow">Formula sheet</span></a></div>`;
  };
})();
