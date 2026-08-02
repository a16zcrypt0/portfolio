import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DEFAULT_LANG_COLOR, EMPTY_MESSAGE, ERROR_MESSAGE, LANG_COLORS, REPOS_URL,
  langColor, formatUpdated, normalizeRepo, createRepoCard, renderRepos, loadRepos,
} from '../js/github.js';

const REPO = {
  name: 'defi-scanner',
  html_url: 'https://github.com/a16zcrypt0/defi-scanner',
  language: 'Solidity',
  description: 'Static analysis for lending protocols',
  stargazers_count: 12,
  forks_count: 3,
  updated_at: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
  document.body.innerHTML = '<div id="github-repos"></div>';
  globalThis.lucide = { createIcons: vi.fn() };
});

afterEach(() => vi.unstubAllGlobals());

const container = () => document.getElementById('github-repos');

describe('langColor', () => {
  it('returns the known language color', () => {
    expect(langColor('TypeScript')).toBe(LANG_COLORS.TypeScript);
  });

  it('falls back to grey for unknown languages', () => {
    expect(langColor('Brainfuck')).toBe(DEFAULT_LANG_COLOR);
    expect(langColor(undefined)).toBe(DEFAULT_LANG_COLOR);
  });
});

describe('formatUpdated', () => {
  it('formats an ISO timestamp as a short US date', () => {
    expect(formatUpdated('2026-01-15T10:00:00Z')).toBe('Jan 15, 2026');
  });
});

describe('normalizeRepo', () => {
  it('maps API fields to view data', () => {
    expect(normalizeRepo(REPO)).toEqual({
      name: 'defi-scanner',
      url: REPO.html_url,
      lang: 'Solidity',
      desc: REPO.description,
      stars: 12,
      forks: 3,
      updated: 'Jan 15, 2026',
    });
  });

  it('fills defaults for missing language, description, stars and forks', () => {
    const sparse = normalizeRepo({ name: 'x', html_url: 'u', updated_at: '2026-01-15T10:00:00Z' });
    expect(sparse.lang).toBe('Unknown');
    expect(sparse.desc).toBe('No description available.');
    expect(sparse.stars).toBe(0);
    expect(sparse.forks).toBe(0);
  });
});

describe('createRepoCard', () => {
  it('builds a link card with the repo metadata', () => {
    const card = createRepoCard(REPO);

    expect(card.tagName).toBe('A');
    expect(card.href).toBe(REPO.html_url);
    expect(card.rel).toBe('noopener');
    expect(card.textContent).toContain('defi-scanner');
    expect(card.textContent).toContain('Static analysis for lending protocols');
    expect(card.textContent).toContain('Solidity');
    expect(card.textContent).toContain('12');
    expect(card.textContent).toContain('Jan 15, 2026');
    expect(card.querySelector('.w-2.h-2').style.background).toBe('rgb(54, 54, 54)');
  });

  it('escapes hostile repo fields instead of injecting HTML', () => {
    const card = createRepoCard({
      ...REPO,
      name: '<img src=x onerror=alert(1)>',
      description: '<script>alert(2)</script>',
    });

    expect(card.querySelector('img')).toBeNull();
    expect(card.querySelector('script')).toBeNull();
    expect(card.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});

describe('renderRepos', () => {
  it('renders one card per repo and refreshes icons', () => {
    expect(renderRepos(container(), [REPO, { ...REPO, name: 'second' }])).toBe(2);

    expect(container().querySelectorAll('a')).toHaveLength(2);
    expect(globalThis.lucide.createIcons).toHaveBeenCalled();
  });

  it('replaces previous content on re-render', () => {
    container().innerHTML = '<span>stale</span>';
    renderRepos(container(), [REPO]);
    expect(container().textContent).not.toContain('stale');
  });

  it('shows the empty state for an empty list or a non-array payload', () => {
    expect(renderRepos(container(), [])).toBe(0);
    expect(container().textContent).toBe(EMPTY_MESSAGE);

    expect(renderRepos(container(), { message: 'rate limited' })).toBe(0);
    expect(container().textContent).toBe(EMPTY_MESSAGE);
  });

  it('is a no-op without a container', () => {
    expect(renderRepos(null, [REPO])).toBe(0);
  });
});

describe('loadRepos', () => {
  it('fetches the public repos and renders them', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [REPO] }));

    await expect(loadRepos(container())).resolves.toBe(1);

    expect(globalThis.fetch).toHaveBeenCalledWith(REPOS_URL);
    expect(container().querySelectorAll('a')).toHaveLength(1);
  });

  it('shows the error state when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(loadRepos(container())).resolves.toBe(0);
    expect(container().textContent).toBe(ERROR_MESSAGE);
  });

  it('defaults to the #github-repos container', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [REPO] }));

    await loadRepos();

    expect(container().querySelectorAll('a')).toHaveLength(1);
  });
});
