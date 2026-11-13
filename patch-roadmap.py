#!/usr/bin/env python3
"""Upgrade the UI of the Roadmap Hub roadmap pages without touching their data.

Usage (from the repo root):
    python patch_roadmaps.py sql-roadmap/index.html postgres-roadmap/index.html fastapi-roadmap/index.html

- Checks every expected snippet first. If anything is missing it stops and writes NOTHING.
- Saves index.html.bak next to each file before writing.
- Safe to inspect with `git diff`. Do not run it twice on the same file (the second run will refuse).
"""
import re, sys, shutil

CSS = r"""
/* ---- UI upgrade ---- */
.cta-btn{display:inline-flex;align-items:center;gap:.5rem;min-height:2.75rem;padding:.5rem 1.125rem;border-radius:.625rem;background:var(--c);color:#09090b;font-weight:600;font-size:.9375rem;transition:filter 160ms var(--ease),transform 120ms var(--ease)}
.cta-btn:hover{filter:brightness(1.1)}.cta-btn:active{transform:scale(.97)}
.up-next{display:inline-block;margin-bottom:.125rem;padding:0 .5rem;border-radius:999px;border:1px solid rgba(var(--rgb),.4);background:var(--bg);color:var(--c);font-size:.6875rem;font-weight:600;line-height:1.6}
.row.next .card{border-color:rgba(var(--rgb),.55)}
.row.next .node{border-color:var(--c);box-shadow:0 0 0 4px rgba(var(--rgb),.12)}
.jump-chip{flex:none;display:inline-flex;align-items:center;min-height:2.5rem;max-width:16rem;padding:.25rem .875rem;border-radius:999px;border:1px solid #3f3f46;background:#141417;color:#d4d4d8;font-size:.875rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:border-color 160ms var(--ease)}
.jump-chip:hover{border-color:var(--c)}
#jump{scrollbar-width:none}
.drawer{height:100dvh}
#df{padding-bottom:calc(1rem + env(safe-area-inset-bottom,0px))}
.card:active{transform:scale(.995)}
section[id^=level-]{scroll-margin-top:4.5rem}
@media (prefers-reduced-motion:reduce){.cta-btn:active,.card:active{transform:none}}
"""

JS = r"""
<script>
(()=>{
 const $=id=>document.getElementById(id);let last=null;
 const _oD=openD,_oP=openP,_cD=closeD,_rr=renderRoad;
 const lock=on=>document.querySelectorAll('header,main').forEach(x=>x.inert=on);
 const wrap=f=>function(...a){
  const was=$('root').classList.contains('open');
  if(!was)last=document.activeElement;
  f(...a);
  $('dr').inert=false;lock(true);
  if(!was){const c=$('dclose');if(c)c.focus({preventScroll:true})}
 };
 openD=wrap(_oD);openP=wrap(_oP);
 closeD=function(){_cD();lock(false);$('dr').inert=true;if(last&&last.isConnected)last.focus({preventScroll:true})};
 $('dr').inert=true;
 window.tg=(b,id)=>{const el=$(id);el.classList.toggle('hidden');b.setAttribute('aria-expanded',String(!el.classList.contains('hidden')))};
 renderRoad=function(){
  _rr();
  const pct=Math.round(done.size/TOPICS.length*100),bar=$('bar');
  if(bar&&bar.parentElement){const p=bar.parentElement;p.setAttribute('role','progressbar');p.setAttribute('aria-label','Roadmap progress');p.setAttribute('aria-valuemin','0');p.setAttribute('aria-valuemax','100');p.setAttribute('aria-valuenow',pct)}
  const nx=document.querySelector('#road .row:not(.done) > button.card[onclick^="openD("]');
  let target=0,label='All topics complete. Review from the start';
  if(nx){
   target=+/openD\((\d+)\)/.exec(nx.getAttribute('onclick'))[1];
   nx.closest('.row').classList.add('next');
   nx.querySelector('.flex-1').insertAdjacentHTML('afterbegin','<span class="up-next">Up next</span>');
   label=(done.size?'Continue: ':'Start with: ')+TOPICS[target].t;
  }
  const cta=$('cta');
  if(cta){cta.innerHTML='<i data-lucide="'+(done.size?'play':'arrow-right')+'" class="w-4 h-4" aria-hidden="true"></i><span></span>';cta.lastElementChild.textContent=label;cta.onclick=()=>openD(target)}
  const j=$('jump');
  if(j)j.innerHTML=LV.map((L,i)=>'<a class="jump-chip" href="#level-'+(i+1)+'">'+(i+1)+'. '+esc(L.n.split(' \u00b7 ')[1])+'</a>').join('');
  lucide.createIcons();
 };
 renderRoad();
})();
</script>
"""

