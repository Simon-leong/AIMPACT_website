const header = document.querySelector('.site-header');
const progress = document.querySelector('.reading-progress span');

function updateScrollUI() {
  const top = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('scrolled', top > 16);
  progress.style.width = `${max > 0 ? (top / max) * 100 : 0}%`;
}

updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('.button.is-placeholder').forEach((button) => {
  button.addEventListener('click', (event) => event.preventDefault());
});

const datasetCaseList = document.querySelector('#dataset-cases');
const scoreFields = [
  ['score_language', 'Language'],
  ['score_vocal_pronunciation', 'Pronunciation'],
  ['score_vocal_volume_pace', 'Volume & pace'],
  ['score_vocal_fluency', 'Fluency'],
  ['score_nonvocal', 'Non-vocal'],
  ['score_visuals_design', 'Visual design'],
  ['score_visuals_techniques_sync', 'Visual sync'],
  ['score_visuals_techniques_reference', 'Visual reference']
];
const scoreTones = ['#2563eb', '#7c3aed', '#0891b2', '#0d9488', '#4f46e5', '#6366f1', '#0284c7', '#8b5cf6'];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function scoreRow(label, score, tone) {
  const numericScore = Number(score) || 0;
  const cells = Array.from({ length: 5 }, (_, index) => `<b class="${index < numericScore ? 'is-filled' : ''}" style="--tone: ${tone}"></b>`).join('');
  return `<div style="--tone: ${tone}"><span>${escapeHtml(label)}</span><i aria-hidden="true">${cells}</i><strong>${numericScore}</strong></div>`;
}

const caseTitles = {
  'VID-003': 'CALLME: Context-Aware Language Learning with Multimodal Enhancement',
  'VID-004': 'Human-AI Songwriter: Co-Creative Music Application for Students\' Mental Wellness',
  'VID-008': 'DubMaster: An LLM-Driven Unified Framework for Multimodal Emotional Text-to-Speech Synthesis',
  'VID-014': 'Symbolic Music Generation from Graph-Learning-Based Preference Modeling and Textual Queries',
  'VID-016': 'Jukebox: A Generative Model for Music',
  'VID-018': 'End-to-End Real-World Polyphonic Piano Audio-to-Score Transcription with Hierarchical Decoding',
  'VID-020': 'Real-Time Musical Mode Detection with Adaptive Tonic Weighting and Harmonic Context',
  'VID-021': 'Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech',
  'VID-022': 'FastSpeech: Fast, Robust and Controllable Text to Speech',
  'VID-023': 'Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech',
  'VID-024': 'VALL-E: Neural Codec LM are Zero-Shot TTS Synthesizers',
  'VID-025': 'XAI-Lyricist: Improving the Singability of AI-Generated Lyrics with Prosody Explanations',
  'VID-027': 'Audio LM',
  'VID-028': 'Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech',
  'VID-034': 'End-to-End Real-World Polyphonic Piano Audio-to-Score Transcription with Hierarchical Decoding'
};

function caseTitle(videoId) {
  return caseTitles[videoId] || 'Multimodal presentation assessment';
}

function datasetCard(annotation) {
  const videoId = escapeHtml(annotation.video_id);
  const fileName = `${encodeURIComponent(annotation.video_id)}.mp4?v=20260927-fast`;
  const rows = scoreFields.map(([field, label], fieldIndex) => scoreRow(label, annotation[field], scoreTones[fieldIndex])).join('');
  const title = escapeHtml(caseTitle(annotation.video_id));
  return `<article class="case-card reveal">
    <div class="case-video is-real">
      <video preload="none" poster="posters/${encodeURIComponent(annotation.video_id)}.jpg" playsinline aria-label="Annotated presentation recording ${videoId}" src="videos/compressed/${fileName}"></video>
      <div class="video-controls" role="group" aria-label="Video controls">
        <button class="video-control video-toggle" type="button" aria-label="Play video"><span aria-hidden="true">▶</span></button>
        <span class="video-time" aria-live="off">0:00 / 0:00</span>
        <input class="video-progress" type="range" min="0" max="100" value="0" step="0.1" aria-label="Video progress">
        <button class="video-control video-volume" type="button" aria-label="Mute video"><span aria-hidden="true">🔊</span></button>
        <button class="video-control video-fullscreen" type="button" aria-label="Enter fullscreen"><span aria-hidden="true">⛶</span></button>
      </div>
    </div>
    <div class="case-content">
      <div class="case-title"><h4>${title}</h4></div>
      <div class="score-list" aria-label="Dimension scores out of 5">${rows}</div>
      <div class="overall-score"><span>Overall score</span><strong>${Number(annotation.overall_score) || 0}/5</strong></div>
    </div>
  </article>`;
}

