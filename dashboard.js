// Dashboard functionality
let currentUser = null;
let selectedDestinationId = null;
let destinations = []; // store destinations from backend

// --------- INITIAL LOAD ------------
document.addEventListener('DOMContentLoaded', async function() {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    currentUser = JSON.parse(userData);
    updateUserProfile();
    await renderAllSections();
    await loadUserBookings(currentUser._id); // ✅ load user's bookings
  }
  await loadDestinations(); // ✅ load destination list for search
});

// --------- USER PROFILE ------------
function updateUserProfile() {
  if (currentUser) {
    document.getElementById('userName').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('profileName').textContent = currentUser.username;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileEmailDetail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileAddress').textContent = currentUser.address;
  }
}

// --------- SECTIONS & NAVIGATION ------------
function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  document.querySelectorAll('.sidebar-menu li').forEach(item => item.classList.remove('active'));
  const activeMenu = document.querySelector(`[onclick="showSection('${sectionId}')"]`)?.parentElement;
  if (activeMenu) activeMenu.classList.add('active');

  const titles = {
    overview: 'Dashboard',
    destinations: 'Destinations',
    bookings: 'My Bookings',
    favorites: 'Favorites',
    profile: 'Profile',
    support: 'Support'
  };
  if (titles[sectionId]) document.getElementById('pageTitle').textContent = titles[sectionId];
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// --------- API INTEGRATION ------------
async function getDestinations() {
  const res = await fetch('http://localhost:3000/api/destinations');
  return res.json();
}

async function getUserFavorites(userId) {
  if (!userId) return [];
  const res = await fetch(`http://localhost:3000/favorites/${userId}`);
  return res.json();
}

async function getUserBookings(userId) {
  if (!userId) return [];
  const res = await fetch(`http://localhost:3000/api/bookings/${userId}`);
  return res.json();
}

async function getUserActivities(userId) {
  if (!userId) return [];
  const res = await fetch(`http://localhost:3000/activities/${userId}`);
  return res.json();
}

// --------- RENDER FUNCTIONS ------------
async function renderAllSections() {
  await renderDestinations();
  await renderFavorites();
  await renderBookings();
  await renderActivities();
  await updateStats();
}

