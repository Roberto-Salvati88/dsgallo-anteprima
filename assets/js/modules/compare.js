// Slider prima/dopo (e dentro/fuori).
// UX: l'utente deve capire subito che si trascina in orizzontale.
// 1. "Show, don't tell": la prima volta che lo slider entra nello schermo la maniglia fa da sola
//    un piccolo va e vieni (sinistra -> destra -> centro), così il gesto si vede prima di leggerlo.
// 2. Etichetta d'azione sotto la maniglia, che la segue: "Scorri col dito" (touch) / "Trascina per confrontare" (mouse),
//    con frecce ‹ ›. Sparisce al primo utilizzo.
// 3. Anello che pulsa intorno alla maniglia finché non si usa.
// 4. Tastiera: frecce sinistra/destra sul range (accessibile), focus visibile sulla maniglia.
// Con "riduci movimento" attivo niente animazioni: resta solo l'etichetta.
// Variante "a trascinamento reale" (.compare--pull, es. zanzariera plissé): la maniglia È la barra della zanzariera.
//   data-hint-left / data-hint-right = verbi d'azione ai lati ("‹ Chiudi" / "Apri ›") al posto di "Trascina per confrontare";
//   data-state-name = mostra in alto lo stato reale che cambia mentre trascini ("Zanzariera aperta", "Chiusa al 60%", ...),
//   al posto delle etichette fisse agli angoli, che facevano pensare il contrario della direzione del gesto.
//   data-frames + data-frame-count (variante .compare--frames): niente taglio a tendina; trascinando si scorrono i
//   fotogrammi veri della zanzariera, che si muove intera con la sua barra e la maniglia. La presa sta in basso.
//   data-min / data-max (in %) = la maniglia corre solo sul tratto reale della zanzariera nella foto (dal profilo
//   in cui si raccoglie al telaio opposto): la barra coincide con il bordo vero della rete, che si raccoglie a sinistra.
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
const TOUCH = window.matchMedia("(hover: none) and (pointer: coarse)");

