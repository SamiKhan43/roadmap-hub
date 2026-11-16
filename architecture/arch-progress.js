/* Save as architecture/arch-progress.js and add before </body> in architecture/index.html:
   <script src="arch-progress.js" defer></script>
   Shows "3 / 11 lessons" progress on the module cards, so learners see where to continue. */
(() => {
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const modules = [
    { match: "computer-fundamentals/index.html", total: 11, count: () => (read("roadmap-hub:architecture:computer-fundamentals:v1")?.completed || []).length },
    { match: "memory-management/index.html", total: 15, count: () => (Array.isArray(read("roadmap-hub-memory-management-progress")) ? read("roadmap-hub-memory-management-progress") : []).length }
  ];
  const style = document.createElement("style");
  style.textContent = ".card-progress{width:100%;margin:-.5rem 0 1.25rem;color:var(--muted);font-size:.78rem}.card-progress i{display:block;height:4px;margin-top:.4rem;border-radius:9px;background:#252c26;overflow:hidden}.card-progress b{display:block;height:100%;background:var(--accent)}";
  document.head.append(style);
  modules.forEach(m => {
    const link = [...document.querySelectorAll(".card-link")].find(a => a.getAttribute("href")?.endsWith(m.match));
    if (!link) return;
    const n = Math.min(m.count(), m.total);
    const p = document.createElement("p");
    p.className = "card-progress";
    p.innerHTML = `<span>${n === 0 ? `${m.total} lessons · not started` : n === m.total ? "Completed ✓" : `${n} / ${m.total} lessons complete`}</span><i><b style="width:${Math.round(n / m.total * 100)}%"></b></i>`;
    link.before(p);
    if (n > 0 && n < m.total) link.firstChild.textContent = link.firstChild.textContent.replace(/^\s*Explore/, "Continue");
  });
})();
