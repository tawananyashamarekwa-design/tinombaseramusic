/* app.js — content binding, scroll-progress engine, controls. No dependencies. */
(function () {
  "use strict";
  const C = window.SITE, S = window.Scene;
  const { clamp, lerp, ease } = S;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), C);
  const thumb = (id, q = "hqdefault") => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
  const watch = (id) => `https://www.youtube.com/watch?v=${id}`;

  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { reduced: mqReduce.matches, paused: mqReduce.matches, t: 0 };
  document.documentElement.classList.toggle("reduced", state.reduced);

  /* ---------- 1. bind config copy ---------- */
  $$("[data-bind]").forEach((n) => { const v = get(n.dataset.bind); if (v != null) n.textContent = v; });
  $("#heroCanvas").setAttribute("aria-label", C.hero.canvasLabel);
  // the TM lockup, wherever a logo appears in the page
  const lockup = `<span class="tm__mark"><span class="tm__mono">${esc(C.brand.monogram)}</span><span class="tm__band">${esc(C.brand.band)}</span></span><span class="tm__tag">${esc(C.brand.tag)}</span>`;
  $$("[data-logo]").forEach((n) => { n.innerHTML = lockup; });

  // chapters → rail + menu
  C.chapters.forEach((ch, i) => {
    const li = el("li"); li.innerHTML = `<a href="#${ch.id}" data-ch="${ch.id}"><span class="rail__dot" aria-hidden="true"></span><span class="rail__label">${esc(ch.label)}</span></a>`;
    $("#railList").append(li);
    const mi = el("li"); mi.innerHTML = `<a href="#${ch.id}"><span class="menu__n">${String(i + 1).padStart(2, "0")}</span>${esc(ch.label)}</a>`;
    $("#menuList").append(mi);
  });

  // hero captions
  C.hero.captions.forEach((c, i) => $("#valley-captions").append(el("p", "hero__caption", esc(c))));

  // voice: click-to-load video (no third-party iframe until the visitor asks)
  (function () {
    const m = $("#voiceMedia"), id = C.voice.featureVideo;
    m.innerHTML = `<img src="${thumb(id, "maxresdefault")}" alt="Video still: Tino Mbasera leading worship" loading="lazy" decoding="async">
      <button class="media__play" type="button" aria-label="Play ${esc(C.route.stations[0].title)} video"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4l9 6-9 6z"/></svg></button>`;
    const img = $("img", m);
    img.addEventListener("error", () => { if (!img.dataset.f) { img.dataset.f = 1; img.src = thumb(id); } else m.classList.add("media--empty"); });
    $(".media__play", m).addEventListener("click", () => {
      m.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(C.route.stations[0].title)} — Tino Mbasera" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
    $("#voiceCaption").textContent = C.voice.featureCaption;
  })();

  // story — portrait, falling back to the gold mark if the image can't load
  (function () {
    const fig = $("#storyImg");
    if (C.story.image) {
      fig.innerHTML = `<img src="${C.story.image}" alt="${esc(C.story.imageAlt || C.brand.name)}" loading="lazy" decoding="async">`;
      $("img", fig).addEventListener("error", () => { fig.innerHTML = `<canvas class="art" data-slot="vault-mark" aria-hidden="true"></canvas>`; artIO && artIO.observe($("canvas", fig)); });
    } else fig.innerHTML = `<canvas class="art" data-slot="vault-mark" aria-hidden="true"></canvas>`;
  })();
  C.story.paragraphs.forEach((p) => $("#storyBody").append(el("p", "", esc(p))));
  C.story.tags.forEach((t) => $("#storyTags").append(el("li", "", esc(t))));

  // service steps (alternating like the reference timeline)
  C.service.steps.forEach((s, i) => $("#steps").append(el("li", i % 2 ? "steps__r" : "steps__l", `<span>${esc(s)}</span>`)));

  // numbers, collaborators, partnership ways
  C.numbers.items.forEach((n) => { const d = el("div", "numbers__item reveal"); d.innerHTML = `<dt>${esc(n.label)}</dt><dd>${esc(n.value)}</dd>`; $("#numbers").append(d); });
  C.collaborators.rows.forEach((r) => $("#collabRows").append(el("li", "reveal", `<span class="rows__name">${esc(r.name)}</span><span class="rows__role">${esc(r.role)}</span>`)));
  C.partnership.ways.forEach((w) => $("#ways").append(el("li", "reveal", `<span class="ways__n">${esc(w.n)}</span><h4>${esc(w.name)}</h4><p>${esc(w.text)}</p>`)));

  // vault
  C.vault.cards.forEach((c) => {
    const li = el("li", "vcard reveal");
    if (c.video) {
      li.innerHTML = `<a href="${watch(c.video)}" target="_blank" rel="noopener"><span class="vcard__img"><img src="${thumb(c.video)}" alt="" loading="lazy" decoding="async"></span>
        <span class="vcard__meta"><span class="vcard__t">${esc(c.title)}</span><span class="vcard__s">${esc(c.text)}</span></span><span class="sr">(opens YouTube in a new tab)</span></a>`;
      $("img", li).addEventListener("error", (e) => e.target.closest(".vcard__img").classList.add("vcard__img--empty"));
    } else {
      const img = c.image || (C.assets[c.slot] || {}).image;
      const inner = `<span class="vcard__img">${img ? `<img src="${img}" alt="" loading="lazy" decoding="async">` : `<canvas class="art" data-slot="${c.slot}" aria-hidden="true"></canvas>`}</span>
        <span class="vcard__meta"><span class="vcard__t">${esc(c.title)}</span><span class="vcard__s">${esc(c.text)}</span></span>`;
      li.innerHTML = c.href ? `<a href="${c.href}" target="_blank" rel="noopener">${inner}<span class="sr">(opens in a new tab)</span></a>` : `<div class="vcard__art">${inner}</div>`;
    }
    $("#vaultGrid").append(li);
  });

  // closing CTAs + contact links
  C.closing.ctas.forEach((c) => { const a = el("a", "btn btn--ghost", esc(c.label)); a.href = c.href; a.target = "_blank"; a.rel = "noopener"; $("#closingCtas").append(a); });
  C.contact.links.forEach((l) => $("#contactLinks").append(el("li", "", `<a href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a>`)));
  if (C.contact.email) $("#contactLinks").append(el("li", "", `<a href="mailto:${esc(C.contact.email)}">${esc(C.contact.email)}</a>`));

  /* ---------- 2. route geometry ---------- */
  const route = (function () {
    const st = C.route.stations, N = st.length;
    const pts = st.map((_, i) => {
      const u = i / Math.max(1, N - 1);
      return [200 + Math.sin(i * 1.9 + 0.4) * 110 * (0.55 + 0.45 * Math.sin(u * 3.1)) + (i === 0 ? -30 : 0), 48 + u * 500];
    });
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < N - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    const path = $("#routePath"), ghost = $("#routeGhost");
    path.setAttribute("d", d); ghost.setAttribute("d", d);
    const L = path.getTotalLength();
    // arc-length position of each station
    const fr = pts.map((p) => {
      let best = 0, bd = 1e9;
      for (let l = 0; l <= L; l += 2) { const q = path.getPointAtLength(l), dd = (q.x - p[0]) ** 2 + (q.y - p[1]) ** 2; if (dd < bd) { bd = dd; best = l; } }
      return best / L;
    });
    path.style.strokeDasharray = `${L}`; path.style.strokeDashoffset = `${L}`;
    const g = $("#routeStops");
    pts.forEach((p, i) => {
      const left = p[0] > 250;
      g.insertAdjacentHTML("beforeend", `<g class="stop" data-i="${i}"><circle cx="${p[0]}" cy="${p[1]}" r="3.2"/><text x="${p[0] + (left ? -10 : 10)}" y="${p[1] + 3.5}" text-anchor="${left ? "end" : "start"}">${String(i + 1).padStart(2, "0")} · ${esc(st[i].year)}</text></g>`);
      const card = el("article", "rcard");
      card.innerHTML = `<p class="rcard__n">${String(i + 1).padStart(2, "0")} — ${esc(st[i].year)}</p><h3>${esc(st[i].chapter)}</h3>
        <p class="rcard__song">${esc(st[i].title)}</p><p class="rcard__t">${esc(st[i].text)}</p>
        <p class="rcard__meta"><span>${esc(st[i].with)}</span><span>${esc(st[i].views)}</span>${st[i].id ? `<a href="${watch(st[i].id)}" target="_blank" rel="noopener">Watch<span class="sr"> ${esc(st[i].title)} on YouTube</span></a>` : ""}</p>`;
      $("#routeCards").append(card);
      $("#routeList").append(el("li", "", `${esc(st[i].chapter)}: ${esc(st[i].title)} (${esc(st[i].year)}). ${esc(st[i].text)}`));
    });
    $("#route").style.setProperty("--stations", N);
    const stops = $$(".stop", g), cards = $$(".rcard"), halo = $("#routeHalo");
    let last = -2;
    return function (p) {
      const f = clamp(p * 1.06);
      path.style.strokeDashoffset = `${L * (1 - f)}`;
      let a = -1; fr.forEach((x, i) => { if (f >= x - 0.002) a = i; });
      a = Math.max(0, a);
      stops.forEach((s, i) => s.classList.toggle("on", fr[i] <= f + 0.002));
      if (a !== last) {
        cards.forEach((c, i) => { c.classList.toggle("on", i === a); c.setAttribute("aria-hidden", i === a ? "false" : "true"); });
        halo.setAttribute("cx", pts[a][0]); halo.setAttribute("cy", pts[a][1]);
        last = a;
      }
    };
  })();

  /* ---------- 3. scenes ---------- */
  const heroCanvas = $("#heroCanvas"), closingCanvas = $("#closingCanvas"), plateCanvas = $("#plateCanvas");
  const HP = C.assets["hero-photo"] || {}, CP = C.assets["closing-photo"] || {};
  const hero = S.createPhotoScene(heroCanvas, { src: HP.image, srcSmall: HP.imageSmall, grade: "night", seed: 11, onload: () => { dirty = true; } });
  const closing = S.createPhotoScene(closingCanvas, { src: CP.image, grade: "amber", seed: 23, onload: () => { dirty = true; } });
  const plate = S.createPlate(plateCanvas);

  // Optional pre-rendered frame player (used when config provides frames)
  function framePlayer(slot) {
    const f = (C.assets[slot] || {}).frames;
    if (!f || !f.count) return null;
    const cache = new Map();
    const url = (i) => f.pattern.replace("{i}", String(i + 1).padStart(f.pad || 4, "0"));
    function want(i) {
      for (let k = Math.max(0, i - 6); k < Math.min(f.count, i + 18); k++) {
        if (cache.has(k)) continue; const im = new Image(); im.decoding = "async"; im.src = url(k); cache.set(k, im);
      }
    }
    return {
      draw(canvas, p) {
        const i = Math.round(clamp(p) * (f.count - 1)); want(i);
        let im = null; for (let d = 0; d < 24 && !im; d++) { const a = cache.get(i - d), b = cache.get(i + d); im = (a && a.complete && a.naturalWidth && a) || (b && b.complete && b.naturalWidth && b) || null; }
        if (!im) return false;
        const g = canvas.getContext("2d"), W = canvas.width, H = canvas.height, s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
        g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(im, (W - im.naturalWidth * s) / 2, (H - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
        return true;
      },
    };
  }
  const heroFrames = framePlayer("hero-photo");

  // section progress helpers
  const secs = { hero: $("#valley"), service: $("#service"), route: $("#route"), closing: $("#closing") };
  const prog = {}, smooth = {};
  function progressOf(sec) {
    const r = sec.getBoundingClientRect(), span = sec.offsetHeight - window.innerHeight;
    return span <= 0 ? (r.top <= 0 ? 1 : 0) : clamp(-r.top / span);
  }
  const inView = (sec) => { const r = sec.getBoundingClientRect(); return r.bottom > -50 && r.top < window.innerHeight + 50; };
  const win = (p, a, b, f = 0.05) => clamp((p - a) / f) * (1 - clamp((p - (b - f)) / f));

  const heroLogo = $("#heroLogo"), heroCue = $("#heroCue"), caps = $$(".hero__caption"), flare = $("#flare");
  /*
   * Hero choreography (scroll progress p):
   * 0      his photograph, wide, gold dust drifting where the logo will form
   * .03–.45 camera pushes in; the T and M fly in from depth, the name band unfolds,
   *         MUSIC settles, the dust converges onto the letters
   * .44–.6 a specular sweep crosses the finished logo · .48–.84 captions
   * .84–.9 fade to black · .88–1 "I Am of God" mark
   */
  function heroLayout() {
    const W = innerWidth, H = innerHeight, portrait = H > W * 1.1, aspect = S.Logo.aspect || 1.2;
    const w = portrait ? Math.min(W * 0.62, H * 0.26 * aspect) : Math.min(W * 0.34, H * 0.56 * aspect);
    return { portrait, x: portrait ? 0.5 : 0.69, y: portrait ? 0.74 : 0.5, w, h: w / aspect };
  }
  function heroState(p) {
    const R = state.reduced, L = heroLayout(), z = R ? 0.15 : ease(clamp(p / 0.86));
    const focus = HP.focus || [0.45, 0.42];
    const A = R ? 1 : clamp((p - 0.03) / 0.42), eA = ease(A);
    heroLogo.style.opacity = R ? 1 - clamp((p - 0.8) / 0.05) : win(p, 0.4, 0.84);
    heroCue.style.opacity = 1 - clamp(p / 0.04);
    caps[0] && (caps[0].style.opacity = win(p, 0.48, 0.66));
    caps[1] && (caps[1].style.opacity = win(p, 0.66, 0.84));
    caps.forEach((c) => { c.setAttribute("aria-hidden", +c.style.opacity < 0.5 ? "true" : "false"); if (!R) c.style.transform = `translate3d(0,${(1 - +c.style.opacity) * 14}px,0)`; });
    const fl = clamp((p - 0.88) / 0.06);
    flare.style.opacity = fl; flare.style.setProperty("--burst", fl);
    const logo = {
      x: L.x, y: L.y, w: L.w, assemble: A, style: "pearl", depth: 0.055, alpha: 1,
      dust: R ? 0 : 0.95 * (1 - A),
      yaw: R ? 0.12 : lerp(-0.7, 0, eA) + Math.sin(clamp((p - 0.45) / 0.4) * Math.PI) * 0.28 + Math.sin(state.t * 0.3) * 0.04 * eA,
      pitch: 0.12 + (R ? 0 : Math.sin(state.t * 0.23) * 0.03),
      sweep: R ? [] : [clamp((p - 0.44) / 0.16) * 1.6 - 0.3, ((state.t * 0.11) % 2.2) - 0.5],
    };
    return {
      zoom: lerp(1, L.portrait ? 1.7 : 1.75, z),
      fx: lerp(L.portrait ? 0.55 : 0.5, focus[0], z), fy: lerp(L.portrait ? 0.45 : 0.5, focus[1], z),
      sx: lerp(0.5, L.portrait ? 0.5 : 0.33, z), sy: lerp(L.portrait ? 0.36 : 0.5, L.portrait ? 0.32 : 0.44, z),
      dark: lerp(0.1, 0.48, clamp(p / 0.4)) + clamp((p - 0.6) / 0.2) * 0.14,
      desat: lerp(0.12, 0.5, clamp(p / 0.45)), rays: 0.75, rayX: 0.76,
      logo, fade: clamp((p - 0.84) / 0.06), t: state.t,
    };
  }
  function closingState(p) {
    const R = state.reduced;
    $("#closingA").style.opacity = win(p, 0.06, 0.46);
    $("#closingTitle").style.opacity = win(p, 0.46, 0.74);
    const sign = clamp((p - 0.74) / 0.08);
    $("#closingSign").style.opacity = sign; $("#closingSign").style.visibility = sign > 0.02 ? "visible" : "hidden";
    const c = R ? 0.5 : ease(p), f = CP.focus || [0.5, 0.45];
    return { zoom: lerp(1.45, 1.02, c), fx: f[0], fy: f[1], sx: 0.5, sy: 0.5, dark: 0.4 + clamp((p - 0.3) / 0.4) * 0.32, desat: 0.45, rays: 0.6, rayX: 0.5, t: state.t };
  }
  // keep the subtitle tucked under the canvas logo
  function placeHeroSub() {
    const L = heroLayout();
    heroLogo.style.left = Math.round(innerWidth * L.x) + "px";
    heroLogo.style.top = Math.round(innerHeight * L.y + L.h / 2 + 10) + "px";
  }

  // service timeline lighting
  const steps = $$("#steps li");
  function serviceState(p) {
    const k = Math.floor(clamp(p * 1.1) * steps.length * 0.999 + 0.0001);
    steps.forEach((s, i) => s.classList.toggle("on", i <= k));
    $("#steps").style.setProperty("--fill", clamp(p * 1.1));
    return { yaw: state.reduced ? 0 : lerp(-0.6, 0.6, p), pitch: state.reduced ? 0.06 : 0.05 + Math.sin(p * Math.PI) * 0.12, rings: 1, t: state.t, sweep: lerp(-0.3, 1.3, p) };
  }

  /* ---------- 4. art slots (vault + story) ---------- */
  const artSlots = new Map();
  function renderArt(cv) {
    const slot = cv.dataset.slot;
    if (!artSlots.has(cv)) {
      artSlots.set(cv, S.createPlate(cv, { dark: true }));
    }
    const sc = artSlots.get(cv); sc.resize();
    sc.render({ yaw: 0.35, pitch: 0.1, rings: 1, t: 1.2, sweep: 0.55 });
  }
  const artIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { renderArt(e.target); artIO.unobserve(e.target); } }), { rootMargin: "300px" });
  $$("canvas.art").forEach((c) => artIO.observe(c));

  /* ---------- 5. reveals (bi-directional) ---------- */
  const rIO = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$(".reveal").forEach((n) => rIO.observe(n));

  /* ---------- 6. chapter rail + tone ---------- */
  const chapterEls = C.chapters.map((c) => document.getElementById(c.id)).filter(Boolean);
  const railLinks = $$("#railList a");
  const toneSecs = $$("main > section, footer");
  function updateRail() {
    const mid = innerHeight * 0.5; let active = 0;
    chapterEls.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) active = i; });
    railLinks.forEach((a, i) => { a.classList.toggle("on", i === active); if (i === active) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    const docP = clamp(scrollY / (document.documentElement.scrollHeight - innerHeight));
    $("#railFill").style.transform = `scaleY(${docP})`;
    let tone = "dark";
    for (const s of toneSecs) { const r = s.getBoundingClientRect(); if (r.top <= 40 && r.bottom > 40) { tone = s.dataset.tone || (s.matches(".voice,.story,.service") ? "light" : "dark"); break; } }
    document.documentElement.dataset.tone = tone;
  }

  /* ---------- 7. main loop ---------- */
  let lastT = performance.now(), dirty = true, sizes = "";
  function resizeAll() { hero.resize(); closing.resize(); plate.resize(); placeHeroSub(); dirty = true; artSlots.forEach((_, cv) => renderArt(cv)); }
  S.fontsReady.then(() => { resizeAll(); });
  addEventListener("resize", () => { const k = innerWidth + "x" + innerHeight; if (k !== sizes) { sizes = k; resizeAll(); } }, { passive: true });
  addEventListener("scroll", () => { dirty = true; }, { passive: true });

  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (!state.paused) state.t += dt;
    const k = state.reduced ? 1 : 1 - Math.pow(0.0008, dt); // critically-damped-ish smoothing
    for (const key in secs) {
      const target = progressOf(secs[key]);
      smooth[key] = smooth[key] == null ? target : lerp(smooth[key], target, k);
      if (Math.abs(smooth[key] - target) < 0.0004) smooth[key] = target;
      const moved = prog[key] !== smooth[key]; prog[key] = smooth[key];
      const vis = inView(secs[key]);
      if (!vis) continue;
      const animate = moved || !state.paused || dirty;
      if (!animate) continue;
      if (key === "hero") { const s = heroState(prog.hero); if (!(heroFrames && heroFrames.draw(heroCanvas, prog.hero))) hero.render(s); }      else if (key === "closing") closing.render(closingState(prog.closing));
      else if (key === "service") plate.render(serviceState(prog.service));
      else if (key === "route" && moved | dirty) route(prog.route);
    }
    if (dirty) updateRail();
    dirty = false;
    requestAnimationFrame(frame);
  }
  // first paint: draw a poster frame synchronously so nothing waits on the loop
  sizes = innerWidth + "x" + innerHeight; resizeAll();
  try { hero.render(heroState(0)); route(0); } catch (e) { document.documentElement.classList.add("no-canvas"); console.warn(e); }
  requestAnimationFrame(frame);

  /* ---------- 8. controls ---------- */
  const motionBtn = $("#motionBtn");
  function setPaused(v) {
    state.paused = v; document.documentElement.classList.toggle("paused", v);
    motionBtn.setAttribute("aria-pressed", String(v));
    $("#motionLabel").textContent = v ? "Play ambient motion" : "Pause ambient motion";
    motionBtn.title = $("#motionLabel").textContent; dirty = true;
  }
  setPaused(state.paused);
  motionBtn.addEventListener("click", () => setPaused(!state.paused));
  mqReduce.addEventListener("change", (e) => { state.reduced = e.matches; document.documentElement.classList.toggle("reduced", e.matches); setPaused(e.matches); });

  const menu = $("#menu"), menuBtn = $("#menuBtn");
  let lastFocus = null;
  function openMenu(v) {
    if (v) { lastFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : menuBtn; menu.hidden = false; requestAnimationFrame(() => menu.classList.add("open")); menuBtn.setAttribute("aria-expanded", "true"); $("a", menu).focus(); document.body.classList.add("lock"); }
    else { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); document.body.classList.remove("lock"); setTimeout(() => { menu.hidden = true; }, 350); lastFocus && lastFocus.focus(); }
  }
  menuBtn.addEventListener("click", () => openMenu(menu.hidden));
  $("#menuClose").addEventListener("click", () => openMenu(false));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => openMenu(false)));
  menu.addEventListener("keydown", (e) => {
    if (e.key === "Escape") openMenu(false);
    if (e.key === "Tab") { const f = $$("a,button", menu), first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  $("#replayBtn").addEventListener("click", () => { openMenu(false); scrollTo({ top: 0, behavior: state.reduced ? "auto" : "smooth" }); setPaused(state.reduced); });

  // chapter links: jump (smooth only when motion allowed). Hero/route links land mid-scene where useful.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute("href").slice(1), t = document.getElementById(id); if (!t) return;
    e.preventDefault();
    let y = t.getBoundingClientRect().top + scrollY;
    if (id === "valley-captions") y = secs.hero.offsetTop + (secs.hero.offsetHeight - innerHeight) * 0.2;
    scrollTo({ top: y, behavior: state.reduced ? "auto" : "smooth" });
    history.replaceState(null, "", "#" + id);
    const focusTarget = t.querySelector("h1,h2") || t; focusTarget.setAttribute("tabindex", "-1"); focusTarget.focus({ preventScroll: true });
  });

  // contact form — never pretends to send
  $("#contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, status = $("#formStatus"), data = Object.fromEntries(new FormData(f));
    const bad = [...f.elements].filter((x) => x.required && !x.checkValidity());
    $$(".field", f).forEach((l) => l.classList.remove("err"));
    if (bad.length) { bad.forEach((b) => b.closest(".field").classList.add("err")); status.textContent = "Please fill in your name, a valid email and a message."; bad[0].focus(); return; }
    if (C.contact.formEndpoint) {
      status.textContent = "Sending…";
      try { const r = await fetch(C.contact.formEndpoint, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } }); if (!r.ok) throw 0; status.textContent = "Thank you — your note has been sent."; f.reset(); }
      catch { status.textContent = "The note could not be sent. Please try again or reach Tino on YouTube."; }
    } else if (C.contact.email) {
      location.href = `mailto:${C.contact.email}?subject=${encodeURIComponent("A note for Tino Mbasera")}&body=${encodeURIComponent(data.message + "\n\n— " + data.name + " (" + data.email + ")")}`;
      status.textContent = "Your email app should open with the note ready to send.";
    } else {
      status.textContent = "Preview mode: this form is not connected yet. Add a booking email or form endpoint in config.js.";
    }
  });
})();
