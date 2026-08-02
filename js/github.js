import { refreshIcons } from './icons.js';

export const REPOS_URL = 'https://api.github.com/users/a16zcrypt0/repos?sort=updated&per_page=6&type=public';

export const LANG_COLORS = {
  Solidity: '#363636', TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
  Vue: '#41b883', Dockerfile: '#384d54', Move: '#4a76a8', Cairo: '#ff4f00',
};

export const DEFAULT_LANG_COLOR = '#6b7280';
export const EMPTY_MESSAGE = 'No public repositories yet.';
export const ERROR_MESSAGE = 'Failed to load repositories.';

export function langColor(lang) {
  return LANG_COLORS[lang] || DEFAULT_LANG_COLOR;
}

export function formatUpdated(updatedAt) {
  return new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function normalizeRepo(repo) {
  return {
    name: repo.name,
    url: repo.html_url,
    lang: repo.language || 'Unknown',
    desc: repo.description || 'No description available.',
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    updated: formatUpdated(repo.updated_at),
  };
}

function iconSpan(name, text) {
  const span = document.createElement('span');
  span.className = 'flex items-center gap-1';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', name);
  icon.className = 'w-3 h-3';
  span.appendChild(icon);
  span.appendChild(document.createTextNode(String(text)));
  return span;
}

// Built with the DOM API — no innerHTML, all text via textContent (XSS-safe).
export function createRepoCard(repo) {
  const data = normalizeRepo(repo);

  const card = document.createElement('a');
  card.href = data.url;
  card.target = '_blank';
  card.rel = 'noopener';
  card.className = 'glass-card rounded-xl p-5 group';

  const header = document.createElement('div');
  header.className = 'flex items-center gap-2 mb-3';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', 'book');
  icon.className = 'w-4 h-4 shrink-0';
  icon.style.color = 'var(--accent)';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'text-sm font-medium group-hover:accent-text transition-colors truncate';
  nameSpan.style.color = 'var(--text-primary)';
  nameSpan.textContent = data.name;
  header.appendChild(icon);
  header.appendChild(nameSpan);

  const descP = document.createElement('p');
  descP.className = 'text-xs leading-relaxed line-clamp-2';
  descP.style.color = 'var(--text-secondary)';
  descP.textContent = data.desc;

  const meta = document.createElement('div');
  meta.className = 'flex items-center gap-4 mt-3 text-[10px] font-mono';
  meta.style.color = 'var(--text-secondary)';
  meta.style.opacity = '0.7';

  const langSpan = document.createElement('span');
  langSpan.className = 'flex items-center gap-1';
  const dot = document.createElement('span');
  dot.className = 'w-2 h-2 rounded-full';
  dot.style.background = langColor(data.lang);
  dot.style.display = 'inline-block';
  langSpan.appendChild(dot);
  langSpan.appendChild(document.createTextNode(data.lang));

  const dateSpan = document.createElement('span');
  dateSpan.style.marginLeft = 'auto';
  dateSpan.textContent = data.updated;

  meta.appendChild(langSpan);
  meta.appendChild(iconSpan('star', data.stars));
  meta.appendChild(iconSpan('git-fork', data.forks));
  meta.appendChild(dateSpan);

  card.appendChild(header);
  card.appendChild(descP);
  card.appendChild(meta);
  return card;
}

export function renderMessage(container, message) {
  container.textContent = '';
  const div = document.createElement('div');
  div.className = 'col-span-full text-center text-sm py-8';
  div.style.color = 'var(--text-secondary)';
  div.textContent = message;
  container.appendChild(div);
}

export function renderRepos(container, repos) {
  if (!container) return 0;
  if (!Array.isArray(repos) || repos.length === 0) {
    renderMessage(container, EMPTY_MESSAGE);
    return 0;
  }
  container.textContent = '';
  repos.forEach(repo => container.appendChild(createRepoCard(repo)));
  refreshIcons();
  return repos.length;
}

export function loadRepos(container = document.getElementById('github-repos')) {
  return fetch(REPOS_URL)
    .then(r => r.json())
    .then(repos => renderRepos(container, repos))
    .catch(() => {
      if (container) renderMessage(container, ERROR_MESSAGE);
      return 0;
    });
}
