export function initCompare() {
  document.querySelectorAll("[data-compare]").forEach((el) => {
    const range = el.querySelector("input[type=range]");
    const set = () => el.style.setProperty("--pos", `${range.value}%`);
    range.addEventListener("input", set);
    set();
  });
}
