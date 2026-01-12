document.addEventListener('DOMContentLoaded', function () {

  /* ========== AUTH UTILITIES ========== */
  function getAdmins() {
    return JSON.parse(localStorage.getItem('admins')) || [];
  }

  function saveAdmins(admins) {
    localStorage.setItem('admins', JSON.stringify(admins));
  }

  function isLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
  }

  /* ========== ROUTE PROTECTION ========== */
  const path = window.location.pathname;

  const adminPages = [
    'admin-dashboard.html',
    'admin-login.html',
    'admin-signup.html'
  ];

  const isAdminPage = adminPages.some(page => path.includes(page));

  // ✅ THIS IS THE MISSING LINE
  if (!isAdminPage) return;

  if (
    !isLoggedIn() &&
    !path.includes('admin-login.html') &&
    !path.includes('admin-signup.html')
  ) {
    window.location.href = 'admin-login.html';
    return;
  }

  /* ========== SIGN UP ========== */
  const signupForm = document.getElementById('adminSignupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('signupConfirm').value;
      const error = document.getElementById('signupError');

      if (password !== confirm) {
        error.textContent = 'Passwords do not match';
        return;
      }

      const admins = getAdmins();
      if (admins.find(a => a.email === email)) {
        error.textContent = 'Admin already exists';
        return;
      }

      admins.push({ email, password, role: 'admin' });
      saveAdmins(admins);

      alert('Admin account created successfully');
      window.location.href = 'admin-login.html';
    });
  }

  /* ========== LOGIN ========== */
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const error = document.getElementById('loginError');

      const admin = getAdmins().find(
        a => a.email === email && a.password === password
      );

      if (!admin) {
        error.textContent = 'Invalid email or password';
        return;
      }

      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('currentAdmin', email);
      window.location.href = 'admin-dashboard.html';
    });
  }

  /* ========== LOGOUT ========== */
  const logoutBtn = document.getElementById('admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('currentAdmin');
      window.location.href = 'index.html';
    });
  }

});
