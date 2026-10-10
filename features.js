/* Nav-Buddy feature modules: calculators, numericals generator, symbols trainers (flags, IALA,
   light rhythms, fronts), spaced repetition, planner and progress. Registered as extra routes. */
(function () {
  "use strict";
  const N = () => window.NAV, SY = () => window.SYM;
  const routes = (window.NB_ROUTES = window.NB_ROUTES || {});
  const f1 = x => (Math.round(x * 10) / 10).toFixed(1), f2 = x => (Math.round(x * 100) / 100).toFixed(2);
  const rnd = (a, b) => a + Math.random() * (b - a), rint = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------- spaced repetition (Leitner boxes) ---------- */
  const DAYS = [0, 1, 3, 7, 16, 35];
  window.NB_SRS = {
    update(r, ok) { r.box = ok ? Math.min(5, (r.box || 0) + 1) : 1; r.due = Date.now() + DAYS[r.box] * 864e5; },
    due(S) { const now = Date.now(); return Object.keys(S.quiz).filter(id => { const r = S.quiz[id]; return (r.due || 0) <= now; }); },
  };

  /* ---------- small form helpers ---------- */
  const latField = (id, label, deg = "", min = "", h = "N") => `<label class="fld"><span>${label}</span><span class="row3"><input type="number" id="${id}d" value="${deg}" placeholder="deg" step="1"><input type="number" id="${id}m" value="${min}" placeholder="min" step="0.1"><select id="${id}h"><option${h === "N" ? " selected" : ""}>N</option><option${h === "S" ? " selected" : ""}>S</option></select></span></label>`;
  const lonField = (id, label, deg = "", min = "", h = "E") => `<label class="fld"><span>${label}</span><span class="row3"><input type="number" id="${id}d" value="${deg}" placeholder="deg" step="1"><input type="number" id="${id}m" value="${min}" placeholder="min" step="0.1"><select id="${id}h"><option${h === "E" ? " selected" : ""}>E</option><option${h === "W" ? " selected" : ""}>W</option></select></span></label>`;
  const numField = (id, label, val = "", step = "any") => `<label class="fld"><span>${label}</span><input type="number" id="${id}" value="${val}" step="${step}"></label>`;
  const selField = (id, label, opts) => `<label class="fld"><span>${label}</span><select id="${id}">${opts.map(o => `<option>${o}</option>`).join("")}</select></label>`;
  const val = id => parseFloat(document.getElementById(id).value);
  const sv = id => document.getElementById(id).value;
  const pos = id => N().dm(val(id + "d"), val(id + "m") || 0, sv(id + "h"));
  const out = (html) => { document.getElementById("calcOut").innerHTML = `<div class="card result">${html}</div>`; };

  /* ---------- calculators ---------- */
  const CALCS = {
    gc: { t: "Great circle sailing", g: "Sailings", form: () => latField("a", "From latitude", 48, 14, "S") + lonField("b", "From longitude", 47, 47, "E") + latField("c", "To latitude", 16, 28, "S") + lonField("d", "To longitude", 89, 23, "E"),
      run() { const A = [pos("a"), pos("b")], B = [pos("c"), pos("d")], r = N().greatCircle(A[0], A[1], B[0], B[1]);
        out(`<div class="kv"><span>Distance</span><b>${f1(r.dist)} nm</b><span>Initial course</span><b>${f1(r.initial)}°</b><span>Final course</span><b>${f1(r.final)}°</b><span>d.long</span><span>${f1(Math.abs(r.dlong) * 60)}' ${r.dlong >= 0 ? "E" : "W"}</span><span>Vertex</span><span>${N().fmtLat(r.vertex[0])} ${N().fmtLon(r.vertex[1])} ${r.vertexOnTrack ? "(on the track)" : "(outside A–B)"}</span></div>
          <p class="small muted">cos D = sin lat1 sin lat2 + cos lat1 cos lat2 cos d.long. Initial course from tan C = sin dl cos lat2 / (cos lat1 sin lat2 − sin lat1 cos lat2 cos dl).</p>`); } },
    merc: { t: "Mercator sailing", g: "Sailings", form: () => latField("a", "From latitude", 10, 0, "N") + lonField("b", "From longitude", 60, 0, "W") + latField("c", "To latitude", 40, 30, "N") + lonField("d", "To longitude", 10, 0, "W"),
      run() { const r = N().mercator(pos("a"), pos("b"), pos("c"), pos("d"));
        out(`<div class="kv"><span>Course</span><b>${f1(r.course)}°</b><span>Distance</span><b>${f1(r.dist)} nm</b><span>d.lat</span><span>${f1(Math.abs(r.dlat))}' ${r.dlat >= 0 ? "N" : "S"}</span><span>DMP</span><span>${f1(Math.abs(r.dmp))}</span><span>d.long</span><span>${f1(Math.abs(r.dlong))}' ${r.dlong >= 0 ? "E" : "W"}</span></div>
          <p class="small muted">tan course = d.long / DMP; distance = d.lat × sec course. Meridional parts by the spheroidal formula (Norie's).</p>`); } },
    plane: { t: "Plane / mid-latitude sailing", g: "Sailings", form: () => latField("a", "From latitude", 20, 0, "N") + lonField("b", "From longitude", 70, 0, "E") + latField("c", "To latitude", 21, 10, "N") + lonField("d", "To longitude", 71, 30, "E"),
      run() { const r = N().planeMidLat(pos("a"), pos("b"), pos("c"), pos("d"));
        out(`<div class="kv"><span>Course</span><b>${f1(r.course)}°</b><span>Distance</span><b>${f1(r.dist)} nm</b><span>d.lat</span><span>${f1(Math.abs(r.dlat))}'</span><span>Departure</span><span>${f1(Math.abs(r.dep))}'</span><span>Mean lat</span><span>${f2(r.meanLat)}°</span></div>
          <p class="small muted">dep = d.long × cos mean lat; tan course = dep / d.lat. Good for short distances (under ~600 nm).</p>`); } },
    dest: { t: "Destination by Mercator (course & distance)", g: "Sailings", form: () => latField("a", "From latitude", 30, 0, "N") + lonField("b", "From longitude", 140, 0, "E") + numField("c", "Course (°T)", 225) + numField("d", "Distance (nm)", 600),
      run() { const r = N().mercatorDest(pos("a"), pos("b"), val("c"), val("d")); out(`<div class="kv"><span>Arrival</span><b>${N().fmtLat(r.lat)} ${N().fmtLon(r.lon)}</b><span>d.lat</span><span>${f1(Math.abs(r.dlat))}'</span><span>DMP</span><span>${f1(Math.abs(r.dmp))}</span><span>d.long</span><span>${f1(Math.abs(r.dlong))}'</span></div>`); } },
    trav: { t: "Day's work traverse", g: "Sailings", form: () => latField("a", "Start latitude", 20, 0, "N") + lonField("b", "Start longitude", 50, 0, "W") + `<label class="fld"><span>Legs: course,distance per line (true, nm; add current as set,drift)</span><textarea id="legs" rows="4">045,100\n120,80\n270,30</textarea></label>`,
      run() { const legs = sv("legs").split(/\n/).map(l => l.split(/[ ,]+/).map(Number)).filter(x => x.length === 2 && !x.some(isNaN));
        const r = N().traverse(legs, pos("a"), pos("b"));
        out(`<table class="plain"><tr><th>Course</th><th>Dist</th><th>d.lat</th><th>dep</th></tr>${r.rows.map(x => `<tr><td>${f1(x.c)}</td><td>${f1(x.dist)}</td><td>${f1(Math.abs(x.dl))} ${x.dl >= 0 ? "N" : "S"}</td><td>${f1(Math.abs(x.dp))} ${x.dp >= 0 ? "E" : "W"}</td></tr>`).join("")}</table>
          <div class="kv" style="margin-top:8px"><span>Total d.lat</span><span>${f1(Math.abs(r.dlat))}' ${r.dlat >= 0 ? "N" : "S"}</span><span>Total dep</span><span>${f1(Math.abs(r.dep))}' ${r.dep >= 0 ? "E" : "W"}</span><span>CMG / DMG</span><b>${f1(r.cmg)}° / ${f1(r.dmg)} nm</b><span>Position</span><b>${N().fmtLat(r.lat)} ${N().fmtLon(r.lon)}</b></div>`); } },
    sight: { t: "Sight reduction: intercept & azimuth", g: "Celestial", form: () => latField("a", "DR latitude", 36, 54, "N") + lonField("b", "DR longitude", 20, 0, "W") + numField("gha", "GHA of body (°)", 340.5) + numField("dec", "Declination (°, S negative)", -12.4) + numField("ta", "True altitude (°)", 28.35),
      run() { const lat = pos("a"), lon = pos("b"), L = N().lha(val("gha"), lon), r = N().calcAltAz(lat, val("dec"), L), ic = (val("ta") - r.hc) * 60;
        out(`<div class="kv"><span>LHA</span><span>${f1(L)}°</span><span>Calculated alt</span><span>${f2(r.hc)}°</span><span>Intercept</span><b>${f1(Math.abs(ic))}' ${ic >= 0 ? "TOWARDS" : "AWAY"}</b><span>Azimuth</span><b>${f1(r.az)}°T</b></div><p class="small muted">sin Hc = sin lat sin dec + cos lat cos dec cos LHA. Plot the PL at right angles to the azimuth through the intercept point.</p>`); } },
    abc: { t: "ABC tables (azimuth)", g: "Celestial", form: () => numField("lat", "Latitude (°, S negative)", 36.9) + numField("dec", "Declination (°, S negative)", -12.4) + numField("lha", "LHA (°)", 320.5),
      run() { const r = N().abc(val("lat"), val("dec"), val("lha"));
        out(`<div class="kv"><span>P</span><span>${f1(r.P)}° ${r.side}</span><span>A = tan lat / tan P</span><span>${r.A.toFixed(3)} ${r.Aname}</span><span>B = tan dec / sin P</span><span>${r.B.toFixed(3)} ${r.Bname}</span><span>C = A ± B</span><span>${r.C.toFixed(3)} ${r.Cname}</span><span>Azimuth</span><b>${r.Cname} ${f1(r.angle)}° ${r.side} = ${f1(r.az)}°T</b></div><p class="small muted">A named opposite to latitude (same when P > 90°); B named as declination; tan Az = 1 / (C cos lat).</p>`); } },
    amp: { t: "Amplitude & compass error", g: "Celestial", form: () => numField("lat", "Latitude (°, S negative)", 45) + numField("dec", "Declination (°, S negative)", 20) + selField("rs", "Body", ["Rising", "Setting"]) + numField("cb", "Compass bearing observed (°C)", 66) + numField("vr", "Variation (°, E +, W −)", -3),
      run() { const a = N().amplitude(val("lat"), val("dec")), rising = sv("rs") === "Rising", dec = val("dec");
        const tb = rising ? (dec >= 0 ? 90 - a : 90 + Math.abs(a)) : (dec >= 0 ? 270 + a : 270 - Math.abs(a));
        let err = tb - val("cb"); err = ((err + 540) % 360) - 180; const dev = err - (val("vr") || 0);
        out(`<div class="kv"><span>True amplitude</span><span>${rising ? "E" : "W"} ${f1(Math.abs(a))}° ${dec >= 0 ? "N" : "S"}</span><span>True bearing</span><b>${f1(N().norm360(tb))}°</b><span>Compass error</span><b>${f1(Math.abs(err))}° ${err >= 0 ? "E" : "W"}</b><span>Deviation</span><b>${f1(Math.abs(dev))}° ${dev >= 0 ? "E" : "W"}</b></div><p class="small muted">sin amp = sin dec / cos lat (theoretical rising/setting: centre on the rational horizon). Error = true − compass.</p>`); } },
    mer: { t: "Meridian altitude & ex-meridian", g: "Celestial", form: () => numField("ta", "True altitude (°)", 69.5) + numField("dec", "Declination (°, S negative)", 10) + selField("brg", "Body bears", ["S", "N"]) + numField("lat", "DR latitude (for ex-meridian, °)", 30) + numField("t", "Time from meridian passage (min, 0 = on meridian)", 12),
      run() { const t = val("t") || 0;
        if (!t) { const L = N().merAltLat(val("ta"), val("dec"), sv("brg")); return out(`<div class="kv"><span>Zenith distance</span><span>${f2(90 - val("ta"))}°</span><b>Latitude</b><b>${N().fmtLat(L)}</b></div>`); }
        const r = N().exMeridian(val("lat"), val("dec"), val("ta"), t, sv("brg"));
        out(`<div class="kv"><span>a (″ per min²)</span><span>${f2(r.a)}</span><span>Reduction</span><span>${f1(r.red)}'</span><span>Meridian altitude</span><span>${f2(r.mer)}°</span><b>Latitude</b><b>${N().fmtLat(r.lat)}</b></div><p class="small muted">Reduction = a t² (a from the ex-meridian table: 1.9635 cos lat cos dec / sin ZD). Check t is within the ex-meridian limit.</p>`); } },
    lbc: { t: "Longitude by chronometer", g: "Celestial", form: () => numField("lat", "Latitude (°, S negative)", 40) + numField("dec", "Declination (°, S negative)", 15) + numField("ta", "True altitude (°)", 30) + numField("gha", "GHA (°)", 300) + selField("side", "Body is", ["East of meridian (a.m.)", "West of meridian (p.m.)"]),
      run() { const r = N().longByChron(val("lat"), val("dec"), val("ta"), val("gha"), sv("side").startsWith("East"));
        out(`<div class="kv"><span>P</span><span>${f2(r.P)}°</span><span>LHA</span><span>${f2(r.LHA)}°</span><b>Longitude</b><b>${N().fmtLon(r.lon)}</b></div><p class="small muted">cos P = (sin alt − sin lat sin dec) / (cos lat cos dec); LHA = P (west) or 360 − P (east); long = LHA − GHA.</p>`); } },
    wind: { t: "True / apparent wind", g: "Meteorology", form: () => numField("c", "Ship's course (°T)", 90) + numField("s", "Ship's speed (kn)", 15) + numField("ad", "Apparent wind FROM (°T)", 30) + numField("as", "Apparent wind speed (kn)", 25),
      run() { const [d, s] = N().trueWind(val("c"), val("s"), val("ad"), val("as")); out(`<div class="kv"><span>True wind from</span><b>${f1(d)}°T</b><span>True wind speed</span><b>${f1(s)} kn</b></div><p class="small muted">Vectorially: true wind = apparent wind − ship's motion (wind named FROM).</p>`); } },
    cur: { t: "Current triangle", g: "Chartwork", form: () => selField("mode", "Find", ["Course to steer (counteract)", "CMG & SMG (allow)", "Engine speed for an ETA"]) + numField("tr", "Track required / heading (°T)", 40) + numField("sp", "Engine speed or required SMG (kn)", 12) + numField("set", "Current set (°T, towards)", 160) + numField("rate", "Current rate (kn)", 3),
      run() { const m = sv("mode");
        if (m.startsWith("Course")) { const r = N().courseToSteer(val("tr"), val("sp"), val("set"), val("rate")); return out(r ? `<div class="kv"><span>Course to steer</span><b>${f1(r.cts)}°T</b><span>SMG</span><b>${f1(r.smg)} kn</b></div><p class="small muted">sin x = rate × sin(set − track) / speed; steer into the current.</p>` : "Current too strong to hold this track."); }
        if (m.startsWith("CMG")) { const r = N().allowCurrent(val("tr"), val("sp"), val("set"), val("rate")); return out(`<div class="kv"><span>CMG</span><b>${f1(r.cmg)}°T</b><span>SMG</span><b>${f1(r.smg)} kn</b></div>`); }
        const r = N().engineSpeedFor(val("tr"), val("sp"), val("set"), val("rate")); out(`<div class="kv"><span>Course to steer</span><b>${f1(r.cts)}°T</b><span>Engine speed</span><b>${f1(r.speed)} kn</b></div>`); } },
    sd: { t: "Set and drift (DR vs fix)", g: "Chartwork", form: () => latField("a", "DR latitude", 50, 10, "N") + lonField("b", "DR longitude", 5, 0, "W") + latField("c", "Fix latitude", 50, 6.1, "N") + lonField("d", "Fix longitude", 4, 56.4, "W") + numField("h", "Hours since last fix", 3),
      run() { const r = N().setAndDrift(pos("a"), pos("b"), pos("c"), pos("d"), val("h")); out(`<div class="kv"><span>Set</span><b>${f1(r.set)}°T</b><span>Drift</span><b>${f1(r.drift)} nm</b><span>Rate</span><b>${f1(r.rate)} kn</b></div>`); } },
    list: { t: "List, free surface & loll", g: "Stability", form: () => numField("w", "Weight shifted/loaded off-centre (t)", 150) + numField("x", "Transverse distance (m)", 8) + numField("disp", "Displacement (t)", 16170) + numField("gm", "Solid GM (m)", 0.61) + numField("fsm", "Free surface moments (t·m)", 1450),
      run() { const disp = val("disp"), fsc = (val("fsm") || 0) / disp, gmf = val("gm") - fsc, r = N().listFromShift(val("w"), val("x"), disp, gmf);
        out(`<div class="kv"><span>FSC</span><span>${f2(fsc)} m</span><span>Fluid GM</span><b>${f2(gmf)} m</b><span>GG₁</span><span>${r.gg1.toFixed(4)} m</span><span>List</span><b>${gmf > 0 ? f1(r.list) + "°" : "GM not positive: loll, not list"}</b></div><p class="small muted">GG₁ = w × d / Δ; tan list = GG₁ / GM (fluid).</p>`); } },
    trim: { t: "Trim: load/discharge one weight", g: "Stability", form: () => numField("L", "LBP (m)", 150) + numField("f", "Draft forward (m)", 7.2) + numField("a", "Draft aft (m)", 7.8) + numField("tpc", "TPC", 22) + numField("mctc", "MCTC (t·m/cm)", 180) + numField("lcf", "LCF aft of amidships (m, fwd negative)", 2) + numField("w", "Weight (t, discharge negative)", 200) + numField("x", "Position forward of amidships (m, aft negative)", 40),
      run() { const r = N().trimLoad(val("L"), val("f"), val("a"), val("tpc"), val("mctc"), val("lcf"), val("w"), val("x"));
        out(`<div class="kv"><span>Sinkage</span><span>${f2(r.sink)} cm</span><span>Trimming moment</span><span>${f1(r.moment)} t·m ${r.moment >= 0 ? "by the head" : "by the stern"}</span><span>Change of trim</span><span>${f2(Math.abs(r.ct))} cm</span><span>Change fwd / aft</span><span>${f2(r.fwd)} / ${f2(-r.aft)} cm</span><b>New drafts</b><b>F ${r.newF.toFixed(3)} m · A ${r.newA.toFixed(3)} m</b></div>`); } },
    fwa: { t: "FWA and DWA", g: "Stability", form: () => numField("disp", "Summer displacement (t)", 20000) + numField("tpc", "TPC (salt water)", 25) + numField("rho", "Dock water density (kg/m³)", 1010),
      run() { const fw = N().fwa(val("disp"), val("tpc")), dw = N().dwa(fw, val("rho")); out(`<div class="kv"><span>FWA</span><b>${f1(fw)} mm</b><span>DWA</span><b>${f1(dw)} mm</b></div><p class="small muted">FWA = Δ / (4 TPC); DWA = FWA × (1025 − ρ) / 25. The ship may submerge the load line by the DWA in dock water.</p>`); } },
    arc: { t: "Arc ↔ time, speed–distance–time", g: "Basics", form: () => numField("deg", "Arc (degrees, e.g. longitude)", 82.5) + numField("dist", "Distance (nm)", 240) + numField("spd", "Speed (kn)", 14.5),
      run() { const deg = val("deg"), mins = deg * 4, h = Math.floor(mins / 60), m = mins - h * 60; const t = val("dist") / val("spd");
        out(`<div class="kv"><span>Arc in time</span><b>${h} h ${f1(m)} min</b><span>Time on passage</span><b>${Math.floor(t)} h ${Math.round((t % 1) * 60)} min</b></div><p class="small muted">15° = 1 h; 1° = 4 min; 1' = 4 s.</p>`); } },
  };
  routes.tools = (H, args) => {
    H.setTab("practice"); const id = args[0];
    if (!id || !CALCS[id]) {
      H.title("Tools");
      const groups = [...new Set(Object.values(CALCS).map(c => c.g))];
      H.view.innerHTML = `<h1>Calculators</h1><p class="muted">Check your exam working. Results use the same formulas as the worked answers in the notes.</p>` +
        groups.map(g => `<h2>${g}</h2><div class="list">${Object.entries(CALCS).filter(([, c]) => c.g === g).map(([k, c]) => `<a class="row" href="#/tools/${k}"><span class="grow">${c.t}</span></a>`).join("")}</div>`).join("");
      return;
    }
    const c = CALCS[id]; H.title(c.t);
    H.view.innerHTML = `<h1>${c.t}</h1><div class="card form">${c.form()}<div class="btns"><button class="btn" id="go">Calculate</button></div></div><div id="calcOut"></div>`;
    document.getElementById("go").onclick = () => { try { c.run(); } catch (e) { out("Check the inputs."); } };
    c.run();
  };

  /* ---------- numericals generator ---------- */
  const latStr = x => N().fmtLat(x), lonStr = x => N().fmtLon(x);
  const rlat = (a, b) => (Math.round(rnd(a, b) * 60) / 60) * (Math.random() < 0.5 ? 1 : -1);
  const GEN = {
    gc: { t: "Great circle", make() {
      let A, B, r; do { A = [rlat(5, 50), Math.round(rnd(-179, 179) * 60) / 60]; B = [rlat(5, 50), A[1] + (Math.random() < 0.5 ? 1 : -1) * Math.round(rnd(40, 90) * 60) / 60]; B[1] = ((B[1] + 540) % 360) - 180; r = N().greatCircle(A[0], A[1], B[0], B[1]); } while (r.dist < 1500);
      return { q: `Find the great-circle distance and initial course from ${latStr(A[0])} ${lonStr(A[1])} to ${latStr(B[0])} ${lonStr(B[1])}.`,
        ans: [["Distance (nm)", r.dist, 2], ["Initial course (°T)", r.initial, 0.5]],
        steps: [`d.long = ${f1(Math.abs(r.dlong))}° ${r.dlong >= 0 ? "E" : "W"}`, `cos D = sin lat1 sin lat2 + cos lat1 cos lat2 cos d.long → D = ${f2(r.dist / 60)}° = <b>${f1(r.dist)} nm</b>`,
          `tan IC = sin dl cos lat2 / (cos lat1 sin lat2 − sin lat1 cos lat2 cos dl) → <b>${f1(r.initial)}°T</b> (final course ${f1(r.final)}°T)`, `Vertex: ${latStr(r.vertex[0])} ${lonStr(r.vertex[1])}${r.vertexOnTrack ? "" : " (not between the two positions)"}`] }; } },
    merc: { t: "Mercator sailing", make() {
      const A = [rlat(0, 45), Math.round(rnd(-170, 170) * 60) / 60]; const B = [Math.max(-60, Math.min(60, A[0] + rnd(-20, 20))), A[1] + rnd(-25, 25)]; B[0] = Math.round(B[0] * 60) / 60; B[1] = Math.round(B[1] * 60) / 60;
      const r = N().mercator(A[0], A[1], B[0], B[1]);
      return { q: `By Mercator sailing find the course and distance from ${latStr(A[0])} ${lonStr(A[1])} to ${latStr(B[0])} ${lonStr(B[1])}.`,
        ans: [["Course (°T)", r.course, 0.5], ["Distance (nm)", r.dist, 2]],
        steps: [`d.lat = ${f1(Math.abs(r.dlat))}'; MP1 = ${f1(N().mp(A[0]))}, MP2 = ${f1(N().mp(B[0]))} → DMP = ${f1(Math.abs(r.dmp))}`, `d.long = ${f1(Math.abs(r.dlong))}'`,
          `tan course = d.long / DMP → <b>${f1(r.course)}°T</b>`, `distance = d.lat × sec course = <b>${f1(r.dist)} nm</b>`] }; } },
    amp: { t: "Amplitude & compass error", make() {
      const lat = Math.round(rnd(-50, 50) * 10) / 10, dec = Math.round(rnd(-23.4, 23.4) * 10) / 10, rising = Math.random() < 0.5, a = N().amplitude(lat, dec);
      const tb = rising ? (dec >= 0 ? 90 - a : 90 + Math.abs(a)) : (dec >= 0 ? 270 + a : 270 - Math.abs(a)); const err = Math.round(rnd(-4, 4) * 2) / 2 || 1.5; const cb = N().norm360(tb - err);
      return { q: `In latitude ${Math.abs(lat)}°${lat >= 0 ? "N" : "S"} the Sun (declination ${Math.abs(dec)}°${dec >= 0 ? "N" : "S"}) bore ${f1(cb)}°C at theoretical ${rising ? "rising" : "setting"}. Find the compass error.`,
        ans: [["Compass error (° , E +, W −)", err, 0.3]],
        steps: [`sin amp = sin dec / cos lat → amplitude = ${rising ? "E" : "W"} ${f1(Math.abs(a))}° ${dec >= 0 ? "N" : "S"}`, `True bearing = ${f1(N().norm360(tb))}°`, `Error = true − compass = ${f1(N().norm360(tb))} − ${f1(cb)} = <b>${f1(Math.abs(err))}° ${err >= 0 ? "E" : "W"}</b>`] }; } },
    icpt: { t: "Intercept & azimuth", make() {
      const lat = Math.round(rnd(-45, 45) * 10) / 10, dec = Math.round(rnd(-23, 23) * 10) / 10; let L, r; do { L = Math.round(rnd(0, 359.9) * 10) / 10; r = N().calcAltAz(lat, dec, L); } while (r.hc < 15 || r.hc > 70);
      const ta = Math.round((r.hc + rnd(-0.12, 0.12)) * 100) / 100, ic = (ta - r.hc) * 60;
      return { q: `DR latitude ${Math.abs(lat)}°${lat >= 0 ? "N" : "S"}, LHA ${f1(L)}°, declination ${Math.abs(dec)}°${dec >= 0 ? "N" : "S"}, true altitude ${f2(ta)}°. Find the intercept and azimuth.`,
        ans: [["Intercept (nm, towards +, away −)", ic, 0.3], ["Azimuth (°T)", r.az, 0.5]],
        steps: [`sin Hc = sin lat sin dec + cos lat cos dec cos LHA → Hc = ${f2(r.hc)}°`, `Intercept = TA − CA = ${f1(Math.abs(ic))}' <b>${ic >= 0 ? "towards" : "away"}</b>`, `Azimuth (formula or ABC tables) = <b>${f1(r.az)}°T</b>`] }; } },
    cts: { t: "Course to steer (current)", make() {
      const tr = rint(0, 359), sp = rint(8, 16), set = rint(0, 359), rate = Math.round(rnd(1, 4) * 2) / 2, r = N().courseToSteer(tr, sp, set, rate);
      return { q: `Track required ${String(tr).padStart(3, "0")}°T, engine speed ${sp} kn, current setting ${String(set).padStart(3, "0")}°T at ${rate} kn. Find the course to steer and the speed made good.`,
        ans: [["Course to steer (°T)", r.cts, 0.7], ["SMG (kn)", r.smg, 0.2]],
        steps: [`Angle between set and track = ${N().norm360(set - tr)}°`, `sin x = ${rate} × sin(${N().norm360(set - tr)}°) / ${sp} → x = ${f1(Math.abs(Math.asin(rate * Math.sin((set - tr) * Math.PI / 180) / sp) * 180 / Math.PI))}°`, `CTS = <b>${f1(r.cts)}°T</b> (steer into the current)`, `SMG from the vector triangle = <b>${f1(r.smg)} kn</b>`] }; } },
    wind: { t: "True wind", make() {
      const c = rint(0, 359), s = rint(8, 20), td = rint(0, 359), ts = rint(8, 35), [ad, as] = N().apparentWind(c, s, td, ts);
      return { q: `Course ${String(c).padStart(3, "0")}°T, speed ${s} kn. Apparent wind from ${f1(ad)}°T at ${f1(as)} kn. Find the true wind.`,
        ans: [["True wind FROM (°T)", td, 1.5], ["True wind speed (kn)", ts, 0.7]],
        steps: [`Draw the ship's vector (course, speed) and the apparent wind vector`, `True wind = apparent wind − ship's motion`, `<b>${String(td).padStart(3, "0")}°T at ${ts} kn</b>`] }; } },
    list: { t: "List from a weight shift", make() {
      const disp = rint(8, 25) * 1000, gm = Math.round(rnd(0.4, 1.4) * 100) / 100, w = rint(5, 30) * 10, x = rint(4, 14), r = N().listFromShift(w, x, disp, gm);
      return { q: `A ship of ${disp} t displacement, GM ${gm} m, shifts ${w} t transversely through ${x} m. Find the list.`,
        ans: [["List (°)", r.list, 0.2]],
        steps: [`GG₁ = w × d / Δ = ${w} × ${x} / ${disp} = ${r.gg1.toFixed(4)} m`, `tan θ = GG₁ / GM = ${r.gg1.toFixed(4)} / ${gm}`, `List = <b>${f1(r.list)}°</b>`] }; } },
    trim: { t: "Final drafts (one weight)", make() {
      const L = rint(12, 20) * 10, dF = Math.round(rnd(5, 9) * 100) / 100, dA = Math.round((dF + rnd(-0.3, 1)) * 100) / 100, tpc = rint(15, 35), mctc = rint(120, 300), lcf = Math.round(rnd(-3, 4) * 10) / 10, w = rint(5, 40) * 10 * (Math.random() < 0.8 ? 1 : -1), x = Math.round(rnd(-L / 2 + 10, L / 2 - 10));
      const r = N().trimLoad(L, dF, dA, tpc, mctc, lcf, w, x);
      return { q: `LBP ${L} m, drafts F ${dF.toFixed(2)} m A ${dA.toFixed(2)} m, TPC ${tpc}, MCTC ${mctc}, LCF ${Math.abs(lcf)} m ${lcf >= 0 ? "aft" : "forward"} of amidships. ${w > 0 ? "Load" : "Discharge"} ${Math.abs(w)} t at ${Math.abs(x)} m ${x >= 0 ? "forward" : "aft"} of amidships. Find the final drafts.`,
        ans: [["Final draft forward (m)", r.newF, 0.02], ["Final draft aft (m)", r.newA, 0.02]],
        steps: [`Sinkage/rise = w / TPC = ${f2(r.sink)} cm`, `Lever from LCF = ${f2(x + lcf)} m → moment ${f1(r.moment)} t·m`, `Change of trim = ${f2(Math.abs(r.ct))} cm ${r.ct >= 0 ? "by the head" : "by the stern"}`, `Change fwd ${f2(r.fwd)} cm, aft ${f2(-r.aft)} cm (in proportion to LCF distances from FP and AP)`, `<b>F ${r.newF.toFixed(3)} m, A ${r.newA.toFixed(3)} m</b>`] }; } },
  };
  let G = null;
  routes.numgen = (H, args) => {
    H.setTab("practice"); H.title("Numericals practice");
    const type = args[0] && GEN[args[0]] ? args[0] : null;
    if (!type) {
      const S = H.S; const st = S.gen || {};
      H.view.innerHTML = `<h1>Numericals practice</h1><p class="muted">Endless fresh exam-style problems. Work them on paper, enter your answer, then check the step-by-step solution.</p>
        <div class="list">${Object.entries(GEN).map(([k, g]) => `<a class="row" href="#/numgen/${k}"><span class="grow">${g.t}</span>${st[k] ? `<span class="pill">${st[k].c}/${st[k].n} correct</span>` : ""}</a>`).join("")}</div>
        <p class="small muted">Tolerances follow exam practice (e.g. ±0.5° on courses). Also see the fixed set in <a href="#/numericals">Sailings numericals</a> and the <a href="#/tools">calculators</a>.</p>`;
      return;
    }
    if (!G || G.type !== type || args[1] === "new") G = Object.assign({ type, done: false }, GEN[type].make());
    if (args[1] === "new") { location.replace("#/numgen/" + type); return; }
    H.view.innerHTML = `<h1>${GEN[type].t}</h1><div class="qcard"><div class="qtext">${G.q}</div>
      ${G.ans.map(([lbl], i) => numField("ga" + i, lbl)).join("")}
      <div class="btns"><button class="btn" id="chk">Check</button><button class="btn ghost" id="show">Show solution</button><a class="btn ghost" href="#/numgen/${type}/new">New problem</a></div><div id="gres"></div></div>
      <p class="small"><a href="#/numgen">All problem types</a></p>`;
    const show = (verdict) => {
      document.getElementById("gres").innerHTML = `${verdict || ""}<div class="exp"><b>Solution</b><ol>${G.steps.map(s => `<li>${s}</li>`).join("")}</ol>
        <p style="margin:0">${G.ans.map(([l, v]) => `${l}: <b>${f2(v)}</b>`).join(" · ")}</p></div>`;
    };
    document.getElementById("show").onclick = () => show();
    document.getElementById("chk").onclick = () => {
      let ok = true; const marks = G.ans.map(([l, v, tol], i) => { const u = parseFloat(document.getElementById("ga" + i).value); let diff = Math.abs(u - v); if (/°T|course|Azimuth|FROM/i.test(l)) diff = Math.min(diff, 360 - diff); const good = !isNaN(u) && diff <= tol; ok = ok && good; return `<span class="pill ${good ? "ok" : "bad"}">${l.split(" (")[0]}: ${good ? "✓" : "✗"}</span>`; });
      if (!G.done) { const S = H.S; S.gen = S.gen || {}; const st = (S.gen[type] = S.gen[type] || { n: 0, c: 0 }); st.n++; if (ok) st.c++; H.save(); G.done = true; }
      show(`<p>${marks.join(" ")}</p>`);
    };
  };

  /* ---------- symbols: flags, buoyage, rhythms, fronts ---------- */
  routes.symbols = H => {
    H.setTab("orals"); H.title("Symbols");
    H.view.innerHTML = `<h1>Symbols trainers</h1><p class="muted">Only symbols fixed exactly by a standard are drawn here.</p>
      <div class="grid"><a class="tile" href="#/flags"><span class="t">Signal flags A–Z</span><span class="small muted">ICS single-letter signals</span>${SY().flag("A", 40)}${SY().flag("B", 40)}${SY().flag("C", 40)}</a>
      <a class="tile" href="#/buoyage"><span class="t">IALA buoyage</span><span class="small muted">marks, topmarks, lights</span></a>
      <a class="tile" href="#/rhythms"><span class="t">Light rhythms</span><span class="small muted">Fl, Q, VQ, Iso, Oc, LFl…</span></a>
      <a class="tile" href="#/fronts"><span class="t">Weather fronts</span><span class="small muted">map symbols</span></a></div>`;
  };
  let FQ = null;
  routes.flags = (H, args) => {
    H.setTab("orals"); H.title("Signal flags"); const L = Object.keys(SY().MEANING);
    const mode = args[0] || "learn";
    const seg = `<div class="seg">${[["learn", "All flags"], ["quiz", "Quiz: name the flag"], ["meaning", "Quiz: meaning"]].map(([k, l]) => `<button class="${mode === k ? "on" : ""}" onclick="location.hash='#/flags/${k}'">${l}</button>`).join("")}</div>`;
    if (mode === "learn") {
      H.view.innerHTML = `<h1>Signal flags</h1>${seg}<div class="flaggrid">${L.map(l => `<div class="card flagcard">${SY().flag(l, 72)}<div><b>${l}</b><br><span class="small">${H.esc(SY().MEANING[l])}</span></div></div>`).join("")}</div>
        <p class="small muted">Flag layouts follow the International Code of Signals; meanings from the ICS single-letter table. The letters B, C, D, E, G, H, I, S, T and Z, when made by sound, may only be used in compliance with COLREG.</p>`;
      return;
    }
    if (!FQ || FQ.mode !== mode || args[1] === "next") { const l = H.shuffle(L)[0]; const others = H.shuffle(L.filter(x => x !== l)).slice(0, 3); FQ = { mode, l, opts: H.shuffle([l, ...others]), picked: null, n: (FQ && FQ.n) || 0, c: (FQ && FQ.c) || 0 }; if (args[1] === "next") { location.replace("#/flags/" + mode); return; } }
    const label = x => (mode === "quiz" ? x : SY().MEANING[x]);
    H.view.innerHTML = `<h1>Signal flags</h1>${seg}<div class="qcard"><div style="text-align:center">${SY().flag(FQ.l, 120)}</div>
      <div class="qtext">${mode === "quiz" ? "Which letter is this flag?" : "What does this flag mean flown alone?"}</div>
      ${FQ.opts.map(o => `<button class="opt ${FQ.picked ? (o === FQ.l ? "right" : o === FQ.picked ? "wrong" : "") : ""}" data-o="${o}" ${FQ.picked ? "disabled" : ""}>${H.esc(label(o))}</button>`).join("")}
      ${FQ.picked ? `<div class="exp"><b>${FQ.l}</b>: ${H.esc(SY().MEANING[FQ.l])}</div><div class="btns"><a class="btn" href="#/flags/${mode}/next">Next flag</a></div>` : ""}
      <p class="small muted">Score ${FQ.c}/${FQ.n}</p></div>`;
    H.view.querySelectorAll("[data-o]").forEach(b => b.onclick = () => { FQ.picked = b.dataset.o; FQ.n++; if (FQ.picked === FQ.l) FQ.c++; routes.flags(H, [mode]); });
  };
  let BQ = null;
  routes.buoyage = (H, args) => {
    H.setTab("buoyage"); H.title("IALA buoyage"); SY().stopLamp();
    const mode = args[0] || "learn", MK = SY().MARKS;
    const seg = `<div class="seg">${[["learn", "All marks"], ["quiz", "Quiz"]].map(([k, l]) => `<button class="${mode === k ? "on" : ""}" onclick="location.hash='#/buoyage/${k}'">${l}</button>`).join("")}</div>`;
    if (mode === "learn") {
      const groups = [...new Set(MK.map(m => m.group))];
      H.view.innerHTML = `<h1>IALA buoyage</h1>${seg}<p class="muted">Tap “Show light” to see the light character. Periods marked “e.g.” are typical examples: the rhythm is fixed by IALA, the exact period is set locally.</p>` +
        groups.map(g => `<h2>${g}</h2><div class="buoygrid">${MK.filter(m => m.group === g).map(m => `<div class="card buoycard">${m.svg()}<div><b>${m.name}</b><br><span class="small">${H.esc(m.note)}</span><br><span class="small"><b>Light:</b> ${H.esc(m.light)}</span>
          <div class="lampmini" id="lm-${m.id}"></div><button class="btn sm ghost" data-l="${m.id}">Show light${/^(VQ|Q|Fl\(2\+1\)|Al)/.test(m.rhythm) && !/Fl [RGY] 4s/.test(m.rhythm) ? "" : " (e.g.)"}</button></div></div>`).join("")}</div>`).join("") +
        `<p class="small"><a href="#/m/F1-TCN-10">Full notes: F1-TCN-10 IALA buoyage</a></p>`;
      H.view.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { const m = MK.find(x => x.id === b.dataset.l); SY().animate(document.getElementById("lm-" + m.id), m.rhythm); });
      return;
    }
    if (!BQ || args[1] === "next") { const m = H.shuffle(MK)[0]; BQ = { m, opts: H.shuffle([m, ...H.shuffle(MK.filter(x => x !== m)).slice(0, 3)]).map(x => x.name), picked: null, n: (BQ && BQ.n) || 0, c: (BQ && BQ.c) || 0 }; if (args[1] === "next") { location.replace("#/buoyage/quiz"); return; } }
    H.view.innerHTML = `<h1>IALA buoyage</h1>${seg}<div class="qcard"><div style="text-align:center">${BQ.m.svg()}</div><div class="qtext">What is this mark?</div>
      ${BQ.opts.map(o => `<button class="opt ${BQ.picked ? (o === BQ.m.name ? "right" : o === BQ.picked ? "wrong" : "") : ""}" data-o="${H.esc(o)}" ${BQ.picked ? "disabled" : ""}>${H.esc(o)}</button>`).join("")}
      ${BQ.picked ? `<div class="exp"><b>${BQ.m.name}</b>. ${H.esc(BQ.m.note)} Light: ${H.esc(BQ.m.light)}.</div><div class="btns"><a class="btn" href="#/buoyage/quiz/next">Next mark</a></div>` : ""}
      <p class="small muted">Score ${BQ.c}/${BQ.n}</p></div>`;
    H.view.querySelectorAll("[data-o]").forEach(b => b.onclick = () => { BQ.picked = b.dataset.o; BQ.n++; if (BQ.picked === BQ.m.name) BQ.c++; routes.buoyage(H, ["quiz"]); });
  };
  const RHY = [["VQ", "Very quick: 80–159 flashes a minute (usually 120). North cardinal: continuous."], ["Q", "Quick: 50–79 flashes a minute (usually 60)."],
    ["VQ(3) 5s", "East cardinal (very quick version)."], ["VQ(6)+LFl 10s", "South cardinal: six flashes then a long flash."], ["VQ(9) 10s", "West cardinal."],
    ["Fl(2) 5s", "Group flashing (2): isolated danger, e.g. period 5 s."], ["Fl(2+1) R 10s", "Composite group flashing: preferred-channel mark, e.g. period 10 s."],
    ["LFl 10s", "Long flash (at least 2 s): safe water."], ["Iso 4s", "Isophase: light and dark equal (e.g. 4 s period)."], ["Oc 4s", "Occulting: light longer than dark (e.g. 4 s period)."],
    ["Mo(A) 8s", "Morse code A (· ▬): safe water alternative."], ["Al Bu Y", "Alternating blue and yellow: emergency wreck marking buoy."]];
  routes.rhythms = H => {
    H.setTab("orals"); H.title("Light rhythms"); SY().stopLamp();
    H.view.innerHTML = `<h1>Light rhythms</h1><p class="muted">Timeline shows one period (light = bright bar). Periods marked “e.g.” are examples.</p>` +
      RHY.map(([c, d], i) => `<div class="card"><b>${c}</b> <span class="small muted">${H.esc(d)}</span>${SY().timeline(c)}<div class="lampmini" id="rl${i}"></div><button class="btn sm ghost" data-r="${i}">Play</button></div>`).join("");
    H.view.querySelectorAll("[data-r]").forEach(b => b.onclick = () => SY().animate(document.getElementById("rl" + b.dataset.r), RHY[+b.dataset.r][0]));
  };
  routes.fronts = H => {
    H.setTab("orals"); H.title("Weather fronts");
    const FR = [["cold", "Cold front", "Blue triangles pointing in the direction of movement."], ["warm", "Warm front", "Red semicircles on the side towards which it moves."],
      ["occluded", "Occluded front", "Purple, alternating triangles and semicircles on the same side."], ["stationary", "Stationary (quasi-stationary) front", "Alternating red semicircles and blue triangles on opposite sides."]];
    H.view.innerHTML = `<h1>Weather-map fronts</h1>${FR.map(([k, n, d]) => `<div class="card"><b>${n}</b>${SY().front(k)}<span class="small muted">${d}</span></div>`).join("")}<p class="small"><a href="#/m/F1-MET-08">Full notes: F1-MET-08 fronts and depressions</a></p>`;
  };

  /* ---------- planner & progress ---------- */
  const PAPERS = [["TCN", "Terrestrial & Coastal Navigation"], ["CN", "Celestial Navigation"], ["BE", "Bridge Equipment & Watchkeeping"], ["MET", "Meteorology"], ["CHS", "Cargo Handling & Stowage"], ["SCS", "Ship Construction & Stability"], ["OR", "Orals (all functions)"]];
  function paperStats(H, p) {
    const ms = H.M.filter(m => m.paper === p); let q = 0, seen = 0, right = 0;
    ms.forEach(m => m.quiz.forEach(x => { q++; const r = H.S.quiz[x.id]; if (r) { seen++; if (r.last) right++; } }));
    return { mods: ms.length, read: ms.filter(m => H.S.read[m.id]).length, q, seen, right };
  }
  routes.progress = H => {
    H.setTab("more"); H.title("Progress & planner");
    const S = H.S; S.plan = S.plan || {};
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const rows = PAPERS.map(([p, n]) => {
      const st = paperStats(H, p), date = S.plan[p] || "", days = date ? Math.ceil((new Date(date) - today) / 864e5) : null;
      const left = st.q - st.seen, perDay = days && days > 0 ? Math.ceil(left / days) : null;
      return `<tr><td><b>${n}</b><br><span class="small muted">${st.read}/${st.mods} read · ${st.seen}/${st.q} tried · ${st.seen ? H.pct(st.right, st.seen) + "% right" : "-"}</span>${H.bar(H.pct(st.read + st.seen, st.mods + st.q))}</td>
        <td><input type="date" data-p="${p}" value="${date}"></td><td>${days == null ? "-" : days < 0 ? "done" : days + " d"}${perDay ? `<br><span class="small muted">${perDay} Q/day</span>` : ""}</td></tr>`;
    }).join("");
    const weak = H.M.map(m => { let n = 0, c = 0; m.quiz.forEach(x => { const r = S.quiz[x.id]; if (r) { n++; if (r.last) c++; } }); return { m, n, p: n ? c / n : 1 }; }).filter(x => x.n >= 3).sort((a, b) => a.p - b.p).slice(0, 6);
    const due = window.NB_SRS.due(S).length;
    H.view.innerHTML = `<h1>Progress & planner</h1>
      <div class="grid"><a class="tile" href="#/quiz/review"><span class="big">${due}</span><span class="t">Due for review</span><span class="small muted">spaced repetition</span></a></div>
      <h2>By paper</h2><p class="muted small">Set your exam dates to get a daily question target.</p>
      <div class="card" style="overflow-x:auto"><table class="plain"><tr><th>Paper</th><th>Exam date</th><th>Left</th></tr>${rows}</table></div>
      <h2>Weakest topics</h2>${weak.length ? `<div class="list">${weak.map(x => `<a class="row" href="#/m/${x.m.id}/quiz"><span class="grow"><span class="id">${x.m.id}</span><br>${H.esc(x.m.title)}</span><span class="pill bad">${Math.round(x.p * 100)}%</span></a>`).join("")}</div>` : '<p class="muted">Answer at least 3 questions in a topic to see it here.</p>'}`;
    H.view.querySelectorAll("input[type=date]").forEach(i => i.onchange = () => { S.plan[i.dataset.p] = i.value; H.save(); routes.progress(H); });
  };
})();
