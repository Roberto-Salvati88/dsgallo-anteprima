// Esempio di calcolo nella pagina detrazione: 50% subito, 50% finanziato,
// detrazione IRPEF del 50% divisa in 10 rate annuali.
const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });

export default function calcoloBonus(root) {
  const range = root.querySelector("input[type=range]");
  const out = (sel) => root.querySelector(sel);

  const update = () => {
    const importo = Number(range.value);
    const meta = importo / 2;
    out("[data-calc-amount]").textContent = euro.format(importo);
    out("[data-calc-subito]").textContent = euro.format(meta);
    out("[data-calc-fin]").textContent = euro.format(meta);
    out("[data-calc-anno]").textContent = euro.format(meta / 10);
    out("[data-calc-tot]").textContent = euro.format(meta);
  };

  range.addEventListener("input", update);
  update();
}
