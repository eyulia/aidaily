// ── ROUTER ──────────────────────────────────────────────────────────────────

const Router = {
  currentPage: 'home',
  currentDigest: null,

  init() {
    this.handleHash();
    window.addEventListener('hashchange', () => this.handleHash());
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        window.location.hash = el.dataset.nav;
      });
    });
  },

  handleHash() {
    const hash = window.location.hash.replace('#', '') || 'home';

    // digest detail: #digest/28
    if (hash.startsWith('digest/')) {
      const day = parseInt(hash.split('/')[1]);
      this.showDigestDetail(day);
      return;
    }

    const pages = ['home', 'digests', 'glossary', 'progress'];
    if (pages.includes(hash)) {
      this.showPage(hash);
    } else {
      this.showPage('home');
    }
  },

  showPage(id) {
    this.currentPage = id;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + id);
    if (page) {
      page.classList.add('active');
      window.scrollTo(0, 0);
    }

    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === id);
    });
  },

  showDigestDetail(day) {
    const digest = SITE_DATA.digests.find(d => d.day === day);
    if (!digest) { this.showPage('home'); return; }

    this.currentDigest = digest;
    DigestDetail.render(digest);
    this.showPage('digest-detail');
    window.scrollTo(0, 0);

    document.querySelectorAll('[data-nav]').forEach(el => el.classList.remove('active'));
  }
};

// ── HOME ─────────────────────────────────────────────────────────────────────

const Home = {
  init() {
    this.renderStats();
    this.renderRecent();
  },

  renderStats() {
    const totalConcepts = SITE_DATA.digests.reduce((n, d) => n + d.concepts.length, 0);
    document.getElementById('stat-sessions').textContent = SITE_DATA.digests.length;
    document.getElementById('stat-concepts').textContent = totalConcepts;
    document.getElementById('stat-usecases').textContent = SITE_DATA.digests.length;
  },

  renderRecent() {
    const recent = SITE_DATA.digests.slice(0, 5);
    const container = document.getElementById('recent-digests');
    container.innerHTML = recent.map(d => DigestCard.render(d)).join('');
    container.querySelectorAll('.digest-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.hash = 'digest/' + card.dataset.day;
      });
    });
  }
};

// ── DIGEST CARD ───────────────────────────────────────────────────────────────

const DigestCard = {
  render(d) {
    const tags = d.concepts.map(c => `<span class="tag">${c}</span>`).join('');
    const topicTag = `<span class="tag tag-topic">${d.topic}</span>`;
    return `
      <div class="digest-card" data-day="${d.day}">
        <div class="day-badge">Day ${d.day}</div>
        <div class="card-content">
          <div class="card-date">${d.date}</div>
          <div class="card-title">${d.title}</div>
          <div class="card-tags">${tags}${topicTag}</div>
        </div>
      </div>
    `;
  }
};

// ── DIGESTS LIST ──────────────────────────────────────────────────────────────

const DigestsList = {
  allDigests: [],

  init() {
    this.allDigests = [...SITE_DATA.digests];
    this.populateTopicFilter();
    this.render(this.allDigests);

    document.getElementById('digests-search').addEventListener('input', () => this.filter());
    document.getElementById('digests-topic').addEventListener('change', () => this.filter());
  },

  populateTopicFilter() {
    const sel = document.getElementById('digests-topic');
    SITE_DATA.topics.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      sel.appendChild(opt);
    });
  },

  filter() {
    const q = document.getElementById('digests-search').value.toLowerCase().trim();
    const topic = document.getElementById('digests-topic').value;

    const filtered = this.allDigests.filter(d => {
      const matchQ = !q ||
        d.title.toLowerCase().includes(q) ||
        d.concepts.some(c => c.toLowerCase().includes(q)) ||
        d.summary.toLowerCase().includes(q) ||
        String(d.day) === q;
      const matchT = !topic || d.topic === topic;
      return matchQ && matchT;
    });

    this.render(filtered);
  },

  render(list) {
    const container = document.getElementById('digest-list');
    if (!list.length) {
      container.innerHTML = '<div class="no-results">No digests match your search. Try a different keyword.</div>';
      return;
    }
    container.innerHTML = list.map(d => DigestCard.render(d)).join('');
    container.querySelectorAll('.digest-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.hash = 'digest/' + card.dataset.day;
      });
    });
  }
};

