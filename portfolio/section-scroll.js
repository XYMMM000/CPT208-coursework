const container = document.querySelector("main.section > .container");

if (container) {
  const blocks = Array.from(container.children).filter((element) => element instanceof HTMLElement);
  let current = 0;
  let locked = false;

  blocks.forEach((block, index) => {
    block.classList.add("scroll-block");
    block.dataset.blockIndex = String(index);
  });

  const setActive = (index) => {
    current = Math.max(0, Math.min(index, blocks.length - 1));
    blocks.forEach((block, i) => block.classList.toggle("is-focus", i === current));
  };

  const goTo = (index) => {
    const target = blocks[index];
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(index);
  };

  const step = (direction) => {
    if (locked) {
      return;
    }
    const next = current + direction;
    if (next < 0 || next >= blocks.length) {
      return;
    }
    locked = true;
    goTo(next);
    window.setTimeout(() => {
      locked = false;
    }, 680);
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) < 10) {
        return;
      }
      event.preventDefault();
      step(event.deltaY > 0 ? 1 : -1);
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      step(1);
      return;
    }
    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      step(-1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      goTo(blocks.length - 1);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const index = Number(entry.target.dataset.blockIndex);
        if (!Number.isNaN(index)) {
          setActive(index);
        }
      });
    },
    { threshold: 0.56 }
  );

  blocks.forEach((block) => observer.observe(block));
  setActive(0);
}