function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function setupVideoControls(root) {
  root.querySelectorAll('.case-video.is-real').forEach((frame) => {
    const video = frame.querySelector('video');
    const toggle = frame.querySelector('.video-toggle');
    const progress = frame.querySelector('.video-progress');
    const time = frame.querySelector('.video-time');
    const volume = frame.querySelector('.video-volume');
    const fullscreen = frame.querySelector('.video-fullscreen');

    if (!video || !toggle || !progress || !time || !volume || !fullscreen) return;

    const update = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      progress.value = duration ? String((video.currentTime / duration) * 100) : '0';
      time.textContent = `${formatVideoTime(video.currentTime)} / ${formatVideoTime(duration)}`;
      toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      toggle.querySelector('span').textContent = video.paused ? '▶' : '❚❚';
      volume.querySelector('span').textContent = video.muted ? '🔇' : '🔊';
      volume.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    };

    toggle.addEventListener('click', () => {
      if (video.paused) void video.play().catch(() => {});
      else video.pause();
    });

    video.addEventListener('click', () => toggle.click());
    video.addEventListener('loadedmetadata', update);
    video.addEventListener('timeupdate', update);
    video.addEventListener('play', update);
    video.addEventListener('pause', update);
    video.addEventListener('volumechange', update);

    progress.addEventListener('input', () => {
      if (Number.isFinite(video.duration)) video.currentTime = (Number(progress.value) / 100) * video.duration;
    });

    volume.addEventListener('click', () => {
      video.muted = !video.muted;
      update();
    });

    fullscreen.addEventListener('click', () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else if (frame.requestFullscreen) void frame.requestFullscreen();
    });

    update();
  });
}

