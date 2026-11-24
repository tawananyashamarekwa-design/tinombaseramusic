/*
 * scene.js — procedural stand-in for pre-rendered cinematic frame sequences.
 *
 * PhotoScene: one of Tino's photographs, graded dark and warm, with a scroll-bound
 *   camera that zooms toward a focal point, plus light rays and gold dust.
 * Logo: his "TM / TINOTENDA MBASERA / MUSIC" lockup (heavy Didone capitals split by a
 *   tracked name band), rasterised into separate pieces. Each piece is extruded in 3D
 *   with a pearl face and gold sides, flies in from its own position in depth, and
 *   assembles while gold dust converges onto the letterforms.
 *
 * Every frame is a pure function of (scroll state, time), so scrubbing backwards gives
 * the same frames as scrubbing forwards.
 */
(function () {
  "use strict";
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const TAU = Math.PI * 2;
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function mk(w, h) { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const DIDONE = '"Playfair Display", "Bodoni Moda", Didot, "Bodoni MT", Georgia, serif';
  const GEO = '"Montserrat", "Manrope", "Segoe UI", Arial, sans-serif';

  /* ===================== LOGO ===================== */
  const Logo = (function () {
    let pieces = [], points = [], LW = 1, LH = 1, builtW = 0, builtFonts = "";
    const brand = () => (window.SITE && window.SITE.brand) || {};

    // draw text with manual tracking so it renders the same in every browser
    function tracked(g, text, x, y, spacing, align) {
      const chars = [...text]; const ws = chars.map((c) => g.measureText(c).width);
      const total = ws.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
      let cx = align === "center" ? x - total / 2 : x;
      chars.forEach((c, i) => { g.fillText(c, cx, y); cx += ws[i] + spacing; });
      return total;
    }
    function bbox(c) {
      const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
      for (let y = 0; y < c.height; y += 1) for (let x = 0; x < c.width; x += 1) {
        if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      if (x1 < 0) return null;
      const p = 2; return { x: Math.max(0, x0 - p), y: Math.max(0, y0 - p), w: Math.min(c.width, x1 + p + 1) - Math.max(0, x0 - p), h: Math.min(c.height, y1 + p + 1) - Math.max(0, y0 - p) };
    }
    function crop(src, b) { const c = mk(b.w, b.h); c.getContext("2d").drawImage(src, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h); return c; }
    function tint(src, fill) {
      const c = mk(src.width, src.height), g = c.getContext("2d");
      g.drawImage(src, 0, 0); g.globalCompositeOperation = "source-in"; g.fillStyle = fill(g, c.width, c.height); g.fillRect(0, 0, c.width, c.height);
      return c;
    }
    function build(targetW) {
      const fonts = String(!!(document.fonts && document.fonts.check && document.fonts.check(`900 40px "Playfair Display"`) && document.fonts.check(`600 20px "Montserrat"`)));
      targetW = Math.min(1600, Math.max(420, targetW));
      if (fonts === builtFonts && targetW <= builtW * 1.15) return;
      builtFonts = fonts; builtW = Math.max(builtW, targetW);
      const b = brand(), mono = b.monogram || "TM", band = (b.band || "Tinotenda Mbasera").toUpperCase(), tag = (b.tag || "Music").toUpperCase();

      // layout: cap height C, lockup width ≈ builtW
      const probe = mk(10, 10).getContext("2d");
      probe.font = `900 100px ${DIDONE}`;
      const ratio = (probe.measureText(mono[0]).width + probe.measureText(mono.slice(1)).width) / 100; // width per px of font size
      const fs = (builtW * 0.86) / ratio, C = fs * 0.71, pad = fs * 0.12;
      LW = Math.ceil(builtW); LH = Math.ceil(C * 1.62 + pad * 2);
      const base = pad + C, bandMid = base - C * 0.47, bandH = C * 0.15;
      const layer = () => { const c = mk(LW, LH), g = c.getContext("2d"); g.fillStyle = "#fff"; g.textBaseline = "alphabetic"; return [c, g]; };

      // monogram letters, each knocked out where the name band passes
      const [full, fg] = layer(); fg.font = `900 ${fs}px ${DIDONE}`;
      const w0 = fg.measureText(mono[0]).width, w1 = fg.measureText(mono.slice(1)).width, kern = -fs * 0.025;
      const startX = (LW - (w0 + w1 + kern)) / 2;
      const letters = [[mono[0], startX], [mono.slice(1), startX + w0 + kern]].map(([ch, x]) => {
        const [c, g] = layer(); g.font = `900 ${fs}px ${DIDONE}`; g.fillText(ch, x, base);
        g.globalCompositeOperation = "destination-out"; g.fillRect(0, bandMid - bandH / 2, LW, bandH);
        return c;
      });
      const monoLeft = startX, monoW = w0 + w1 + kern;
      // name band, tracked to the monogram's width
      const [bandC, bg] = layer(); let bfs = C * 0.1;
      bg.font = `600 ${bfs}px ${GEO}`;
      const raw = [...band].reduce((a, ch) => a + bg.measureText(ch).width, 0);
      let spacing = (monoW * 1.02 - raw) / (band.length - 1);
      if (spacing < bfs * 0.2) { bfs *= (monoW * 1.02) / (raw + bfs * 0.2 * (band.length - 1)); bg.font = `600 ${bfs}px ${GEO}`; spacing = bfs * 0.2; }
      tracked(bg, band, LW / 2, bandMid + bfs * 0.36, spacing, "center");
      // tag line
      const [tagC, tg] = layer(); const tfs = C * 0.085; tg.font = `600 ${tfs}px ${GEO}`;
      tracked(tg, tag, LW / 2, base + C * 0.25, tfs * 0.55, "center");

      const defs = [
        { src: letters[0], from: [-0.95, -0.35, 0.9], rot: -0.5, yaw: 1.3, start: 0.0, dur: 0.55, depth: 1 },
        { src: letters[1], from: [0.95, 0.3, -1.6], rot: 0.35, yaw: -1.4, start: 0.12, dur: 0.55, depth: 1 },
        { src: bandC, from: [0, 0, 0], rot: 0, yaw: 0, start: 0.55, dur: 0.3, depth: 0.25, reveal: true },
        { src: tagC, from: [0, 0.18, 0], rot: 0, yaw: 0, start: 0.75, dur: 0.25, depth: 0.2 },
      ];
      pieces = defs.map((d) => {
        const bb = bbox(d.src) || { x: 0, y: 0, w: 1, h: 1 }, img = crop(d.src, bb);
        const pearl = tint(img, (g, w, h) => { const gr = g.createLinearGradient(0, -bb.y, 0, LH - bb.y); gr.addColorStop(0.25, "#ffffff"); gr.addColorStop(0.7, "#f7f1e6"); gr.addColorStop(1, "#ead7ad"); return gr; });
        const foil = tint(img, (g, w, h) => { const gr = g.createLinearGradient(0, -bb.y, 0, LH - bb.y); gr.addColorStop(0.15, "#fff1c9"); gr.addColorStop(0.5, "#d9ae5c"); gr.addColorStop(0.8, "#a87a2e"); gr.addColorStop(1, "#e8c77c"); return gr; });
        const sides = ["#b88a3a", "#8a6224", "#5a3e14"].map((c) => tint(img, () => c));
        return { ...d, img, pearl, foil, sides, x: bb.x, y: bb.y, w: bb.w, h: bb.h, ox: bb.x + bb.w / 2 - LW / 2, oy: bb.y + bb.h / 2 - LH / 2 };
      });
      // dust targets from the whole lockup
      fg.drawImage(letters[0], 0, 0); fg.drawImage(letters[1], 0, 0); fg.drawImage(bandC, 0, 0); fg.drawImage(tagC, 0, 0);
      const sw = 320, sh = Math.round((sw * LH) / LW), s = mk(sw, sh), sg = s.getContext("2d");
      sg.drawImage(full, 0, 0, sw, sh);
      const dd = sg.getImageData(0, 0, sw, sh).data, cand = [];
      for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) if (dd[(y * sw + x) * 4 + 3] > 110) cand.push([x / sw - 0.5, (y / sh - 0.5) * (LH / LW)]);
      const r = rng(9); points = [];
      for (let i = 0; i < 1800 && cand.length; i++) {
        const c = cand[(r() * cand.length) | 0], a = r() * TAU, d = 0.6 + r() * 1.4;
        points.push({ lx: c[0], ly: c[1], sx: Math.cos(a) * d, sy: Math.sin(a) * d * 0.6, sz: (r() - 0.5) * 2.4, d: r(), tw: r() * TAU, s: 0.6 + r() * 1.3 });
      }
    }

    /**
     * draw(g, cx, cy, width, o)
     * o.assemble 0..1 · o.yaw · o.pitch · o.alpha · o.style 'pearl'|'foil' · o.sweep (0..1 across, or <0 none)
     * o.depth (fraction of width) · o.dust 0..1 (strength of converging dust) · o.t · o.shadow
     */
    function draw(g, cx, cy, width, o) {
      if (!pieces.length) return;
      const alpha = o.alpha == null ? 1 : o.alpha; if (alpha <= 0.003) return;
      const A = o.assemble == null ? 1 : o.assemble, sc = width / LW, t = o.t || 0;
      const yaw = o.yaw || 0, pitch = o.pitch || 0, P = width * 1.8, depth = (o.depth == null ? 0.05 : o.depth) * width;
      const style = o.style || "pearl";

      // converging gold dust
      const dust = o.dust == null ? 1 - A : o.dust;
      if (dust > 0.01 && points.length) {
        g.save(); g.globalCompositeOperation = "lighter";
        const cyw = Math.cos(yaw), syw = Math.sin(yaw);
        for (const q of points) {
          const a = easeOut(clamp((A * 1.15 - q.d * 0.3) / 0.85));
          let x = lerp(q.sx, q.lx, a) * width, y = lerp(q.sy, q.ly, a) * width, z = lerp(q.sz, 0, a) * width;
          const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw, s = P / (P - z1);
          if (s <= 0 || s > 5) continue;
          const tw = 0.5 + 0.5 * Math.sin(t * 2.4 + q.tw), sz = q.s * s;
          g.fillStyle = `rgba(255,${200 + ((q.tw * 9) | 0) % 40},${120 + ((q.tw * 13) | 0) % 60},${alpha * dust * tw * 0.9})`;
          g.fillRect(cx + x1 * s - sz / 2, cy + y * s - sz / 2, sz, sz);
        }
        g.restore();
      }

      for (const pc of pieces) {
        const k = ease(clamp((A - pc.start) / pc.dur));
        if (k <= 0.001) continue;
        const inv = 1 - k;
        const z = pc.from[2] * width * inv, persp = P / (P - z);
        const pYaw = yaw + pc.yaw * inv, cyw = Math.cos(pYaw), syw = Math.sin(pYaw);
        const px = cx + (pc.ox * sc * Math.cos(yaw) + pc.from[0] * width * inv) * persp;
        const py = cy + (pc.oy * sc * Math.cos(pitch) + pc.from[1] * width * inv) * persp;
        const w = pc.w * sc * persp, h = pc.h * sc * persp;
        const N = Math.max(3, Math.round(16 * pc.depth)), dpx = (syw * depth * pc.depth * persp) / N, dpy = (-Math.sin(pitch) * depth * pc.depth * persp) / N;
        g.save();
        g.globalAlpha = alpha * clamp(k * 1.6);
        g.translate(px, py); g.rotate(pc.rot * inv);
        const sx = Math.max(0.03, Math.abs(cyw)) * Math.sign(cyw || 1), sy = Math.cos(pitch);
        if (pc.reveal) { const rw = (w * (0.15 + 0.85 * k)) / 2 + 4; g.beginPath(); g.rect(-rw, -h, rw * 2, h * 2); g.clip(); }
        const layer = (img, ox, oy, extraSX = 1) => { g.save(); g.translate(ox, oy); g.scale(sx * extraSX, sy); g.drawImage(img, -w / 2, -h / 2, w, h); g.restore(); };
        const bandStretch = pc.reveal ? lerp(1.25, 1, k) : 1;
        if (o.shadow) { g.save(); g.filter = `blur(${Math.max(1, Math.round(width * 0.012))}px)`; g.globalAlpha *= 0.35; layer(pc.sides[2], width * 0.006, width * 0.018, bandStretch); g.restore(); }
        for (let i = N; i >= 1; i--) layer(pc.sides[i > N * 0.66 ? 2 : i > N * 0.33 ? 1 : 0], dpx * i, dpy * i, bandStretch);
        // face with specular sweep, composed off-screen
        const fw = Math.ceil(w), fh = Math.ceil(h);
        pc._f = pc._f && pc._f.width === fw && pc._f.height === fh ? pc._f : mk(fw, fh);
        const f = pc._f, fgc = f.getContext("2d");
        fgc.globalCompositeOperation = "source-over"; fgc.clearRect(0, 0, fw, fh);
        fgc.drawImage(style === "foil" ? pc.foil : pc.pearl, 0, 0, fw, fh);
        const sweeps = Array.isArray(o.sweep) ? o.sweep : o.sweep == null ? [] : [o.sweep];
        fgc.globalCompositeOperation = "source-atop";
        for (const sw of sweeps) {
          if (sw < -0.3 || sw > 1.3) continue;
          const lx = (sw * LW - pc.x) * (fw / pc.w);
          const span = (LW * 0.12) * (fw / pc.w);
          const gr = fgc.createLinearGradient(lx - span - fh * 0.3, 0, lx + span + fh * 0.3, fh);
          gr.addColorStop(0, "rgba(255,226,150,0)"); gr.addColorStop(0.5, style === "foil" ? "rgba(255,252,235,0.9)" : "rgba(232,190,110,0.7)"); gr.addColorStop(1, "rgba(255,226,150,0)");
          fgc.fillStyle = gr; fgc.fillRect(0, 0, fw, fh);
        }
        layer(f, 0, 0, bandStretch);
        g.restore();
      }
    }
    return { build, draw, get ready() { return pieces.length > 0; }, get aspect() { return LW / LH; } };
  })();

  /* ===================== PHOTO SCENE ===================== */
  const GRADES = {
    night: { warm: [214, 160, 80], ray: [255, 220, 160], floor: "#040507" },
    amber: { warm: [230, 140, 60], ray: [255, 190, 120], floor: "#060404" },
  };
  function createPhotoScene(canvas, opts = {}) {
    const G = GRADES[opts.grade || "night"], r = rng(opts.seed || 3);
    const ctx = canvas.getContext("2d", { alpha: false });
    let W = 0, H = 0, dpr = 1, img = null, blurBg = null, onload = opts.onload || null;
    const motes = Array.from({ length: 80 }, () => ({ u: r(), v: r(), s: 0.5 + r() * 1.7, sp: 0.2 + r() * 0.8, ph: r() * TAU }));
    function load() {
      const big = (canvas.clientWidth || innerWidth) * Math.min(devicePixelRatio || 1, 2) > 1300;
      const src = big || !opts.srcSmall ? opts.src : opts.srcSmall;
      if (!src || (img && img.dataset.src === src)) return;
      const im = new Image(); im.decoding = "async"; im.dataset.src = src;
      im.onload = () => {
        img = im;
        const b = mk(96, Math.round((96 * im.naturalHeight) / im.naturalWidth)); b.getContext("2d").drawImage(im, 0, 0, b.width, b.height);
        blurBg = b; onload && onload();
      };
      im.src = src;
    }
    function resize() {
      const cap = opts.dprCap || (innerWidth < 760 ? 1.5 : 1.75);
      dpr = Math.min(devicePixelRatio || 1, cap);
      W = Math.max(1, canvas.clientWidth); H = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      load();
    }
    /**
     * s: zoom, fx, fy (focal point in image fractions), sx, sy (where it lands on screen, fractions),
     * dark 0..1, desat 0..1, rays 0..1, t, fade, logo {x, y, w (px), ...Logo.draw opts}
     */
    function render(s) {
      if (!W) resize();
      const g = ctx, t = s.t || 0, portrait = H > W * 1.1;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.filter = "none";
      g.fillStyle = "#050608"; g.fillRect(0, 0, W, H);

      if (img) {
        const iw = img.naturalWidth, ih = img.naturalHeight;
        if (portrait && blurBg) {
          const bs = Math.max(W / blurBg.width, H / blurBg.height) * 1.1;
          g.filter = "blur(18px)"; g.drawImage(blurBg, (W - blurBg.width * bs) / 2, (H - blurBg.height * bs) / 2, blurBg.width * bs, blurBg.height * bs); g.filter = "none";
          g.fillStyle = "rgba(4,5,8,0.55)"; g.fillRect(0, 0, W, H);
        }
        const base = portrait ? Math.max(W / iw, (H * (s.portraitFill || 0.62)) / ih) : Math.max(W / iw, H / ih);
        const k = base * (s.zoom || 1), dw = iw * k, dh = ih * k;
        let tx = (s.sx == null ? 0.5 : s.sx) * W - (s.fx == null ? 0.5 : s.fx) * dw;
        let ty = (s.sy == null ? 0.5 : s.sy) * H - (s.fy == null ? 0.5 : s.fy) * dh;
        if (dw >= W) tx = clamp(tx, W - dw, 0); else tx = (W - dw) / 2;
        if (dh >= H) ty = clamp(ty, H - dh, 0);
        g.drawImage(img, tx, ty, dw, dh);
        if (portrait && dh < H) {
          // feather the photo band into the blurred fill
          const fe = Math.min(80, dh * 0.2);
          let gr = g.createLinearGradient(0, ty, 0, ty + fe); gr.addColorStop(0, "rgba(5,6,8,0.9)"); gr.addColorStop(1, "rgba(5,6,8,0)"); g.fillStyle = gr; g.fillRect(0, ty, W, fe);
          gr = g.createLinearGradient(0, ty + dh - fe, 0, ty + dh); gr.addColorStop(0, "rgba(5,6,8,0)"); gr.addColorStop(1, "rgba(5,6,8,0.9)"); g.fillStyle = gr; g.fillRect(0, ty + dh - fe, W, fe);
        }
        // grade: pull saturation down, deepen, warm the highlights
        if (s.desat) { g.globalCompositeOperation = "saturation"; g.fillStyle = `rgba(128,128,128,${s.desat})`; g.fillRect(0, 0, W, H); }
        g.globalCompositeOperation = "soft-light"; g.globalAlpha = 0.5;
        const wg = g.createLinearGradient(0, 0, W, H); wg.addColorStop(0, "#1c2a40"); wg.addColorStop(0.55, rgba(G.warm, 1)); wg.addColorStop(1, "#140c06");
        g.fillStyle = wg; g.fillRect(0, 0, W, H);
        g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
      }
      g.fillStyle = `rgba(4,5,8,${s.dark == null ? 0.3 : s.dark})`; g.fillRect(0, 0, W, H);

      // light rays falling from above
      const rays = s.rays == null ? 0.6 : s.rays;
      if (rays > 0) {
        g.globalCompositeOperation = "screen";
        const ox = W * (s.rayX == null ? 0.72 : s.rayX), oy = -H * 0.15;
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 2 + (i - 2.5) * 0.16 + Math.sin(t * 0.12 + i) * 0.04, half = 0.025 + (i % 3) * 0.012, len = H * 1.7;
          const gr = g.createLinearGradient(ox, oy, ox + Math.cos(a) * len, oy + Math.sin(a) * len);
          gr.addColorStop(0, rgba(G.ray, 0.16 * rays)); gr.addColorStop(1, rgba(G.ray, 0));
          g.fillStyle = gr; g.beginPath(); g.moveTo(ox, oy);
          g.lineTo(ox + Math.cos(a - half) * len, oy + Math.sin(a - half) * len); g.lineTo(ox + Math.cos(a + half) * len, oy + Math.sin(a + half) * len); g.fill();
        }
        g.globalCompositeOperation = "source-over";
      }
      // vignette
      const vg = g.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.28, W / 2, H / 2, Math.max(W, H) * 0.78);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.82)");
      g.fillStyle = vg; g.fillRect(0, 0, W, H);
      // floor fade for text legibility
      const bf = g.createLinearGradient(0, H * 0.6, 0, H); bf.addColorStop(0, "rgba(0,0,0,0)"); bf.addColorStop(1, "rgba(0,0,0,0.6)");
      g.fillStyle = bf; g.fillRect(0, H * 0.6, W, H * 0.4);

      // dust in the light
      g.globalCompositeOperation = "lighter";
      motes.forEach((d) => {
        const x = ((d.u + Math.sin(t * 0.05 * d.sp + d.ph) * 0.04) % 1) * W, y = ((d.v - t * 0.01 * d.sp + 10) % 1) * H;
        g.fillStyle = rgba([255, 214, 150], 0.25 + 0.25 * Math.sin(t + d.ph)); g.beginPath(); g.arc(x, y, d.s, 0, TAU); g.fill();
      });
      g.globalCompositeOperation = "source-over";

      if (s.logo && Logo.ready) {
        const L = s.logo, lx = W * L.x, ly = H * L.y, lw = L.w;
        const halo = g.createRadialGradient(lx, ly, 0, lx, ly, lw * 0.75);
        halo.addColorStop(0, `rgba(0,0,0,${0.45 * (L.alpha == null ? 1 : L.alpha)})`); halo.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = halo; g.fillRect(0, 0, W, H);
        Logo.draw(g, lx, ly, lw, { ...L, t });
      }
      if (s.fade) { g.fillStyle = `rgba(3,4,6,${s.fade})`; g.fillRect(0, 0, W, H); }
    }
    return { resize, render, get loaded() { return !!img; }, set onload(f) { onload = f; } };
  }

  /* ===================== MARK PLATE (cream foil / dark card) ===================== */
  function createPlate(canvas, opts = {}) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, canvas.clientWidth); H = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      Logo.build(W * 0.8 * dpr);
    }
    function render(s) {
      if (!W) resize();
      const g = ctx, dark = opts.dark, t = s.t || 0;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = dark ? "#07090c" : "#f6efe0"; g.fillRect(0, 0, W, H);
      const pg = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      pg.addColorStop(0, dark ? "rgba(226,190,120,0.14)" : "rgba(255,251,240,1)"); pg.addColorStop(1, dark ? "rgba(0,0,0,0)" : "rgba(222,206,176,0.7)");
      g.fillStyle = pg; g.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.5, base = Math.min(W, H);
      for (let i = 0; i < 12; i++) {
        const pulse = Math.pow(Math.max(0, Math.sin(t * 1.4 - i * 0.6)), 6) * (s.rings == null ? 1 : s.rings);
        g.strokeStyle = dark ? `rgba(226,190,120,${0.12 + pulse * 0.35})` : `rgba(110,80,46,${0.14 + pulse * 0.28})`;
        g.lineWidth = i % 3 === 0 ? 1.1 : 0.6;
        g.beginPath(); g.arc(cx, cy, base * (0.1 + i * 0.045), 0, TAU); g.stroke();
      }
      Logo.draw(g, cx, cy, W * 0.66, { assemble: 1, dust: 0, yaw: s.yaw || 0, pitch: s.pitch || 0.08, t, depth: 0.05, shadow: !dark, style: dark ? "pearl" : "foil", sweep: s.sweep, alpha: 1 });
    }
    return { resize, render };
  }

  const fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('900 100px "Playfair Display"'), document.fonts.load('600 20px "Montserrat"')]).catch(() => {})
    : Promise.resolve();

  window.Scene = { createPhotoScene, createPlate, Logo, fontsReady, clamp, lerp, ease };
})();
