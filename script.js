(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const progress = document.getElementById("readingProgress");
  const navLinks = [...document.querySelectorAll('.top-nav a, .mobile-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem("tmh-cinematic-theme", theme); } catch (_) {}
    themeToggle?.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = theme === "dark" ? "#080908" : "#f1f2eb";
  }
  setTheme(root.dataset.theme === "light" ? "light" : "dark");
  themeToggle?.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

  function closeMenu() {
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileNav?.classList.remove("open");
    document.body.classList.remove("menu-open");
  }
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileNav?.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  });
  mobileNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  document.addEventListener("click", event => {
    if (mobileNav?.classList.contains("open") && !mobileNav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".timeline-item, .project, .skill-group, .education-grid article, .metric, .about-terminal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item, index) => {
      item.classList.add("reveal");
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      revealObserver.observe(item);
    });
  } else revealItems.forEach(item => item.classList.add("is-visible"));

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (progress) progress.style.width = `${Math.min(100, ratio * 100)}%`;
      let current = "home";
      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 150) current = section.id;
      });
      navLinks.forEach(link => {
        const href = link.getAttribute("href");
        link.classList.toggle("active", href === `#${current}`);
      });
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Animate only real, grounded metrics; keep the visible values meaningful with reduced motion.
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const start = performance.now();
        const duration = 900;
        function frame(now) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  // Live system clock gives the status monitor a subtle, believable sense of activity.
  const liveClock = document.getElementById("liveClock");
  function updateClock() {
    if (!liveClock) return;
    liveClock.textContent = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(new Date());
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  // Cursor light follows the pointer on desktop; no extra work on touch devices.
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", event => {
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);
    }, { passive: true });
  }

  // Gentle cursor parallax on the status monitor; disabled on touch and reduced-motion devices.
  const monitor = document.querySelector(".system-window");
  if (monitor && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    monitor.addEventListener("pointermove", event => {
      const rect = monitor.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      monitor.style.setProperty("--pointer-x", `${x * 8}px`);
      monitor.style.setProperty("--pointer-y", `${y * 8}px`);
      monitor.style.setProperty("--tilt-y", `${x * 2.2}deg`);
      monitor.style.setProperty("--tilt-x", `${y * -2.2}deg`);
    });
    monitor.addEventListener("pointerleave", () => {
      monitor.style.setProperty("--pointer-x", "0px");
      monitor.style.setProperty("--pointer-y", "0px");
      monitor.style.setProperty("--tilt-y", "0deg");
      monitor.style.setProperty("--tilt-x", "0deg");
    });
  }
})();
