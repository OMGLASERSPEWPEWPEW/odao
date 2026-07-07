import { isLoggedIn, getUser } from '../lib/supabase.js';
import { renderAuthForm, bindAuthForm } from '../lib/auth-ui.js';

export async function renderLogin() {
  const container = document.getElementById('page-login');
  const user = await getUser();

  if (user) {
    container.innerHTML = `
      <header class="page-header">
        <div class="container">
          <p class="page-eyebrow">ACCOUNT</p>
          <h1 class="page-title">Welcome back, ${user.username}</h1>
          <p class="page-subtitle">You're logged in. <a href="#/">Go to dashboard</a></p>
        </div>
      </header>
    `;
    return;
  }

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">ACCOUNT</p>
        <h1 class="page-title">Log in</h1>
        <p class="page-subtitle">Track your campaign actions and climb the leaderboard</p>
      </div>
    </header>
    <section class="section">
      <div class="container">
        ${renderAuthForm()}
      </div>
    </section>
  `;

  bindAuthForm(container);
}
