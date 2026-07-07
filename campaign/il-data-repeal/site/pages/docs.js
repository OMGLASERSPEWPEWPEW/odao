export async function renderDocs() {
  const container = document.getElementById('page-docs');
  let docsIndex = [];
  try {
    const res = await fetch('/docs-index.json');
    docsIndex = await res.json();
  } catch { docsIndex = []; }

  const categories = {
    overview: { label: 'Overview', color: 'var(--blue)' },
    legal: { label: 'Legal', color: 'var(--red)' },
    strategy: { label: 'Strategy', color: 'var(--gold)' },
    media: { label: 'Media', color: 'var(--purple)' },
    coalition: { label: 'Coalition', color: 'var(--green)' },
  };

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">INTEL</p>
        <h1 class="page-title">Documentation</h1>
        <p class="page-subtitle">Campaign research, templates, and strategy docs</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <div class="bounty-filters">
          <button class="filter-pill active" data-filter="all">All</button>
          ${Object.entries(categories).map(([key, cat]) =>
            `<button class="filter-pill" data-filter="${key}">${cat.label}</button>`
          ).join('')}
        </div>

        <div class="docs-grid">
          ${docsIndex.map(doc => {
            const cat = categories[doc.category] || { label: doc.category, color: 'var(--text-dim)' };
            return `
              <div class="doc-card" data-category="${doc.category}">
                <div class="doc-card-header">
                  <span class="doc-category-badge" style="color: ${cat.color}; border-color: ${cat.color}">${cat.label}</span>
                </div>
                <h3 class="doc-title">${doc.title}</h3>
                <p class="doc-desc">${doc.description}</p>
                <button class="doc-read-btn" data-slug="${doc.slug}">Read</button>
              </div>
            `;
          }).join('')}
        </div>

        <div class="doc-reader" id="docReader" style="display:none">
          <button class="doc-reader-close" id="docReaderClose">&larr; Back to docs</button>
          <div class="doc-reader-content" id="docReaderContent"></div>
        </div>
      </div>
    </section>
  `;

  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      container.querySelectorAll('.doc-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });

  container.querySelectorAll('.doc-read-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slug = btn.dataset.slug;
      const grid = container.querySelector('.docs-grid');
      const filters = container.querySelector('.bounty-filters');
      const reader = document.getElementById('docReader');
      const content = document.getElementById('docReaderContent');

      grid.style.display = 'none';
      filters.style.display = 'none';
      reader.style.display = 'block';
      content.innerHTML = '<p class="empty-state">Loading...</p>';

      try {
        const res = await fetch(`/docs-md/${slug}.md`);
        if (!res.ok) throw new Error('Not found');
        const md = await res.text();
        content.innerHTML = renderMarkdown(md);
      } catch {
        content.innerHTML = `<p class="empty-state">Document not available yet. Check the <a href="#/shared-docs">shared documents</a> page for downloadable versions.</p>`;
      }
    });
  });

  document.getElementById('docReaderClose')?.addEventListener('click', () => {
    const grid = container.querySelector('.docs-grid');
    const filters = container.querySelector('.bounty-filters');
    const reader = document.getElementById('docReader');
    grid.style.display = '';
    filters.style.display = '';
    reader.style.display = 'none';
  });
}

function renderMarkdown(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^(?!<[hulo]|<li)(.+)$/gm, '<p>$1</p>')
    .replace(/\n{2,}/g, '\n');
}
