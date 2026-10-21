// Carica l'iframe di Google Maps solo al tocco (evita i cookie di Google finché l'utente non lo chiede).
export function initMappe() {
  document.querySelectorAll("[data-mappa]").forEach((frame) => {
    const button = frame.querySelector("[data-mappa-load]");
    button?.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = frame.dataset.src;
      iframe.title = frame.dataset.title;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      frame.replaceChildren(iframe);
      frame.classList.add("is-loaded");
    });
  });
}
