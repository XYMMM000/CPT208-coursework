const fullpage = document.getElementById("fullpage") || document.getElementById("scroll-container");
const panels = Array.from(document.querySelectorAll(".fp-panel"));
const dots = Array.from(document.querySelectorAll(".scene-dot"));
const navLinks = Array.from(document.querySelectorAll(".immersive-nav a"));
const menuLinks = Array.from(document.querySelectorAll(".menu-list a"));
const menuButton = document.querySelector(".menu-button");
const menuList = document.querySelector(".menu-list");
const currentEl = document.getElementById("section-current");
const totalEl = document.getElementById("section-total");
const root = document.documentElement;
const typeTargets = Array.from(document.querySelectorAll(".type-target"));
const scenePalettes = [
  ["#f59e0b", "#38bdf8", "#a78bfa"],
  ["#fb7185", "#f59e0b", "#22d3ee"],
  ["#22d3ee", "#60a5fa", "#34d399"],
  ["#f97316", "#facc15", "#22c55e"],
  ["#a78bfa", "#38bdf8", "#fb7185"],
  ["#34d399", "#facc15", "#60a5fa"]
];
let current = 0;
let locked = false;

const setVhUnit = () => {
  const vh = window.innerHeight * 0.01;
  root.style.setProperty("--vh", `${vh}px`);
};

const paintTheme = (index) => {
  const [a, b, c] = scenePalettes[index % scenePalettes.length];
  root.style.setProperty("--scene-a", a);
  root.style.setProperty("--scene-b", b);
  root.style.setProperty("--scene-c", c);
};

const typeWrite = (node) => {
  if (node.dataset.typing === "running") {
    return;
  }
  const original = node.dataset.text || node.textContent || "";
  node.dataset.text = original;
  node.dataset.typing = "running";
  node.textContent = "";
  let i = 0;
  const tick = () => {
    i += 1;
    node.textContent = original.slice(0, i);
    if (i < original.length) {
      window.setTimeout(tick, Math.max(15, 48 - Math.floor(i / 2)));
      return;
    }
    node.dataset.typing = "done";
  };
  tick();
};

const runTypeInPanel = (index) => {
  const panel = panels[index];
  if (!panel) {
    return;
  }
  const nodes = typeTargets.filter((node) => panel.contains(node));
  nodes.forEach((node) => {
    if (node.dataset.typing !== "done") {
      typeWrite(node);
    }
  });
};

const setActive = (index) => {
  current = index;
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  navLinks.forEach((link, i) => link.classList.toggle("active", i === index));
  if (currentEl) {
    currentEl.textContent = String(index + 1).padStart(2, "0");
  }
  panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
  paintTheme(index);
  runTypeInPanel(index);
};

const jumpTo = (index) => {
  if (index < 0 || index >= panels.length) {
    return;
  }
  panels[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
  setActive(index);
};

const step = (direction) => {
  if (locked) {
    return;
  }
  locked = true;
  jumpTo(current + direction);
  setTimeout(() => {
    locked = false;
  }, 700);
};

if (fullpage && panels.length > 0) {
  fullpage.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 12) {
        return;
      }
      step(event.deltaY > 0 ? 1 : -1);
    },
    { passive: false }
  );
}

window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    step(1);
  } else if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    step(-1);
  } else if (event.key === "Home") {
    event.preventDefault();
    jumpTo(0);
  } else if (event.key === "End") {
    event.preventDefault();
    jumpTo(panels.length - 1);
  }
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const index = Number(dot.dataset.target);
    jumpTo(index);
  });
});

navLinks.forEach((link, index) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    jumpTo(index);
  });
});

menuLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const targetId = link.getAttribute("href")?.replace("#", "");
    const section = targetId ? document.getElementById(targetId) : null;
    if (!section) {
      return;
    }
    const index = panels.indexOf(section);
    if (index !== -1) {
      jumpTo(index);
    }
    if (menuList) {
      menuList.classList.remove("open");
    }
    if (menuButton) {
      menuButton.classList.remove("open");
    }
  });
});

if (menuButton && menuList) {
  menuButton.addEventListener("click", () => {
    menuButton.classList.toggle("open");
    menuList.classList.toggle("open");
  });
}

document.addEventListener("click", (event) => {
  if (!menuButton || !menuList) {
    return;
  }
  const insideMenu = menuList.contains(event.target);
  const insideButton = menuButton.contains(event.target);
  if (!insideMenu && !insideButton) {
    menuList.classList.remove("open");
    menuButton.classList.remove("open");
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton && menuList) {
    menuList.classList.remove("open");
    menuButton.classList.remove("open");
  }
});

window.addEventListener("pointermove", (event) => {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;
  root.style.setProperty("--mx", x.toFixed(4));
  root.style.setProperty("--my", y.toFixed(4));
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      const index = panels.indexOf(entry.target);
      if (index !== -1) {
        setActive(index);
      }
    });
  },
  { threshold: 0.56 }
);

panels.forEach((panel) => observer.observe(panel));
if (totalEl) {
  totalEl.textContent = String(panels.length).padStart(2, "0");
}
setVhUnit();
window.addEventListener("resize", setVhUnit);
setActive(0);
