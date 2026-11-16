const lessonList = document.getElementById("lesson-list");
const lessonContent = document.getElementById("lesson-content");
const moduleOverview = document.getElementById("module-overview");
const moduleComplete = document.getElementById("module-complete");

const progressCount = document.getElementById("progress-count");
const progressFill = document.getElementById("progress-fill");

const lessonNumber = document.getElementById("lesson-number");
const lessonDuration = document.getElementById("lesson-duration");
const lessonTitle = document.getElementById("lesson-title");
const lessonIntro = document.getElementById("lesson-intro");
const lessonBody = document.getElementById("lesson-body");

const questionText = document.getElementById("question-text");
const questionOptions = document.getElementById("question-options");
const questionFeedback = document.getElementById("question-feedback");

const completeButton = document.getElementById("complete-button");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

const STORAGE_KEY = "roadmap-hub-memory-management-progress";

let currentLesson = 0;
let completedLessons = loadProgress();
let questionAnswered = false;

function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.filter(function (number) {
            return Number.isInteger(number) &&
                number >= 0 &&
                number < memoryLessons.length;
        });
    } catch (error) {
        return [];
    }
}

function saveProgress() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLessons));
    } catch (error) {
        // Progress remains available for the current visit if storage is disabled.
    }
}

function updateProgress() {
    const completed = completedLessons.length;
    const total = memoryLessons.length;
    const percentage = (completed / total) * 100;

    progressCount.textContent = completed + " / " + total;
    progressFill.style.width = percentage + "%";
    progressFill.setAttribute("aria-valuenow", String(completed));

    renderNavigation();
}

