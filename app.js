const USER = "masesk";
const API = "https://api.github.com";
const CACHE_KEY = `gh-cache:${USER}`;
const CACHE_TTL_MS = 10 * 60 * 1000;

// Repos that shouldn't be listed (e.g. this site itself).
const EXCLUDED = new Set([`${USER}.github.io`, `${USER}.github.com`].map((n) => n.toLowerCase()));

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  "Jupyter Notebook": "#DA5B0B",
  Lua: "#000080",
  CMake: "#DA3434",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  QML: "#44a51c",
  "Objective-C": "#438eff",
  Scala: "#c22d40",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  R: "#198CE7",
  MATLAB: "#e16737",
  Assembly: "#6E4C13",
  PowerShell: "#012456",
};

const ICONS = {
  repo: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.71 1.71.75.75 0 0 1-1.06 1.06A2.49 2.49 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.71A2.49 2.49 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.09a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>',
  fork: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 5.37v.88c0 .41.34.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.88a2.25 2.25 0 1 1 1.5 0v.88A2.25 2.25 0 0 1 10.25 8.5h-1.5v2.13a2.25 2.25 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.88a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>',
  star: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .67.42l1.88 3.81 4.2.61a.75.75 0 0 1 .42 1.28l-3.04 2.96.72 4.19a.75.75 0 0 1-1.09.79L8 12.34l-3.76 1.97a.75.75 0 0 1-1.09-.79l.72-4.19L.83 6.37a.75.75 0 0 1 .42-1.28l4.2-.61L7.33.67A.75.75 0 0 1 8 .25Z"/></svg>',
  clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.99l2.03 1.17a.75.75 0 1 1-.75 1.3l-2.4-1.38A.75.75 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"/></svg>',
  people: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5.5a3.5 3.5 0 1 1 5.9 2.54 5 5 0 0 1 2.97 4.53.75.75 0 0 1-1.5.07 3.5 3.5 0 0 0-6.98 0 .75.75 0 0 1-1.5-.07A5 5 0 0 1 3.86 8.04 3.49 3.49 0 0 1 2 5.5ZM11 4a3 3 0 0 1 1.84 5.37 4.5 4.5 0 0 1 2.66 4.08.75.75 0 0 1-1.5 0 3 3 0 0 0-2.1-2.86.75.75 0 0 1-.53-.71v-.35a.75.75 0 0 1 .4-.66A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>',
  location: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m12.6 11.2-3.4 3.4a1.75 1.75 0 0 1-2.4 0l-3.4-3.4a6 6 0 1 1 9.2 0ZM11.5 4.6a4.5 4.5 0 0 0-7 0 4.5 4.5 0 0 0 .1 5.5l3.4 3.4a.25.25 0 0 0 .3 0l3.4-3.4a4.5 4.5 0 0 0-.2-5.5ZM8 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>',
  link: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m7.78 3.22 1.25-1.25a3.5 3.5 0 0 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .75.75 0 0 1 1.06-1.06 2 2 0 0 0 2.83 0l2.5-2.5a2 2 0 0 0-2.83-2.83l-1.25 1.25a.75.75 0 0 1-1.06-1.06Zm-4.69 9.64a2 2 0 0 0 2.83 0l1.25-1.25a.75.75 0 0 1 1.06 1.06l-1.25 1.25a3.5 3.5 0 0 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .75.75 0 0 1-1.06 1.06 2 2 0 0 0-2.83 0l-2.5 2.5a2 2 0 0 0 0 2.83Z"/></svg>',
};

const $ = (id) => document.getElementById(id);

const els = {
  profile: $("profile"),
  avatar: $("avatar"),
  name: $("name"),
  bio: $("bio"),
  meta: $("meta"),
  search: $("search"),
  typeFilter: $("type-filter"),
  language: $("language"),
  sort: $("sort"),
  count: $("count"),
  repos: $("repos"),
};

const state = {
  repos: [],
  query: "",
  type: "all",
  language: "",
  sort: "stars",
};

