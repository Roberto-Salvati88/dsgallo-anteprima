// Hero a scorrimento (home e pagine servizio): lo scroll fa avanzare la scena.
// Su telefoni e tablet in verticale, se la sezione ha data-frames e data-frame-count,
// disegna su canvas una sequenza di immagini: iPhone e molti Android non caricano
// il video finché non parte la riproduzione, quindi lo scroll non lo farebbe avanzare.
// Sugli schermi grandi pilota il video.
import logo3d from "./logo-3d.js";

const MOBILE = "(max-width: 950px), (max-aspect-ratio: 1/1)";

export default function heroFinestra(section, { gsap, ScrollTrigger, reduce }) {
  const canvas = section.querySelector("[data-hero-canvas]");
  const video = section.querySelector("[data-hero-video]");
  const copy = section.querySelector("[data-hero-copy]");
  const scrim = section.querySelector("[data-hero-scrim]");
  const outro = section.querySelector("[data-hero-outro]");
  const hint = section.querySelector("[data-hero-hint]");

  if (reduce || !gsap) {
    section.style.height = "auto";
    return;
  }

  const useFrames = section.dataset.frames && canvas && window.matchMedia(MOBILE).matches;
  const drawScene = useFrames ? frameSequence(section, canvas) : videoScrub(video);

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6 },
  });

  tl.to({}, { duration: 1, onUpdate() { drawScene(this.progress()); } }, 0)
    .to(hint, { opacity: 0, duration: 0.06 }, 0)
    .to(copy, { opacity: 0, y: -60, duration: 0.22 }, 0.06)
    .to(scrim, { opacity: 0, duration: 0.25 }, 0.06);

  // finale della home: il logo 3D copre il logo piatto del video e gira entrando
  if (outro) {
    tl.fromTo(outro, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.8);
    const logo = section.querySelector("[data-logo3d]");
    const model = logo && logo3d(logo, { gsap });
    tl.eventCallback("onUpdate", () => {
      const p = tl.progress();
      outro.classList.toggle("is-live", p > 0.86);
      model?.setScroll(Math.min(Math.max((p - 0.82) / 0.18, 0), 1));
    });
  }

  // ingresso del titolo al caricamento
  gsap.from(section.querySelectorAll(".hero__line, .hero__lead, .hero__actions, .hero__rating, .eyebrow"), {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out",
    stagger: 0.08,
  });

  ScrollTrigger.refresh();
}

function videoScrub(video) {
  let duration = 0;
  video.preload = "auto";
  video.load();
  video.pause();
  const ready = () => (duration = video.duration || 0);
  if (video.readyState >= 1) ready();
  video.addEventListener("loadedmetadata", ready);

  let pending = null;
  let seeking = false;
  video.addEventListener("seeked", () => {
    seeking = false;
    if (pending !== null) {
      const t = pending;
      pending = null;
      seek(t);
    }
  });

  function seek(t) {
    if (seeking) {
      pending = t;
      return;
    }
    seeking = true;
    video.currentTime = t;
  }

  return (p) => {
    if (duration) seek(Math.min(p * duration, duration - 0.05));
  };
}

function frameSequence(section, canvas) {
  const ctx = canvas.getContext("2d");
  const count = Number(section.dataset.frameCount);
  const pattern = section.dataset.frames;
  const frames = [];
  let current = 0;

  const src = (i) => pattern.replace("###", String(i + 1).padStart(3, "0"));

  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.decoding = "async";
    img.src = src(i);
    // il poster resta visibile finché non arriva il primo fotogramma
    if (i === 0) {
      img.onload = () => {
        section.classList.add("has-frames");
        resize();
      };
    }
    frames.push(img);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    render(current);
  }

  const loaded = (img) => img && img.complete && img.naturalWidth;

  function render(i) {
    // se lo scroll è più veloce del download, usa il fotogramma pronto più vicino
    let k = i;
    while (k > 0 && !loaded(frames[k])) k--;
    const img = frames[k];
    if (!loaded(img)) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  window.addEventListener("resize", resize);

  return (p) => {
    const i = Math.min(count - 1, Math.round(p * (count - 1)));
    if (i !== current) {
      current = i;
      render(i);
    }
  };
}
