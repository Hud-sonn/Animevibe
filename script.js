// ======= THEME TOGGLE =======
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

if (localStorage.getItem('theme') === 'light') {
  html.setAttribute('data-theme', 'light');
} else {
  html.setAttribute('data-theme', 'dark');
}

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ======= SEARCH FUNCTIONALITY =======
const searchInput = document.getElementById('searchInput');
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const handleSearch = debounce(() => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll('[data-title]').forEach(card => {
    const title = card.getAttribute('data-title').toLowerCase();
    card.style.display = title.includes(query) ? 'block' : 'none';
  });
}, 300);

searchInput?.addEventListener('input', handleSearch);

// ======= PROFILE DATA LOAD =======
document.addEventListener('DOMContentLoaded', () => {
  const nameField = document.getElementById('profileName');
  const nameInput = document.getElementById('nameInput');
  const avatarImg = document.getElementById('avatarImg');
  const avatarInput = document.getElementById('avatarInput');

  const savedName = localStorage.getItem('username') || 'User123';
  if (nameField) nameField.textContent = savedName;
  if (nameInput) nameInput.value = savedName;

  const savedAvatar = localStorage.getItem('avatar');
  if (savedAvatar && avatarImg) avatarImg.src = savedAvatar;

  document.getElementById('saveName')?.addEventListener('click', () => {
    const newName = nameInput.value;
    localStorage.setItem('username', newName);
    if (nameField) nameField.textContent = newName;
    alert('Name updated!');
  });

  avatarInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      if (avatarImg) {
        avatarImg.src = event.target.result;
        avatarImg.classList.add('animate-bounce');
        setTimeout(() => avatarImg.classList.remove('animate-bounce'), 800);
      }
      localStorage.setItem('avatar', event.target.result);
    };
    if (file) reader.readAsDataURL(file);
  });

  // Highlight added anime on page load
  const watchlist = getWatchlist();
  document.querySelectorAll(".watchlist-btn").forEach(btn => {
    if (watchlist.includes(btn.dataset.title)) {
      btn.textContent = "✓ Added";
      btn.classList.remove("bg-green-600");
      btn.classList.add("bg-red-600");
    }
  });
});

// ======= WATCHLIST CORE FUNCTIONS =======
function getWatchlist() {
  return JSON.parse(localStorage.getItem("animeWatchlist")) || [];
}

function saveWatchlist(list) {
  localStorage.setItem("animeWatchlist", JSON.stringify(list));
}

function toggleWatchlist(button) {
  const title = button.dataset.title;
  let watchlist = getWatchlist();

  const isAdded = watchlist.includes(title);
  if (isAdded) {
    watchlist = watchlist.filter(item => item !== title);
    button.textContent = "+ Watchlist";
    button.classList.remove("bg-red-600");
    button.classList.add("bg-green-600");
  } else {
    watchlist.push(title);
    button.textContent = "✓ Added";
    button.classList.remove("bg-green-600");
    button.classList.add("bg-red-600");
    showPopup();
  }

  saveWatchlist(watchlist);
}

function showPopup() {
  const popup = document.getElementById("watchlistPopup");
  if (!popup) return;
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("hidden"), 3000);
}

// ======= COMMENT SYSTEM =======
function postComment(animeId) {
  const input = document.getElementById(`commentInput-${animeId}`);
  const container = document.getElementById(`newComments-${animeId}`);
  const commentText = input.value.trim();

  if (!commentText) return;

  const div = document.createElement('div');
  div.className = 'flex items-start gap-3';
  div.innerHTML = `
    <img src="assets/avatars/default.png" alt="Avatar" class="w-8 h-8 rounded-full" />
    <div>
      <p class="font-bold">You <span class="text-xs text-gray-400">– just now</span></p>
      <p>${commentText}</p>
    </div>
  `;

  container.appendChild(div);
  input.value = '';
}

// ======= DETAILS TOGGLE =======
function toggleDetails(btn) {
  const details = btn.closest('.bg-gray-800').querySelector('.details');
  details?.classList.toggle('hidden');
}

// ======= NAV TOGGLE =======
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

navToggle?.addEventListener("click", () => {
  mainNav?.classList.toggle("nav-visible");
  mainNav?.classList.toggle("nav-hidden");
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 768 && mainNav) {
    mainNav.classList.add("nav-hidden");
  }

  document.querySelectorAll("#mainNav a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768 && mainNav) {
        mainNav.classList.remove("nav-visible");
        mainNav.classList.add("nav-hidden");
      }
    });
  });
});