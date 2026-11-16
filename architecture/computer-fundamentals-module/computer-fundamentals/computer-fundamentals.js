(() => {
  const lessons = window.COMPUTER_FUNDAMENTALS_LESSONS || [];
  const base = document.body.dataset.base || "./";
  const current = Number(document.body.dataset.lesson || 0);
  const storageKey = "roadmap-hub:architecture:computer-fundamentals:v1";
  const readState = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{"completed":[]}'); }
    catch { return { completed: [] }; }
  };
  const writeState = state => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { /* Progress remains usable for this visit if storage is unavailable. */ }
  };
  let state = readState();
  if (!Array.isArray(state.completed)) state.completed = [];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const diagram = type => {
    const wrap = (title, desc, inner, width=760) => `<figure class="cf-diagram"><svg viewBox="0 0 ${width} 220" role="img" aria-labelledby="diagram-title diagram-desc"><title id="diagram-title">${title}</title><desc id="diagram-desc">${desc}</desc><defs><marker id="cf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#a8b69d"/></marker><marker id="cf-arrow-accent" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#c6f36a"/></marker></defs>${inner}</svg><figcaption>Conceptual diagram. Real systems contain additional components and implementation details.</figcaption></figure>`;
    const box = (x,y,w,h,title,sub="",accent=false) => `<rect class="${accent?"box-accent":"box"}" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><text x="${x+w/2}" y="${y+27}">${title}</text>${sub?`<text class="small" x="${x+w/2}" y="${y+47}">${sub}</text>`:""}`;
    const line = (x1,y1,x2,y2,accent=false) => `<path class="${accent?"arrow-accent":"arrow"}" marker-end="url(#${accent?"cf-arrow-accent":"cf-arrow"})" d="M${x1} ${y1} L${x2} ${y2}"/>`;
    switch(type){
      case "system": return wrap("Computer system overview","Input enters a computer system; software and the operating system coordinate CPU, memory and storage; output leaves the system.",`${box(20,80,120,60,"Input","keyboard / network")}${box(205,80,150,60,"Operating system","coordinates resources",true)}${box(420,20,130,60,"CPU","executes instructions")}${box(420,90,130,60,"RAM","active working data")}${box(420,160,130,45,"Storage","persistent files")}${box(625,80,115,60,"Output","screen / network")}${line(140,110,197,110)}${line(355,110,412,50)}${line(355,110,412,120)}${line(355,110,412,180)}${line(550,110,617,110)}`);
      case "cpu": return wrap("CPU package and cores","A processor contains multiple cores. Each core executes instructions; cores share some processor resources.",`${box(120,35,520,150,"CPU package","shared caches and interconnect",true)}${box(155,85,125,65,"Core 1","execution unit")}${box(325,85,125,65,"Core 2","execution unit")}${box(495,85,125,65,"Core 3","execution unit")}`);
      case "memory": return wrap("Memory hierarchy overview","CPU registers and caches are very fast and small; RAM is larger working memory; SSD storage is persistent and generally slower.",`${box(70,15,620,42,"CPU registers and cache","very fast · small",true)}${box(70,75,620,42,"RAM","working memory · volatile")}${box(70,135,620,42,"SSD / hard drive","persistent storage")}${line(380,57,380,73,true)}${line(380,117,380,133)}`);
      case "pipeline": return wrap("CPU RAM and storage cooperate","Programs and files persist on storage, active data is held in RAM, and the CPU operates on instructions and data.",`${box(35,75,175,75,"Storage","programs and files")}${box(290,75,175,75,"RAM","active code and data",true)}${box(545,75,175,75,"CPU","executes operations")}${line(210,112,282,112)}${line(465,112,537,112)}<text class="small" x="250" y="95">load</text><text class="small" x="505" y="95">fetch / write</text>`);
      case "binary": return wrap("Binary place values","Each binary position represents a power of two. The example 1011 equals decimal eleven.",`${[8,4,2,1].map((v,i)=>box(90+i*150,55,105,90,String("1011"[i]),"place value "+v,true)).join("")}<text x="380" y="185">8 + 0 + 2 + 1 = 11</text>`);
      case "execution": return wrap("Program execution lifecycle","The operating system creates a process, maps code and data, schedules a thread, and the CPU executes instructions.",`${box(20,75,125,65,"Program","stored executable")}${box(185,75,145,65,"OS creates","process + memory",true)}${box(370,75,125,65,"Thread","runnable work")}${box(535,75,100,65,"CPU","executes")}${box(675,75,75,65,"Exit","cleanup")}${line(145,108,177,108)}${line(330,108,362,108)}${line(495,108,527,108)}${line(635,108,667,108)}`);
      case "instruction": return wrap("Fetch decode execute cycle","The processor fetches an instruction, decodes its operation, executes it, and advances or branches to the next instruction.",`${box(35,70,180,80,"1 · Fetch","read next instruction",true)}${box(290,70,180,80,"2 · Decode","identify operation")}${box(545,70,180,80,"3 · Execute","perform operation")}${line(215,110,282,110)}${line(470,110,537,110)}<path class="arrow" marker-end="url(#cf-arrow)" d="M635 158 V190 H125 V158"/>`);
      case "bits": return wrap("Address width and possible values","A field with 32 bits has 2 to the power of 32 possible patterns; a field with 64 bits has 2 to the power of 64.",`${box(90,45,245,100,"32 bit","2³² possible patterns")}${box(425,45,245,100,"64 bit","2⁶⁴ possible patterns",true)}<text class="small" x="380" y="185">Actual usable address width depends on the platform.</text>`);
      case "os": return wrap("Operating system as a resource manager","Applications request services from the operating system, which coordinates hardware resources.",`${box(265,15,230,55,"Applications","backend · database · tools")}${box(265,90,230,55,"Operating system","process · memory · files · network",true)}${box(75,170,150,40,"CPU")}${box(305,170,150,40,"RAM")}${box(535,170,150,40,"Storage / devices")}${line(380,70,380,82)}${line(315,145,150,162)}${line(380,145,380,162)}${line(445,145,610,162)}`);
      case "kernel": return wrap("User space and kernel space boundary","Applications run in user space. System calls cross into kernel space for privileged services, then return to user space.",`${box(70,25,620,65,"USER SPACE","application process · restricted privileges",true)}${box(70,135,620,65,"KERNEL SPACE","system calls · drivers · networking · memory")}${line(380,90,380,127,true)}<text class="small" x="455" y="115">system call / return</text>`);
      case "layers": return wrap("Hardware and software layers","Applications use services provided by the operating system; the operating system manages hardware.",`${box(230,15,300,45,"Applications","backend service and tools")}${box(230,80,300,45,"System software","operating system and drivers",true)}${box(230,145,300,45,"Hardware","CPU · RAM · storage · network")}${line(380,60,380,72)}${line(380,125,380,137)}`);
      default:return "";
    }
  };
  const lessonHTML = lesson => `
    <header class="cf-hero"><p class="cf-eyebrow">Module 01 · Computer & Operating System Fundamentals</p><h1>${escapeHTML(lesson.title)}</h1><p class="cf-lede">${escapeHTML(lesson.intro)}</p><div class="cf-meta"><span class="cf-pill">Beginner</span><span class="cf-pill">${escapeHTML(lesson.time)} read</span><span class="cf-pill">Lesson ${String(current+1).padStart(2,"0")} of ${lessons.length}</span></div></header>
    <div class="cf-progress" aria-label="Module progress"><div class="cf-progress-top"><span>Module progress</span><strong id="progress-text"></strong></div><div class="cf-progress-track" role="progressbar" aria-label="Lessons completed" aria-valuemin="0" aria-valuemax="${lessons.length}" id="progress-bar"><div class="cf-progress-fill" id="progress-fill"></div></div></div>
    <div class="cf-layout"><aside class="cf-sidebar" aria-label="Module lessons"><p class="cf-sidebar-heading">Computer Fundamentals · 11 lessons</p><ol class="cf-lesson-list">${lessons.map((item,i)=>`<li><a class="cf-lesson-link" href="${item.id}.html" ${i===current?'aria-current="page"':""}><span class="cf-lesson-number">${String(i+1).padStart(2,"0")}</span><span>${escapeHTML(item.title)}</span><span class="cf-done" data-done="${item.id}" aria-label="Not completed"></span></a></li>`).join("")}</ol></aside>
    <main class="cf-content" id="main-content"><article class="cf-card">
      <section class="cf-section" id="introduction"><p class="cf-section-kicker">01 · Introduction</p><h2>What this means</h2><p>${escapeHTML(lesson.intro)}</p></section>
      <section class="cf-section" id="why-it-matters"><p class="cf-section-kicker">02 · Backend connection</p><h2>Why it matters</h2><p>${escapeHTML(lesson.why)}</p></section>
      <section class="cf-section" id="mental-model"><p class="cf-section-kicker">03 · Mental model</p><h2>A way to picture it</h2><div class="cf-callout">${escapeHTML(lesson.mental)}</div></section>
      <section class="cf-section" id="how-it-works"><p class="cf-section-kicker">04 · Under the hood</p><h2>How it works</h2><ol>${lesson.steps.map(step=>`<li>${escapeHTML(step)}</li>`).join("")}</ol>${diagram(lesson.diagram)}</section>
      <section class="cf-section" id="real-world-example"><p class="cf-section-kicker">05 · In practice</p><h2>Real world backend example</h2><p>${escapeHTML(lesson.example)}</p></section>
      <section class="cf-section" id="misconceptions"><p class="cf-section-kicker">06 · Clear up the confusion</p><h2>Common misconceptions</h2><ul>${lesson.misconceptions.map(item=>`<li>${escapeHTML(item)}</li>`).join("")}</ul></section>
      <section class="cf-section" id="takeaways"><p class="cf-section-kicker">07 · Review</p><h2>Key takeaways</h2><ul>${lesson.takeaways.map(item=>`<li>${escapeHTML(item)}</li>`).join("")}</ul></section>
      <section class="cf-section" id="knowledge-check"><p class="cf-section-kicker">08 · Check your understanding</p><h2>Knowledge check</h2><p>Choose an answer for each question. Feedback explains why the answer is correct or incorrect.</p><div class="cf-check" id="quiz">${lesson.questions.map((q,i)=>`<div class="cf-question" data-question="${i}"><p>${i+1}. ${escapeHTML(q[0])}</p><div class="cf-options">${q[1].map((option,j)=>`<button class="cf-option" type="button" data-answer="${j}" aria-pressed="false">${escapeHTML(option)}</button>`).join("")}</div><p class="cf-feedback" aria-live="polite"></p></div>`).join("")}<p class="cf-quiz-summary" id="quiz-summary" aria-live="polite">0 of ${lesson.questions.length} answered correctly.</p></div></section>
      <section class="cf-section" id="related-lessons"><p class="cf-section-kicker">09 · Continue learning</p><h2>Related lessons</h2><ul>${[current-1,current+1].filter(i=>i>=0&&i<lessons.length).map(i=>`<li><a href="${lessons[i].id}.html">${String(i+1).padStart(2,"0")} · ${escapeHTML(lessons[i].title)}</a></li>`).join("")}<li><a href="../index.html">Return to the Computer Fundamentals module overview</a></li><li><a href="../../../index.html">Explore the Architecture Library</a></li></ul></section>
      <div class="cf-actions"><a class="cf-btn" href="${current===0?"../index.html":lessons[current-1].id+".html"}">← Previous lesson</a><button class="cf-btn primary" id="complete-button" type="button">${state.completed.includes(lesson.id)?"Completed ✓":"Mark lesson complete"}</button><a class="cf-btn" href="${current===lessons.length-1?"../index.html":lessons[current+1].id+".html"}">${current===lessons.length-1?"Module overview":"Next lesson →"}</a></div>
      <p class="cf-lesson-foot">Progress is saved in this browser using localStorage. Clearing this browser's site data will clear this module's progress.</p>
    </article></main></div>`;
  const renderOverview = () => {
    const list = lessons.map((lesson,i)=>`<li><a class="cf-lesson-link" href="lessons/${lesson.id}.html"><span class="cf-lesson-number">${String(i+1).padStart(2,"0")}</span><span>${escapeHTML(lesson.title)}<small style="display:block;color:var(--cf-quiet);font-size:.68rem;margin-top:.15rem">${lesson.time} · ${lesson.difficulty}</small></span><span class="cf-done" data-done="${lesson.id}"></span></a></li>`).join("");
    document.getElementById("overview-lessons").innerHTML=list;
    updateProgress();
  };
  const updateProgress = () => {
    const done=state.completed.length, pct=Math.round(done/lessons.length*100);
    const label=document.getElementById("progress-text");
    const fill=document.getElementById("progress-fill");
    const bar=document.getElementById("progress-bar");
    if(label) label.textContent=`${done} / ${lessons.length} lessons · ${pct}%`;
    if(fill) fill.style.width=pct+"%";
    if(bar) bar.setAttribute("aria-valuenow",String(done));
    document.querySelectorAll("[data-done]").forEach(el=>{
      const complete=state.completed.includes(el.dataset.done);
      el.textContent=complete?"✓":"";
      el.setAttribute("aria-label",complete?"Completed":"Not completed");
    });
    const button=document.getElementById("complete-button");
    if(button) button.textContent=state.completed.includes(lessons[current].id)?"Completed ✓":"Mark lesson complete";
  };
  const initQuiz = lesson => {
    const answers={};
    document.querySelectorAll(".cf-question").forEach(row=>{
      const index=Number(row.dataset.question);
      row.querySelectorAll(".cf-option").forEach(button=>button.addEventListener("click",()=>{
        const selected=Number(button.dataset.answer), q=lesson.questions[index];
        answers[index]=selected;
        row.querySelectorAll(".cf-option").forEach((item,j)=>item.setAttribute("aria-pressed",String(j===selected)));
        const feedback=row.querySelector(".cf-feedback");
        const correct=selected===q[2];
        feedback.textContent=(correct?"Correct. ":"Not quite. ")+q[3];
        feedback.className="cf-feedback "+(correct?"good":"bad");
        const score=lesson.questions.filter((item,i)=>answers[i]===item[2]).length;
        document.getElementById("quiz-summary").textContent=`${score} of ${lesson.questions.length} answered correctly.`;
      }));
    });
  };
  const isLesson=document.body.dataset.page==="lesson";
  if(isLesson){
    const lesson=lessons[current];
    if(!lesson){document.getElementById("app").textContent="Lesson not found.";return;}
    document.getElementById("app").innerHTML=lessonHTML(lesson);
    initQuiz(lesson);
    document.getElementById("complete-button").addEventListener("click",()=>{
      if(!state.completed.includes(lesson.id)) state.completed.push(lesson.id);
      writeState(state); updateProgress();
    });
    updateProgress();
  }else renderOverview();
})();

