import { login, signup, isLoggedIn, getUser } from './supabase.js';

export async function renderAuthGate(container, message = 'Log in to continue') {
  const loggedIn = await isLoggedIn();
  if (loggedIn) return true;

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">ACCOUNT</p>
        <h1 class="page-title">${message}</h1>
      </div>
    </header>
    <section class="section">
      <div class="container">
        ${renderAuthForm()}
      </div>
    </section>
  `;

  bindAuthForm(container);
  return false;
}

export function renderAuthForm() {
  return `
    <div class="auth-card" id="authCard">
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Log in</button>
        <button class="auth-tab" data-tab="signup">Create account</button>
      </div>

      <form class="auth-form" id="loginForm">
        <input type="text" id="loginUsername" placeholder="Username" required class="form-input" autocomplete="username" />
        <input type="password" id="loginPassword" placeholder="Password" required class="form-input" autocomplete="current-password" />
        <button type="submit" class="cta-button auth-submit-btn">Log in</button>
        <div class="auth-error" id="loginError"></div>
      </form>

      <form class="auth-form" id="signupForm" style="display:none">
        <input type="text" id="signupUsername" placeholder="Choose a username" required class="form-input" autocomplete="username" minlength="3" maxlength="20" />
        <input type="password" id="signupPassword" placeholder="Password" required class="form-input" autocomplete="new-password" minlength="6" />
        <input type="password" id="signupConfirm" placeholder="Confirm password" required class="form-input" autocomplete="new-password" />
        <button type="submit" class="cta-button auth-submit-btn">Create account</button>
        <div class="auth-error" id="signupError"></div>
      </form>
    </div>
  `;
}

export function bindAuthForm(container, onSuccess = null) {
  const tabs = container.querySelectorAll('.auth-tab');
  const loginForm = container.querySelector('#loginForm');
  const signupForm = container.querySelector('#signupForm');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loginForm.style.display = tab.dataset.tab === 'login' ? '' : 'none';
      signupForm.style.display = tab.dataset.tab === 'signup' ? '' : 'none';
    });
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = container.querySelector('#loginUsername').value.trim();
    const password = container.querySelector('#loginPassword').value;
    const errorEl = container.querySelector('#loginError');
    const btn = loginForm.querySelector('.auth-submit-btn');

    btn.disabled = true;
    btn.textContent = 'Logging in...';
    errorEl.textContent = '';

    const result = await login(username, password);
    if (result.error) {
      errorEl.textContent = result.error;
      btn.disabled = false;
      btn.textContent = 'Log in';
      return;
    }

    if (onSuccess) {
      onSuccess(result.user);
    } else {
      location.hash = '#/';
      location.reload();
    }
  });

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = container.querySelector('#signupUsername').value.trim();
    const password = container.querySelector('#signupPassword').value;
    const confirm = container.querySelector('#signupConfirm').value;
    const errorEl = container.querySelector('#signupError');
    const btn = signupForm.querySelector('.auth-submit-btn');

    if (password !== confirm) {
      errorEl.textContent = 'Passwords don\'t match';
      return;
    }

    if (username.length < 3) {
      errorEl.textContent = 'Username must be at least 3 characters';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating account...';
    errorEl.textContent = '';

    const result = await signup(username, password);
    if (result.error) {
      errorEl.textContent = result.error;
      btn.disabled = false;
      btn.textContent = 'Create account';
      return;
    }

    if (onSuccess) {
      onSuccess(result.user);
    } else {
      location.hash = '#/';
      location.reload();
    }
  });
}
