// Navigation and Page Switching
function openModal() {
  document.getElementById("loginModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("loginModal").style.display = "none";
}

function showSignup() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
}

function showLogin() {
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

function showAdventurePage() {
  document.querySelector('.slideshow-container').style.display = 'none';
  document.querySelector('.experiences').style.display = 'none';
  document.querySelector('nav').style.display = 'none';
  document.getElementById('adventurePage').style.display = 'block';
  document.getElementById('foodPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'none';
}

function showFoodPage() {
  document.querySelector('.slideshow-container').style.display = 'none';
  document.querySelector('.experiences').style.display = 'none';
  document.querySelector('nav').style.display = 'none';
  document.getElementById('foodPage').style.display = 'block';
  document.getElementById('adventurePage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'none';
}

function showMainPage() {
  // This shows the public main page (slideshow and experiences)
  document.querySelector('.slideshow-container').style.display = 'block';
  document.querySelector('.experiences').style.display = 'block';
  document.querySelector('nav').style.display = 'flex';
  document.getElementById('adventurePage').style.display = 'none';
  document.getElementById('foodPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'none';
}

// Show main page after login/signup (personalized)
function showMainPageAfterAuth(username) {
  document.getElementById("mainPage").style.display = "flex";
  document.querySelector('nav').style.display = 'none';
  document.querySelector('.slideshow-container').style.display = 'none';
  document.querySelector('.experiences').style.display = 'none';
  document.getElementById('adventurePage').style.display = 'none';
  document.getElementById('foodPage').style.display = 'none';
  document.getElementById("welcomePage").style.display = "none";
  document.getElementById("mainWelcome").innerText = `Hello, ${username || 'User'}!`;
  closeModal();
}

// Show main page (from adventure/food back)
function showMainExperiences() {
  document.getElementById("mainPage").style.display = "flex";
  document.getElementById('adventurePage').style.display = 'none';
  document.getElementById('foodPage').style.display = 'none';
}

// Logout and return to main experiences (public)
function logout() {
  // Clear stored user data
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');
  
  // Reset UI to public state
  document.getElementById("mainPage").style.display = "none";
  document.getElementById("welcomePage").style.display = "none";
  document.querySelector('nav').style.display = 'flex';
  document.querySelector('.slideshow-container').style.display = 'block';
  document.querySelector('.experiences').style.display = 'block';
  
  // If on dashboard page, redirect to main page
  if (window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'travel.html';
  }
}

// Validation helpers
function showError(input, message) {
  clearError(input);
  let error = document.createElement("div");
  error.className = "error-msg";
  error.innerText = message;
  input.parentElement.appendChild(error);
  input.style.borderColor = "#ffcc00";
}

function clearError(input) {
  let parent = input.parentElement;
  let error = parent.querySelector(".error-msg");
  if (error) error.remove();
  input.style.borderColor = "";
}

// Show welcome page after login/signup (legacy, now unused)
function showWelcomePage() {
  document.getElementById("welcomePage").style.display = "flex";
  document.querySelector('nav').style.display = 'none';
  document.querySelector('.slideshow-container').style.display = 'none';
  document.querySelector('.experiences').style.display = 'none';
  document.getElementById('adventurePage').style.display = 'none';
  document.getElementById('foodPage').style.display = 'none';
  document.getElementById("mainPage").style.display = "none";
  closeModal();
}

// Utility function to get current date and time
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Enhanced user data storage
function storeUserData(userData) {
  const enhancedUserData = {
    ...userData,
    loginTime: getCurrentDateTime(),
    isLoggedIn: true
  };

  // ✅ Store in both localStorage and sessionStorage
  localStorage.setItem('currentUser', JSON.stringify(enhancedUserData));
  sessionStorage.setItem('currentUser', JSON.stringify(enhancedUserData));

  return enhancedUserData;
}


// Check if user is already logged in
function checkExistingLogin() {
  const userData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.isLoggedIn) {
        // User is already logged in, could redirect to dashboard
        console.log('User already logged in:', user.username);
        return user;
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      // Clear corrupted data
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    }
  }
  return null;
}

// Signup validation & API
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  const existingUser = checkExistingLogin();
  if (existingUser && !window.location.pathname.includes('dashboard.html')) {
    // Could show a message or redirect to dashboard
    console.log('Welcome back,', existingUser.username);
  }
  
  // Signup event listener
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", function(e) {
      e.preventDefault();
      
      let username = document.getElementById("signupUsername");
      let email = document.getElementById("signupEmail");
      let phone = document.getElementById("signupPhone");
      let address = document.getElementById("signupAddress");
      let password = document.getElementById("signupPassword");
      let valid = true;

      // Clear previous errors
      [username, email, phone, address, password].forEach(clearError);

      // Validation
      if (!username.value.trim()) {
        showError(username, "Username is required.");
        valid = false;
      } else if (username.value.trim().length < 3) {
        showError(username, "Username must be at least 3 characters.");
        valid = false;
      }

      if (!email.value.trim()) {
        showError(email, "Email is required.");
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, "Please enter a valid email address.");
        valid = false;
      }

      if (!phone.value.trim()) {
        showError(phone, "Phone number is required.");
        valid = false;
      } else if (!/^\d{10}$/.test(phone.value.trim())) {
        showError(phone, "Enter a valid 10-digit phone number.");
        valid = false;
      }

      if (!address.value.trim()) {
        showError(address, "Address is required.");
        valid = false;
      } else if (address.value.trim().length < 10) {
        showError(address, "Address must be at least 10 characters.");
        valid = false;
      }

      if (!password.value.trim()) {
        showError(password, "Password is required.");
        valid = false;
      } else if (password.value.length < 6) {
        showError(password, "Password must be at least 6 characters.");
        valid = false;
      }

      if (valid) {
        // Disable button to prevent double submission
        signupBtn.disabled = true;
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing up...';
        
        // Call backend API
        fetch('http://localhost:3000/signup', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: username.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            address: address.value.trim(),
            password: password.value
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.message === 'User registered!' && data.user) {
            // Store user data with real _id
            const userData = storeUserData({
            _id: data.user._id,   // ✅ store MongoDB ID
            username: data.user.username,
            email: data.user.email,
            phone: data.user.phone,
            address: data.user.address,
            registrationDate: getCurrentDateTime()
            });
            alert(`Welcome ${userData.username}! Registration successful. Redirecting to dashboard...`);

            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1500);
          } else {
            alert(data.message || 'Registration failed. Please try again.');
         }
        })

        .catch(error => {
          console.error('Signup error:', error);
          alert('Signup failed. Please check your connection and try again.');
        })
        .finally(() => {
          // Re-enable button
          signupBtn.disabled = false;
          signupBtn.innerHTML = 'Sign Up';
        });
      }
    });
  }

  // Login event listener
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", function(e) {
      e.preventDefault();
      
      let username = document.getElementById("loginUsername");
      let password = document.getElementById("loginPassword");
      let valid = true;

      // Clear previous errors
      clearError(username);
      clearError(password);

      // Validation
      if (!username.value.trim()) {
        showError(username, "Username is required.");
        valid = false;
      }

      if (!password.value.trim()) {
        showError(password, "Password is required.");
        valid = false;
      }

      if (valid) {
        // Disable button to prevent double submission
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        // Call backend API
        fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: username.value.trim(),
            password: password.value
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.message === 'Login successful' && data.user) {
            // Store user data with enhanced information
            const userData = storeUserData({
              _id: data.user._id,          // ✅ keep MongoDB ObjectId
              username: data.user.username,
              email: data.user.email,
              phone: data.user.phone,
              address: data.user.address,
              lastLogin: getCurrentDateTime()
            });

            
            // Show success message
            alert(`Welcome back ${userData.username}! Redirecting to dashboard...`);
            
            // Redirect to dashboard after a brief delay
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1500);
            
          } else {
            alert(data.message || 'Invalid credentials. Please try again.');
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          alert('Login failed. Please check your connection and try again.');
        })
        .finally(() => {
          // Re-enable button
          loginBtn.disabled = false;
          loginBtn.innerHTML = 'Login';
        });
      }
    });
  }

  // Remove error message on input in both forms
  document.querySelectorAll("#loginForm input, #signupForm input").forEach((input) => {
    input.addEventListener("input", function () {
      clearError(input);
    });
  });

  // Add Enter key support for forms
  document.querySelectorAll("#loginForm input").forEach((input) => {
    input.addEventListener("keypress", function(e) {
      if (e.key === 'Enter') {
        document.getElementById("loginBtn").click();
      }
    });
  });

  document.querySelectorAll("#signupForm input").forEach((input) => {
    input.addEventListener("keypress", function(e) {
      if (e.key === 'Enter') {
        document.getElementById("signupBtn").click();
      }
    });
  });
});

