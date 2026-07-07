import { supabase, getUser, logActivity, isLoggedIn } from '../lib/supabase.js';

const IDEA_CATEGORIES = ['question', 'suggestion', 'intel', 'tip'];

export async function renderIdeas() {
  const container = document.getElementById('page-ideas');
  const user = await getUser();
  const volunteerId = user?.id;

  let ideas = [];
  try {
    const { data } = await supabase
      .from('campaign_ideas')
      .select('*')
      .order('votes', { ascending: false });
    if (data) ideas = data;
  } catch { /* supabase unavailable */ }

  let votedIds = [];
  if (volunteerId) {
    try {
      const { data } = await supabase
        .from('campaign_idea_votes')
        .select('idea_id')
        .eq('volunteer_id', volunteerId);
      if (data) votedIds = data.map(v => v.idea_id);
    } catch { /* ignore */ }
  }

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">ENGAGE</p>
        <h1 class="page-title">Idea Zone</h1>
        <p class="page-subtitle">Submit questions, intel, suggestions — the campaign listens</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        ${!user ? '<div class="auth-inline-notice"><a href="#/login">Log in</a> to submit ideas.</div>' : ''}
        <div class="idea-submit-card" ${!user ? 'style="display:none"' : ''}>
          <h3>Share an Idea</h3>
          <form id="ideaForm" class="idea-form">
            <input type="text" id="ideaTitle" placeholder="What's on your mind?" required class="form-input" />
            <div class="idea-category-select">
              ${IDEA_CATEGORIES.map(c => `
                <label class="idea-category-option">
                  <input type="radio" name="ideaCategory" value="${c}" ${c === 'suggestion' ? 'checked' : ''} />
                  <span class="idea-category-label">${c.charAt(0).toUpperCase() + c.slice(1)}</span>
                </label>
              `).join('')}
            </div>
            <textarea id="ideaBody" placeholder="Tell us more..." rows="3" class="form-input"></textarea>
            <button type="submit" class="cta-button">Submit</button>
            <div id="ideaStatus" class="video-upload-status"></div>
          </form>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <div class="bounty-filters">
          <button class="filter-pill active" data-filter="all">All</button>
          ${IDEA_CATEGORIES.map(c => `<button class="filter-pill" data-filter="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</button>`).join('')}
        </div>

        <div class="ideas-feed" id="ideasFeed">
          ${ideas.length > 0 ? ideas.map(idea => renderIdeaCard(idea, votedIds.includes(idea.id), volunteerId)).join('') : '<p class="empty-state">No ideas yet. Be the first to share!</p>'}
        </div>
      </div>
    </section>
  `;

  document.getElementById('ideaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('ideaTitle').value.trim();
    const body = document.getElementById('ideaBody').value.trim();
    const category = container.querySelector('input[name="ideaCategory"]:checked')?.value || 'suggestion';
    const status = document.getElementById('ideaStatus');

    if (!title) return;

    try {
      const { error } = await supabase.from('campaign_ideas').insert({
        volunteer_id: volunteerId,
        title,
        category,
        body,
        votes: 0,
      });
      if (error) throw error;

      logActivity('idea_submitted', { title, category });
      status.textContent = 'Idea submitted!';
      status.className = 'video-upload-status success';
      e.target.reset();
      setTimeout(() => renderIdeas(), 1000);
    } catch (err) {
      status.textContent = `Failed: ${err.message}`;
      status.className = 'video-upload-status error';
    }
  });

  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      container.querySelectorAll('.idea-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });

  container.querySelectorAll('.idea-vote-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ideaId = btn.dataset.id;
      if (btn.classList.contains('voted')) return;

      try {
        await supabase.from('campaign_idea_votes').insert({
          idea_id: ideaId,
          volunteer_id: volunteerId,
        });
        await supabase.rpc('increment_idea_votes', { idea_id_input: ideaId });

        btn.classList.add('voted');
        const countEl = btn.querySelector('.idea-vote-count');
        if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
      } catch { /* already voted or error */ }
    });
  });
}

function renderIdeaCard(idea, hasVoted) {
  const date = new Date(idea.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  });
  const categoryColors = {
    question: 'var(--blue)',
    suggestion: 'var(--green)',
    intel: 'var(--gold)',
    tip: 'var(--purple)',
  };

  return `
    <div class="idea-card" data-category="${idea.category}">
      <button class="idea-vote-btn ${hasVoted ? 'voted' : ''}" data-id="${idea.id}">
        <svg viewBox="0 0 24 24" fill="${hasVoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        <span class="idea-vote-count">${idea.votes || 0}</span>
      </button>
      <div class="idea-content">
        <div class="idea-header">
          <span class="idea-category-badge" style="color: ${categoryColors[idea.category] || 'var(--text-dim)'}">${idea.category}</span>
          <span class="idea-date">${date}</span>
        </div>
        <h3 class="idea-title">${idea.title}</h3>
        ${idea.body ? `<p class="idea-body">${idea.body}</p>` : ''}
      </div>
    </div>
  `;
}
