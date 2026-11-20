// 1. Explanation mode switcher
const explanationButtons = [...document.querySelectorAll("[data-explanation-choice]")];

for (const button of explanationButtons) {
  button.addEventListener("click", () => {
    const mode = button.dataset.explanationChoice;
    document.documentElement.dataset.explanationMode = mode;

    for (const choice of explanationButtons) {
      choice.setAttribute("aria-pressed", String(choice === button));
    }
  });
}

// 2. Table of Contents (TOC) responsive behavior & active link highlighting
const tocLinks = [...document.querySelectorAll(".docs-toc a")];
const tocDetails = document.querySelector(".toc-details");
const mobileNavigation = window.matchMedia("(max-width: 760px)");
const sections = tocLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function syncNavigation(event) {
  if (tocDetails) {
    tocDetails.open = !event.matches;
  }
}

syncNavigation(mobileNavigation);
mobileNavigation.addEventListener("change", syncNavigation);

for (const link of tocLinks) {
  link.addEventListener("click", () => {
    if (mobileNavigation.matches && tocDetails) {
      tocDetails.open = false;
    }
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (!visible.length) return;

      const currentId = visible[0].target.id;
      for (const link of tocLinks) {
        if (link.hash === \`#\${currentId}\`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "-18% 0px -72% 0px", threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

// 3. Interactive architecture diagram nodes
const diagramDetail = document.getElementById("diagram-detail");

const descriptions = {
  "Browser": "The browser or API client constructs an HTTP request and interprets the response.",
  "DNS": "DNS resolves a hostname to records such as IP addresses; it does not carry the HTTP request.",
  "TCP connection": "TCP provides an ordered, reliable byte stream between network endpoints.",
  "HTTP": "HTTP defines request and response semantics such as methods, headers, status codes, and message content.",
  "Reverse proxy": "A reverse proxy accepts traffic for an upstream application and may handle TLS, routing, and limits.",
  "Uvicorn": "Uvicorn is an ASGI server. It handles protocol connections and invokes an ASGI application.",
  "ASGI interface": "ASGI passes request context and asynchronous receive/send channels between a server and application.",
  "FastAPI": "FastAPI routes requests, validates input, resolves dependencies, invokes endpoints, and creates responses.",
  "socket()": "Creates a socket endpoint through the operating system's socket API.",
  "bind()": "Associates the listening socket with a local IP address and port.",
  "listen()": "Marks a stream socket as a passive listener for incoming connection requests.",
  "accept()": "Waits for a connection and returns a separate connected socket for that client.",
  "Connected socket": "Carries data for one established connection; the original listening socket can continue accepting.",
  "API clients": "Browsers, mobile apps, and other API clients initiate requests.",
  "Uvicorn workers": "Separate worker processes can host application instances and event loops.",
  "Database": "Stores durable application records and answers queries from the application.",
  "Cache": "Stores reusable data or queued work to reduce repeated computation or decouple tasks."
};

function selectNode(node) {
  const name = node.dataset.component;
  const target = node.dataset.target ? document.querySelector(node.dataset.target) : null;

  document.querySelectorAll(".architecture-diagram .node").forEach((other) => {
    const selected = other === node;
    other.classList.toggle("is-selected", selected);
    other.classList.toggle("is-related", !selected && other.dataset.component === name);
    other.setAttribute("aria-pressed", String(selected));
  });

  const figure = node.closest("figure");
  if (figure && diagramDetail) {
    figure.insertAdjacentElement("afterend", diagramDetail);
  }

  if (!diagramDetail) return;

  diagramDetail.replaceChildren();
  diagramDetail.append(
    document.createTextNode(descriptions[name] || \`\${name} is one component in this system.\`)
  );

  if (target) {
    const heading = target.querySelector("h2");
    const link = document.createElement("a");
    link.href = \`#\${target.id}\`;
    link.textContent = \` Read \${heading ? heading.textContent.trim() : "the related section"}\`;
    diagramDetail.append(link);
  }
}

document.querySelectorAll(".architecture-diagram .node[role='button']").forEach((node) => {
  node.setAttribute("aria-label", node.dataset.component);
  node.setAttribute("aria-pressed", "false");

  node.addEventListener("click", () => selectNode(node));
  node.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectNode(node);
    }
  });
});
