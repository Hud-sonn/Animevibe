// ======= FIREBASE SETUP =======
const firebaseConfig = {
  apiKey: "AIzaSyCP0-NvTyK_NMzIYwGKiHgRDWmXKcRiBtM",
  authDomain: "animevibe-login.firebaseapp.com",
  projectId: "animevibe-login",
  storageBucket: "animevibe-login.appspot.com",
  messagingSenderId: "708155899694",
  appId: "1:708155899694:web:77558f56f5f4b540a8944a"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

// ======= USER ID SETUP (simple localStorage unique ID for demo) =======
function getUserId() {
  let id = localStorage.getItem('userId');
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2);
    localStorage.setItem('userId', id);
  }
  return id;
}
const userId = getUserId();

// ======= PROFILE DATA LOAD & SAVE (Firestore user doc) =======
async function loadUserProfile() {
  const nameField = document.getElementById('profileName');
  const nameInput = document.getElementById('nameInput');
  const avatarImg = document.getElementById('avatarImg');
  const avatarInput = document.getElementById('avatarInput');

  try {
    const doc = await db.collection('users').doc(userId).get();
    let userData = { username: 'User123', avatar: null };
    if (doc.exists) {
      userData = doc.data();
    }
    if (nameField) nameField.textContent = userData.username || 'User123';
    if (nameInput) nameInput.value = userData.username || 'User123';
    if (avatarImg && userData.avatar) avatarImg.src = userData.avatar;

    // Save name button handler
    document.getElementById('saveName')?.addEventListener('click', async () => {
      const newName = nameInput.value.trim() || 'User123';
      await db.collection('users').doc(userId).set({
        username: newName,
        avatar: avatarImg?.src || null
      }, { merge: true });
      if (nameField) nameField.textContent = newName;
      alert('Name updated!');
    });

    // Avatar upload handler
    avatarInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async function (event) {
        if (avatarImg) {
          avatarImg.src = event.target.result;
          avatarImg.classList.add('animate-bounce');
          setTimeout(() => avatarImg.classList.remove('animate-bounce'), 800);
        }
        await db.collection('users').doc(userId).set({
          avatar: event.target.result,
          username: nameInput.value.trim() || 'User123'
        }, { merge: true });
      };
      if (file) reader.readAsDataURL(file);
    });

  } catch (err) {
    console.error("Error loading user profile:", err);
  }
}

// ======= WATCHLIST CORE FUNCTIONS (localStorage still) =======
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
function clearWatchlist() {
  localStorage.removeItem("animeWatchlist");
  document.querySelectorAll(".watchlist-btn").forEach(btn => {
    btn.textContent = "+ Watchlist";
    btn.classList.remove("bg-red-600");
    btn.classList.add("bg-green-600");
  });
  alert("Watchlist cleared!");
}
function showPopup() {
  const popup = document.getElementById("watchlistPopup");
  if (!popup) return;
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("hidden"), 3000);
}

// ======= COMMENT SYSTEM (FIRESTORE) =======
function postComment(animeId) {
  const input = document.getElementById(`commentInput-${animeId}`);
  const container = document.getElementById(`newComments-${animeId}`);
  const commentText = input.value.trim();

  if (!commentText) return;

  // Load username from Firestore user doc
  db.collection('users').doc(userId).get().then(userDoc => {
    const username = userDoc.exists && userDoc.data().username ? userDoc.data().username : 'Anonymous';

    db.collection("comments").add({
      animeId,
      username,
      text: commentText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      const div = document.createElement('div');
      div.className = 'flex items-start gap-3';
      div.innerHTML = `
        <img src="assets/avatars/default.png" alt="Avatar" class="w-8 h-8 rounded-full" />
        <div>
          <p class="font-bold">${username} <span class="text-xs text-gray-400">– just now</span></p>
          <p>${commentText}</p>
        </div>
      `;
      container.appendChild(div);
      input.value = '';
    });
  });
}

// ======= STAR RATING SYSTEM (FIRESTORE) =======
async function loadRatings() {
  const ratingContainers = document.querySelectorAll("[data-anime-id]");
  for (const container of ratingContainers) {
    const animeId = container.dataset.animeId;

    // Fetch all ratings for this anime
    const snapshot = await db.collection('ratings').where('animeId', '==', animeId).get();
    const ratings = snapshot.docs.map(doc => doc.data());

    // Calculate average rating
    let avgRating = 0;
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, r) => sum + r.rating, 0);
      avgRating = total / ratings.length;
    }

    // Display average rating
    const avgElem = container.querySelector(".avg-rating");
    if (avgElem) avgElem.textContent = `Average: ${avgRating.toFixed(1)} ⭐ (${ratings.length})`;

    // Fetch this user’s rating for this anime
    const userRatingSnap = await db.collection('ratings')
      .where('animeId', '==', animeId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    const userRating = userRatingSnap.empty ? 0 : userRatingSnap.docs[0].data().rating;

    // Display user rating stars (fill stars accordingly)
    const stars = container.querySelectorAll(".star");
    stars.forEach((star, index) => {
      if (index < userRating) {
        star.classList.add("text-yellow-400");
      } else {
        star.classList.remove("text-yellow-400");
      }
      // Add click listener for rating
      star.onclick = () => rateAnime(animeId, index + 1);
    });
  }
}

async function rateAnime(animeId, rating) {
  try {
    // Check if user already rated this anime
    const existingRatingSnap = await db.collection('ratings')
      .where('animeId', '==', animeId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (existingRatingSnap.empty) {
      // Add new rating
      await db.collection('ratings').add({
        animeId,
        userId,
        rating,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Update existing rating
      const docId = existingRatingSnap.docs[0].id;
      await db.collection('ratings').doc(docId).update({
        rating,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    alert(`You rated ${animeId} ${rating} stars!`);
    await loadRatings(); // refresh stars and average display
  } catch (err) {
    console.error("Error rating anime:", err);
  }
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

  loadUserProfile();
  loadRatings();

  // Restore watchlist button states
  const watchlist = getWatchlist();
  document.querySelectorAll(".watchlist-btn").forEach(btn => {
    if (watchlist.includes(btn.dataset.title)) {
      btn.textContent = "✓ Added";
      btn.classList.remove("bg-green-600");
      btn.classList.add("bg-red-600");
    }
  });
});