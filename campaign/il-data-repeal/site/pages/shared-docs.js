const SITE_BASE = 'https://sb3019.vercel.app';

function getFullUrl(url) {
  return url.startsWith('http') ? url : SITE_BASE + url;
}

export async function renderSharedDocs() {
  const container = document.getElementById('page-shared-docs');
  let docs = [];
  try {
    const res = await fetch('/shared-documents.json');
    docs = await res.json();
  } catch { docs = []; }

  const categories = {
    campaign: { label: 'Campaign Materials', color: 'var(--red)', icon: '&#128220;' },
    legislation: { label: 'Legislation', color: 'var(--gold)', icon: '&#9878;' },
    press: { label: 'Press', color: 'var(--blue)', icon: '&#128240;' },
    reference: { label: 'Reference', color: 'var(--text-muted)', icon: '&#128218;' },
    templates: { label: 'Templates', color: 'var(--green)', icon: '&#128196;' },
  };

  const grouped = {};
  docs.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">INTEL</p>
        <h1 class="page-title">Shared Documents</h1>
        <p class="page-subtitle">Bill texts, press coverage, and campaign materials</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        ${Object.entries(grouped).map(([cat, items]) => {
          const catInfo = categories[cat] || { label: cat, color: 'var(--text-dim)', icon: '&#128196;' };
          return `
            <div class="shared-docs-category">
              <h2 class="shared-docs-category-title" style="color: ${catInfo.color}">
                <span>${catInfo.icon}</span> ${catInfo.label}
              </h2>
              <div class="shared-docs-list">
                ${items.map(doc => `
                  <div class="shared-doc-item-wrapper">
                    <a href="${doc.url}" target="_blank" rel="noopener" class="shared-doc-item">
                      <div class="shared-doc-info">
                        <span class="shared-doc-type-badge">${doc.type.toUpperCase()}</span>
                        <h3 class="shared-doc-title">${doc.title}</h3>
                        <p class="shared-doc-desc">${doc.description}</p>
                      </div>
                      <span class="shared-doc-arrow">&rarr;</span>
                    </a>
                    <button class="copy-link-btn" data-url="${getFullUrl(doc.url)}" title="Copy link">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      <span class="copy-link-label">Copy link</span>
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;

  container.querySelectorAll('.copy-link-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        const label = btn.querySelector('.copy-link-label');
        label.textContent = 'Copied!';
        setTimeout(() => { label.textContent = 'Copy link'; }, 2000);
      } catch {
        prompt('Copy this link:', url);
      }
    });
  });
}
