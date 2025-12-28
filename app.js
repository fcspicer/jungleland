const showUrl = "https://open.spotify.com/show/1IDuMMnrRNRwuI9v4rtfE7";
const accentColor = "#7ef9ff";

const state = {
  episodes: [],
  filtered: [],
  query: "",
  season: "all"
};

const elements = {
  latestContainer: document.querySelector("[data-latest]")
};

document.documentElement.style.setProperty("--accent", accentColor);

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const sortEpisodes = (episodes) =>
  [...episodes].sort((a, b) => new Date(b.date) - new Date(a.date));

const renderLatestEpisode = (episode) => {
  if (!elements.latestContainer || !episode) return;
  const embedMarkup = episode.embedUrl
    ? `<iframe title="Spotify episode player" src="${episode.embedUrl}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`
    : "";

  elements.latestContainer.innerHTML = `
    <div class="latest-card">
      <div>
        <p class="eyebrow">Latest episode</p>
        <h2>${episode.title}</h2>
        <p class="meta">${formatDate(episode.date)}${episode.duration ? ` · ${episode.duration}` : ""}</p>
        <p class="description">${episode.description}</p>
        <div class="actions">
          <a class="btn btn-primary" href="${episode.spotifyUrl}" target="_blank" rel="noreferrer">Play on Spotify</a>
          <a class="btn btn-outline" href="#episodes">View all episodes</a>
        </div>
      </div>
      <div class="latest-embed">
        ${embedMarkup || `<div class="placeholder-embed">Spotify embed available when an episode embed URL is provided.</div>`}
      </div>
    </div>
  `;
};

const renderEpisodes = (episodes) => {
  const list = document.querySelector("[data-episode-list]");
  const count = document.querySelector("[data-episode-count]");

  if (!list) return;
  list.innerHTML = episodes
    .map(
      (episode) => `
      <article class="episode-row" tabindex="0">
        <div class="meta">${formatDate(episode.date)}</div>
        <div>
          <p class="eyebrow">${episode.season || "Episode"}</p>
          <h3>${episode.title}</h3>
          <p class="description">${episode.description}</p>
        </div>
        <div class="meta">${episode.duration || "—"}</div>
      <article class="episode-card" tabindex="0">
        <div>
          <p class="eyebrow">${episode.season || "Episode"}</p>
          <h3>${episode.title}</h3>
          <p class="meta">${formatDate(episode.date)}${episode.duration ? ` · ${episode.duration}` : ""}</p>
          <p class="description">${episode.description}</p>
        </div>
        <div class="episode-actions">
          <a class="btn btn-outline" href="${episode.spotifyUrl}" target="_blank" rel="noreferrer">Play</a>
        </div>
      </article>
    `
    )
    .join("");

  if (count) {
    count.textContent = `${episodes.length} episode${episodes.length === 1 ? "" : "s"}`;
  }
};

const updateFilters = () => {
  const filtered = state.episodes.filter((episode) => {
    const matchesQuery =
      !state.query ||
      episode.title.toLowerCase().includes(state.query) ||
      episode.description.toLowerCase().includes(state.query);
    const matchesSeason = state.season === "all" || episode.season === state.season;
    return matchesQuery && matchesSeason;
  });

  state.filtered = filtered;
  renderEpisodes(filtered);
};

const setupSearch = () => {
  const searchInput = document.querySelector("[data-search]");
  const seasonSelect = document.querySelector("[data-season]");

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.query = event.target.value.trim().toLowerCase();
      updateFilters();
    });
  }

  if (seasonSelect) {
    seasonSelect.addEventListener("change", (event) => {
      state.season = event.target.value;
      updateFilters();
    });
  }
};

const populateSeasonFilter = (episodes) => {
  const seasonSelect = document.querySelector("[data-season]");
  if (!seasonSelect) return;

  const seasons = Array.from(
    new Set(episodes.map((episode) => episode.season).filter(Boolean))
  );

  seasons.forEach((season) => {
    const option = document.createElement("option");
    option.value = season;
    option.textContent = season;
    seasonSelect.appendChild(option);
  });
};

const init = () => {
  if (!Array.isArray(window.EPISODES)) return;
  state.episodes = sortEpisodes(window.EPISODES);
  populateSeasonFilter(state.episodes);
  renderLatestEpisode(state.episodes[0]);
  renderEpisodes(state.episodes);
  setupSearch();
};

init();
