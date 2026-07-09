/**
 * support.js — ForceLens Support & Collaboration Portal
 */

document.addEventListener('DOMContentLoaded', async () => {

  const SUPABASE_URL  = 'https://umvoadxxbqviguaxwdjh.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdm9hZHh4YnF2aWd1YXh3ZGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDc5MTIsImV4cCI6MjA5NTk4MzkxMn0.K7UO-11eSdCPmKp6k96eJDwUlAC4yPHVDa3j44ge_gQ';

  const _lib = window.supabase;
  if (!_lib || !_lib.createClient) {
    showBanner('Could not load the support service. Please refresh.', 'error');
    return;
  }

  const _sb = _lib.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      persistSession:   true,
      autoRefreshToken: true,
      storageKey:       'forcelens_sb_session'
    }
  });

  let _currentUser = null;

  async function ensureAuth() {
    if (_currentUser) return _currentUser;
    const { data: { session } } = await _sb.auth.getSession();
    if (session?.user) {
      _currentUser = session.user;
      return _currentUser;
    }
    const { data, error } = await _sb.auth.signInAnonymously();
    if (error) throw new Error('Auth failed: ' + error.message);
    _currentUser = data.user;
    return _currentUser;
  }

  function displayName(uid) {
    return 'User_' + (uid || '').slice(0, 6).toUpperCase();
  }

  async function fetchIssues() {
    const { data, error } = await _sb
      .from('issues')
      .select(`
        id, author_id, display_name, type, title, description, steps,
        rating, status, image_url, created_at, updated_at,
        replies ( id, issue_id, author_id, display_name, is_owner, text, created_at )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function insertIssue({ type, title, description, steps, email, imageUrl, rating }) {
    const user = await ensureAuth();
    const { data, error } = await _sb.from('issues').insert({
      author_id:    user.id,
      display_name: displayName(user.id),
      type,
      title,
      description,
      steps:     steps || '',
      rating:    (typeof rating === 'number' ? rating : null),
      image_url: imageUrl || null,
      status:    'open'
    }).select().single();
    if (error) throw error;

    if (email) {
      const { error: emailErr } = await _sb.from('issue_emails').insert({
        issue_id:  data.id,
        author_id: user.id,
        email
      });
      if (emailErr) console.warn('[ForceLens] issue_emails write failed:', emailErr.message);
    }

    return data;
  }

  async function deleteIssue(id) {
    await ensureAuth();
    const { error } = await _sb.from('issues').delete().eq('id', id);
    if (error) throw error;
  }

  async function insertReply(issueId, text) {
    const user = await ensureAuth();
    const { data, error } = await _sb.from('replies').insert({
      issue_id:     issueId,
      author_id:    user.id,
      display_name: displayName(user.id),
      is_owner:     false,
      text
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteReply(replyId) {
    await ensureAuth();
    const { error } = await _sb.from('replies').delete().eq('id', replyId);
    if (error) throw error;
  }

  async function uploadScreenshot(base64DataUrl, issueId) {
    const user = await ensureAuth();
    const [meta, b64] = base64DataUrl.split(',');
    const mime = meta.match(/:(.*?);/)[1];
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });

    const ext = mime.split('/')[1] || 'png';
    const path = `${user.id}/${issueId}.${ext}`;

    const { error } = await _sb.storage
      .from('support-screenshots')
      .upload(path, blob, { upsert: true, contentType: mime });
    if (error) throw error;

    const { data } = _sb.storage.from('support-screenshots').getPublicUrl(path);
    return data.publicUrl;
  }

  function subscribeToFeed(onUpdate) {
    return _sb
      .channel('support-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' },  onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'replies' }, onUpdate)
      .subscribe();
  }


  let issues     = [];
  let currentUid = null;
  let attachedImageBase64 = null;
  let statsReady = false;

  const feedSearch    = document.getElementById('feed-search');
  const filterType    = document.getElementById('filter-type');
  const filterStatus  = document.getElementById('filter-status');
  const feedContainer = document.getElementById('support-feed');
  const formTypeInput = document.getElementById('form-type');
  const stepsGroup    = document.getElementById('steps-group');
  const dropzone         = document.getElementById('image-dropzone');
  const imageInput       = document.getElementById('image-input');
  const previewContainer = document.getElementById('image-preview-container');
  const previewImg       = document.getElementById('image-preview');
  const removeImageBtn   = document.getElementById('remove-image-btn');
  const submitBtn        = document.querySelector('#support-form button[type="submit"]');
  const statNums         = document.querySelectorAll('.support-stats-banner .stat-num');

  try {
    currentUid = (await ensureAuth()).id;
  } catch (e) {
    const msg = e.message || String(e);
    if (msg.includes('422') || msg.includes('Anonymous')) {
      showBanner('Anonymous sign-in is disabled on the backend. Enable it in Supabase → Authentication → Providers.', 'error');
    } else {
      showBanner('Could not connect: ' + msg, 'error');
    }
  }

  async function loadAndRender() {
    try {
      issues = await fetchIssues();
      statsReady = true;
      updateStats();
      renderFeed();
    } catch (e) {
      const msg = e.message || String(e);
      if (msg.includes('relation') || msg.includes('does not exist')) {
        showBanner('Database tables not found. Run the SQL migration in Supabase.', 'error');
      } else {
        showBanner('Failed to load reports: ' + msg, 'error');
      }
      statNums.forEach(n => { n.classList.remove('is-loading'); n.textContent = '—'; });
    }
  }

  await loadAndRender();

  subscribeToFeed(() => loadAndRender());

  document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      formTypeInput.value = tab.dataset.form;
      stepsGroup.style.display = tab.dataset.form === 'bug' ? 'flex' : 'none';
    });
  });

  dropzone?.addEventListener('click', () => imageInput?.click());
  dropzone?.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--brand-primary)';
  });
  dropzone?.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--border-default)';
  });
  dropzone?.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border-default)';
    if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
  });
  imageInput?.addEventListener('change', e => {
    if (e.target.files.length) handleImageFile(e.target.files[0]);
  });

  function handleImageFile(file) {
    if (!file?.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      attachedImageBase64 = e.target.result;
      previewImg.src = attachedImageBase64;
      dropzone.style.display = 'none';
      previewContainer.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  }

  removeImageBtn?.addEventListener('click', () => {
    attachedImageBase64 = null;
    imageInput.value = '';
    previewImg.src = '';
    previewContainer.style.display = 'none';
    dropzone.style.display = 'flex';
  });

  document.getElementById('support-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const type  = formTypeInput.value;
    const title = document.getElementById('form-title').value.trim();
    const desc  = document.getElementById('form-desc').value.trim();
    const steps = document.getElementById('form-steps').value.trim();
    const email = document.getElementById('form-email').value.trim();
    if (!title || !desc) return;

    setLoading(submitBtn, true);
    try {
      if (attachedImageBase64) {
        try {
          const tempIssue = await insertIssue({ type, title, description: desc, steps, email, imageUrl: null });
          const imageUrl = await uploadScreenshot(attachedImageBase64, tempIssue.id);
          await _sb.from('issues').update({ image_url: imageUrl }).eq('id', tempIssue.id);
        } catch (imgErr) {
          console.warn('[ForceLens] Image upload failed:', imgErr.message);
          await insertIssue({ type, title, description: desc, steps, email, imageUrl: null });
        }
      } else {
        await insertIssue({ type, title, description: desc, steps, email, imageUrl: null });
      }

      e.target.reset();
      attachedImageBase64 = null;
      previewContainer.style.display = 'none';
      dropzone.style.display = 'flex';
      showBanner('Your report was submitted! The community can now see it.', 'success');

      await loadAndRender();
    } catch (err) {
      showBanner('Submission failed: ' + err.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });

  function updateStats() {
    if (!statsReady) return;  
    const bugs    = issues.filter(i => i.type === 'bug');
    const fixed   = bugs.filter(i => i.status === 'fixed');
    const suggest = issues.filter(i => i.type === 'feature');
    const rate    = bugs.length ? Math.round((fixed.length / bugs.length) * 100) : 0;

    setStat('stat-total-bugs',  bugs.length);
    setStat('stat-fixed-bugs',  fixed.length);
    setStat('stat-suggestions', suggest.length);
    setStat('stat-rate',        rate + '%');
  }

  function setStat(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-loading');
    el.textContent = value;
  }

  feedSearch?.addEventListener('input', renderFeed);
  filterType?.addEventListener('change', renderFeed);
  filterStatus?.addEventListener('change', renderFeed);

  function renderFeed() {
    if (!feedContainer) return;
    feedContainer.innerHTML = '';

    const query  = (feedSearch?.value || '').toLowerCase();
    const type   = filterType?.value  || 'all';
    const status = filterStatus?.value || 'all';

    const filtered = issues.filter(i => {
      const matchSearch = i.title.toLowerCase().includes(query) || i.description.toLowerCase().includes(query);
      const matchType   = type   === 'all' || i.type   === type;
      const matchStatus = status === 'all' || i.status === status;
      return matchSearch && matchType && matchStatus;
    });

    if (!filtered.length) {
      feedContainer.innerHTML = `<div class="support-feed-empty">No matching reports found.</div>`;
      return;
    }

    filtered.forEach(item => renderCard(item));
  }

  function renderCard(item) {
    const isMyPost    = currentUid && item.author_id === currentUid;
    const typeLabel   = item.type === 'bug' ? 'Bug' : 'Suggestion';
    const statusMap   = { open: 'Open', fixed: 'Fixed', closed: 'Closed' };
    const statusLabel = statusMap[item.status] || item.status;
    const typeClass   = item.type === 'bug' ? 'type-tag-bug' : 'type-tag-feature';
    const statusClass = item.status === 'fixed' ? 'status-tag-fixed' : item.status === 'closed' ? 'status-tag-closed' : 'status-tag-open';

    const imgHtml = item.image_url
      ? `<div class="feed-item-attachment"><img src="${esc(item.image_url)}" class="attached-thumb" alt="Screenshot" title="Click to zoom"></div>`
      : '';

    const stepsHtml = item.type === 'bug' && item.steps
      ? `<div class="feed-item-steps"><div class="steps-label">Steps to reproduce</div><pre class="steps-content">${esc(item.steps)}</pre></div>`
      : '';

    const sortedReplies = (item.replies || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const commentsHtml = sortedReplies.map(r => {
      const cls     = r.is_owner ? 'comment-row comment-row-owner' : 'comment-row';
      const nameCls = r.is_owner ? 'comment-author-owner' : 'comment-author-user';
      const isMyReply = currentUid && r.author_id === currentUid;
      return `
        <div class="${cls}" data-reply-id="${r.id}">
          <div class="comment-meta">
            <span class="${nameCls}">${esc(r.display_name)}${r.is_owner ? ' <span class="owner-badge">Dev</span>' : ''}</span>
            <span>·</span>
            <span>${relTime(r.created_at)}</span>
            ${isMyReply ? `<button class="delete-reply-btn ghost-btn" data-rid="${r.id}" title="Delete reply">✕</button>` : ''}
          </div>
          <p class="comment-text">${esc(r.text)}</p>
        </div>`;
    }).join('');

    const deletePostBtn = isMyPost
      ? `<button class="delete-post-btn ghost-btn danger-btn" data-id="${item.id}" title="Delete your report">Delete my report</button>`
      : '';

    const statusDot = item.status !== 'open'
      ? `<span class="status-dot status-dot-${item.status}"></span>`
      : '';

    const card = document.createElement('div');
    card.className = 'feed-item';
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="feed-item-head">
        <div class="feed-item-meta">
          <span class="user-badge">${esc(item.display_name)}</span>
          <span>·</span>
          <span>${relTime(item.created_at)}</span>
        </div>
        <div class="feed-item-badges">
          <span class="type-tag ${typeClass}">${typeLabel}</span>
          <span class="status-tag ${statusClass}">${statusDot}${statusLabel}</span>
          ${deletePostBtn}
        </div>
      </div>
      <h4 class="feed-item-title">${esc(item.title)}</h4>
      <p class="feed-item-desc">${esc(item.description)}</p>
      ${stepsHtml}
      ${imgHtml}
      <div class="feed-item-comments">
        <div class="comments-header">Replies (${sortedReplies.length})</div>
        <div class="comments-list">${commentsHtml}</div>
        <div class="add-comment-row">
          <input type="text" class="add-comment-input" placeholder="Add a public comment...">
          <button class="comment-btn submit-reply-btn" data-id="${item.id}">Reply</button>
        </div>
      </div>`;

    card.querySelector('.attached-thumb')?.addEventListener('click', () => openLightbox(item.image_url));

    card.querySelector('.delete-post-btn')?.addEventListener('click', async () => {
      if (!confirm('Delete your report? This cannot be undone.')) return;
      try {
        await deleteIssue(item.id);
        card.remove();
        issues = issues.filter(i => i.id !== item.id);
        updateStats();
      } catch (err) {
        showBanner('Delete failed: ' + err.message, 'error');
      }
    });

    card.querySelectorAll('.delete-reply-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const rid = btn.dataset.rid;
        try {
          await deleteReply(rid);
          btn.closest('[data-reply-id]')?.remove();
        } catch (err) {
          showBanner('Could not delete reply: ' + err.message, 'error');
        }
      });
    });

    const replyInput = card.querySelector('.add-comment-input');
    card.querySelector('.submit-reply-btn')?.addEventListener('click', async () => {
      const text = (replyInput?.value || '').trim();
      if (!text) return;
      try {
        await insertReply(item.id, text);
        replyInput.value = '';
        // Show the reply immediately; realtime (if on) covers other users.
        await loadAndRender();
      } catch (err) {
        showBanner('Could not post reply: ' + err.message, 'error');
      }
    });

    replyInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        card.querySelector('.submit-reply-btn')?.click();
      }
    });

    feedContainer.appendChild(card);
  }

  const lightbox      = document.getElementById('support-lightbox');
  const lightboxImg   = document.getElementById('support-lightbox-img');
  const lightboxClose = document.getElementById('support-lightbox-close');

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
  }
  lightboxClose?.addEventListener('click', () => { lightbox.style.display = 'none'; });
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.style.display = 'none'; });

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function relTime(ts) {
    const ms = Date.now() - new Date(ts).getTime();
    const m = Math.floor(ms / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }

  function setLoading(btn, on) {
    if (!btn) return;
    btn.disabled = on;
    btn.textContent = on ? 'Submitting…' : 'Submit to Collaboration Board';
  }

  function showBanner(msg, type = 'info') {
    let banner = document.getElementById('support-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'support-banner';
      document.body.appendChild(banner);
    }
    const colors = {
      success: { bg: 'var(--status-success-bg)', border: 'var(--status-success-border)', color: 'var(--status-success-text)' },
      error:   { bg: 'var(--status-error-bg)',   border: 'var(--status-error-border)',   color: 'var(--status-error-text)' },
      info:    { bg: 'var(--status-info-bg)',     border: 'var(--status-info-border)',    color: 'var(--status-info-text)' }
    };
    const c = colors[type] || colors.info;
    banner.style.background = c.bg;
    banner.style.border     = `1px solid ${c.border}`;
    banner.style.color      = c.color;
    banner.style.opacity    = '1';
    banner.textContent      = msg;
    clearTimeout(banner._t);
    banner._t = setTimeout(() => { banner.style.opacity = '0'; }, 4000);
  }
  window.showBanner = showBanner;
});
