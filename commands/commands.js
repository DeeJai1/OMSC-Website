"use strict";
// Public website-only interactions. No OMSC API access or user configuration is modified.
(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
    }));
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const search = document.getElementById("commands-search");
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

  document.querySelectorAll(".command-copy").forEach(button => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy");
      if (!text) return;
      try {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied!";
        button.setAttribute("aria-label", "Copied " + text);
        window.setTimeout(() => {
          button.textContent = "Copy";
          button.setAttribute("aria-label", "Copy " + text);
        }, 1700);
      } catch (_) {
        button.textContent = "Select text";
        button.setAttribute("aria-label", "Select the command shown beside this button to copy it");
      }
    });
  });
})();