export function initCompare() {
  const items = [...document.querySelectorAll("[data-compare]")];
  if (!items.length) return;

  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            io.unobserve(e.target);
            Promise.resolve(e.target._framesReady).then(() => setTimeout(() => peek(e.target), 350));
          }
        });
      }, { threshold: [0.6] })
    : null;

  items.forEach((el) => {
    const range = el.querySelector("input[type=range]");
    if (!range) return;
    const stateName = el.dataset.stateName;
    let stateEl = null;
    if (stateName) {
      stateEl = document.createElement("span");
      stateEl.className = "compare__state";
      stateEl.setAttribute("aria-hidden", "true");
      el.appendChild(stateEl);
    }
    // fotogrammi reali (caricati quando lo slider si avvicina allo schermo)
    const pattern = el.dataset.frames;
    const fcount = Number(el.dataset.frameCount || 0);
    const base = pattern ? el.querySelector("img") : null;
    const fimgs = [];
    const furl = (i) => pattern.replace("###", String(i + 1).padStart(3, "0"));
    // i fotogrammi si disegnano su un canvas sopra la foto: cambiare il src dell'<img> a ogni passo
    // la faceva sfarfallare (ogni cambio = nuova decodifica con un istante vuoto)
    let cv = null, cx = null, shown = -1;
    const ok = (im) => im && im.complete && im.naturalWidth;
    const paint = (k) => {
      if (!cv || !ok(fimgs[k])) return false;
      const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); shown = -1; }
      if (k === shown) return true;
      const im = fimgs[k], s = Math.max(cv.width / im.naturalWidth, cv.height / im.naturalHeight);
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      cx.drawImage(im, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh);
      shown = k;
      return true;
    };
    const loadFrames = () => {
      if (fimgs.length || !pattern) return;
      cv = document.createElement("canvas");
      cv.className = "compare__canvas";
      cv.setAttribute("aria-hidden", "true");
      base.after(cv);
      cx = cv.getContext("2d");
      const loads = [];
      for (let i = 0; i < fcount; i++) {
        const im = new Image();
        im.src = furl(i);
        loads.push(im.decode ? im.decode().catch(() => {}) : new Promise((r) => { im.onload = im.onerror = r; }));
        fimgs.push(im);
      }
      // la dimostrazione parte solo quando tutti i fotogrammi sono pronti
      el._framesReady = Promise.all(loads).then(() => { shown = -1; set(); });
      new ResizeObserver(() => { shown = -1; set(); }).observe(cv);
    };
    if (pattern) {
      if ("IntersectionObserver" in window) {
        const pio = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { loadFrames(); pio.disconnect(); } }, { rootMargin: "800px" });
        pio.observe(el);
      } else loadFrames();
    }
    const min = el.dataset.min != null ? Number(el.dataset.min) : null;
    const max = el.dataset.max != null ? Number(el.dataset.max) : null;
    const set = () => {
      let v = Number(range.value);
      if (min !== null) { v = Math.min(max, Math.max(min, v)); if (Number(range.value) !== v) range.value = v; }
      el.style.setProperty("--pos", `${v}%`);
      if (base && fimgs.length) {
        let k = Math.round((v / 100) * (fcount - 1));
        while (k > 0 && !ok(fimgs[k])) k--;
        paint(k);
      }
      if (min !== null) el.style.setProperty("--f", ((v - min) / (max - min)).toFixed(4));
      if (!stateEl) return;
      // data-open-after: l'immagine scoperta trascinando è quella aperta (la rete si ritira verso destra)
      const frac = min !== null ? (v - min) / (max - min) : 1 - v / 100;
      const closed = Math.round(("openAfter" in el.dataset ? 1 - frac : frac) * 100);
      const text = closed >= 96 ? `${stateName} chiusa` : closed <= 4 ? `${stateName} aperta` : `Chiusa al ${closed}%`;
      stateEl.textContent = text;
      stateEl.classList.toggle("is-closed", closed >= 96);
      stateEl.classList.toggle("is-open", closed <= 4);
      range.setAttribute("aria-valuetext", text);
    };
    range.step = "any";
    range.addEventListener("input", set);
    set();

    // Etichetta d'azione che segue la maniglia
    const hint = document.createElement("span");
    hint.className = "compare__hint";
    hint.setAttribute("aria-hidden", "true");
    hint.innerHTML =
      '<svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg>' +
      (el.dataset.hintLeft
        ? `<span>${el.dataset.hintLeft}</span><i class="compare__hint-sep"></i><span>${el.dataset.hintRight}</span>`
        : `<span>${TOUCH.matches ? "Scorri col dito" : "Trascina per confrontare"}</span>`) +
      '<svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg>';
    el.appendChild(hint);

    const used = () => {
      if (el.classList.contains("is-used")) return;
      el.classList.add("is-used");
      el._peekStop = true;
    };
    ["pointerdown", "touchstart", "keydown"].forEach((ev) =>
      range.addEventListener(ev, used, { passive: true })
    );
    range.addEventListener("input", (e) => { if (e.isTrusted && !el._peeking) used(); });
    // mentre si tiene premuto / si trascina: classe is-active (mostra "‹ Chiudi | Apri ›" anche su touch)
    const on = () => el.classList.add("is-active");
    const off = () => el.classList.remove("is-active");
    range.addEventListener("pointerdown", on);
    range.addEventListener("touchstart", on, { passive: true });
    ["pointerup", "pointercancel", "touchend", "touchcancel"].forEach((ev) => window.addEventListener(ev, off, { passive: true }));
    range.addEventListener("focus", () => { if (range.matches(":focus-visible")) el.classList.add("is-focus"); });
    range.addEventListener("blur", () => el.classList.remove("is-focus"));

    if (io && !REDUCED.matches) io.observe(el);
  });
}

// Va e vieni dimostrativo: 50 -> 28 -> 72 -> 50
function peek(el) {
  if (el.classList.contains("is-used")) return;
  const range = el.querySelector("input[type=range]");
  const start = Number(range.value);
  const keys = [start, 28, 72, start];
  const seg = 650;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  let t0 = null;
  el._peeking = true;
  el.classList.add("is-peek");
  const step = (now) => {
    if (el._peekStop) return done();
    if (t0 === null) t0 = now;
    const t = (now - t0) / seg;
    const i = Math.floor(t);
    if (i >= keys.length - 1) { range.value = start; el.style.setProperty("--pos", `${start}%`); return done(); }
    const v = keys[i] + (keys[i + 1] - keys[i]) * ease(t - i);
    range.value = v;
    range.dispatchEvent(new Event("input"));
    requestAnimationFrame(step);
  };
  const done = () => { el._peeking = false; el.classList.remove("is-peek"); };
  requestAnimationFrame(step);
}
