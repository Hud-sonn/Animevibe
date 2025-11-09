// script.js – FINAL v4 (Watchlist & Theme Fixed)
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const searchInput = document.getElementById("searchInput");
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const themeToggle = document.getElementById("themeToggle");
  const watchlistPopup = document.getElementById("watchlistPopup");
  const sunIcon = themeToggle?.querySelector(".sun");
  const moonIcon = themeToggle?.querySelector(".moon");

  // === DEBOUNCE ===
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // === THEME TOGGLE (FIXED: Switches to Light Mode) ===
  const applyTheme = () => {
    const theme = localStorage.getItem("theme") || "dark";
    html.setAttribute("data-theme", theme);
    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle("hidden", theme !== "light");
      moonIcon.classList.toggle("hidden", theme === "light");
    }
  };
  applyTheme();

  themeToggle?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    applyTheme(); // Update icons
  });

  // === NAV TOGGLE ===
  navToggle?.addEventListener("click", () => mainNav?.classList.toggle("hidden"));

  // === SEARCH ===
  if (searchInput) {
    const handleSearch = debounce(() => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll('[data-title]').forEach(card => {
        const title = card.getAttribute("data-title").toLowerCase();
        card.style.display = title.includes(query) ? "block" : "none";
      });
    }, 300);
    searchInput.addEventListener("input", handleSearch);
  }

  // === WATCHLIST (FIXED: Add/Remove Works) ===
  const getWatchlist = () => JSON.parse(localStorage.getItem("animeWatchlist") || "[]");
  const saveWatchlist = (list) => localStorage.setItem("animeWatchlist", JSON.stringify(list));

  const watchlist = getWatchlist();
  document.querySelectorAll(".watchlist-btn").forEach(btn => {
    const title = btn.dataset.title;
    if (watchlist.includes(title)) {
      btn.textContent = "Added";
      btn.classList.replace("bg-green-600", "bg-red-600");
    }
  });

  window.toggleWatchlist = function (button) {
    const title = button.dataset.title;
    let list = getWatchlist();
    const exists = list.includes(title);
    if (exists) {
      list = list.filter(t => t !== title);
      button.textContent = "+ Watchlist";
      button.classList.replace("bg-red-600", "bg-green-600");
      button.classList.remove("bg-red-600", "hover:bg-red-700");
      button.classList.add("bg-green-600", "hover:bg-green-500");
    } else {
      list.push(title);
      button.textContent = "Added";
      button.classList.replace("bg-green-600", "bg-red-600");
      button.classList.remove("bg-green-600", "hover:bg-green-500");
      button.classList.add("bg-red-600", "hover:bg-red-500");
      showPopup(title);
    }
    saveWatchlist(list);
  };

  const showPopup = (title) => {
    if (watchlistPopup) {
      watchlistPopup.querySelector("p").textContent = `Added "${title}" to Watchlist!`;
      watchlistPopup.classList.remove("hidden");
      setTimeout(() => watchlistPopup.classList.add("hidden"), 2500);
    }
  };

  window.closePopup = () => watchlistPopup?.classList.add("hidden");

  // === DETAILS TOGGLE ===
  window.toggleDetails = function (button) {
    const container = button.closest('[data-title]');
    const details = container.querySelector('.details');
    details.classList.toggle('hidden');
  };

  // === WATCHLIST PAGE ===
  const watchlistContainer = document.getElementById("watchlistContainer");
  if (watchlistContainer) {
    const renderWatchlist = () => {
      const items = getWatchlist();
      watchlistContainer.innerHTML = items.map((title, index) => `
        <div class="bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-md">
          <span>${title}</span>
          <button onclick="removeFromWatchlist(${index})" class="text-red-400 hover:text-red-600 text-2xl">×</button>
        </div>
      `).join('');
    };
    renderWatchlist();

    window.removeFromWatchlist = (index) => {
      let list = getWatchlist();
      list.splice(index, 1);
      saveWatchlist(list);
      renderWatchlist();
    };

    const clearBtn = document.getElementById("clearWatchlist");
    clearBtn?.addEventListener("click", () => {
      if (confirm("Clear all?")) {
        saveWatchlist([]);
        renderWatchlist();
      }
    });
  }
});