"use strict";
// Public website-only interactions. No OMSC API access or user configuration is modified.
(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (menuButton && nav) {
    const closeMenu = (returnFocus = false) => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      if (returnFocus) menuButton.focus();
    };
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });
    nav.querySelectorAll("a").forEach(link =>
      link.addEventListener("click", () => closeMenu()));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) closeMenu(true);
    });
    document.addEventListener("click", event => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const search = document.getElementById("commands-search");
  const replyHelp = document.getElementById("auto-replies-help");
  document.querySelectorAll('a[href="#auto-replies-help"]').forEach(link => {
    link.addEventListener("click", () => { if (replyHelp) replyHelp.open = true; });
  });
  const results = document.getElementById("commands-results");
  const empty = document.getElementById("commands-empty");
  const groups = [...document.querySelectorAll(".commands-group")];
  const cards = [...document.querySelectorAll(".command-card")];
  if (search && results && empty) {
    const refresh = () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      for (const card of cards) {
        const matches = !query || card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      }
      for (const group of groups) {
        const count = [...group.querySelectorAll(".command-card")].filter(card => !card.hidden).length;
        group.hidden = count === 0;
        const label = group.querySelector(".commands-count");
        if (label) label.textContent = count + (count === 1 ? " command" : " commands");
      }
      empty.hidden = visible !== 0;
      results.textContent = query ? "Showing " + visible + " of " + cards.length + " commands." : "Showing all " + cards.length + " commands.";
    };
    search.addEventListener("input", refresh);
    refresh();
  }


})();
