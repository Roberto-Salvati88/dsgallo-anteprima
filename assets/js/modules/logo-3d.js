// Logo 3D in fondo alla hero della home: il logo con il suo spessore, senza basi.
// Quando compare gira con lo scroll; poi si fa ruotare trascinandolo (mouse o dito),
// con un tocco o con le frecce della tastiera. Lasciato andare, rallenta e si ferma di fronte.
export default function logo3d(scene, { gsap }) {
  const state = { scroll: 0, user: 0, tilt: 0 };
  let velocity = 0;
  let inertia = null;
  let settle = null;

  function render() {
    scene.style.setProperty("--ry", `${state.scroll + state.user}deg`);
    scene.style.setProperty("--rx", `${state.tilt}deg`);
  }

  function stop() {
    cancelAnimationFrame(inertia);
    settle?.kill();
  }

  // si ferma sempre di fronte, con il logo dritto e leggibile
  function rest() {
    const total = state.scroll + state.user;
    const target = Math.round(total / 360) * 360 - state.scroll;
    settle = gsap.to(state, { user: target, tilt: 0, duration: 0.9, ease: "power3.out", onUpdate: render });
  }

  function glide() {
    velocity *= 0.95;
    state.user += velocity;
    render();
    if (Math.abs(velocity) > 0.3) inertia = requestAnimationFrame(glide);
    else rest();
  }

  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastT = 0;
  let moved = false;
  let dragging = false;

  scene.addEventListener("pointerdown", (e) => {
    stop();
    dragging = true;
    try {
      scene.setPointerCapture(e.pointerId);
    } catch {}
    startX = lastX = e.clientX;
    startY = e.clientY;
    lastT = performance.now();
    velocity = 0;
    moved = false;
    scene.classList.add("is-dragging");
  });

  scene.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    state.user += dx * 0.6;
    state.tilt = Math.max(-18, Math.min(18, (startY - e.clientY) * 0.15));
    velocity = (dx * 0.6 * 16) / Math.max(now - lastT, 1);
    lastX = e.clientX;
    lastT = now;
    if (Math.abs(e.clientX - startX) > 4) moved = true;
    render();
  });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    if (scene.hasPointerCapture(e.pointerId)) scene.releasePointerCapture(e.pointerId);
    scene.classList.remove("is-dragging");
    if (!moved) {
      // un tocco: giro completo
      settle = gsap.to(state, { user: state.user + 360, tilt: 0, duration: 1.4, ease: "power3.inOut", onUpdate: render, onComplete: rest });
      return;
    }
    glide();
  }

  scene.addEventListener("pointerup", release);
  scene.addEventListener("pointercancel", release);

  scene.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: -45, ArrowRight: 45 }[e.key];
    if (!step) return;
    e.preventDefault();
    stop();
    settle = gsap.to(state, { user: state.user + step, duration: 0.4, ease: "power2.out", onUpdate: render });
  });

  // le immagini sono in un contenitore trasparente: il caricamento "lazy" non partirebbe,
  // quindi si scaricano a pagina caricata
  const loadImages = () => scene.parentElement.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
  if (document.readyState === "complete") loadImages();
  else window.addEventListener("load", loadImages, { once: true });

  render();

  return {
    // p da 0 a 1 mentre il logo compare: un giro e mezzo che rallenta fino al fronte
    setScroll(p) {
      state.scroll = -540 * Math.pow(1 - p, 2);
      render();
    },
  };
}
