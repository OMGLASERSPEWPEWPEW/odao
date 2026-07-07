import { supabase, getUser } from '../lib/supabase.js';

export async function renderVideoJournal() {
  const container = document.getElementById('page-video-journal');
  const user = await getUser();
  const volunteerId = user?.id;

  let videos = [];
  try {
    const { data } = await supabase
      .from('campaign_videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) videos = data;
  } catch { /* supabase unavailable */ }

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">INTEL</p>
        <h1 class="page-title">Video Journal</h1>
        <p class="page-subtitle">Meeting recordings, updates, and campaign vlogs</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        ${!user ? '<div class="auth-inline-notice"><a href="#/login">Log in</a> to upload videos.</div>' : ''}
        <div class="video-upload-card" id="videoUploadCard" ${!user ? 'style="display:none"' : ''}>
          <h3>Upload a Video</h3>
          <form id="videoUploadForm" class="video-upload-form">
            <input type="text" id="videoTitle" placeholder="Video title" required class="form-input" />
            <textarea id="videoDesc" placeholder="What happened? How did the meeting go?" rows="3" class="form-input"></textarea>
            <div class="video-file-input">
              <input type="file" id="videoFile" accept="video/*" required />
              <p class="video-file-hint">Accepts .mp4, .mov, .webm — max 500 MB</p>
            </div>
            <button type="submit" class="cta-button" id="videoSubmitBtn">Upload</button>
            <div id="videoUploadStatus" class="video-upload-status"></div>
          </form>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Journal Entries</h2>
        <div class="video-grid" id="videoGrid">
          ${videos.length > 0 ? videos.map(v => renderVideoCard(v)).join('') : '<p class="empty-state">No videos yet. Upload your first meeting recording!</p>'}
        </div>
      </div>
    </section>
  `;

  document.getElementById('videoUploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('videoTitle').value.trim();
    const desc = document.getElementById('videoDesc').value.trim();
    const fileInput = document.getElementById('videoFile');
    const file = fileInput.files[0];
    const status = document.getElementById('videoUploadStatus');
    const submitBtn = document.getElementById('videoSubmitBtn');

    if (!file || !title) return;

    submitBtn.disabled = true;
    status.textContent = 'Uploading...';
    status.className = 'video-upload-status uploading';

    try {
      const ext = file.name.split('.').pop();
      const path = `${volunteerId || 'anon'}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-videos')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-videos')
        .getPublicUrl(path);

      await supabase.from('campaign_videos').insert({
        volunteer_id: volunteerId,
        title,
        description: desc,
        storage_path: path,
      });

      status.textContent = 'Uploaded!';
      status.className = 'video-upload-status success';
      e.target.reset();

      setTimeout(() => renderVideoJournal(), 1000);
    } catch (err) {
      status.textContent = `Upload failed: ${err.message}`;
      status.className = 'video-upload-status error';
      submitBtn.disabled = false;
    }
  });

  container.querySelectorAll('.video-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.video-card');
      const player = card.querySelector('.video-player');
      player.style.display = player.style.display === 'none' ? 'block' : 'none';
    });
  });
}

function renderVideoCard(v) {
  const date = new Date(v.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const { data: { publicUrl } } = supabase.storage
    .from('campaign-videos')
    .getPublicUrl(v.storage_path);

  return `
    <div class="video-card">
      <div class="video-card-header">
        <h3 class="video-card-title">${v.title}</h3>
        <span class="video-card-date">${date}</span>
      </div>
      ${v.description ? `<p class="video-card-desc">${v.description}</p>` : ''}
      <button class="video-play-btn">&#9654; Play</button>
      <div class="video-player" style="display:none">
        <video controls width="100%" preload="metadata">
          <source src="${publicUrl}" />
          Your browser does not support video.
        </video>
      </div>
    </div>
  `;
}
