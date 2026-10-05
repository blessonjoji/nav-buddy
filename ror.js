/* ROR card renderer: draws a COLREG lights/shapes scene as SVG from the card schema in
   content/F1/F1-OR-08/cards.json. Original drawing (schematic), not copied from any source. */
(function () {
  const COL = { W: "#ffffff", R: "#ff3b30", G: "#2ee66b", Y: "#ffd60a", YF: "#ffd60a", RF: "#ff3b30" };

  function light(x, y, code, r) {
    const c = COL[code] || "#fff";
    const blink = code === "YF" || code === "RF" ? ' class="blink"' : "";
    return `<g${blink}><circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="${c}" opacity=".18"/>` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/></g>`;
  }

  function night(card) {
    const W = 360, H = 220, cx = W / 2, sea = 170;
    const asp = (card.aspect || "").toLowerCase();
    const side = card.sidelights || "none";
    let s = `<rect width="${W}" height="${H}" fill="#05080d"/>` +
      `<rect y="${sea}" width="${W}" height="${H - sea}" fill="#0b1520"/>` +
      `<line x1="0" y1="${sea}" x2="${W}" y2="${sea}" stroke="#1d2b3a"/>`;
    // direction of travel as seen by observer: red side seen => heading to observer's left
    const dir = side === "red" ? -1 : side === "green" ? 1 : 0;
    const headOn = dir === 0 && (side === "both" || /head|end.on|ahead/.test(asp));
    const fromAstern = side === "none" && card.stern;
    const lights = [];
    // masthead lights
    const mh = String(card.masthead || "0");
    const baseY = 112;
    if (mh === "1") lights.push([cx + (dir ? -dir * 10 : 0), baseY - 20, "W"]);
    if (mh === "2-vertical") { lights.push([cx, baseY - 22, "W"], [cx, baseY - 4, "W"]); }
    if (mh === "3-vertical") { lights.push([cx, baseY - 40, "W"], [cx, baseY - 22, "W"], [cx, baseY - 4, "W"]); }
    if (mh === "2-fore-aft") {
      if (headOn) lights.push([cx, baseY - 6, "W"], [cx, baseY - 30, "W"]);
      else {
        const d = dir || 1;
        lights.push([cx + d * 55, baseY - 2, "W"], [cx - d * 35, baseY - 30, "W"]);
      }
    }
    // all-round stack (top to bottom)
    const ex = (card.extra || "").toLowerCase();
    let ar = card.allround || [];
    if (/anchor-fwd-aft/.test(ex) && ar.every(c => c === "W")) ar = [];
    if (ar.length) {
      const x = mh === "0" || !mh ? cx : cx + (dir ? -dir * 70 : -60);
      const top = 40 + Math.max(0, 4 - ar.length) * 9;
      ar.forEach((c, i) => lights.push([x, top + i * 18, c]));
    }
    // sidelights
    const sy = baseY + 22;
    if (side === "both") { lights.push([cx - 14, sy, "G"], [cx + 14, sy, "R"]); }
    if (side === "red") lights.push([cx + (mh === "2-fore-aft" ? -dir * 55 : 0) - 0, sy, "R"]);
    if (side === "green") lights.push([cx + (mh === "2-fore-aft" ? dir * 55 : 0), sy, "G"]);
    // stern / towing
    if (card.stern) {
      const x = fromAstern ? cx : cx - (dir || 1) * 70;
      lights.push([x, sy + 10, "W"]);
      if (card.towing_light) lights.push([x, sy - 8, "Y"]);
    }
    // extra free-text lights
    if (/2r/.test(ex)) lights.push([cx - 70, 70, "R"], [cx - 70, 88, "R"]);
    if (/2g/.test(ex)) lights.push([cx + 70, 70, "G"], [cx + 70, 88, "G"]);
    if (/3 all-round g|3g/.test(ex)) lights.push([cx, 30, "G"], [cx - 40, 48, "G"], [cx + 40, 48, "G"]);
    if (/^anchor light/.test(ex)) lights.push([cx + 60, 118, "W"]);
    if (/anchor-fwd-aft/.test(ex)) lights.push([cx - 60, 96, "W"], [cx + 60, 112, "W"]);
    if (/deck-lights/.test(ex)) for (let i = -3; i <= 3; i++) lights.push([cx + i * 22, sea - 14, "W"]);
    if (/w-towards-gear/.test(ex)) lights.push([cx + 90, 128, "W"]);
    s += lights.map(([x, y, c]) => light(x, y, c, c === "W" ? 4.2 : 4.6)).join("");
    return `<svg class="ror-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Night view of a vessel's lights">${s}</svg>`;
  }

  function shape(kind, x, y) {
    const k = kind.toLowerCase(), f = "#111";
    if (k === "ball") return `<circle cx="${x}" cy="${y}" r="9" fill="${f}"/>`;
    if (k === "cone-up") return `<path d="M${x} ${y - 10} L${x + 10} ${y + 9} L${x - 10} ${y + 9}Z" fill="${f}"/>`;
    if (k === "cone-down") return `<path d="M${x} ${y + 10} L${x + 10} ${y - 9} L${x - 10} ${y - 9}Z" fill="${f}"/>`;
    if (k === "diamond") return `<path d="M${x} ${y - 11} L${x + 9} ${y} L${x} ${y + 11} L${x - 9} ${y}Z" fill="${f}"/>`;
    if (k === "cylinder") return `<rect x="${x - 8}" y="${y - 11}" width="16" height="22" fill="${f}"/>`;
    if (k === "basket" || k === "cones-points-together")
      return `<path d="M${x - 10} ${y - 11} L${x + 10} ${y - 11} L${x} ${y} Z M${x - 10} ${y + 11} L${x + 10} ${y + 11} L${x} ${y} Z" fill="${f}"/>`;
    if (k === "flag-a") return `<path d="M${x - 2} ${y - 12} v24" stroke="${f}" stroke-width="2"/><path d="M${x} ${y - 12} h12 l-5 7 l5 7 h-12z" fill="#fff" stroke="#1d4fa8"/><path d="M${x + 6} ${y - 12} h6 l-5 7 l5 7 h-6z" fill="#1d4fa8"/>`;
    return `<text x="${x}" y="${y + 4}" font-size="10" text-anchor="middle" fill="${f}">${kind}</text>`;
  }

  function day(card) {
    const W = 360, H = 240, cx = 180, sea = 188;
    let s = `<rect width="${W}" height="${H}" fill="#cfe6f7"/><rect y="${sea}" width="${W}" height="${H - sea}" fill="#3e7fb0"/>` +
      `<path d="M70 ${sea - 4} L300 ${sea - 4} L285 ${sea + 14} L88 ${sea + 14}Z" fill="#4a4f57"/>` +
      `<rect x="150" y="${sea - 30}" width="60" height="26" fill="#d9dde2" stroke="#6b737d"/>` +
      `<line x1="${cx}" y1="${sea - 30}" x2="${cx}" y2="22" stroke="#222" stroke-width="3"/>` +
      `<line x1="${cx - 28}" y1="40" x2="${cx + 28}" y2="40" stroke="#222" stroke-width="2"/>`;
    const sh = card.shapes || [];
    const ex = (card.extra || "").toLowerCase();
    if (/each yardarm/.test(ex)) { s += shape("ball", cx - 26, 52) + shape("ball", cx + 26, 52); }
    if (/2 balls on one side/.test(ex)) { s += shape("ball", cx - 26, 52) + shape("ball", cx - 26, 78) + shape("diamond", cx + 26, 52) + shape("diamond", cx + 26, 78); }
    if (/cone point up on one side/.test(ex)) s += shape("cone-up", cx - 70, sea - 40);
    sh.forEach((k, i) => { s += shape(k, cx, 56 + i * 26); });
    return `<svg class="ror-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Day view of a vessel's shapes">${s}</svg>`;
  }

  window.ROR = { render: c => (c.view === "day" ? day(c) : night(c)) };
})();
