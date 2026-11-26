// Slider prima/dopo (e dentro/fuori).
// UX: l'utente deve capire subito che si trascina in orizzontale.
// 1. "Show, don't tell": la prima volta che lo slider entra nello schermo la maniglia fa da sola
//    un piccolo va e vieni (sinistra -> destra -> centro), così il gesto si vede prima di leggerlo.
// 2. Etichetta d'azione sotto la maniglia, che la segue: "Scorri col dito" (touch) / "Trascina per confrontare" (mouse),
//    con frecce ‹ ›. Sparisce al primo utilizzo.
// 3. Anello che pulsa intorno alla maniglia finché non si usa.
// 4. Tastiera: frecce sinistra/destra sul range (accessibile), focus visibile sulla maniglia.
// Con "riduci movimento" attivo niente animazioni: resta solo l'etichetta.
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
            setTimeout(() => peek(e.target), 350);
          }
        });
      }, { threshold: [0.6] })
    : null;

  items.forEach((el) => {
    const range = el.querySelector("input[type=range]");
    if (!range) return;
    const set = () => el.style.setProperty("--pos", `${range.value}%`);
    range.addEventListener("input", set);
    set();

    // Etichetta d'azione che segue la maniglia
    const hint = document.createElement("span");
    hint.className = "compare__hint";
    hint.setAttribute("aria-hidden", "true");
    hint.innerHTML =
      '<svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg>' +
      `<span>${TOUCH.matches ? "Scorri col dito" : "Trascina per confrontare"}</span>` +
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
    el.style.setProperty("--pos", `${v}%`);
    requestAnimationFrame(step);
  };
  const done = () => { el._peeking = false; el.classList.remove("is-peek"); };
  requestAnimationFrame(step);
}
