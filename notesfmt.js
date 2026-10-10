/* Nav-Buddy notes formatter: turns the plain notes HTML into the Elec-Buddy style
   (section cards with numbered headers, jump bar, callouts, formula and question boxes,
   styled tables, arrow lists, step circles, highlighted values). Runs on the live DOM. */
(function () {
  "use strict";
  const ICONS = [
    [/quick revision|summary|remember/i, "🧠"],
    [/worked example|example|numerical|calculation|exam data/i, "🧮"],
    [/formula|method|how to (find|calculate)|working/i, "📐"],
    [/definition|terms|meaning|what is|kinds of|types/i, "📖"],
    [/procedure|steps|taking over|preparing|preparation|checks|checklist|action/i, "🪜"],
    [/error|limitation|danger|hazard|precaution|risk|failure|warning/i, "⚠️"],
    [/fire|extinguish|foam/i, "🔥"],
    [/medical|first aid|health|casualty/i, "🩺"],
    [/security|piracy|stowaway|isps/i, "🛡️"],
    [/storm|weather|wind|cloud|fog|ice|wave|swell|current|pressure|atmosphere|met/i, "🌦️"],
    [/light|shape|signal|flag|sound|morse|gmdss|radio|vhf|epirb|sart/i, "🚦"],
    [/radar|ecdis|arpa|gyro|compass|gnss|gps|ais|log|echo|sextant|equipment|instrument/i, "🧭"],
    [/stability|trim|gz|list|draft|draught|displacement|free surface/i, "📊"],
    [/cargo|container|tank|bulk|grain|dangerous|imdg|stowage|hold|lashing|reefer/i, "📦"],
    [/rule|regulation|solas|marpol|code|law|convention|certificate|survey|psc|stcw|mlc|ism/i, "⚖️"],
    [/star|sun|moon|celestial|time|altitude|azimuth|meridian|twilight/i, "🌟"],
    [/chart|passage|position|fix|tide|sailing|buoy/i, "🗺️"],
  ];
  const UNIT_T = null;
  const iconFor = t => { for (const [re, ic] of ICONS) if (re.test(t)) return ic; return "⚓"; };
  const UNIT = /(\b\d+(?:[.,]\d+)?(?:\s?(?:to|or|-|–)\s?\d+(?:[.,]\d+)?)?\s?(?:%|percent|°C|°F|°|'|ppm|NM|nm|knots?|kn|m³\/h|m³\/t|m³|m²|t·m\/cm|t·m|t\/m²|t\/m³|m·rad|N\/mm²|kJ|kN|kW|kVA|MHz|kHz|GHz|cm|mm|m|t|GT|litres?|L|minutes?|min|hours?|h|seconds?|s|days?|months?|years?|bar|cd|dB)(?![\w/]))/g;

  function markValues(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement.closest(".n-formula,.n-h1,.n-h2,.n-val,th,code,a,.n-q-label") ? NodeFilter.FILTER_REJECT : new RegExp(UNIT.source).test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      UNIT.lastIndex = 0;
      const frag = document.createDocumentFragment(); let last = 0, s = n.nodeValue, mm;
      while ((mm = UNIT.exec(s))) {
        frag.append(s.slice(last, mm.index));
        const sp = document.createElement("span"); sp.className = "n-val"; sp.textContent = mm[0]; frag.append(sp);
        last = mm.index + mm[0].length;
      }
      frag.append(s.slice(last)); n.replaceWith(frag);
    });
  }
  const box = (cls, icon, inner) => { const d = document.createElement("div"); d.className = cls; d.innerHTML = `<div class="icon">${icon}</div><div class="body">${inner}</div>`; return d; };

  window.NB_formatNotes = function (article) {
    const h1 = article.querySelector("h1"); if (h1) h1.remove();
    const kids = [...article.childNodes];
    const sections = []; let cur = { head: null, nodes: [] };
    kids.forEach(k => { if (k.nodeType === 1 && k.tagName === "H2") { sections.push(cur); cur = { head: k, nodes: [] }; } else cur.nodes.push(k); });
    sections.push(cur);
    article.innerHTML = "";
    const anchors = [];
    let num = 0;
    sections.forEach(sec => {
      if (!sec.head && !sec.nodes.some(n => n.nodeType === 1 || (n.nodeValue || "").trim())) return;
      const el = document.createElement("section");
      el.className = "n-sec";
      if (sec.head) {
        num++;
        let txt = sec.head.innerHTML;
        const plain = sec.head.textContent;
        let asked = "";
        txt = txt.replace(/\s*\((asked[^)]*)\)/i, (_, a) => { asked = a; return ""; });
        const id = "s-" + num;
        el.id = id;
        if (/quick revision/i.test(plain)) el.classList.add("revise");
        if (/worked example|example/i.test(plain)) el.classList.add("example");
        const head = document.createElement("div");
        head.className = "n-h1";
        head.innerHTML = `<span class="n-num">${String(num).padStart(2, "0")}</span><span class="n-ic">${iconFor(plain)}</span><span class="n-t">${txt}</span>${asked ? `<span class="n-asked">🔥 ${asked.replace(/^asked/i, "Asked")}</span>` : ""}`;
        el.append(head);
        let lab = plain.replace(/\s*\(asked[^)]*\)/i, "").replace(/\s*\(.*?\)\s*$/, "");
        const ex = lab.match(/^worked example\s*(\d+)?/i); if (ex) lab = "Example" + (ex[1] ? " " + ex[1] : "");
        lab = lab.split(":")[0];
        if (lab.length > 32) lab = lab.slice(0, 32).replace(/\s+\S*$/, "") + "…";
        anchors.push([id, lab]);
      } else el.classList.add("lead");
      sec.nodes.forEach(n => el.append(n));
      article.append(el);
    });

    // drawings: the long "Sketch:" descriptions become a one-line placeholder (tap to see what to draw)
    article.querySelectorAll("strong").forEach(s => {
      if (!/^(sketch|sketches|figures?|drawing)\b[^:]{0,40}:$/i.test(s.textContent.trim())) return;
      const block = s.parentElement; if (!block || !/^(P|LI)$/.test(block.tagName)) return;
      const d = document.createElement("details"); d.className = "n-draw";
      d.innerHTML = '<summary>✏️ Drawing to be added</summary>';
      const body = document.createElement("div");
      let n = s.nextSibling; while (n) { const nx = n.nextSibling; body.append(n); n = nx; }
      d.append(body); s.remove();
      if (block.tagName === "LI") { if (block.textContent.trim()) block.append(d); else { block.innerHTML = ""; block.append(d); } }
      else if (block.textContent.trim()) block.after(d); else block.replaceWith(d);
    });

    // components
    article.querySelectorAll("h3").forEach(h => { h.className = "n-h2"; });
    article.querySelectorAll("ul").forEach(u => u.classList.add("n-list"));
    article.querySelectorAll("ol").forEach(o => o.classList.add("n-steps"));
    article.querySelectorAll("table").forEach(t => { t.classList.add("n-table"); const w = document.createElement("div"); w.className = "n-tablewrap"; t.replaceWith(w); w.append(t); });
    article.querySelectorAll("blockquote").forEach(b => b.replaceWith(box("n-info", "💡", b.innerHTML.replace(/<\/?p>/g, " "))));
    article.querySelectorAll("section.n-sec > p").forEach(p => {
      const only = p.children.length === 1 && p.firstElementChild.tagName === "STRONG" && p.textContent.trim() === p.firstElementChild.textContent.trim();
      const t = p.textContent.trim();
      if (only && /=|→/.test(t) && t.length < 200) { const d = document.createElement("div"); d.className = "n-formula"; d.innerHTML = p.firstElementChild.innerHTML; p.replaceWith(d); return; }
      if (only && t.length >= 60) { p.replaceWith(box("n-q", "📝", `<div class="n-q-label">Exam question</div>${p.firstElementChild.innerHTML}`)); return; }
      const lead = p.firstElementChild && p.firstElementChild.tagName === "STRONG" && p.innerHTML.trim().startsWith("<strong>") && /[.:?]\s*$/.test(p.firstElementChild.textContent.trim()) && p.firstElementChild.textContent.length < 70;
      if (lead) {
        const k = p.firstElementChild.textContent.toLowerCase();
        const cls = /danger|warning|never|caution|do not|don't|wrong|beware/.test(k) ? ["n-warn", "⚠️"] : /why|reason|tip|remember|note|hint/.test(k) ? ["n-ok", "💡"] : ["n-info", "📘"];
        p.replaceWith(box(cls[0], cls[1], p.innerHTML));
      }
    });
    // quick revision section body becomes one memory box
    article.querySelectorAll("section.revise").forEach(s => {
      const head = s.querySelector(".n-h1"); const rest = [...s.childNodes].filter(n => n !== head);
      const d = document.createElement("div"); d.className = "n-memory"; d.innerHTML = '<div class="n-memory-label">Say it in one breath</div>';
      rest.forEach(n => d.append(n)); s.append(d);
    });
    // an intro made only of callout boxes needs no outer card (avoids a box inside a box)
    article.querySelectorAll("section.lead").forEach(s => {
      if ([...s.children].every(c => /(n-info|n-ok|n-warn|n-q)/.test(c.className) || c.tagName === "HR")) s.classList.add("bare");
    });
    // wide tables: a right-arrow hint that fades out 5 s after the table comes into view
    requestAnimationFrame(() => {
      const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        const h = e.target.querySelector(".n-scrollhint"); if (!h) return;
        h.classList.add("show"); setTimeout(() => h.classList.remove("show"), 5000);
      }), { threshold: 0.4 }) : null;
      article.querySelectorAll(".n-tablewrap").forEach(w => {
        if (w.scrollWidth <= w.clientWidth + 4) return;
        const box = document.createElement("div"); box.className = "n-tablebox"; w.replaceWith(box); box.append(w);
        const h = document.createElement("div"); h.className = "n-scrollhint"; h.setAttribute("aria-hidden", "true"); h.textContent = "›"; box.append(h);
        w.addEventListener("scroll", () => h.classList.remove("show"), { passive: true });
        if (io) io.observe(box); else { h.classList.add("show"); setTimeout(() => h.classList.remove("show"), 5000); }
      });
    });
    markValues(article);
    return anchors;
  };
})();