async function renderDestinations() {
  const list = await getDestinations();
  destinations = list; // ✅ store for search
  const container = document.getElementById('destinationsList');
  container.innerHTML = '';

  list.forEach(dest => {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.onclick = () => showDestinationDetails(dest._id);
    card.innerHTML = `
      <div class="destination-image" style="background-image: url('${dest.imageUrl || ''}')"></div>
      <div class="destination-info">
        <h4>${dest.name}</h4>
        <p><i class="fas fa-star"></i> ${dest.rating || '0'} (${dest.reviews || 0} reviews)</p>
        <span class="destination-type">${dest.type.replace('-', ' ')}</span>
        <button class="btn-outline" onclick="event.stopPropagation(); addFavorite('${currentUser?._id}', '${dest._id}')">
          <i class="fas fa-heart"></i> Add to Favorites
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function renderFavorites() {
  const favorites = await getUserFavorites(currentUser?._id);
  const container = document.getElementById('favoritesGrid');
  container.innerHTML = '';

  favorites.forEach(fav => {
    const dest = fav.destinationId;
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.innerHTML = `
      <div class="destination-image" style="background-image: url('${dest?.imageUrl || ''}')"></div>
      <div class="destination-info">
        <h4>${dest?.name || 'Unknown'}</h4>
        <button class="btn-danger" onclick="event.stopPropagation(); removeFavorite('${fav._id}')">
          <i class="fas fa-heart-broken"></i> Remove
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function renderBookings() {
  const bookings = await getUserBookings(currentUser?._id);
  const container = document.getElementById('bookingsList');
  container.innerHTML = '';

  bookings.forEach(booking => {
    const card = document.createElement('div');
    card.className = 'booking-card';
    card.innerHTML = `
      <div class="booking-header">
        <h3>${booking.destination?.name || "Unknown"}</h3>
        <span class="booking-status ${booking.status.toLowerCase()}">${booking.status}</span>
      </div>
      <div class="booking-details">
        <div class="detail-item"><i class="fas fa-calendar"></i> <span>${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</span></div>
        <div class="detail-item"><i class="fas fa-users"></i> <span>${booking.travelers || 1} Travelers</span></div>
      </div>
      <div class="booking-actions">
        <button class="btn-outline">View Details</button>
        <button class="btn-outline">Modify</button>
        <button class="btn-danger">Cancel</button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function renderActivities() {
  const activities = await getUserActivities(currentUser?._id);
  const container = document.getElementById('activityList');
  container.innerHTML = '';

  if (!activities.length) {
    container.innerHTML = `<p style="text-align:center;">No Activity</p>`;
    return;
  }

  activities.forEach(act => {
    const icon = act.type === 'favorite' ? 'heart' : act.type === 'booking' ? 'calendar-check' : 'star';
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <div class="activity-icon"><i class="fas fa-${icon}"></i></div>
      <div class="activity-details">
        <p>${act.content || act.type}</p>
        <span>${formatDateTime(act.createdAt)}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// --------- BOOKING FORM ------------

async function submitBooking() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const travelers = document.getElementById("travelers").value;

  if (!selectedDestinationId || !startDate || !endDate || !travelers) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser._id,
        destination: selectedDestinationId,
        startDate,
        endDate,
        travelers
      })
    });

    const newBooking = await res.json();

    alert("✅ Booking confirmed for " + (newBooking.destination?.name || "Trip"));
    closeBookingForm();
    await loadUserBookings(currentUser._id); // refresh bookings list

  } catch (err) {
    console.error("Booking error:", err);
    alert("Failed to save booking.");
  }
}

function filterDestinationsList() {
  const input = document.getElementById("destinationSearch").value.toLowerCase();
  const resultsBox = document.getElementById("destinationResults");
  resultsBox.innerHTML = "";

  destinations
    .filter(dest => dest.name.toLowerCase().includes(input))
    .forEach(dest => {
      const li = document.createElement("li");
      li.textContent = dest.name;
      li.onclick = () => selectDestination(dest);
      resultsBox.appendChild(li);
    });
}

function selectDestination(dest) {
  selectedDestinationId = dest._id;
  document.getElementById("destinationSearch").value = dest.name;
  document.getElementById("destinationResults").innerHTML = "";
}

async function loadUserBookings(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/bookings/${userId}`);
    const bookings = await res.json();
    const container = document.getElementById("bookingsList");
    container.innerHTML = "";

    if (!bookings.length) {
      container.innerHTML = `<p>No bookings found.</p>`;
      return;
    }

    bookings.forEach(booking => {
      const card = document.createElement("div");
      card.className = "booking-card";
      card.innerHTML = `
        <div class="booking-header">
          <h3>${booking.destination?.name || "Unknown"} Trip</h3>
          <span class="booking-status ${booking.status.toLowerCase()}">${booking.status}</span>
        </div>
        <div class="booking-details">
          <div class="detail-item"><i class="fas fa-calendar"></i><span>${booking.startDate.slice(0,10)} → ${booking.endDate.slice(0,10)}</span></div>
          <div class="detail-item"><i class="fas fa-users"></i><span>${booking.travelers} Travelers</span></div>
        </div>
        <div class="booking-actions">
          <button class="btn-outline">View Details</button>
          <button class="btn-outline">Modify</button>
          <button class="btn-danger">Cancel</button>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error loading bookings:", err);
    alert("Failed to load bookings.");
  }
}

// --------- MODAL CONTROL ------------
function openBookingForm() {
  document.getElementById("bookingModal").style.display = "flex";
}
function closeBookingForm() {
  document.getElementById("bookingModal").style.display = "none";
}

// --------- UTILITY ------------
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}
function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault(); // prevent page reload from <a href="#">
      localStorage.removeItem("currentUser");
      window.location.href = "travel.html"; // redirect to your login page
    });
  }
});

function editProfile() {
// Prefill modal with current user data
document.getElementById("editUsername").value = currentUser.username;
document.getElementById("editEmail").value = currentUser.email;
document.getElementById("editPhone").value = currentUser.phone || "";
document.getElementById("editAddress").value = currentUser.address || "";
document.getElementById("editProfileModal").style.display = "flex";
}
function closeEditProfileForm() {
document.getElementById("editProfileModal").style.display = "none";
}
async function submitProfileEdit() {
const updatedUser = {
username: document.getElementById("editUsername").value,
email: document.getElementById("editEmail").value,
phone: document.getElementById("editPhone").value,
address: document.getElementById("editAddress").value,
};
try {
const res = await fetch(`http://localhost:3000/api/users/${currentUser._id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(updatedUser)
});
if (!res.ok) throw new Error("Failed to update profile");
const savedUser = await res.json();
// Update localStorage + UI
localStorage.setItem("currentUser", JSON.stringify(savedUser));
currentUser = savedUser;
updateUserProfile();
closeEditProfileForm();
alert("✅ Profile updated successfully!");
} catch (err) {
console.error("Profile update error:", err);
alert("Failed to update profile.");
}
}