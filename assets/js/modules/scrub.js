// Scene pilotate dallo scroll: video sugli schermi grandi, sequenza di immagini su telefono.
// iPhone e molti Android non caricano il video finché non parte la riproduzione,
// quindi su mobile lo scroll non lo farebbe avanzare: lì si disegnano i fotogrammi su canvas.
export const MOBILE = "(max-width: 950px), (max-aspect-ratio: 1/1)";

// sceglie il motore giusto per la sezione (data-frames + data-frame-count per il mobile)
export function scrubber(section, canvas, video) {
  const useFrames = section.dataset.frames && canvas && window.matchMedia(MOBILE).matches;
  return useFrames ? frameSequence(section, canvas) : videoScrub(video);
}

export function videoScrub(video) {
  let duration = 0;
  let lastP = 0;
  video.preload = "auto";
  video.load();
  video.pause();
  // se il video finisce di caricarsi dopo che si è già scorso, salta subito al punto giusto
  const ready = () => {
    duration = video.duration || 0;
    if (duration && lastP) seek(Math.min(lastP * duration, duration - 0.05));
  };
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

  if (video.readyState >= 1) ready();

  return (p) => {
    lastP = p;
    if (duration) seek(Math.min(p * duration, duration - 0.05));
  };
}

export function frameSequence(section, canvas) {
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