function renderNavigation() {
    lessonList.replaceChildren();

    memoryLessons.forEach(function (lesson, index) {
        const button = document.createElement("button");
        const number = document.createElement("span");
        const title = document.createElement("span");

        button.type = "button";
        button.className = "mm-lesson-link";

        if (index === currentLesson && !moduleComplete.hidden) {
            button.classList.remove("active");
        } else if (index === currentLesson) {
            button.classList.add("active");
        }

        if (completedLessons.includes(index)) {
            button.classList.add("completed");
        }

        number.className = "mm-lesson-index";
        number.textContent = completedLessons.includes(index)
            ? "✓"
            : String(index + 1).padStart(2, "0");

        title.textContent = lesson.title;

        button.append(number, title);

        button.addEventListener("click", function () {
            openLesson(index);
        });

        lessonList.appendChild(button);
    });
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function renderDiagram(labels) {
    const diagram = createElement("div", "mm-diagram");

    diagram.appendChild(
        createElement("div", "mm-diagram-title", "CONCEPTUAL DIAGRAM")
    );

    const flow = createElement("div", "mm-diagram-flow");

    labels.forEach(function (label, index) {
        const node = createElement("div", "mm-diagram-node");
        node.textContent = label;

        flow.appendChild(node);

        if (index < labels.length - 1) {
            flow.appendChild(
                createElement("span", "mm-diagram-arrow", "→")
            );
        }
    });

    diagram.appendChild(flow);
    return diagram;
}

function renderTable(tableData) {
    const wrapper = createElement("div", "mm-table-wrap");
    const table = createElement("table", "mm-table");
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    const body = document.createElement("tbody");

    tableData.headers.forEach(function (heading) {
        headRow.appendChild(createElement("th", "", heading));
    });

    head.appendChild(headRow);

    tableData.rows.forEach(function (row) {
        const tableRow = document.createElement("tr");

        row.forEach(function (cell) {
            tableRow.appendChild(createElement("td", "", cell));
        });

        body.appendChild(tableRow);
    });

    table.append(head, body);
    wrapper.appendChild(table);

    return wrapper;
}

function renderSection(section) {
    const container = createElement("section", "mm-section");

    container.appendChild(createElement("h2", "", section.heading));

    if (section.paragraphs) {
        section.paragraphs.forEach(function (paragraph) {
            container.appendChild(createElement("p", "", paragraph));
        });
    }

    if (section.bullets) {
        const list = document.createElement("ul");

        section.bullets.forEach(function (bullet) {
            list.appendChild(createElement("li", "", bullet));
        });

        container.appendChild(list);
    }

    if (section.code) {
        const code = createElement("pre", "mm-code");
        code.textContent = section.code;
        container.appendChild(code);
    }

    if (section.diagram) {
        container.appendChild(renderDiagram(section.diagram));
    }

    if (section.table) {
        container.appendChild(renderTable(section.table));
    }

    if (section.callout) {
        const callout = createElement("aside", "mm-callout");

        callout.appendChild(
            createElement("strong", "", section.callout.title)
        );

        callout.appendChild(
            createElement("p", "", section.callout.text)
        );

        container.appendChild(callout);
    }

    return container;
}

function renderQuiz(lesson) {
    questionAnswered = false;

    questionText.textContent = lesson.question;
    questionOptions.replaceChildren();

    questionFeedback.textContent = "";
    questionFeedback.className = "mm-feedback";

    lesson.options.forEach(function (option, index) {
        const button = createElement("button", "mm-option", option);
        button.type = "button";

        button.addEventListener("click", function () {
            answerQuestion(index, lesson);
        });

        questionOptions.appendChild(button);
    });
}

function answerQuestion(selectedIndex, lesson) {
    if (questionAnswered) {
        return;
    }

    questionAnswered = true;

    const buttons = questionOptions.querySelectorAll("button");
    const isCorrect = selectedIndex === lesson.answer;

    buttons.forEach(function (button, index) {
        button.disabled = true;

        if (index === lesson.answer) {
            button.classList.add("correct");
        } else if (index === selectedIndex) {
            button.classList.add("incorrect");
        }
    });

    if (isCorrect) {
        questionFeedback.textContent = "Correct. " + lesson.explanation;
        questionFeedback.classList.add("success");
    } else {
        questionFeedback.textContent = "Not quite. " + lesson.explanation;
        questionFeedback.classList.add("error");
    }
}

function openLesson(index) {
    if (index < 0 || index >= memoryLessons.length) {
        return;
    }

    currentLesson = index;

    moduleOverview.hidden = true;
    moduleComplete.hidden = true;
    lessonContent.hidden = false;

    const lesson = memoryLessons[index];

    lessonNumber.textContent =
        "LESSON " + String(index + 1).padStart(2, "0");

    lessonDuration.textContent = lesson.duration;
    lessonTitle.textContent = lesson.title;
    lessonIntro.textContent = lesson.intro;

    lessonBody.replaceChildren();

    lesson.sections.forEach(function (section) {
        lessonBody.appendChild(renderSection(section));
    });

    renderQuiz(lesson);

    completeButton.textContent = completedLessons.includes(index)
        ? "Completed ✓"
        : "Mark as complete";

    completeButton.disabled = completedLessons.includes(index);

    previousButton.disabled = index === 0;
    nextButton.textContent = index === memoryLessons.length - 1
        ? "Finish module →"
        : "Next lesson →";

    renderNavigation();
    updateProgress();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function markComplete() {
    if (completedLessons.includes(currentLesson)) {
        return;
    }

    completedLessons.push(currentLesson);
    completedLessons.sort(function (a, b) {
        return a - b;
    });

    saveProgress();
    updateProgress();

    completeButton.textContent = "Completed ✓";
    completeButton.disabled = true;
}

function showModuleComplete() {
    lessonContent.hidden = true;
    moduleOverview.hidden = true;
    moduleComplete.hidden = false;

    renderNavigation();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.getElementById("start-button").addEventListener("click", function () {
    openLesson(0);
});

completeButton.addEventListener("click", markComplete);

previousButton.addEventListener("click", function () {
    openLesson(currentLesson - 1);
});

nextButton.addEventListener("click", function () {
    if (currentLesson === memoryLessons.length - 1) {
        showModuleComplete();
        return;
    }

    openLesson(currentLesson + 1);
});

document.getElementById("review-button").addEventListener("click", function () {
    openLesson(0);
});

updateProgress();

/* ===== Memory Management — fixes + UX. Append to the END of memory-management.js ===== */
(() => {
  const $ = id => document.getElementById(id);
  const baseTitle = document.title;
  memoryLessons.forEach(l => {
    const right = l.options[l.answer];
    for (let i = l.options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l.options[i], l.options[j]] = [l.options[j], l.options[i]]; }
    l.answer = l.options.indexOf(right);
  });
  saveProgress = function () { try { try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLessons));
    } catch (error) {
        // Progress remains available for the current visit if storage is disabled.
    } } catch (e) { /* progress lasts for this visit only */ } };
  renderDiagram = function (labels) {
    const layout = labels.some(l => /newest call|Used block|Process A/.test(l));
    const column = labels.some(l => /newest call/.test(l));
    const diagram = createElement("div", "mm-diagram");
    diagram.appendChild(createElement("div", "mm-diagram-title", layout ? "CONCEPTUAL LAYOUT" : "CONCEPTUAL FLOW"));
    const flow = createElement("div", "mm-diagram-flow" + (column ? " is-column" : ""));
    labels.forEach((label, i) => {
      flow.appendChild(createElement("div", "mm-diagram-node", label));
      if (!layout && i < labels.length - 1) { const a = createElement("span", "mm-diagram-arrow", "→"); a.setAttribute("aria-hidden", "true"); flow.appendChild(a); }
    });
    diagram.appendChild(flow);
    return diagram;
  };
  answerQuestion = function (selected, lesson) {
    if (questionAnswered) return;
    const buttons = [...questionOptions.querySelectorAll("button")];
    buttons[selected].disabled = true;
    if (selected === lesson.answer) {
      questionAnswered = true;
      buttons.forEach(b => { b.disabled = true; });
      buttons[selected].classList.add("correct");
      questionFeedback.textContent = "Correct. " + lesson.explanation;
      questionFeedback.className = "mm-feedback success";
    } else {
      buttons[selected].classList.add("incorrect");
      questionFeedback.textContent = "Not quite. That option is ruled out, so try another.";
      questionFeedback.className = "mm-feedback error";
    }
  };
  const paint = () => { const d = completedLessons.includes(currentLesson); completeButton.disabled = false; completeButton.textContent = d ? "Completed ✓ (undo)" : "Mark as complete"; };
  completeButton.removeEventListener("click", markComplete);
  markComplete = function () {
    const i = completedLessons.indexOf(currentLesson);
    if (i > -1) completedLessons.splice(i, 1); else completedLessons.push(currentLesson);
    completedLessons.sort((a, b) => a - b);
    saveProgress(); updateProgress(); paint();
  };
  completeButton.addEventListener("click", markComplete);
  const markNav = () => lessonList.querySelectorAll(".mm-lesson-link").forEach(b => {
    const on = !lessonContent.hidden && b.classList.contains("active");
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  const baseNav = renderNavigation;
  renderNavigation = function () { baseNav(); markNav(); };
  const baseOpen = openLesson;
  openLesson = function (i) {
    baseOpen(i);
    if (i < 0 || i >= memoryLessons.length) return;
    paint(); markNav();
    document.title = `${memoryLessons[i].title} | Memory Management | Architecture Library`;
    if (location.hash !== "#lesson-" + (i + 1)) history.pushState(null, "", "#lesson-" + (i + 1));
    lessonTitle.tabIndex = -1; lessonTitle.focus({ preventScroll: true });
  };
  const fromHash = () => {
    const m = /^#lesson-(\d+)$/.exec(location.hash), n = m ? Number(m[1]) - 1 : -1;
    if (n >= 0 && n < memoryLessons.length) openLesson(n);
    else { lessonContent.hidden = true; moduleComplete.hidden = true; moduleOverview.hidden = false; document.title = baseTitle; markNav(); }
  };
  addEventListener("popstate", fromHash);
  if (location.hash) fromHash();
  const crumb = document.querySelector(".mm-breadcrumb");
  if (crumb) crumb.innerHTML = '<a href="../../index.html">Architecture Library</a><span>/</span><a href="../computer-fundamentals/index.html">Computer Fundamentals</a><span>/</span><strong>Memory Management</strong>';
  const done = $("module-complete");
  if (done) done.insertAdjacentHTML("beforeend", '<p><a class="mm-secondary-button" href="../../index.html">Back to the Architecture Library</a></p>');
  const nav = document.querySelector(".mm-lesson-nav");
  if (nav) {
    const d = document.createElement("details"), s = document.createElement("summary");
    d.className = "mm-lessons-details"; s.textContent = `All lessons · ${memoryLessons.length}`;
    nav.replaceWith(d); d.append(s, nav);
    const mq = matchMedia("(max-width:850px)"), set = () => { d.open = !mq.matches; };
    set(); mq.addEventListener("change", set);
  }
  addEventListener("keydown", e => {
    if (lessonContent.hidden || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") nextButton.click();
    else if (e.key === "ArrowLeft" && !previousButton.disabled) previousButton.click();
  });
})();
