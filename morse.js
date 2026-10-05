/* Morse light flasher used by the Signals trainer. */
(function () {
  let stopFlag = false;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function flash(lamp, text, code, wpm) {
    stopFlag = false;
    const unit = 1200 / wpm;
    const chars = String(text).toUpperCase().split("");
    for (let i = 0; i < chars.length; i++) {
      if (stopFlag) break;
      const ch = chars[i];
      if (ch === " ") { await sleep(unit * 7); continue; }
      const pat = code[ch];
      if (!pat) continue;
      for (let j = 0; j < pat.length; j++) {
        if (stopFlag) break;
        lamp.classList.add("on");
        await sleep(pat[j] === "-" ? unit * 3 : unit);
        lamp.classList.remove("on");
        if (j < pat.length - 1) await sleep(unit);
      }
      if (i < chars.length - 1 && chars[i + 1] !== " ") await sleep(unit * 3);
    }
    lamp.classList.remove("on");
  }

  window.MORSE = { flash, stop: () => { stopFlag = true; } };
})();
