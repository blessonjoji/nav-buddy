/* Exactly specified symbols only: ICS letter flags (layouts checked against the Wikimedia Commons
   ICS SVGs and their heraldic blazons), IALA buoyage marks (IALA MBS), light rhythms, weather-front
   symbols. Anything not fixed by a standard is deliberately NOT drawn here. */
(function () {
  const Y = "#ffd600", B = "#0047ab", R = "#d81e05", W = "#ffffff", K = "#111111", G = "#00a651";

  /* ---------- ICS flags (square 60x60; swallowtails for A and B) ---------- */
  const F = {
    A: `<path d="M0,0H60L45,30L60,60H0Z" fill="${W}"/><path d="M30,0H60L45,30L60,60H30Z" fill="${B}"/>`,
    B: `<path d="M0,0H60L45,30L60,60H0Z" fill="${R}"/>`,
    C: `<rect width="60" height="60" fill="${B}"/><rect y="12" width="60" height="36" fill="${W}"/><rect y="24" width="60" height="12" fill="${R}"/>`,
    D: `<rect width="60" height="60" fill="${Y}"/><rect y="12" width="60" height="36" fill="${B}"/>`,
    E: `<rect width="60" height="30" fill="${B}"/><rect y="30" width="60" height="30" fill="${R}"/>`,
    F: `<rect width="60" height="60" fill="${W}"/><path d="M30,0L60,30L30,60L0,30Z" fill="${R}"/>`,
    G: `<rect width="60" height="60" fill="${Y}"/>${[10, 30, 50].map(x => `<rect x="${x}" width="10" height="60" fill="${B}"/>`).join("")}`,
    H: `<rect width="30" height="60" fill="${W}"/><rect x="30" width="30" height="60" fill="${R}"/>`,
    I: `<rect width="60" height="60" fill="${Y}"/><circle cx="30" cy="30" r="15" fill="${K}"/>`,
    J: `<rect width="60" height="60" fill="${B}"/><rect y="20" width="60" height="20" fill="${W}"/>`,
    K: `<rect width="30" height="60" fill="${Y}"/><rect x="30" width="30" height="60" fill="${B}"/>`,
    L: `<rect width="60" height="60" fill="${Y}"/><rect x="30" width="30" height="30" fill="${K}"/><rect y="30" width="30" height="30" fill="${K}"/>`,
    M: `<rect width="60" height="60" fill="${B}"/><path d="M0,0L60,60M60,0L0,60" stroke="${W}" stroke-width="12"/>`,
    N: `<rect width="60" height="60" fill="${W}"/>${[0, 1, 2, 3].flatMap(j => [0, 1, 2, 3].filter(i => (i + j) % 2 === 0).map(i => `<rect x="${i * 15}" y="${j * 15}" width="15" height="15" fill="${B}"/>`)).join("")}`,
    O: `<rect width="60" height="60" fill="${R}"/><path d="M0,0V60H60Z" fill="${Y}"/>`,
    P: `<rect width="60" height="60" fill="${B}"/><rect x="20" y="20" width="20" height="20" fill="${W}"/>`,
    Q: `<rect width="60" height="60" fill="${Y}"/>`,
    R: `<rect width="60" height="60" fill="${R}"/><rect x="24" width="12" height="60" fill="${Y}"/><rect y="24" width="60" height="12" fill="${Y}"/>`,
    S: `<rect width="60" height="60" fill="${W}"/><rect x="20" y="20" width="20" height="20" fill="${B}"/>`,
    T: `<rect width="20" height="60" fill="${R}"/><rect x="20" width="20" height="60" fill="${W}"/><rect x="40" width="20" height="60" fill="${B}"/>`,
    U: `<rect width="60" height="60" fill="${R}"/><rect x="30" width="30" height="30" fill="${W}"/><rect y="30" width="30" height="30" fill="${W}"/>`,
    V: `<rect width="60" height="60" fill="${W}"/><path d="M0,0L60,60M60,0L0,60" stroke="${R}" stroke-width="12"/>`,
    W: `<rect width="60" height="60" fill="${B}"/><rect x="12" y="12" width="36" height="36" fill="${W}"/><rect x="24" y="24" width="12" height="12" fill="${R}"/>`,
    X: `<rect width="60" height="60" fill="${W}"/><rect x="24" width="12" height="60" fill="${B}"/><rect y="24" width="60" height="12" fill="${B}"/>`,
    Y: `<clipPath id="cy"><rect width="60" height="60"/></clipPath><g clip-path="url(#cy)"><rect width="60" height="60" fill="${R}"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${-60 + i * 24},60L${i * 24},0L${12 + i * 24},0L${-48 + i * 24},60Z" fill="${Y}"/>`).join("")}</g>`,
    Z: `<rect width="60" height="60" fill="${Y}"/><path d="M0,0L30,30L0,60Z" fill="${K}"/><path d="M0,60L30,30L60,60Z" fill="${R}"/><path d="M60,60L30,30L60,0Z" fill="${B}"/>`,
  };
  function flag(letter, size = 64) {
    const body = F[letter]; if (!body) return "";
    const swallow = letter === "A" || letter === "B";
    const outline = swallow ? `<path d="M0,0H60L45,30L60,60H0Z" fill="none" stroke="#555" stroke-width="1"/>` : `<rect width="60" height="60" fill="none" stroke="#555" stroke-width="1"/>`;
    return `<svg viewBox="-1 -1 62 62" width="${size}" height="${size}" role="img" aria-label="Signal flag ${letter}">${body.replace('id="cy"', `id="cy${letter}${size}"`).replace("url(#cy)", `url(#cy${letter}${size})`)}${outline}</svg>`;
  }
  /* Single-letter meanings from the International Code of Signals (Pub. 102, Ch. 1). */
  const MEANING = {
    A: "I have a diver down; keep well clear at slow speed.", B: "I am taking in, or discharging, or carrying dangerous goods.",
    C: "Yes (affirmative).", D: "Keep clear of me; I am maneuvering with difficulty.", E: "I am altering my course to starboard.",
    F: "I am disabled; communicate with me.", G: "I require a pilot. (Fishing vessels near fishing grounds: I am hauling nets.)",
    H: "I have a pilot on board.", I: "I am altering my course to port.",
    J: "I am on fire and have dangerous cargo on board: keep well clear of me, or I am leaking dangerous cargo.",
    K: "I wish to communicate with you.", L: "You should stop your vessel instantly.", M: "My vessel is stopped and making no way through the water.",
    N: "No (negative).", O: "Man overboard.", P: "In harbour: all persons should report on board as the vessel is about to proceed to sea. (At sea, fishing vessels: my nets have come fast upon an obstruction.)",
    Q: "My vessel is healthy and I request free pratique.", R: "No meaning as a single flag.", S: "I am operating astern propulsion.",
    T: "Keep clear of me; I am engaged in pair trawling.", U: "You are running into danger.", V: "I require assistance.",
    W: "I require medical assistance.", X: "Stop carrying out your intentions and watch for my signals.", Y: "I am dragging my anchor.",
    Z: "I require a tug. (Fishing vessels near fishing grounds: I am shooting nets.)",
  };

  /* ---------- IALA marks ---------- */
  // bands: array of colours top to bottom (equal heights), or {v:[...]} for vertical stripes
  function buoy({ body = "pillar", bands = [R], topmark = "", label = "" }) {
    const cx = 60;
    let s = `<rect x="0" y="150" width="120" height="30" fill="#3e7fb0"/>`;
    // float
    s += `<path d="M28 148 Q60 162 92 148 L86 140 L34 140Z" fill="#444"/>`;
    // body
    const top = 70, bot = 140;
    let shape;
    if (body === "can") shape = `M40 ${top} H80 V${bot} H40Z`;
    else if (body === "cone") shape = `M60 ${top - 6} L84 ${bot} H36Z`;
    else if (body === "sphere") shape = `M60 ${top} A34 34 0 1 1 59.9 ${top}Z`;
    else shape = `M48 ${top} H72 L80 ${bot} H40Z`; // pillar
    const id = "b" + Math.random().toString(36).slice(2, 8);
    s += `<clipPath id="${id}"><path d="${shape}"/></clipPath><g clip-path="url(#${id})">`;
    if (bands.v) {
      const x0 = body === "sphere" ? 26 : 40, span = body === "sphere" ? 68 : 40, n = bands.v.length, w = span / n;
      bands.v.forEach((c, i) => { s += `<rect x="${x0 + i * w}" y="${top - 10}" width="${w + 0.5}" height="${bot - top + 20}" fill="${c}"/>`; });
    } else {
      const h = (bot - top + 8) / bands.length;
      bands.forEach((c, i) => { s += `<rect x="20" y="${top - 8 + i * h}" width="80" height="${h + 0.5}" fill="${c}"/>`; });
    }
    s += `</g><path d="${shape}" fill="none" stroke="#222" stroke-width="1"/>`;
    // mast for topmark
    if (topmark) s += `<line x1="${cx}" y1="${top}" x2="${cx}" y2="22" stroke="#222" stroke-width="2"/>`;
    s += topmarkSvg(topmark, cx);
    return `<svg viewBox="0 0 120 180" width="120" height="180" role="img" aria-label="${label}">${s}</svg>`;
  }
  function topmarkSvg(t, x) {
    const cone = (y, up, c = K) => up ? `<path d="M${x} ${y - 9} L${x + 9} ${y + 7} H${x - 9}Z" fill="${c}"/>` : `<path d="M${x} ${y + 9} L${x + 9} ${y - 7} H${x - 9}Z" fill="${c}"/>`;
    switch (t) {
      case "N": return cone(22, true) + cone(42, true);
      case "S": return cone(22, false) + cone(42, false);
      case "E": return cone(22, true) + cone(44, false);
      case "W": return cone(24, false) + cone(42, true);
      case "2balls": return `<circle cx="${x}" cy="22" r="8" fill="${K}"/><circle cx="${x}" cy="42" r="8" fill="${K}"/>`;
      case "redball": return `<circle cx="${x}" cy="34" r="9" fill="${R}"/>`;
      case "yellowX": return `<path d="M${x - 10} 24 L${x + 10} 44 M${x + 10} 24 L${x - 10} 44" stroke="${Y}" stroke-width="5"/>`;
      case "yellowCross": return `<path d="M${x} 22 V46 M${x - 11} 34 H${x + 11}" stroke="${Y}" stroke-width="5"/>`;
      case "canR": return `<rect x="${x - 9}" y="26" width="18" height="16" fill="${R}"/>`;
      case "canG": return `<rect x="${x - 9}" y="26" width="18" height="16" fill="${G}"/>`;
      case "coneG": return cone(34, true, G);
      case "coneR": return cone(34, true, R);
      default: return "";
    }
  }
  const MARKS = [
    { id: "N", group: "Cardinal", name: "North cardinal", svg: () => buoy({ bands: [K, Y], topmark: "N" }), light: "VQ or Q (white, continuous)", rhythm: "VQ", note: "Pass to the north of it. Topmark: two black cones, points up. Black above yellow." },
    { id: "E", group: "Cardinal", name: "East cardinal", svg: () => buoy({ bands: [K, Y, K], topmark: "E" }), light: "VQ(3) 5s or Q(3) 10s (white)", rhythm: "VQ(3) 5s", note: "Pass to the east. Cones base to base. Black with one broad yellow band." },
    { id: "S", group: "Cardinal", name: "South cardinal", svg: () => buoy({ bands: [Y, K], topmark: "S" }), light: "VQ(6) + LFl 10s or Q(6) + LFl 15s (white)", rhythm: "VQ(6)+LFl 10s", note: "Pass to the south. Cones points down. Yellow above black." },
    { id: "W", group: "Cardinal", name: "West cardinal", svg: () => buoy({ bands: [Y, K, Y], topmark: "W" }), light: "VQ(9) 10s or Q(9) 15s (white)", rhythm: "VQ(9) 10s", note: "Pass to the west. Cones point to point. Yellow with one broad black band." },
    { id: "PA", group: "Lateral (Region A, incl. India)", name: "Port-hand mark, Region A", svg: () => buoy({ body: "can", bands: [R], topmark: "canR" }), light: "Red, any rhythm except Fl(2+1)", rhythm: "Fl R 4s", note: "Keep on your port side when going in the conventional direction of buoyage (entering harbour)." },
    { id: "SA", group: "Lateral (Region A, incl. India)", name: "Starboard-hand mark, Region A", svg: () => buoy({ body: "cone", bands: [G], topmark: "coneG" }), light: "Green, any rhythm except Fl(2+1)", rhythm: "Fl G 4s", note: "Keep on your starboard side when entering." },
    { id: "PCSA", group: "Lateral (Region A, incl. India)", name: "Preferred channel to starboard, Region A", svg: () => buoy({ body: "can", bands: [R, G, R], topmark: "canR" }), light: "Fl(2+1) R", rhythm: "Fl(2+1) R 10s", note: "Modified port mark: main channel is to starboard." },
    { id: "PCPA", group: "Lateral (Region A, incl. India)", name: "Preferred channel to port, Region A", svg: () => buoy({ body: "cone", bands: [G, R, G], topmark: "coneG" }), light: "Fl(2+1) G", rhythm: "Fl(2+1) G 10s", note: "Modified starboard mark: main channel is to port." },
    { id: "PB", group: "Lateral (Region B)", name: "Port-hand mark, Region B", svg: () => buoy({ body: "can", bands: [G], topmark: "canG" }), light: "Green, any rhythm except Fl(2+1)", rhythm: "Fl G 4s", note: "Region B (Americas, Japan, Korea, Philippines): colours reversed, shapes the same." },
    { id: "SB", group: "Lateral (Region B)", name: "Starboard-hand mark, Region B", svg: () => buoy({ body: "cone", bands: [R], topmark: "coneR" }), light: "Red, any rhythm except Fl(2+1)", rhythm: "Fl R 4s", note: "\"Red right returning\"." },
    { id: "ID", group: "Other marks", name: "Isolated danger", svg: () => buoy({ bands: [K, R, K], topmark: "2balls" }), light: "Fl(2) white", rhythm: "Fl(2) 5s", note: "On or above a small danger with navigable water all round. Two black spheres." },
    { id: "SW", group: "Other marks", name: "Safe water", svg: () => buoy({ body: "sphere", bands: { v: [R, W, R, W, R, W] }, topmark: "redball" }), light: "Iso, Oc, LFl 10s or Mo(A), white", rhythm: "LFl 10s", note: "Mid-channel or landfall: navigable water all round. Single red sphere." },
    { id: "SP", group: "Other marks", name: "Special mark", svg: () => buoy({ bands: [Y], topmark: "yellowX" }), light: "Yellow, any rhythm not used for white lights", rhythm: "Fl Y 5s", note: "Marks a special area or feature (spoil ground, cables, ODAS). Yellow X topmark." },
    { id: "EW", group: "Other marks", name: "Emergency wreck marking buoy", svg: () => buoy({ bands: { v: [B, Y, B, Y] }, topmark: "yellowCross" }), light: "Alternating blue and yellow flashes", rhythm: "Al Bu Y", note: "Marks a newly discovered danger. Blue and yellow vertical stripes, upright yellow cross." },
  ];

  /* ---------- light rhythm as a timeline (on/off sequence in seconds) ---------- */
  function sequence(code) {
    const s = [], on = (t, c = "W") => s.push([1, t, c]), off = t => s.push([0, t]);
    const col = /\bR\b/.test(code) ? "R" : /\bG\b/.test(code) ? "G" : /\bY\b/.test(code) ? "Y" : "W";
    const fill = per => { const used = s.reduce((a, x) => a + x[1], 0); if (per > used) off(per - used); };
    let m;
    if (code === "VQ") { for (let i = 0; i < 10; i++) { on(0.2); off(0.3); } return s; }
    if (code === "Q") { for (let i = 0; i < 5; i++) { on(0.3); off(0.7); } return s; }
    if ((m = code.match(/^VQ\((\d)\)(\+LFl)? (\d+)s/))) { for (let i = 0; i < +m[1]; i++) { on(0.2); off(0.3); } if (m[2]) { on(2); off(0.5); } fill(+m[3]); return s; }
    if ((m = code.match(/^Fl\(2\+1\) [RG] (\d+)s/))) { on(0.5, col); off(0.7); on(0.5, col); off(1.8); on(0.5, col); fill(+m[1]); return s; }
    if ((m = code.match(/^Fl\(2\) (\d+)s/))) { on(0.5); off(1); on(0.5); fill(+m[1]); return s; }
    if ((m = code.match(/^Fl [RGY] (\d+)s/))) { on(0.6, col); fill(+m[1]); return s; }
    if ((m = code.match(/^LFl (\d+)s/))) { on(2); fill(+m[1]); return s; }
    if (code === "Al Bu Y") { on(1, "B"); off(0.5); on(1, "Y"); off(0.5); return s; }
    if (code === "Iso 4s") { on(2); off(2); return s; }
    if (code === "Oc 4s") { on(3); off(1); return s; }
    if (code === "Mo(A) 8s") { on(0.5); off(0.5); on(1.5); fill(8); return s; }
    return s;
  }
  const LCOL = { W: "#fff6c8", R: "#ff3b30", G: "#2ee66b", Y: "#ffd60a", B: "#3d7dff" };
  function timeline(code) {
    const seq = sequence(code), total = seq.reduce((a, x) => a + x[1], 0) || 1;
    let x = 0, bars = "";
    seq.forEach(([lit, t, c]) => { const w = (t / total) * 300; if (lit) bars += `<rect x="${x}" y="4" width="${w}" height="16" rx="2" fill="${LCOL[c || "W"]}" stroke="#555" stroke-width=".5"/>`; x += w; });
    return `<svg viewBox="0 0 300 24" width="100%" height="24" role="img" aria-label="${code} timing"><rect width="300" height="24" fill="#0b1520" rx="3"/>${bars}</svg><div class="small muted">one period ≈ ${total.toFixed(1)} s</div>`;
  }
  let stopLamp = null;
  function animate(el, code) {
    if (stopLamp) stopLamp();
    const seq = sequence(code); let i = 0, live = true, tid;
    const step = () => { if (!live) return; const [lit, t, c] = seq[i % seq.length]; el.style.background = lit ? LCOL[c || "W"] : "#2a2f36"; el.style.boxShadow = lit ? `0 0 30px 10px ${LCOL[c || "W"]}` : "none"; i++; tid = setTimeout(step, t * 1000); };
    step(); stopLamp = () => { live = false; clearTimeout(tid); el.style.background = "#2a2f36"; el.style.boxShadow = "none"; };
    return stopLamp;
  }

  /* ---------- weather-map front symbols ---------- */
  function front(kind) {
    const tri = (x, c, up = true) => `<path d="M${x} 30 L${x + 8} ${up ? 16 : 44} L${x + 16} 30Z" fill="${c}"/>`;
    const semi = (x, c, up = true) => `<path d="M${x} 30 A8 8 0 0 ${up ? 1 : 0} ${x + 16} 30Z" fill="${c}"/>`;
    let s = "";
    const col = { cold: "#1f5bd6", warm: "#d32f2f", occluded: "#8e24aa", stationary: "" }[kind];
    if (kind === "stationary") { s += `<path d="M0 30 H120" stroke="#d32f2f" stroke-width="3"/><path d="M120 30 H240" stroke="#1f5bd6" stroke-width="3"/>`; for (let i = 0; i < 4; i++) { s += semi(10 + i * 60, "#d32f2f", true) + tri(40 + i * 60, "#1f5bd6", false); } }
    else { s += `<path d="M0 30 H240" stroke="${col}" stroke-width="3"/>`; for (let i = 0; i < 6; i++) { const x = 8 + i * 38; s += kind === "cold" ? tri(x, col) : kind === "warm" ? semi(x, col) : (i % 2 ? semi(x, col) : tri(x, col)); } }
    return `<svg viewBox="0 0 240 50" width="100%" height="50" role="img" aria-label="${kind} front symbol">${s}</svg>`;
  }

  window.SYM = { flag, MEANING, MARKS, timeline, animate, stopLamp: () => stopLamp && stopLamp(), front };
})();