// ---------- Utilities ----------

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);
}

const numberFormat = new Intl.NumberFormat("en", { notation: "compact" });
const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(dateString) {
  const seconds = (new Date(dateString) - Date.now()) / 1000;
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) return cached.data;
  } catch {
    // Storage unavailable or corrupt; fall through to network.
  }
  return null;
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
  } catch {
    // Ignore quota / privacy-mode errors.
  }
}

// ---------- Data ----------

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) {
    const error = new Error(`GitHub API responded with ${res.status}`);
    error.status = res.status;
    error.resetAt = Number(res.headers.get("x-ratelimit-reset")) * 1000 || null;
    throw error;
  }
  return { data: await res.json(), link: res.headers.get("link") };
}

async function fetchAllRepos() {
  const repos = [];
  let url = `${API}/users/${USER}/repos?per_page=100&type=owner&sort=updated`;
  while (url) {
    const { data, link } = await fetchJson(url);
    repos.push(...data);
    url = link?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
  }
  return repos;
}

async function loadData() {
  const cached = readCache();
  if (cached) return cached;

  const [{ data: user }, repos] = await Promise.all([
    fetchJson(`${API}/users/${USER}`),
    fetchAllRepos(),
  ]);

  // Keep only the fields we render to keep the cache small.
  const data = {
    user: {
      name: user.name,
      login: user.login,
      bio: user.bio,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      followers: user.followers,
      public_repos: user.public_repos,
      location: user.location,
      blog: user.blog,
    },
    repos: repos
      .filter((r) => !EXCLUDED.has(r.name.toLowerCase()))
      .map((r) => ({
        name: r.name,
        html_url: r.html_url,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        fork: r.fork,
        archived: r.archived,
        topics: r.topics ?? [],
        pushed_at: r.pushed_at,
      })),
  };

  writeCache(data);
  return data;
}

// ---------- Rendering ----------

