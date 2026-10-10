/* Nav-Buddy features, part 3: collision situation trainer, written exam mode, formula sheet,
   abbreviations glossary. Situations are limited to textbook cases with one correct action. */
(function () {
  "use strict";
  const routes = (window.NB_ROUTES = window.NB_ROUTES || {});
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const deg3 = x => String(((x % 360) + 360) % 360).padStart(3, "0");

  /* ---------- situation trainer ---------- */
  const ACT = {
    headon: "Head-on situation (Rule 14): alter course to starboard, sound one short blast, pass port to port.",
    giveway: "Give-way vessel (Rules 15, 16): take early and substantial action, normally a bold alteration to starboard to pass astern of her; one short blast. Avoid crossing ahead.",
    standon: "Stand-on vessel (Rule 17): keep course and speed and keep monitoring. If she does not act, sound at least five short blasts and take action yourself (avoid altering to port for a vessel on your port side). Act when collision cannot be avoided by her alone.",
    overtaking: "You are overtaking (Rule 13): keep out of her way, passing on either side with ample clearance, until finally past and clear.",
    beingover: "You are being overtaken (Rules 13, 17): you are the stand-on vessel. Keep course and speed and monitor her; five short blasts if in doubt about her intentions.",
    r18: "Keep out of her way (Rule 18): a power-driven vessel keeps clear of vessels not under command, restricted in ability to manoeuvre, engaged in fishing and sailing. Take early, substantial action.",
    norisk: "No risk of collision indicated (Rule 7): the compass bearing is changing appreciably and the CPA is safe. Keep monitoring by bearings and radar, remembering that risk may still exist with large vessels or at close range.",
    r19fwd: "Rule 19: she is detected by radar only and forward of the beam. Make a substantial alteration to starboard and/or reduce speed. Avoid altering to port for a vessel forward of the beam (other than one being overtaken).",
    r19aft: "Rule 19: she is detected by radar only and abaft the beam. Avoid altering towards her; if action is needed, alter away from her and/or adjust speed. Sound fog signals and keep plotting.",
    fogfwd: "Rule 19(e): you hear her fog signal apparently forward of the beam and cannot rule out risk of collision. Reduce to the minimum speed at which you can keep your course (take all way off if necessary) and navigate with extreme caution until the danger is over.",
  };
  const OTHER = {
    pdv: { name: "a power-driven vessel", lights: side => `two white masthead lights${side ? " and her " + side + " sidelight" : ""}` },
    sail: { name: "a sailing vessel", lights: side => `no masthead light, only her ${side} sidelight` },
    trawl: { name: "a vessel engaged in trawling", lights: side => `all-round green over white, plus her ${side} sidelight` },
    nuc: { name: "a vessel not under command", lights: side => `two all-round red lights in a vertical line, plus her ${side} sidelight` },
    ram: { name: "a vessel restricted in her ability to manoeuvre", lights: side => `all-round red-white-red in a vertical line, a masthead light and her ${side} sidelight` },
  };
  function scenario() {
    const kind = pick(["headon", "stbd", "stbd", "port", "port", "overtaking", "beingover", "r18", "r18", "norisk", "r19fwd", "r19aft", "fogfwd"]);
    const co = rint(0, 35) * 10, crs = `You are on a power-driven vessel making way, heading ${deg3(co)}°T at ${rint(10, 16)} knots, at night in clear weather in the open sea.`;
    let q, a, why;
    if (kind === "headon") { const rb = pick([0, 2, 358]); q = `${crs} ${rb === 0 ? "Dead ahead" : rb < 180 ? "Fine on your starboard bow (" + rb + "°)" : "Fine on your port bow (" + (360 - rb) + "°)"} you see two white masthead lights nearly in line and both her red and green sidelights. The compass bearing is steady and the range is closing.`; a = "headon"; why = "Masthead lights in line and both sidelights seen: reciprocal courses. Both power-driven vessels alter to starboard."; }
    if (kind === "stbd") { const rb = rint(2, 9) * 10; q = `${crs} Bearing ${rb}° on your starboard bow you see two white masthead lights and her red sidelight. The compass bearing is steady and the range is closing.`; a = "giveway"; why = "Her red (port) sidelight means you see her port side: she is crossing from your starboard side. A steady bearing means risk of collision, and she is on your starboard side, so you give way."; }
    if (kind === "port") { const rb = rint(2, 9) * 10; q = `${crs} Bearing ${rb}° on your port bow you see two white masthead lights and her green sidelight. The compass bearing is steady and the range is closing.`; a = "standon"; why = "Her green sidelight on your port bow: she is crossing from your port side, so she has you on her starboard side and must give way. You stand on."; }
    if (kind === "overtaking") { q = `${crs} Fine ahead you see a single white light that you identify as a sternlight, with no masthead lights or sidelights visible. The range is closing steadily.`; a = "overtaking"; why = "Only her sternlight is visible, so you are coming up from more than 22.5° abaft her beam: you are the overtaking vessel."; }
    if (kind === "beingover") { const rb = rint(13, 16) * 10; q = `${crs} Bearing ${rb}° relative (on your starboard quarter) you see two white masthead lights and both her sidelights. She is faster than you; her bearing is steady and the range is closing.`; a = "beingover"; why = "She is approaching from well abaft your beam, so she is overtaking you. The overtaking vessel keeps clear; you stand on."; }
    if (kind === "r18") { const t = pick(["sail", "trawl", "nuc", "ram"]), stb = Math.random() < 0.5, rb = rint(2, 8) * 10, side = stb ? "red" : "green";
      q = `${crs} Bearing ${rb}° on your ${stb ? "starboard" : "port"} bow you see ${OTHER[t].lights(side)}. The compass bearing is steady and the range is closing.`; a = "r18";
      why = `These lights show ${OTHER[t].name}. Unless she is overtaking you, Rule 18 puts the duty on you, a power-driven vessel, to keep out of her way, whichever side she is on.`; }
    if (kind === "norisk") { const rb = rint(3, 7) * 10; q = `${crs} Bearing ${rb}° on your starboard bow you see two white masthead lights and her red sidelight. Over 12 minutes her compass bearing has drawn steadily forward by 15° and the radar CPA is 2.5 miles ahead of you, opening.`; a = "norisk"; why = "An appreciable, steady change of compass bearing and a safe, opening CPA show no risk of collision. Keep watching her."; }
    if (kind === "r19fwd") { const rb = rint(1, 6) * 10, stb = Math.random() < 0.5; q = `In restricted visibility (fog, about 0.5 mile), you are on a power-driven vessel making way at a safe speed, sounding one prolonged blast every 2 minutes. Radar shows a target bearing ${rb}° on your ${stb ? "starboard" : "port"} bow at 6 miles, compass bearing steady, closing. Nothing is visible and no fog signal is heard yet.`; a = "r19fwd"; why = "Detected by radar alone and forward of the beam, with risk of collision developing: Rule 19(d)(i) says avoid altering to port, so the standard action is a substantial alteration to starboard and/or a speed reduction, taken in good time."; }
    if (kind === "r19aft") { const rb = rint(11, 15) * 10, stb = Math.random() < 0.5; q = `In restricted visibility you are on a power-driven vessel making way at a safe speed. Radar shows a target ${stb ? rb + "° relative on your starboard quarter" : 360 - rb + "° relative on your port quarter"} at 3 miles, compass bearing steady and closing, overtaking you. Nothing is visible.`; a = "r19aft"; why = "Rule 19(d)(ii): for a vessel abeam or abaft the beam, avoid an alteration of course towards her. Rule 13 does not apply because the vessels are not in sight of one another."; }
    if (kind === "fogfwd") { q = `In thick fog, at a safe speed, you hear a prolonged blast apparently about 30° on your starboard bow. Radar is cluttered and you cannot find a matching target, so you cannot rule out a risk of collision.`; a = "fogfwd"; why = "Hearing a fog signal apparently forward of the beam, or being unable to avoid a close-quarters situation with a vessel forward of the beam, requires reducing to bare steerage way."; }
    const opts = [a]; const pool = Object.keys(ACT).filter(k => k !== a);
    while (opts.length < 4) { const k = pick(pool); if (!opts.includes(k)) opts.push(k); }
    return { q, a, why, opts: opts.sort(() => Math.random() - 0.5) };
  }
  let SIT = null;
  routes.situations = (H, args) => {
    H.setTab("situations"); H.title("Collision situations");
    if (!SIT || args[0] === "next") { const s = scenario(); SIT = Object.assign(s, { picked: null, n: (SIT && SIT.n) || 0, c: (SIT && SIT.c) || 0 }); if (args[0] === "next") { location.replace("#/situations"); return; } }
    H.view.innerHTML = `<h1>Collision situations</h1><p class="muted small">Generated textbook encounters with one correct action under the Rules. In the oral, say what she is, what the situation is, who gives way, and your action with the rule numbers.</p>
      <div class="qcard"><div class="qtext" style="font-weight:500">${H.esc(SIT.q)}</div><p><b>What is the situation and your action?</b></p>
      ${SIT.opts.map(k => `<button class="opt ${SIT.picked ? (k === SIT.a ? "right" : k === SIT.picked ? "wrong" : "") : ""}" data-k="${k}" ${SIT.picked ? "disabled" : ""}>${H.esc(ACT[k])}</button>`).join("")}
      ${SIT.picked ? `<div class="exp"><b>Why:</b> ${H.esc(SIT.why)}</div><div class="btns"><a class="btn" href="#/situations/next">Next situation</a><a class="btn ghost" href="#/colreg">Rule finder</a></div>` : ""}
      <p class="small muted">Score ${SIT.c}/${SIT.n}</p></div>
      <p class="small"><a href="#/m/F1-OR-09">Full notes: F1-OR-09 collision situations</a></p>`;
    H.view.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { SIT.picked = b.dataset.k; SIT.n++; if (SIT.picked === SIT.a) SIT.c++; routes.situations(H, []); });
  };

  /* ---------- written exam mode (real past paper, timed) ---------- */
  const TIME = { TCN: 180, CN: 180, BE: 180, MET: 120, CHS: 180, SCS: 180 };
  const NAMES = { TCN: "Terrestrial & Coastal Navigation", CN: "Celestial Navigation", BE: "Bridge Equipment & Watchkeeping", MET: "Meteorology", CHS: "Cargo Handling & Stowage", SCS: "Ship Construction, Stability & Safety" };
  let EX = null, exTimer = null;
  function withPapers(cb) {
    if (window.PAPERS) return cb(window.PAPERS);
    const s = document.createElement("script"); s.src = "data/papers.js"; s.onload = () => cb(window.PAPERS); document.head.appendChild(s);
  }
  routes.exam = (H, args) => {
    H.setTab("practice"); H.title("Exam mode"); clearInterval(exTimer);
    if (!args[0]) {
      const hist = (H.S.examHist || []).slice(-6).reverse();
      H.view.innerHTML = `<h1>Written exam mode</h1><p class="muted">Sit a real past MMD paper against the clock. Write your answers on paper exactly as in the exam (use the fixed exam extracts for chartwork, tides, almanac and stability). Afterwards, rate each question and get a revision list.</p>
        <div class="list">${Object.entries(NAMES).map(([c, n]) => `<a class="row" href="#/exam/${c}"><span class="grow"><b>${n}</b><br><span class="small muted">${TIME[c] / 60} hours</span></span><span class="pill">${c}</span></a>`).join("")}</div>
        ${hist.length ? `<h2>Recent sittings</h2><div class="list">${hist.map(h => `<div class="row"><span class="grow">${h.c} paper of ${h.d} · ${new Date(h.t).toLocaleDateString()}</span><span class="pill">${h.conf}/${h.n} confident</span></div>`).join("")}</div>` : ""}`;
      return;
    }
    withPapers(P => {
      const c = args[0];
      if (!EX || EX.c !== c || args[1] === "new") {
        const list = P.filter(p => p.c === c && p.q.length >= 6);
        const p = list[Math.floor(Math.random() * Math.min(list.length, 40))];
        EX = { c, p, start: null, done: false, rate: {} };
        if (args[1] === "new") { location.replace("#/exam/" + c); return; }
      }
      const p = EX.p;
      if (!EX.start) {
        H.view.innerHTML = `<h1>${NAMES[c]}</h1><p>Paper of <b>${p.d.split("-").reverse().join("/")}</b>, ${p.q.length} questions, ${TIME[c] / 60} hours. Have your answer sheets ready.</p>
          <div class="btns"><button class="btn" id="startEx">Start the clock</button><a class="btn ghost" href="#/exam/${c}/new">Different paper</a></div>`;
        document.getElementById("startEx").onclick = () => { EX.start = Date.now(); routes.exam(H, [c]); };
        return;
      }
      if (!EX.done) {
        H.view.innerHTML = `<div class="progress-line"><span>${c} · ${p.d.split("-").reverse().join("/")}</span><span id="exClock"></span></div>
          ${p.q.map(q => `<div class="card"><b>Q${q.n}.</b> ${H.esc(q.t)}</div>`).join("")}
          <div class="btns"><button class="btn" id="finEx">I've finished</button></div>`;
        const tick = () => { const left = TIME[c] * 60 - Math.floor((Date.now() - EX.start) / 1000); const el = document.getElementById("exClock"); if (!el) return clearInterval(exTimer);
          if (left <= 0) { el.textContent = "Time is up"; el.className = "pill bad"; return; } el.textContent = `${Math.floor(left / 3600)}:${String(Math.floor(left / 60) % 60).padStart(2, "0")}:${String(left % 60).padStart(2, "0")} left`; };
        tick(); exTimer = setInterval(tick, 1000);
        document.getElementById("finEx").onclick = () => { EX.done = true; EX.used = Math.round((Date.now() - EX.start) / 60000); clearInterval(exTimer); routes.exam(H, [c]); };
        return;
      }
      const rated = Object.keys(EX.rate).length;
      const weak = [...new Set(p.q.filter(q => EX.rate[q.n] && EX.rate[q.n] !== "c").flatMap(q => q.m))];
      H.view.innerHTML = `<h1>Review: ${NAMES[c]}</h1><p class="muted">You used ${EX.used} of ${TIME[c]} minutes. Rate each answer honestly against the notes.</p>
        ${p.q.map(q => `<div class="card"><b>Q${q.n}.</b> ${H.esc(q.t)}<div class="seg" style="margin:8px 0 0">${[["c", "Confident"], ["p", "Partly"], ["n", "Couldn't"]].map(([k, l]) => `<button class="${EX.rate[q.n] === k ? "on" : ""}" data-q="${q.n}" data-r="${k}">${l}</button>`).join("")}</div>
          ${q.m.length ? `<div class="small" style="margin-top:6px">Revise: ${q.m.map(id => `<a href="#/m/${id}">${id}</a>`).join(", ")}</div>` : ""}</div>`).join("")}
        ${rated === p.q.length ? `<h2>Revision list</h2>${weak.length ? `<div class="list">${weak.map(id => H.byId[id] ? H.moduleRow(H.byId[id]) : "").join("")}</div>` : '<p class="pill ok">No weak topics in this paper. Well done.</p>'}<div class="btns"><a class="btn" href="#/exam/${c}/new">Another paper</a></div>` : `<p class="muted">Rate all ${p.q.length} questions to see your revision list (${rated} done).</p>`}`;
      H.view.querySelectorAll("[data-r]").forEach(b => b.onclick = () => {
        EX.rate[b.dataset.q] = b.dataset.r;
        if (Object.keys(EX.rate).length === p.q.length && !EX.saved) { const hist = H.S.examHist || (H.S.examHist = []); hist.push({ c, d: p.d, t: Date.now(), n: p.q.length, conf: Object.values(EX.rate).filter(x => x === "c").length }); H.save(); EX.saved = true; }
        const y = window.scrollY; routes.exam(H, [c]); window.scrollTo(0, y);
      });
    });
  };

  /* ---------- formula sheet ---------- */
  const FORMULAS = [
    ["Sailings", "F1-TCN-07", [
      ["Departure", "dep = d.long × cos lat (parallel sailing; mean or mid latitude in plane sailing)"],
      ["Plane sailing", "tan course = dep / d.lat; distance = d.lat × sec course"],
      ["Mercator sailing", "tan course = d.long / DMP; distance = d.lat × sec course"],
      ["Great circle distance", "cos D = sin lat1 sin lat2 + cos lat1 cos lat2 cos d.long"],
      ["Great circle initial course", "tan IC = sin d.long / (cos lat1 tan lat2 − sin lat1 cos d.long)"],
      ["Vertex (Napier)", "cos lat V = cos lat1 sin IC; sin d.long(1→V) = cos IC / sin lat V"],
      ["Meridional parts", "MP = 7915.7045 log tan(45° + L/2) − 23.0133 sin L (Norie's tables in the exam)"]]],
    ["Coastal navigation", "F1-TCN-03", [
      ["Distance to horizon", "d (nm) = 2.08 √h (h in metres; includes refraction)"],
      ["Geographical range", "2.08 (√H + √h)"],
      ["Vertical sextant angle", "d (nm) ≈ 1.856 × H(m) / α(minutes); H = charted height + (MHWS − height of tide now)"],
      ["HSA circle", "radius = d / (2 sin α); centre on the perpendicular bisector"],
      ["Doubling the angle on the bow", "distance off at 2nd bearing = run between bearings"],
      ["Current triangle", "water vector + current vector = ground vector; CTS: sin x = rate × sin(set − track) / speed"],
      ["Speed, distance, time", "distance = speed × time; 1° of longitude = 4 minutes of time"]]],
    ["Celestial", "F1-CN-08", [
      ["LHA", "LHA = GHA + E long / − W long"],
      ["Calculated altitude", "sin Hc = sin lat sin dec + cos lat cos dec cos LHA"],
      ["Azimuth (ABC)", "A = tan lat / tan P; B = tan dec / sin P; C = A ± B; tan Az = 1 / (C cos lat)"],
      ["Intercept", "intercept = true alt − calc alt (towards if positive)"],
      ["Amplitude", "sin amp = sin dec / cos lat (theoretical rising/setting)"],
      ["Meridian altitude", "lat = ZD ± dec (same names add, contrary subtract); ZD = 90° − true alt"],
      ["Ex-meridian", "reduction = a × t²; a = 1.9635 cos lat cos dec / sin ZD (″ per minute²)"],
      ["Long by chron", "cos P = (sin alt − sin lat sin dec) / (cos lat cos dec)"],
      ["Dip", "dip (′) = 1.76 √h (h in metres)"]]],
    ["Stability", "F3-SCS-03", [
      ["Metacentric height", "GM = KM − KG"],
      ["Righting lever", "GZ = GM sin θ (small angles); GZ = KN − KG sin θ (large angles)"],
      ["KG after loading", "new KG = Σ(w × kg) / Σw"],
      ["List", "GG₁ = w × d / Δ; tan list = GG₁ / GM"],
      ["Free surface", "FSC = FSM / Δ; FSM (rectangular tank) = l b³ / 12 × ρ"],
      ["Angle of loll", "tan loll = √(2 |GM| / BM) (wall-sided)"],
      ["Rolling period", "T ≈ 2 C B / √GM (C ≈ 0.7 to 0.8)"],
      ["Inclining experiment", "GM = w d / (Δ tan θ); tan θ = deflection / pendulum length"]]],
    ["Trim and drafts", "F3-SCS-02", [
      ["Sinkage", "sinkage (cm) = w / TPC"],
      ["Change of trim", "COT (cm) = w × lever from LCF / MCTC"],
      ["Distribution", "change fwd = COT × (LCF distance from FP) / L; change aft = COT × (LCF distance from AP) / L"],
      ["TPC", "TPC = 1.025 × A_w / 100 (salt water)"],
      ["FWA", "FWA (mm) = Δ / (4 TPC)"],
      ["DWA", "DWA = FWA × (1025 − ρ) / 25"],
      ["Quarter-mean draft", "QMD = (F + 6M + A) / 8"]]],
    ["Cargo", "F2-CHS-01", [
      ["Stowage factor", "space needed = cargo weight × SF (+ broken stowage)"],
      ["Volume correction", "GSV = GOV × VCF (ASTM tables, density at 15 °C)"],
      ["Weight in air", "weight = GSV × (density at 15 °C − 0.0011) = GSV × WCF"],
      ["Tackles", "pull = (W + n f W) / VR (f = friction per sheave)"],
      ["SWL of wire (rule of thumb)", "use the formula given in the question (e.g. 20 D² / 500 t for 6×24 wire)"]]],
    ["Meteorology", "F1-MET-02", [
      ["True wind", "true wind = apparent wind − ship's motion (wind named FROM)"],
      ["Geostrophic wind", "measure isobar spacing on the geostrophic scale; surface wind about 2/3 of it over the sea"],
      ["Buys Ballot's law", "NH: back to the wind, low pressure on the left (SH: right)"]]],
  ];
  routes.formulas = H => {
    H.setTab("more"); H.title("Formula sheet");
    H.view.innerHTML = `<h1>Formula sheet</h1><p class="muted">The working formulas behind the exam numericals, gathered from the notes. Use the tables and data supplied in the exam where they differ.</p>` +
      FORMULAS.map(([g, mod, rows]) => `<h2>${g}</h2><div class="card"><table class="plain">${rows.map(([k, v]) => `<tr><th style="width:38%">${H.esc(k)}</th><td>${H.esc(v)}</td></tr>`).join("")}</table><p class="small" style="margin:6px 0 0"><a href="#/m/${mod}">Notes: ${mod}</a> · <a href="#/tools">Calculators</a></p></div>`).join("");
  };

  /* ---------- glossary ---------- */
  const GLOSS = [
    ["ABC tables", "Tables for azimuth from latitude, declination and hour angle"], ["AIS", "Automatic Identification System"], ["ALRS", "Admiralty List of Radio Signals"], ["ARPA", "Automatic Radar Plotting Aid"],
    ["ATT", "Admiralty Tide Tables"], ["BNWAS", "Bridge Navigational Watch Alarm System"], ["BWM", "Ballast Water Management (Convention)"], ["CATZOC", "Category of Zones of Confidence (chart data quality)"],
    ["CBD", "Constrained by her draught"], ["CMG / SMG", "Course / speed made good (over the ground)"], ["COW", "Crude oil washing"], ["CPA / TCPA", "Closest point of approach / time to it"],
    ["CTS", "Course to steer"], ["DMG", "Distance made good"], ["DMP", "Difference of meridional parts"], ["DOC", "Document of Compliance (ISM company; or DG carriage)"],
    ["DR / EP", "Dead-reckoning position / estimated position"], ["DSC", "Digital Selective Calling"], ["DWA / FWA", "Dock water / fresh water allowance"], ["ECA", "Emission Control Area"],
    ["ECDIS", "Electronic Chart Display and Information System"], ["EEBD", "Emergency escape breathing device"], ["ENC", "Electronic Navigational Chart (vector)"], ["EPIRB", "Emergency Position-Indicating Radio Beacon"],
    ["FSC / FSM", "Free surface correction / free surface moment"], ["GHA / LHA / SHA", "Greenwich / local / sidereal hour angle"], ["GM / GZ", "Metacentric height / righting lever"], ["GMDSS", "Global Maritime Distress and Safety System"],
    ["GNSS", "Global Navigation Satellite System"], ["HAT / LAT", "Highest / lowest astronomical tide"], ["HSA / VSA", "Horizontal / vertical sextant angle"], ["IAMSAR", "International Aeronautical and Maritime SAR Manual"],
    ["ICS", "International Code of Signals"], ["IG", "Inert gas"], ["IMDG", "International Maritime Dangerous Goods Code"], ["IMSBC", "International Maritime Solid Bulk Cargoes Code"],
    ["ISM / ISPS", "International Safety Management / Ship and Port Facility Security Code"], ["KM / KG / KB", "Height of metacentre / centre of gravity / centre of buoyancy above keel"], ["LCF / LCB", "Longitudinal centre of flotation / buoyancy"], ["LFL / UFL", "Lower / upper flammable limit"],
    ["LMT / GMT / ZT", "Local mean / Greenwich mean / zone time"], ["LRIT", "Long Range Identification and Tracking"], ["LSA / FFA", "Life-saving / fire-fighting appliances"], ["MCTC", "Moment to change trim 1 cm"],
    ["MHWS / MLWS", "Mean high / low water springs"], ["MLC", "Maritime Labour Convention 2006"], ["MMD", "Mercantile Marine Department (India)"], ["MSI", "Maritime Safety Information"],
    ["NAVTEX", "Navigational Telex (518 kHz MSI broadcasts)"], ["NM", "Notices to Mariners"], ["NUC / RAM", "Not under command / restricted in ability to manoeuvre"], ["ODME", "Oil Discharge Monitoring Equipment"],
    ["OOW", "Officer of the watch"], ["ORB / GRB", "Oil / Garbage Record Book"], ["PDV", "Power-driven vessel"], ["PI", "Parallel index (radar)"],
    ["PSC", "Port State Control"], ["PZX", "Celestial triangle: pole, zenith, body"], ["RCDS", "Raster Chart Display System"], ["SART", "Search and Rescue Transponder"],
    ["SOLAS", "Safety of Life at Sea Convention 1974"], ["SOPEP", "Shipboard Oil Pollution Emergency Plan"], ["SSAS", "Ship Security Alert System"], ["STCW", "Standards of Training, Certification and Watchkeeping Convention"],
    ["SWL", "Safe working load"], ["TML", "Transportable Moisture Limit"], ["TPC", "Tonnes per centimetre immersion"], ["TRS", "Tropical revolving storm"],
    ["TSS", "Traffic separation scheme"], ["UKC", "Under-keel clearance"], ["VDR", "Voyage Data Recorder"], ["VTS", "Vessel Traffic Service"], ["ZD", "Zenith distance"],
  ];
  routes.glossary = H => {
    H.setTab("more"); H.title("Abbreviations");
    H.view.innerHTML = `<h1>Abbreviations</h1><label class="fld"><span>Filter</span><input id="gq" placeholder="e.g. MCTC, ODME"></label><div class="card"><table class="plain" id="gt"></table></div>`;
    const draw = v => { v = v.toLowerCase(); document.getElementById("gt").innerHTML = GLOSS.filter(([k, d]) => !v || (k + " " + d).toLowerCase().includes(v)).map(([k, d]) => `<tr><th style="width:30%">${H.esc(k)}</th><td>${H.esc(d)}</td></tr>`).join("") || "<tr><td>No match</td></tr>"; };
    const i = document.getElementById("gq"); i.oninput = () => draw(i.value); draw("");
  };
})();