name = ""
def rep(s, a, b, n=None):
    c = s.count(a)
    if c == 0 or (n is not None and c != n):
        raise SystemExit(f"[{name}] expected {n if n else '1+'} x {a[:80]!r}, found {c}. Nothing was written.")
    return s.replace(a, b)

def rx(s, pattern, repl, flags=0):
    new, c = re.subn(pattern, repl, s, count=1, flags=flags)
    if c != 1:
        raise SystemExit(f"[{name}] pattern not found: {pattern[:80]!r}. Nothing was written.")
    return new

def main(paths):
    if not paths:
        raise SystemExit(__doc__)
    global name
    src = {p: open(p, encoding="utf-8").read() for p in paths}
    ref = next((t for t in src.values() if "milestone-card" in t and "nav-toggle" in t), None)
    out = {}
    for p, s in src.items():
        name = p
        if "/* ---- UI upgrade ---- */" in s:
            raise SystemExit(f"[{p}] already patched.")
        if "nav-toggle" not in s:  # the older PostgreSQL page: bring it to the shared layout first
            if ref is None:
                raise SystemExit("Pass the SQL or FastAPI page too: it is the reference for the shared header.")
            hdr = re.search(r"<header[\s\S]*?</header>", ref).group(0)
            s = rx(s, r"<header[\s\S]*?</header>", lambda m: hdr)
            s = rep(s, '<meta name="viewport" content="width=device-width, initial-scale=1">',
                    '<meta name="viewport" content="width=device-width, initial-scale=1">\n<link rel="icon" type="image/svg+xml" href="../logos/logo-mark.svg">', 1)
            s = rep(s, '<div class="mb-8"><div class="eyebrow', '<div id="how-it-works" class="mb-8"><div class="eyebrow', 1)
            s = rep(s, '<h2 class="text-4xl sm:text-5xl', '<h1 class="text-4xl sm:text-5xl', 1)
            s = rx(s, r"(<h1 class=\"text-4xl[\s\S]*?)</h2>", lambda m: m.group(1) + "</h1>")
            s = rep(s, '<div id="road"></div>', '<div id="progress"><div id="road"></div></div>', 1)
            s = rep(s, '<div id="legend"', '<div id="roadmaps" class="sr-only"></div><div id="legend"', 1)
            style = re.search(r"<style>([\s\S]*?)</style>", ref).group(1)
            lines = "\n".join(re.findall(r"^(?:\.milestone-|\.nav-link|@media\(max-width:600px\)).*$", style, re.M))
            s = rep(s, "@media (prefers-reduced-motion:reduce)", lines + "\n@media (prefers-reduced-motion:reduce)", 1)
            mp = re.search(r"^ const milestonePercent.*$", ref, re.M).group(0)
            ml = re.search(r'^ document\.getElementById\("mile"\)\.innerHTML=.*$', ref, re.M).group(0)
            ml = re.sub(r"Bring your \w+ skills", "Bring your PostgreSQL skills", ml)
            s = rx(s, r'^ document\.getElementById\("mile"\)\.innerHTML=.*$', lambda m: mp + "\n" + ml, re.M)
            navjs = re.findall(r"<script>\s*\(\(\) => \{[\s\S]*?\}\)\(\);\s*</script>", ref)[-1]
            s = rep(s, "</body>", navjs + "\n</body>", 1)

        s = rep(s, '<script src="https://cdn.tailwindcss.com"></script>', '<script src="https://cdn.tailwindcss.com/3.4.17"></script>', 1)
        s = rep(s, '<script src="https://unpkg.com/lucide@latest"></script>', '<script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"></script>', 1)
        s = rep(s, '500:"#71717a"', '500:"#8a8a93"', 1)
        s = rep(s, ".cm{color:#71717a", ".cm{color:#9a9aa4", 1)
        s = rep(s, ".null{color:#71717a", ".null{color:#9a9aa4", 1)
        s = rep(s, '<body class="min-h-screen">', '<body class="min-h-screen">\n<a href="#roadmaps" class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-950">Skip to roadmap</a>', 1)
        s = rep(s, '<div class="hidden sm:block flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">', '<div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">', 1)
        s = rep(s, "gap-3 sm:w-48 md:ml-0", "gap-3 w-32 sm:w-48 md:ml-0", 1)
        s = rep(s, 'class="rounded-lg p-2 text-zinc-300 hover:bg-white/10 md:hidden"', 'class="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 md:hidden"', 1)
        s = rep(s, 'class="nav-link py-2.5"', 'class="nav-link py-3"')
        s = rep(s, '<aside id="dr" class="drawer', '<aside id="dr" role="dialog" aria-modal="true" aria-labelledby="dtitle" class="drawer', 1)
        s = rep(s, '<h2 class="text-2xl font-bold text-white">${', '<h2 id="dtitle" class="text-2xl font-bold text-white">${', 2)
        s = rep(s, '<button onclick="closeD()" aria-label="Close" class="p-2 rounded-lg hover:bg-slate-700 text-slate-300">',
                '<button id="dclose" onclick="closeD()" aria-label="Close" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-slate-700 text-slate-300">', 2)
        s = rep(s, 'class="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30"',
                'class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40"', 2)
        s = rep(s, 'class="flex-1 py-2 rounded-lg font-semibold', 'class="flex-1 py-3 rounded-lg font-semibold', 2)
        s = rep(s, "px-4 py-2 rounded-lg", "px-4 py-3 rounded-lg")
        s = rep(s, "onclick=\"document.getElementById('hint').classList.toggle('hidden')\"", "aria-expanded=\"false\" onclick=\"tg(this,'hint')\"", 1)
        s = rep(s, "onclick=\"document.getElementById('sol').classList.toggle('hidden')\"", "aria-expanded=\"false\" onclick=\"tg(this,'sol')\"", 1)
        # bug fix: arrow keys inside the practice textarea used to switch topics
        s = rep(s, 'if(document.getElementById("root").classList.contains("open")){if(e.key==="ArrowRight")',
                'if(document.getElementById("root").classList.contains("open")&&!/^(TEXTAREA|INPUT)$/.test(e.target.tagName)){if(e.key==="ArrowRight")', 1)
        s = rep(s, '<section class="${L.cls} mb-12">', '<section id="level-${li+1}" class="${L.cls} mb-12">', 1)
        s = rep(s, '<div id="legend" class="flex flex-wrap gap-2 mb-10"></div>',
                '<div id="legend" class="flex flex-wrap gap-2 mb-4"></div><nav id="jump" aria-label="Jump to level" class="mb-10 flex gap-2 overflow-x-auto pb-1"></nav>', 1)
        s = rx(s, r'(id="how-it-works"[\s\S]*?</p>)(</section>|</div>)',
               lambda m: m.group(1) + '<div class="mt-6"><button id="cta" type="button" class="cta-btn"></button></div>' + m.group(2))
        s = rep(s, "</style>", CSS + "</style>", 1)
        s = rep(s, "</body>", JS + "</body>", 1)
        out[p] = s

    for p, s in out.items():  # only reached if every file passed every check
        shutil.copyfile(p, p + ".bak")
        open(p, "w", encoding="utf-8").write(s)
        print("patched", p, "(backup:", p + ".bak)")

if __name__ == "__main__":
    main(sys.argv[1:])