// ── DIGEST DETAIL ─────────────────────────────────────────────────────────────

const DigestDetail = {
  render(d) {
    const glossaryMap = {};
    SITE_DATA.glossary.forEach(g => { glossaryMap[g.term] = g; });

    const conceptsHtml = d.concepts.map(name => {
      const entry = glossaryMap[name] || {};
      const def = entry.def || 'Definition coming soon.';
      return `
        <div class="concept-block">
          <div class="concept-name">${name}</div>
          <div class="concept-def">${def}</div>
        </div>
      `;
    }).join('');

    document.getElementById('digest-detail-content').innerHTML = `
      <a class="back-link" href="#digests">← Back to all digests</a>
      <div class="detail-header">
        <div class="detail-day">Day ${d.day} · ${d.topic}</div>
        <h1 class="detail-title">${d.title}</h1>
        <div class="detail-meta">${d.date}</div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">Summary</div>
        <p style="font-size:15px; color:var(--muted); line-height:1.75;">${d.summary}</p>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">Concepts covered</div>
        ${conceptsHtml}
      </div>

      <div class="detail-section">
        <div class="detail-section-title">Business use case</div>
        <div class="use-case-block">
          <div class="use-case-label">Applied insight</div>
          <div class="use-case-text">${d.useCase}</div>
        </div>
      </div>
    `;

    document.getElementById('digest-detail-content').querySelector('.back-link')
      .addEventListener('click', e => {
        e.preventDefault();
        window.location.hash = 'digests';
      });
  }
};

// ── GLOSSARY ──────────────────────────────────────────────────────────────────

const Glossary = {
  init() {
    const sorted = [...SITE_DATA.glossary].sort((a, b) => a.term.localeCompare(b.term));
    const letters = [...new Set(sorted.map(t => t.term[0].toUpperCase()))];

    // Alpha nav
    const alphaNav = document.getElementById('alpha-nav');
    alphaNav.innerHTML = letters.map(l =>
      `<a class="alpha-btn" href="#glossary-${l}">${l}</a>`
    ).join('');

    // Content
    const content = document.getElementById('glossary-content');
    content.innerHTML = letters.map(l => {
      const items = sorted.filter(t => t.term[0].toUpperCase() === l);
      return `
        <div class="glossary-letter-section" id="glossary-${l}">
          <div class="glossary-letter">${l}</div>
          <div class="glossary-items">
            ${items.map(t => `
              <div class="glossary-item">
                <span class="glossary-term">${t.term}</span>
                <span class="glossary-def">${t.def}</span>
                <a class="day-ref" href="#digest/${t.day}" data-day="${t.day}">Day ${t.day}</a>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Wire up day links in glossary
    content.querySelectorAll('[data-day]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        window.location.hash = 'digest/' + link.dataset.day;
      });
    });
  }
};

// ── PROGRESS ──────────────────────────────────────────────────────────────────

const Progress = {
  init() {
    const total = SITE_DATA.digests.length;
    const TARGET = 50;
    const pct = Math.round((total / TARGET) * 100);

    document.getElementById('progress-sessions').textContent = total;
    document.getElementById('progress-bar').style.width = pct + '%';

    // Category breakdown
    const catCounts = {};
    SITE_DATA.digests.forEach(d => {
      catCounts[d.topic] = (catCounts[d.topic] || 0) + 1;
    });

    const maxCat = Math.max(...Object.values(catCounts));
    const catContainer = document.getElementById('category-breakdown');
    catContainer.innerHTML = SITE_DATA.topics.map(topic => {
      const count = catCounts[topic] || 0;
      const pct = Math.round((count / maxCat) * 100);
      return `
        <div class="category-row">
          <span class="cat-label">${topic}</span>
          <div class="cat-bar-bg"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
          <span class="cat-count">${count}</span>
        </div>
      `;
    }).join('');

    // Streak dots
    const TARGET_DOTS = 35;
    const dots = document.getElementById('streak-dots');
    dots.innerHTML = Array.from({ length: TARGET_DOTS }, (_, i) =>
      `<div class="streak-dot ${i < total ? 'done' : ''}"></div>`
    ).join('');
  }
};

// ── INIT ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  Home.init();
  DigestsList.init();
  Glossary.init();
  Progress.init();
  Router.init();
});
