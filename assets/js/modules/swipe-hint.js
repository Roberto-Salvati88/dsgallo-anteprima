// Indicazione di scorrimento, unica per telefono e desktop (sostituisce il vecchio "Scorri" in basso a destra).
// - In basso al centro, dove l'occhio arriva dopo i pulsanti: su telefono frecce swipe-up stile storie Instagram
//   ("Scorri in su"); su Mac lo stesso (scorrimento naturale: le dita salgono); sugli altri desktop
//   il mouse con la rotellina che si muove ("Scorri").
// - Capsula bassa e orizzontale (icona + scritta) nel margine in fondo allo schermo; se lì sotto c'è del testo
//   diventa un cerchietto con sole frecce, così non copre le scritte.
// - Su tutte le pagine e in ogni punto: compare dopo 1 s, sparisce appena si scorre, ricompare dopo 1 s da fermi;
//   non compare in fondo alla pagina (footer) né mentre si scrive in un modulo. Capsula scura: leggibile su fondi chiari e scuri.
// - Gesto sbagliato (trascinamento o swipe del trackpad in orizzontale): l'indicazione salta per richiamare quello giusto.
// - Cliccabile/toccabile: fa avanzare la scena di un tratto (per chi non sa come procedere).
// - Barra sottile sul bordo destro che si riempie mentre la scena avanza con lo scroll.
import { MOBILE } from "./scrub.js";

const SCENES = '[data-module="hero-finestra"], [data-module="scroll-scene"], .hero[data-frames], .scene[data-frames]';
const NO_NUDGE = ".compare, .tabs, .mappa, [data-swipe-ok], input, textarea, select, [role='slider']";

export function initSwipeHint() {
  const scenes = [...document.querySelectorAll(SCENES)];
  const mq = window.matchMedia(MOBILE);

  const hint = document.createElement("button");
  hint.type = "button";
  hint.className = "swipe-hint";
  hint.tabIndex = -1;
  hint.setAttribute("aria-hidden", "true");
  hint.innerHTML =
    '<span class="swipe-hint__touch">' +
    '<svg viewBox="0 0 24 14"><path d="M2 12 12 3l10 9"/></svg>'.repeat(2) +
    "</span>" +
    '<span class="swipe-hint__mouse"><span class="swipe-hint__wheel"></span></span>' +
    '<span class="swipe-hint__label"></span>';
  const label = hint.querySelector(".swipe-hint__label");

  const bar = document.createElement("div");
  bar.className = "scroll-meter";
  bar.setAttribute("aria-hidden", "true");
  bar.innerHTML = '<span class="scroll-meter__fill"></span>';
  const fill = bar.firstElementChild;

  document.body.append(hint, bar);

  // Mac (trackpad e Magic Mouse con lo scorrimento "naturale" di serie): per andare avanti le dita salgono,
  // come sul telefono, quindi frecce in su. Altri computer: rotellina del mouse che si gira verso di sé.
  const mac = /mac/i.test(navigator.userAgentData?.platform || navigator.platform || "");
  const setLabel = () => {
    const up = mq.matches || mac;
    hint.classList.toggle("swipe-hint--up", up);
    label.textContent = up ? "Scorri in su" : "Scorri";
  };
  setLabel();
  mq.addEventListener("change", setLabel);

  // scena "a scorrimento" attiva in questo momento e quanto è avanzata (0..1)
  function activeScene() {
    const vh = window.innerHeight;
    for (const s of scenes) {
      const r = s.getBoundingClientRect();
      const run = r.height - vh;
      if (run < vh * 0.3) continue; // sezione non pilotata dallo scroll
      if (r.top <= 1 && r.bottom >= vh - 1) return { p: Math.min(1, Math.max(0, -r.top / run)) };
    }
    return null;
  }

  let idle = null;
  let lastY = window.scrollY;
  // Se nel punto in basso al centro c'è del testo (titoli, paragrafi, pulsanti, numeri...), la capsula con la scritta
  // lo coprirebbe: allora compare solo il cerchietto con le frecce, senza scritta. Nella hero lo spazio è riservato.
  const CONTENT = "h1, h2, h3, h4, h5, h6, p, li, a, button, label, input, textarea, select, figcaption, blockquote, dt, dd, td, th, img, picture, .btn, .stats__num, .stats__label";
  function spotFree() {
    hint.classList.remove("is-mini");
    const r = hint.getBoundingClientRect();
    for (const fy of [0.2, 0.8]) {
      for (const fx of [0.05, 0.3, 0.5, 0.7, 0.95]) {
        const el = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy);
        if (el && el !== hint && !hint.contains(el) && el.closest(CONTENT) && !el.closest(".quick-actions")) return false;
      }
    }
    return true;
  }
  const show = () => {
    if (!hint.classList.contains("is-on")) hint.classList.toggle("is-mini", !spotFree());
    hint.classList.add("is-on");
  };
  const hide = () => hint.classList.remove("is-on");

  // c'è ancora pagina sotto? (niente indicazione sul footer o in fondo)
  const footer = document.querySelector("footer, .site-footer");
  function moreBelow() {
    const vh = window.innerHeight;
    const doc = document.documentElement;
    if (window.scrollY + vh >= doc.scrollHeight - 120) return false;
    if (footer && footer.getBoundingClientRect().top < vh * 0.85) return false;
    return true;
  }
  const typing = () => document.activeElement?.matches?.("input, textarea, select, [contenteditable]");
  const canShow = () => moreBelow() && !typing() && !document.querySelector(".is-open");

  function armIdle() {
    clearTimeout(idle);
    idle = setTimeout(() => { if (canShow()) show(); }, 1000);
  }

  function update() {
    const a = activeScene();
    bar.classList.toggle("is-on", Boolean(a));
    if (a) fill.style.transform = `scaleY(${a.p})`;
  }

  function nudge() {
    show();
    hint.classList.remove("is-nudge");
    void hint.offsetWidth;
    hint.classList.add("is-nudge");
    armIdle();
  }

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 8) {
      hide();
      lastY = y;
    }
    update();
    armIdle();
  }, { passive: true });
  window.addEventListener("resize", update);

  // clic/tocco sull'indicazione: avanza di un tratto
  hint.addEventListener("click", () => {
    hide();
    window.scrollBy({ top: Math.round(window.innerHeight * 0.6), behavior: "smooth" });
  });

  // telefono: trascinamento orizzontale
  let x0 = 0;
  let y0 = 0;
  let nudged = false;
  window.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    x0 = t.clientX;
    y0 = t.clientY;
    nudged = false;
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (nudged) return;
    const t = e.touches[0];
    const dx = t.clientX - x0;
    const dy = t.clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > 1.6 * Math.abs(dy) && !e.target.closest(NO_NUDGE)) {
      nudged = true;
      nudge();
      navigator.vibrate?.(30);
    }
  }, { passive: true });

  // desktop: swipe orizzontale sul trackpad
  let lastWheelNudge = 0;
  window.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) > 20 && Math.abs(e.deltaX) > 2 * Math.abs(e.deltaY) && !e.target.closest(NO_NUDGE)) {
      const now = Date.now();
      if (now - lastWheelNudge > 1200) {
        lastWheelNudge = now;
        nudge();
      }
    }
  }, { passive: true });

  update();
  armIdle();
}