/* ===== Computer Fundamentals — UX enhancements. Append to the END of computer-fundamentals.js (after the existing IIFE) ===== */
(() => {
  const lessons = window.COMPUTER_FUNDAMENTALS_LESSONS || [];
  const key = "roadmap-hub:architecture:computer-fundamentals:v1";
  const $ = id => document.getElementById(id);
  const read = () => { try { const s = JSON.parse(localStorage.getItem(key) || "{}"); return Array.isArray(s.completed) ? s.completed : []; } catch { return []; } };
  const write = completed => { try { localStorage.setItem(key, JSON.stringify({ completed })); } catch { /* storage unavailable */ } };
  const sync = () => {
    const done = read(), pct = Math.round(done.length / lessons.length * 100);
    if ($("progress-text")) $("progress-text").textContent = `${done.length} / ${lessons.length} lessons · ${pct}%`;
    if ($("progress-fill")) $("progress-fill").style.width = pct + "%";
    if ($("progress-bar")) $("progress-bar").setAttribute("aria-valuenow", done.length);
    document.querySelectorAll("[data-done]").forEach(el => {
      const d = done.includes(el.dataset.done);
      el.textContent = d ? "✓" : "";
      el.setAttribute("aria-label", d ? "Completed" : "Not completed");
    });
  };
  if (document.body.dataset.page !== "lesson") {
    const done = read(), next = lessons.findIndex(l => !done.includes(l.id)), meta = document.querySelector(".cf-meta");
    if (meta && lessons.length) {
      const a = document.createElement("a");
      a.className = "cf-btn primary cf-cta";
      a.href = `lessons/${lessons[next < 0 ? 0 : next].id}.html`;
      a.textContent = !done.length ? "Start lesson 01 →" : next < 0 ? "Review from lesson 01 →" : `Continue with lesson ${String(next + 1).padStart(2, "0")} →`;
      meta.after(a);
    }
    sync();
    return;
  }
  const current = Number(document.body.dataset.lesson || 0), lesson = lessons[current];
  if (!lesson) return;
  $("introduction")?.remove();
  document.querySelectorAll(".cf-section-kicker").forEach(k => {
    k.textContent = k.textContent.replace(/^\d+/, n => String(Number(n) - 1).padStart(2, "0"));
  });
  document.querySelectorAll(".cf-options").forEach(box => {
    const b = [...box.children];
    if (b.length < 3) return;
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    b.forEach(x => box.appendChild(x));
  });
  document.querySelectorAll(".cf-question").forEach(row => row.querySelectorAll(".cf-option").forEach(btn =>
    btn.addEventListener("click", () => {
      const ok = row.querySelector(".cf-feedback").classList.contains("good");
      row.querySelectorAll(".cf-option").forEach(o => o.classList.remove("is-correct", "is-wrong"));
      btn.classList.add(ok ? "is-correct" : "is-wrong");
    })));
  const side = document.querySelector(".cf-sidebar");
  if (side) {
    const d = document.createElement("details"), s = document.createElement("summary");
    d.className = "cf-lessons-details";
    s.textContent = `All lessons · ${lessons.length}`;
    d.append(s, ...[...side.childNodes]);
    side.append(d);
    const mq = matchMedia("(max-width:700px)"), set = () => { d.open = !mq.matches; };
    set(); mq.addEventListener("change", set);
  }
  const old = $("complete-button"), btn = old.cloneNode(true);
  old.replaceWith(btn);
  const paint = () => { const d = read().includes(lesson.id); btn.textContent = d ? "Completed ✓ (undo)" : "Mark lesson complete"; btn.setAttribute("aria-pressed", String(d)); };
  btn.addEventListener("click", () => { const d = read(); write(d.includes(lesson.id) ? d.filter(x => x !== lesson.id) : [...d, lesson.id]); paint(); sync(); });
  paint(); sync();
  const links = document.querySelectorAll(".cf-actions a"), nextLink = links[links.length - 1];
  if (current === lessons.length - 1 && nextLink) { nextLink.href = "../../memory-management/index.html"; nextLink.textContent = "Next module: Memory Management →"; }
  document.querySelector(".cf-progress")?.setAttribute("role", "group");
  document.querySelectorAll(".cf-diagram").forEach(f => { f.tabIndex = 0; f.setAttribute("role", "group"); f.setAttribute("aria-label", "Diagram (scroll sideways if needed)"); });
  const secs = [...document.querySelectorAll(".cf-section")], layout = document.querySelector(".cf-layout");
  if (layout && secs.length) {
    const toc = document.createElement("nav");
    toc.className = "cf-toc"; toc.setAttribute("aria-label", "On this page");
    toc.innerHTML = '<p class="cf-sidebar-heading">On this page</p>' + secs.map(x => `<a href="#${x.id}">${x.querySelector("h2").textContent}</a>`).join("");
    layout.append(toc);
    const tl = [...toc.querySelectorAll("a")];
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) tl.forEach(a => a.toggleAttribute("aria-current", a.hash === "#" + e.target.id)); }), { rootMargin: "-15% 0px -70% 0px" });
      secs.forEach(x => io.observe(x));
    }
  }
  addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.closest?.(".cf-diagram")) return;
    const go = e.key === "ArrowRight" ? nextLink : e.key === "ArrowLeft" ? links[0] : null;
    if (go) location.href = go.href;
  });
})();
