import { initHeader } from "./modules/header.js";
import { initNav } from "./modules/nav.js";
import { initMotion } from "./modules/motion.js";
import { initTabs } from "./modules/tabs.js";
import { initCompare } from "./modules/compare.js";
import { initMappe } from "./modules/mappa.js";

const pageModules = {
  "hero-finestra": () => import("./modules/hero-finestra.js"),
  palazzina: () => import("./modules/palazzina.js"),
  esploso: () => import("./modules/esploso.js"),
  vetro: () => import("./modules/vetro.js"),
  percorso: () => import("./modules/percorso.js"),
  "calcolo-bonus": () => import("./modules/calcolo-bonus.js"),
  "scroll-scene": () => import("./modules/scroll-scene.js"),
  stagioni: () => import("./modules/stagioni.js"),
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initNav();
  initTabs();
  initCompare();
  initMappe();
  const motion = initMotion();

  for (const [name, load] of Object.entries(pageModules)) {
    const el = document.querySelector(`[data-module="${name}"]`);
    if (el) load().then((m) => m.default(el, motion));
  }
});
