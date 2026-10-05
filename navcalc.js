/* Navigation, celestial, wind, current and stability maths for Nav-Buddy.
   Port of research/navcalc.py (the module used to check every worked answer in the notes).
   Angles in degrees; lat N +, S -; lon E +, W -; distances in nautical miles. */
(function () {
  const r = x => (x * Math.PI) / 180, d = x => (x * 180) / Math.PI;
  const { sin, cos, tan, atan, atan2, asin, acos, log10, abs, sqrt } = Math;
  const norm360 = x => ((x % 360) + 360) % 360;
  const dlong = (a, b) => { const x = ((b - a + 180) % 360 + 360) % 360 - 180; return x === -180 ? 180 : x; };
  const wrap180 = x => ((x + 180) % 360 + 360) % 360 - 180;

  function mp(lat) {
    const L = r(abs(lat));
    const v = 7915.7045 * log10(tan(r(45) + L / 2)) - 23.0133 * sin(L) - 0.0525 * sin(L) ** 3;
    return lat < 0 ? -v : v;
  }

  function greatCircle(lat1, lon1, lat2, lon2) {
    const L1 = r(lat1), L2 = r(lat2), dl = r(dlong(lon1, lon2));
    const D = acos(Math.min(1, Math.max(-1, sin(L1) * sin(L2) + cos(L1) * cos(L2) * cos(dl))));
    const ic = norm360(d(atan2(sin(dl) * cos(L2), cos(L1) * sin(L2) - sin(L1) * cos(L2) * cos(dl))));
    const back = norm360(d(atan2(sin(-dl) * cos(L1), cos(L2) * sin(L1) - sin(L2) * cos(L1) * cos(-dl))));
    const v = gcVertex(lat1, lon1, lat2, lon2);
    return { dist: d(D) * 60, initial: ic, final: norm360(back + 180), vertex: v.vertex, vertexOnTrack: v.onTrack, dlong: dlong(lon1, lon2) };
  }
  const vec = (lat, lon) => [cos(r(lat)) * cos(r(lon)), cos(r(lat)) * sin(r(lon)), sin(r(lat))];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = v => { const n = sqrt(v.reduce((s, x) => s + x * x, 0)); return v.map(x => x / n); };
  function gcVertex(lat1, lon1, lat2, lon2) {
    const a = vec(lat1, lon1), b = vec(lat2, lon2), n = norm(cross(a, b));
    const p = norm([0 - n[2] * n[0], 0 - n[2] * n[1], 1 - n[2] * n[2]]);
    const cands = [p, p.map(x => -x)];
    const ang = (u, w) => acos(Math.max(-1, Math.min(1, u[0] * w[0] + u[1] * w[1] + u[2] * w[2])));
    const between = v => abs(ang(a, v) + ang(v, b) - ang(a, b)) < 1e-9;
    const on = cands.filter(between);
    let v;
    if (on.length) v = on[0];
    else v = ((abs(lat1) >= abs(lat2) ? lat1 : lat2) >= 0) ? cands[0] : cands[1];
    return { vertex: [d(asin(v[2])), d(atan2(v[1], v[0]))], onTrack: on.length > 0 };
  }

  function mercator(lat1, lon1, lat2, lon2) {
    const dlat = (lat2 - lat1) * 60, dmp = mp(lat2) - mp(lat1), dlo = dlong(lon1, lon2) * 60;
    const C = atan2(dlo, dmp);
    const dist = abs(cos(C)) > 1e-9 ? abs(dlat / cos(C)) : abs(dlo) * cos(r(lat1));
    return { course: norm360(d(C)), dist, dlat, dmp, dlong: dlo };
  }
  function mercatorDest(lat1, lon1, course, dist) {
    const C = r(course), dlat = dist * cos(C), lat2 = lat1 + dlat / 60, dmp = mp(lat2) - mp(lat1);
    const dlo = abs(cos(C)) > 1e-9 ? dmp * tan(C) : (dist * sin(C)) / cos(r(lat1));
    return { lat: lat2, lon: wrap180(lon1 + dlo / 60), dlat, dmp, dlong: dlo };
  }
  function planeMidLat(lat1, lon1, lat2, lon2) {
    const dlat = (lat2 - lat1) * 60, mlat = (lat1 + lat2) / 2, dep = dlong(lon1, lon2) * 60 * cos(r(mlat));
    return { course: norm360(d(atan2(dep, dlat))), dist: sqrt(dlat * dlat + dep * dep), dlat, dep, meanLat: mlat };
  }
  function traverse(legs, lat0, lon0) {
    let nlat = 0, dep = 0; const rows = [];
    for (const [c, dist] of legs) { const dl = dist * cos(r(c)), dp = dist * sin(r(c)); rows.push({ c, dist, dl, dp }); nlat += dl; dep += dp; }
    const lat1 = lat0 + nlat / 60, mlat = (lat0 + lat1) / 2, dlo = dep / cos(r(mlat));
    return { rows, dlat: nlat, dep, meanLat: mlat, dlong: dlo, cmg: norm360(d(atan2(dep, nlat))), dmg: sqrt(nlat * nlat + dep * dep), lat: lat1, lon: wrap180(lon0 + dlo / 60) };
  }

  // celestial
  const lha = (gha, lon) => norm360(gha + lon);
  function calcAltAz(lat, dec, LHA) {
    const L = r(lat), D = r(dec), H = r(LHA);
    const hc = asin(sin(L) * sin(D) + cos(L) * cos(D) * cos(H));
    const z = atan2(-cos(D) * sin(H), sin(D) * cos(L) - cos(D) * sin(L) * cos(H));
    return { hc: d(hc), az: norm360(d(z)) };
  }
  function abc(lat, dec, LHA) {
    const P = LHA <= 180 ? LHA : 360 - LHA, side = LHA <= 180 ? "W" : "E";
    const L = r(lat), Pr = r(P);
    const A = abs(tan(L) / tan(Pr)), latName = lat >= 0 ? "N" : "S", opp = latName === "N" ? "S" : "N";
    const Aname = P > 90 ? latName : opp;
    const B = abs(tan(r(dec)) / sin(Pr)), Bname = dec >= 0 ? "N" : "S";
    const Cs = (Aname === "N" ? A : -A) + (Bname === "N" ? B : -B);
    const C = abs(Cs), Cname = Cs >= 0 ? "N" : "S";
    const angle = C > 1e-12 ? d(atan(1 / (C * cos(L)))) : 90;
    const az = Cname === "N" ? (side === "E" ? angle : 360 - angle) : (side === "E" ? 180 - angle : 180 + angle);
    return { P, side, A, Aname, B, Bname, C, Cname, angle, az };
  }
  const dip = he => 1.76 * sqrt(he);
  const refraction = app => 1 / tan(r(app + 7.31 / (app + 4.4)));
  function sunTrueAlt(sext, ieMin, he, sdMin = 16.0, limb = "L", hpMin = 0.15) {
    const obs = sext + ieMin / 60, app = obs - dip(he) / 60, ref = refraction(app) / 60, par = (hpMin * cos(r(app))) / 60;
    const sd = (sdMin / 60) * (limb === "L" ? 1 : -1);
    return { ta: app - ref + par + sd, dip: dip(he), app, ref: ref * 60, par: par * 60 };
  }
  const amplitude = (lat, dec) => d(asin(sin(r(dec)) / cos(r(lat))));
  const merAltLat = (ta, dec, bearing) => dec + (bearing === "N" ? -(90 - ta) : 90 - ta);
  function exMeridian(latDr, dec, ta, tMin, bearing) {
    const zd = abs(latDr - dec), a = (1.9635 * cos(r(latDr)) * cos(r(dec))) / sin(r(zd));
    const red = (a * tMin * tMin) / 60, mer = ta + red / 60;
    return { a, red, mer, lat: merAltLat(mer, dec, bearing) };
  }
  function longByChron(lat, dec, ta, gha, east) {
    const L = r(lat), D = r(dec), H = r(ta);
    const cosP = (sin(H) - sin(L) * sin(D)) / (cos(L) * cos(D));
    const P = d(acos(Math.max(-1, Math.min(1, cosP))));
    const LHA = east ? 360 - P : P;
    return { P, LHA, lon: wrap180(LHA - gha) };
  }

  // wind ("from" directions)
  const v = (dir, s) => [s * sin(r(dir)), s * cos(r(dir))];
  const polar = (x, y) => [norm360(d(atan2(x, y))), sqrt(x * x + y * y)];
  function apparentWind(course, ss, tdir, tspd) { const t = v(tdir, tspd), s = v(course, ss); return polar(t[0] + s[0], t[1] + s[1]); }
  function trueWind(course, ss, adir, aspd) { const a = v(adir, aspd), s = v(course, ss); return polar(a[0] - s[0], a[1] - s[1]); }

  // current triangle ("set" = direction current flows TO)
  function allowCurrent(heading, speed, set, rate) {
    const x = speed * sin(r(heading)) + rate * sin(r(set)), y = speed * cos(r(heading)) + rate * cos(r(set));
    return { cmg: norm360(d(atan2(x, y))), smg: sqrt(x * x + y * y) };
  }
  function courseToSteer(track, speed, set, rate) {
    const rel = r(set - track), s = (rate * sin(rel)) / speed;
    if (abs(s) > 1) return null;
    const H = norm360(track - d(asin(s)));
    return Object.assign({ cts: H }, allowCurrent(H, speed, set, rate));
  }
  function engineSpeedFor(track, smg, set, rate) {
    const x = smg * sin(r(track)) - rate * sin(r(set)), y = smg * cos(r(track)) - rate * cos(r(set));
    return { cts: norm360(d(atan2(x, y))), speed: sqrt(x * x + y * y) };
  }
  function setAndDrift(drLat, drLon, fixLat, fixLon, hours) {
    const dl = (fixLat - drLat) * 60, dep = dlong(drLon, fixLon) * 60 * cos(r((drLat + fixLat) / 2));
    const drift = sqrt(dl * dl + dep * dep);
    return { set: norm360(d(atan2(dep, dl))), drift, rate: hours ? drift / hours : NaN };
  }

  // stability and trim
  function listFromShift(w, dist, disp, gm) { const gg1 = (w * dist) / disp; return { gg1, list: d(atan(gg1 / gm)) }; }
  function fsc(l, b, rho, disp) { const fsm = ((l * b ** 3) / 12) * rho; return { fsm, fsc: fsm / disp }; }
  const loll = (gm, bm) => d(atan(sqrt((2 * abs(gm)) / bm)));
  function trimLoad(L, dF, dA, tpc, mctc, lcfAftMid, w, xFwdMid) {
    const sink = w / tpc; // cm
    const lever = xFwdMid + lcfAftMid; // m, + = forward of LCF
    const ct = (w * lever) / mctc; // cm, + = by the head
    const lcfFromFP = L / 2 + lcfAftMid, lcfFromAP = L / 2 - lcfAftMid;
    const fwd = (ct * lcfFromFP) / L, aft = (ct * lcfFromAP) / L;
    return { sink, moment: w * lever, ct, fwd, aft, newF: dF + (sink + fwd) / 100, newA: dA + (sink - aft) / 100 };
  }
  const fwa = (disp, tpc) => disp / (4 * tpc); // mm
  const dwa = (fwaMm, rho) => (fwaMm * (1025 - rho)) / 25; // mm

  // compass
  function compassToTrue(c, varE, devE) { return norm360(c + varE + devE); }

  // formatting
  function fmtLat(x) { const a = abs(x); let deg = Math.floor(a), m = (a - deg) * 60; if (+m.toFixed(1) >= 60) { deg++; m = 0; } return `${String(deg).padStart(2, "0")}° ${m.toFixed(1).padStart(4, "0")}' ${x >= 0 ? "N" : "S"}`; }
  function fmtLon(x) { const a = abs(x); let deg = Math.floor(a), m = (a - deg) * 60; if (+m.toFixed(1) >= 60) { deg++; m = 0; } return `${String(deg).padStart(3, "0")}° ${m.toFixed(1).padStart(4, "0")}' ${x >= 0 ? "E" : "W"}`; }
  const fmtDeg = x => `${norm360(x).toFixed(1).padStart(5, "0")}°`;
  const dm = (deg, min, hemi) => { const v2 = (+deg || 0) + (+min || 0) / 60; return hemi === "S" || hemi === "W" ? -v2 : v2; };

  const api = { norm360, dlong, mp, greatCircle, gcVertex, mercator, mercatorDest, planeMidLat, traverse, lha, calcAltAz, abc, dip, refraction,
    sunTrueAlt, amplitude, merAltLat, exMeridian, longByChron, apparentWind, trueWind, allowCurrent, courseToSteer, engineSpeedFor,
    setAndDrift, listFromShift, fsc, loll, trimLoad, fwa, dwa, compassToTrue, fmtLat, fmtLon, fmtDeg, dm };
  if (typeof module !== "undefined") module.exports = api; else window.NAV = api;
})();