function renderProfile(user) {
  if (user.name) {
    els.name.innerHTML = `${escapeHtml(user.name)}<small>@${escapeHtml(user.login)}</small>`;
  }
  els.bio.textContent = user.bio ?? "";
  els.avatar.src = `${user.avatar_url}&s=160`;
  els.avatar.alt = `${user.login}'s avatar`;

  const items = [
    `${ICONS.people}<span><strong>${numberFormat.format(user.followers)}</strong> followers</span>`,
    `${ICONS.repo}<span><strong>${user.public_repos}</strong> public repos</span>`,
  ];
  if (user.location) items.push(`${ICONS.location}<span>${escapeHtml(user.location)}</span>`);
  if (user.blog) {
    const href = /^https?:\/\//.test(user.blog) ? user.blog : `https://${user.blog}`;
    const label = user.blog.replace(/^https?:\/\//, "").replace(/\/$/, "");
    items.push(`${ICONS.link}<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`);
  }
  els.meta.innerHTML = items.map((html) => `<li>${html}</li>`).join("");
  els.profile.removeAttribute("aria-busy");
}

function renderLanguageOptions(repos) {
  const counts = new Map();
  for (const { language } of repos) {
    if (language) counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  const options = [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([lang, n]) => `<option value="${escapeHtml(lang)}">${escapeHtml(lang)} (${n})</option>`);
  els.language.insertAdjacentHTML("beforeend", options.join(""));
}

function repoCard(repo, index) {
  const color = LANGUAGE_COLORS[repo.language];
  const badges = [
    repo.fork && '<span class="badge">Fork</span>',
    repo.archived && '<span class="badge">Archived</span>',
  ].filter(Boolean).join("");

  const topics = repo.topics.length
    ? `<ul class="repo-topics">${repo.topics.slice(0, 5).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
    : "";

  const meta = [
    repo.language &&
      `<span><i class="lang-dot" style="${color ? `--lang-color:${color}` : ""}"></i>${escapeHtml(repo.language)}</span>`,
    repo.stars > 0 && `<span title="${repo.stars} stars">${ICONS.star}${numberFormat.format(repo.stars)}</span>`,
    repo.forks > 0 && `<span title="${repo.forks} forks">${ICONS.fork}${numberFormat.format(repo.forks)}</span>`,
    `<span title="Last pushed ${new Date(repo.pushed_at).toLocaleDateString()}">${ICONS.clock}Updated ${timeAgo(repo.pushed_at)}</span>`,
  ].filter(Boolean).join("");

  return `
    <li class="repo-card" style="animation-delay:${Math.min(index * 30, 300)}ms">
      <div class="repo-header">
        ${repo.fork ? ICONS.fork : ICONS.repo}
        <a class="repo-name" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener">${escapeHtml(repo.name)}</a>
        ${badges}
      </div>
      <p class="repo-desc${repo.description ? "" : " is-empty"}">${escapeHtml(repo.description || "No description provided.")}</p>
      ${topics}
      <div class="repo-meta">${meta}</div>
    </li>`;
}

const sorters = {
  stars: (a, b) => b.stars - a.stars || b.forks - a.forks || new Date(b.pushed_at) - new Date(a.pushed_at),
  updated: (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
  name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
};

function renderRepos() {
  const query = state.query.trim().toLowerCase();

  const visible = state.repos
    .filter((r) => state.type === "all" || (state.type === "forks" ? r.fork : !r.fork))
    .filter((r) => !state.language || r.language === state.language)
    .filter((r) =>
      !query ||
      r.name.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      r.topics.some((t) => t.includes(query)))
    .sort(sorters[state.sort]);

  els.count.textContent = `${visible.length} of ${state.repos.length} repositories`;
  els.repos.innerHTML = visible.length
    ? visible.map(repoCard).join("")
    : `<li class="state-message"><strong>No repositories match.</strong>Try a different search or filter.</li>`;
}

function renderSkeletons(count = 6) {
  const card = `
    <li class="repo-card is-skeleton" aria-hidden="true">
      <div class="skeleton-line" style="width:45%;height:16px"></div>
      <div class="skeleton-line" style="width:95%"></div>
      <div class="skeleton-line" style="width:70%"></div>
      <div class="skeleton-line" style="width:35%;margin-top:8px"></div>
    </li>`;
  els.repos.innerHTML = card.repeat(count);
}

function renderError(error) {
  const rateLimited = error.status === 403 || error.status === 429;
  const retry = rateLimited && error.resetAt
    ? ` Try again ${timeAgo(new Date(error.resetAt).toISOString())}.`
    : "";
  els.count.textContent = "";
  els.repos.innerHTML = `
    <li class="state-message">
      <strong>${rateLimited ? "GitHub rate limit reached." : "Couldn't load repositories."}</strong>
      ${rateLimited ? `The public API allows 60 requests per hour.${retry}` : escapeHtml(error.message)}
      <br />You can still browse them on <a href="https://github.com/${USER}?tab=repositories">GitHub</a>.
    </li>`;
}

// ---------- Events ----------

function bindControls() {
  els.search.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderRepos();
  });

  els.typeFilter.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-type]");
    if (!button) return;
    state.type = button.dataset.type;
    for (const b of els.typeFilter.querySelectorAll("button")) {
      b.setAttribute("aria-pressed", String(b === button));
    }
    renderRepos();
  });

  els.language.addEventListener("change", (e) => {
    state.language = e.target.value;
    renderRepos();
  });

  els.sort.addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderRepos();
  });

  // "/" focuses search, like on GitHub.
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== els.search && !e.target.closest("input, select, textarea")) {
      e.preventDefault();
      els.search.focus();
    }
  });
}

// ---------- Init ----------

async function init() {
  bindControls();
  renderSkeletons();

  try {
    const { user, repos } = await loadData();
    state.repos = repos;
    renderProfile(user);
    renderLanguageOptions(repos);
    renderRepos();
  } catch (error) {
    console.error(error);
    renderError(error);
  } finally {
    els.repos.removeAttribute("aria-busy");
  }
}

init();