async function loadDatasetAnnotations() {
  if (!datasetCaseList) return;
  try {
    // Prefer inlined data (data.js) so cards render without a same-origin fetch,
    // which is blocked inside the 4open.science anonymized sandbox. Fetch is a fallback.
    const annotations = window.__ANNOTATIONS__ || await (async () => {
      const response = await fetch('videos/annotations_selected.json?v=20260927-masked4', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load annotations (${response.status})`);
      return response.json();
    })();
    const ordered = [...annotations].sort((a, b) => String(a.video_id).localeCompare(String(b.video_id), undefined, { numeric: true }));
    datasetCaseList.innerHTML = ordered.map(datasetCard).join('');
    datasetCaseList.setAttribute('aria-busy', 'false');
    datasetCaseList.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
    setupVideoControls(datasetCaseList);
  } catch (error) {
    datasetCaseList.setAttribute('aria-busy', 'false');
    datasetCaseList.innerHTML = '<p class="dataset-load-error">The selected annotations could not be loaded in this preview.</p>';
    console.error(error);
  }
}

loadDatasetAnnotations();

/* ---------- Experiments: per-presentation method comparison cards ---------- */

const experimentCaseList = document.querySelector('#experiment-cases');
const experimentTones = ['#2563eb', '#7c3aed', '#0891b2', '#0d9488', '#4f46e5', '#6366f1', '#0284c7'];

function experimentScoreRow(label, score, tone) {
  const numericScore = Number(score) || 0;
  const cells = Array.from({ length: 5 }, (_, index) =>
    `<b class="${index < Math.round(numericScore) ? 'is-filled' : ''}" style="--tone: ${tone}"></b>`).join('');
  return `<div style="--tone: ${tone}"><span>${escapeHtml(label)}</span><i aria-hidden="true">${cells}</i><strong>${numericScore.toFixed(1)}</strong></div>`;
}

const defaultMethod = 'AIMPACT (ours)';

function methodTabClass(method) {
  if (method === defaultMethod) return ' is-ours';
  if (method === 'Expert consensus') return ' is-expert';
  return '';
}

// Per-dimension written feedback, shown only for our own method.
// Rendered as an overlay so opening it never stretches the card itself.
function feedbackBlock(feedback, videoId) {
  if (!Array.isArray(feedback) || !feedback.length) return '';
  const items = feedback.map((entry, index) => `<li style="--tone: ${experimentTones[index] || experimentTones[0]}">
        <b>${escapeHtml(entry.dimension)}<em>${escapeHtml(entry.score)}</em></b>
        <span>${escapeHtml(entry.text)}</span>
      </li>`).join('');
  const id = `feedback-${escapeHtml(videoId)}`;
  return `<div class="feedback-block">
      <button type="button" class="feedback-toggle" aria-expanded="false" aria-controls="${id}">
        <span>Per-dimension feedback</span><i aria-hidden="true"></i>
      </button>
      <div class="feedback-pop" id="${id}" role="group" aria-label="AIMPACT written feedback for presentation ${escapeHtml(videoId)}" hidden>
        <div class="feedback-pop-head">
          <b>Per-dimension feedback</b>
          <button type="button" class="feedback-close" aria-label="Close feedback">&times;</button>
        </div>
        <ul class="feedback-list">${items}</ul>
      </div>
    </div>`;
}

function experimentPanel(dimensions, scores, method, defaultMethodInList, feedback, videoId) {
  const rows = dimensions.map((label, i) => experimentScoreRow(label, scores[i], experimentTones[i])).join('');
  const overall = Number(scores[dimensions.length]) || 0;
  const active = method === defaultMethodInList;
  const notes = method === defaultMethod ? feedbackBlock(feedback, videoId) : '';
  return `<div class="method-panel${active ? ' is-active' : ''}" data-method="${escapeHtml(method)}" role="tabpanel" aria-label="${escapeHtml(method)} scores" aria-hidden="${!active}">
      <div class="score-list" aria-label="Dimension scores out of 5">${rows}</div>
      <div class="overall-score"><span>Overall score</span><strong>${overall.toFixed(1)}/5</strong></div>
      ${notes}
    </div>`;
}

// Tab rows are grouped explicitly (3 rows, each sized to fit on one line)
// so the menu never reflows into an unplanned extra row with a lopsided gap.
const methodRows = [
  ['Expert consensus', 'AIMPACT (ours)', 'Gemini-3.1-Pro'],
  ['Xiaomi-MiMo-v2.5', 'MiniCPM-o-4.5', 'MiniCPM-o-2.6'],
  ['Qwen3-Omni-Thinking', 'Qwen3-Omni-Instruct']
];

function experimentCard(videoId, methods, dimensions, table, feedback) {
  const videoFileId = `VID-${String(videoId).padStart(3, '0')}`;
  const title = escapeHtml(caseTitle(videoFileId));
  const ordered = methodRows.flat().filter((method) => methods.includes(method));
  const defaultMethodInList = ordered.includes(defaultMethod) ? defaultMethod : ordered[0];
  const tabs = methodRows
    .map((row) => {
      const buttons = row
        .filter((method) => methods.includes(method))
        .map((method) => {
          const active = method === defaultMethodInList;
          return `<button type="button" class="method-tab${methodTabClass(method)}${active ? ' is-active' : ''}" role="tab" data-method="${escapeHtml(method)}" aria-selected="${active}">${escapeHtml(method)}</button>`;
        })
        .join('');
      return buttons ? `<div class="method-tab-row">${buttons}</div>` : '';
    })
    .join('');
  const panels = ordered.map((method) => experimentPanel(dimensions, table[method] || [], method, defaultMethodInList, feedback, videoId)).join('');
  return `<article class="experiment-case reveal">
    <div class="case-video is-real">
      <video preload="none" poster="posters/${videoFileId}.jpg" playsinline aria-label="Presentation ${escapeHtml(videoId)} recording" src="videos/compressed/${videoFileId}.mp4?v=20260927-fast"></video>
      <div class="video-controls" role="group" aria-label="Video controls">
        <button class="video-control video-toggle" type="button" aria-label="Play video"><span aria-hidden="true">▶</span></button>
        <span class="video-time" aria-live="off">0:00 / 0:00</span>
        <input class="video-progress" type="range" min="0" max="100" value="0" step="0.1" aria-label="Video progress">
        <button class="video-control video-volume" type="button" aria-label="Mute video"><span aria-hidden="true">🔊</span></button>
        <button class="video-control video-fullscreen" type="button" aria-label="Enter fullscreen"><span aria-hidden="true">⛶</span></button>
      </div>
    </div>
    <div class="case-content">
      <div class="case-title"><h4>${title}</h4></div>
      <div class="method-tabs" role="tablist" aria-label="Assessment method">${tabs}</div>
      <div class="method-panels">${panels}</div>
    </div>
  </article>`;
}

function closeFeedback(block) {
  const toggle = block.querySelector('.feedback-toggle');
  const pop = block.querySelector('.feedback-pop');
  if (!toggle || !pop) return;
  block.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  const card = block.closest('.experiment-case');
  // Keep it in the a11y tree only while visible; wait out the fade first.
  window.setTimeout(() => {
    if (block.classList.contains('is-open')) return;
    pop.hidden = true;
    if (card && !card.querySelector('.feedback-block.is-open')) card.classList.remove('has-open-feedback');
  }, 220);
}

function closeAllFeedback(root, except) {
  root.querySelectorAll('.feedback-block.is-open').forEach((block) => {
    if (block !== except) closeFeedback(block);
  });
}

function setupFeedbackPops(root) {
  root.querySelectorAll('.feedback-block').forEach((block) => {
    const toggle = block.querySelector('.feedback-toggle');
    const pop = block.querySelector('.feedback-pop');
    const close = block.querySelector('.feedback-close');
    if (!toggle || !pop) return;

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = block.classList.contains('is-open');
      if (open) {
        closeFeedback(block);
        return;
      }
      closeAllFeedback(root, block);
      pop.hidden = false;
      // Next frame so the transition runs from the hidden state.
      requestAnimationFrame(() => {
        block.classList.add('is-open');
        block.closest('.experiment-case')?.classList.add('has-open-feedback');
      });
      toggle.setAttribute('aria-expanded', 'true');
    });

    if (close) close.addEventListener('click', () => { closeFeedback(block); toggle.focus(); });
    pop.addEventListener('click', (event) => event.stopPropagation());
  });

  document.addEventListener('click', () => closeAllFeedback(root));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = root.querySelector('.feedback-block.is-open');
    if (!open) return;
    closeFeedback(open);
    open.querySelector('.feedback-toggle')?.focus();
  });
}

function setupMethodTabs(root) {
  root.querySelectorAll('.experiment-case').forEach((card) => {
    const tabs = card.querySelectorAll('.method-tab');
    const panels = card.querySelectorAll('.method-panel');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('is-active')) return;
        tabs.forEach((other) => {
          const active = other === tab;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-selected', String(active));
        });
        panels.forEach((panel) => {
          const active = panel.dataset.method === tab.dataset.method;
          panel.classList.toggle('is-active', active);
          panel.setAttribute('aria-hidden', String(!active));
          if (!active) panel.querySelectorAll('.feedback-block.is-open').forEach(closeFeedback);
        });
      });
    });
  });
}

async function loadExperimentScores() {
  if (!experimentCaseList) return;
  try {
    const data = window.__EXPERIMENTS__ || await (async () => {
      const response = await fetch('experiments_scores.json?v=2', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load experiment scores (${response.status})`);
      return response.json();
    })();
    const feedback = data.feedback || {};
    const ids = Object.keys(data.presentations).sort((a, b) => Number(a) - Number(b));
    experimentCaseList.innerHTML = ids
      .map((id) => experimentCard(id, data.methods, data.dimensions, data.presentations[id], feedback[id]))
      .join('');
    experimentCaseList.setAttribute('aria-busy', 'false');
    experimentCaseList.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
    setupVideoControls(experimentCaseList);
    setupMethodTabs(experimentCaseList);
    setupFeedbackPops(experimentCaseList);
  } catch (error) {
    experimentCaseList.setAttribute('aria-busy', 'false');
    experimentCaseList.innerHTML = '<p class="dataset-load-error">The experiment scores could not be loaded in this preview.</p>';
    console.error(error);
  }
}

loadExperimentScores();
