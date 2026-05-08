/* ============================================================
   auth.js — Authentication: login, register, logout
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Auth = (() => {
  /* ── Shared state (read by other modules via App.state) ── */
  let _currentUser = null;
  let _isAdmin = false;

  function currentUser() {
    return _currentUser;
  }
  function isAdmin() {
    return _isAdmin;
  }

  function _normaliseUser(user) {
    const role = String(user?.role || "").toLowerCase();
    return {
      ...user,
      role: role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student",
      initials:
        (user?.name || "User")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() || "")
          .join("") || "U",
    };
  }

  function _mapRole(role) {
    const value = String(role || "").toLowerCase();
    if (value.includes("teacher")) return "teacher";
    if (value.includes("reader")) return "reader";
    return "student";
  }

  async function _signInWithPayload(payload, options = {}) {
    const response = await API.request(options.path, {
      method: "POST",
      body: payload,
      auth: false,
    });

    const token = response?.data?.token;
    const user = response?.data?.user;
    if (!token || !user) {
      throw new Error("Login failed.");
    }

    API.setToken(token);
    _currentUser = _normaliseUser(user);
    _isAdmin = String(user.role).toLowerCase() === "admin";
    AppData.setSessionUser(_currentUser);
    await AppData.syncAuthenticatedData(_currentUser);
    _launchApp();
  }

  /* ── Login as regular user ── */
  async function doLogin() {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value;

    if (!email || !pass) {
      UI.showToast("⚠️ Please enter your email and password.");
      return;
    }
    try {
      await _signInWithPayload(
        { email, password: pass },
        { path: "/auth/login" },
      );
    } catch (error) {
      UI.showToast(error.message || "⚠️ Unable to sign in.");
    }
  }

  /* ── Login as admin ── */
  async function doAdminLogin() {
    await doLogin();
  }

  /* ── Register ── */
  async function doRegister() {
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-pass").value;
    const role = document.getElementById("reg-role").value;

    if (!name || !email || !pass) {
      UI.showToast("⚠️ Please fill in all fields.");
      return;
    }

    try {
      await _signInWithPayload(
        {
          name,
          email,
          password: pass,
          role: _mapRole(role),
        },
        { path: "/auth/register" },
      );
    } catch (error) {
      UI.showToast(error.message || "⚠️ Unable to register.");
    }
  }

  /* ── Forgot password ── */
  function forgotPassword() {
    UI.showToast("📧 Password reset link sent to your email.");
  }

  /* ── Logout ── */
  async function doLogout() {
    try {
      await API.request("/auth/logout", { method: "POST", auth: true });
    } catch (error) {
      // Ignore logout failures and clear local state anyway.
    }
    API.setToken("");
    _currentUser = null;
    _isAdmin = false;
    document.getElementById("app").style.display = "none";
    UI.showPage("page-login");
  }

  async function restoreSession() {
    if (!API.getToken()) return null;
    try {
      const response = await API.request("/auth/me");
      const user = response?.data;
      if (!user) return null;
      _currentUser = _normaliseUser(user);
      _isAdmin = String(user.role).toLowerCase() === "admin";
      AppData.setSessionUser(_currentUser);
      await AppData.syncAuthenticatedData(_currentUser);
      _launchApp();
      return _currentUser;
    } catch (error) {
      API.setToken("");
      return null;
    }
  }

  /* ── Private: launch app shell ── */
  function _launchApp() {
    // Hide auth pages, show app shell
    document
      .querySelectorAll(".full-page")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById("app").style.display = "block";

    // Populate sidebar user info
    document.getElementById("sb-name").textContent = _currentUser.name;
    document.getElementById("sb-role").textContent = _currentUser.role;
    document.getElementById("sb-avatar").textContent = _currentUser.initials;
    document.getElementById("top-avatar").textContent = _currentUser.initials;

    // Build sidebar navigation
    UI.buildSidebar(_isAdmin);

    // Navigate to dashboard
    Router.navigate("dashboard");
  }

  return {
    currentUser,
    isAdmin,
    doLogin,
    doAdminLogin,
    doRegister,
    doLogout,
    forgotPassword,
    restoreSession,
  };
})();