// Enhanced modal functionality
function openModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "flex";
    // Focus on first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  }
}

function closeModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "none";
    // Clear any error messages
    document.querySelectorAll(".error-msg").forEach(error => error.remove());
    // Reset input styles
    document.querySelectorAll("#loginForm input, #signupForm input").forEach(input => {
      input.style.borderColor = "";
    });
  }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById("loginModal");
  if (modal && e.target === modal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Enhanced page navigation with user state management
function navigateToPage(pageName) {
  const user = checkExistingLogin();
  
  switch(pageName) {
    case 'adventure':
      showAdventurePage();
      break;
    case 'food':
      showFoodPage();
      break;
    case 'dashboard':
      if (user) {
        window.location.href = 'dashboard.html';
      } else {
        openModal();
      }
      break;
    case 'home':
      showMainPage();
      break;
    default:
      console.log('Unknown page:', pageName);
  }
}

// Session management
function refreshSession() {
  const user = checkExistingLogin();
  if (user) {
    // Update last activity time
    user.lastActivity = getCurrentDateTime();
    localStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }
}

// Refresh session every 5 minutes
setInterval(refreshSession, 5 * 60 * 1000);

// Activity tracking
document.addEventListener('click', refreshSession);
document.addEventListener('keypress', refreshSession);

// Console welcome message for developers
console.log(`
🌴 Tamil Nadu Tourism Application
📅 Current Date: ${getCurrentDateTime()}
👨‍💻 Developer: sk-krishnan05
🚀 Version: 1.0.0

Welcome to the Tamil Nadu Tourism web application!
This application features user authentication, dashboard management,
and comprehensive tourism information for Tamil Nadu.

Features:
- User Registration & Login
- Interactive Dashboard
- Destination Management
- Booking System
- Responsive Design
- Session Management

For support, contact the development team.
`);

// Export functions for dashboard integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkExistingLogin,
    storeUserData,
    getCurrentDateTime,
    logout,
    showAdventurePage,
    showFoodPage
  };
}

// Global error handler
window.addEventListener('error', function(e) {
  console.error('Application Error:', e.error);
  // Could send error reports to a logging service
});

// Handle page visibility changes (useful for session management)
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // Page became visible, refresh session
    refreshSession();
  }
});

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Tamil Nadu Tourism App initialized at:', getCurrentDateTime());
});