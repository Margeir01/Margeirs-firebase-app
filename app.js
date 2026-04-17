import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import {
  redirectToSpotifyLogin,
  getSpotifyAccessToken
} from "./spotify.js";

// â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const firebaseConfig = {
  apiKey: "AIzaSyCTmDx5IzB1GeMA9w0GflJvTy2CRx0DaPw",
  authDomain: "database-prosjekt-d7f33.firebaseapp.com",
  projectId: "database-prosjekt-d7f33",
  storageBucket: "database-prosjekt-d7f33.firebasestorage.app",
  messagingSenderId: "211536762103",
  appId: "1:211536762103:web:1da5eac3fbca85df50eff2",
  measurementId: "G-37603ED50B"
};

const TMDB_API_KEY    = "a6924d38d73acf859dcb96d954118b2a";
const TMDB_BASE_URL   = "https://api.themoviedb.org/3";
const NHTSA_BASE_URL  = "https://vpic.nhtsa.dot.gov/api/vehicles";
const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org";
const WORKS_LIMIT = 20;

// â”€â”€â”€ Firebase init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// â”€â”€â”€ DOM refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const $ = (id) => document.getElementById(id);
const currentPage = document.body?.dataset?.page || "dashboard";

const isPage = (page) => currentPage === page;
const isDashboardPage = isPage("dashboard");
const isMoviesPage = isPage("movies");
const isTvShowsPage = isPage("tvshows");
const isCarsPage = isPage("cars");
const isBooksPage = isPage("books");

const userInfo         = $("userInfo");
const message          = $("message");
const logoutBtn        = $("logoutBtn");
const connectSpotifyBtn = $("connectSpotifyBtn");
const spotifyList      = $("spotifyList");
const loadingOverlay   = $("loadingOverlay");
const loadingText      = $("loadingText");

const moviesSection   = $("moviesSection");
const tvShowsSection  = $("tvShowsSection");
const carsSection     = $("carsSection");
const booksSection    = $("booksSection");
const movieTitle   = $("movieTitle");
const addMovieBtn  = $("addMovieBtn");
const movieList    = $("movieList");
const movieSearch  = $("movieSearch");
const movieSort    = $("movieSort");

const tvShowTitle  = $("tvShowTitle");
const addTvShowBtn = $("addTvShowBtn");
const tvShowList   = $("tvShowList");
const tvShowSearch = $("tvShowSearch");
const tvShowSort   = $("tvShowSort");

const carYear          = $("carYear");
const carBrand         = $("carBrand");
const fetchCarModelsBtn = $("fetchCarModelsBtn");
const carModelSelect   = $("carModelSelect");
const carModelManual   = $("carModelManual");
const addCarBtn        = $("addCarBtn");
const carList          = $("carList");
const carSearch        = $("carSearch");
const carSort          = $("carSort");

const bookTitle    = $("bookTitle");
const bookYear     = $("bookYear");
const bookAuthor   = $("bookAuthor");
const bookGenre    = $("bookGenre");
const addBookBtn   = $("addBookBtn");
const bookList     = $("bookList");
const bookSearch   = $("bookSearch");
const bookSort     = $("bookSort");

const openLibraryAuthorSearch = $("openLibraryAuthorSearch");
const searchOpenLibraryBtn    = $("searchOpenLibraryBtn");
const clearAuthorResultsBtn   = $("clearAuthorResultsBtn");
const authorResultsActions    = $("authorResultsActions");
const openLibraryAuthorResults = $("openLibraryAuthorResults");
const openLibraryWorks        = $("openLibraryWorks");

const statsMoviesWatched  = $("statsMoviesWatched");
const statsMovieHours     = $("statsMovieHours");
const statsSeriesCompleted = $("statsSeriesCompleted");
const statsSeriesHours    = $("statsSeriesHours");
const statsBooksRead      = $("statsBooksRead");
const statsPagesRead      = $("statsPagesRead");
const shareOverviewBtn    = $("shareOverviewBtn");
const shareOverviewLink   = $("shareOverviewLink");

// â”€â”€â”€ In-memory state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let allMovies  = [];
let allTvShows = [];
let allCars    = [];
let allBooks   = [];
let overviewShareReady = false;

let currentOpenLibraryAuthors = [];
let currentOpenLibraryWorks   = [];
let selectedOpenLibraryAuthor = null;
let currentWorksOffset        = 0;

// â”€â”€â”€ Utilities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Debounce: delays fn call until after `delay`ms of inactivity */
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function showMessage(text, isError = false) {
  if (!message) return;
  message.textContent = text;
  message.style.color = isError ? "var(--danger)" : "var(--success)";
  // Auto-clear after 5s
  clearTimeout(showMessage._timer);
  showMessage._timer = setTimeout(() => {
    if (message) message.textContent = "";
  }, 5000);
}

function showLoading(text = "Laster...") {
  if (loadingText)    loadingText.textContent = text;
  if (loadingOverlay) loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  if (loadingOverlay) loadingOverlay.classList.add("hidden");
}

function normalizeBrand(text) {
  if (!text) return "";
  return text
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Safely get milliseconds from a Firestore Timestamp or date string */
function getTimeValue(value) {
  if (!value) return 0;
  if (typeof value.toDate === "function") return value.toDate().getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getIntValue(value, fallback = 0) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getProgressValue(progress) {
  return clamp(getIntValue(progress), 0, 100);
}

function formatAddedDate(value) {
  if (!value || typeof value.toDate !== "function") return "ukjent";
  return value.toDate().toLocaleDateString("no-NO");
}

function formatMinutes(minutes) {
  const m = getIntValue(minutes);
  if (m <= 0) return "0 t";
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h} t ${rem} min` : `${h} t`;
}

function getChosenCarModel() {
  const selected = carModelSelect?.value?.trim() || "";
  const manual   = carModelManual?.value?.trim() || "";
  return selected || manual;
}

function resetCarModelSelect(placeholder = "Velg modell fra liste...") {
  if (!carModelSelect) return;
  carModelSelect.innerHTML = "";
  const opt = document.createElement("option");
  opt.value = "";
  opt.textContent = placeholder;
  carModelSelect.appendChild(opt);
}

function showNoResults(listEl, text = "Ingen treff") {
  if (!listEl) return;
  const li = document.createElement("li");
  li.className = "no-results";
  li.textContent = text;
  listEl.appendChild(li);
}

function createSecondaryButton(text, className, onClick) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.textContent = text;
  btn.type = "button";
  btn.addEventListener("click", onClick);
  return btn;
}

function createProgressBar(progress = 0, text = "") {
  const wrap  = document.createElement("div");
  wrap.className = "progress-wrap";

  const bar  = document.createElement("div");
  bar.className = "progress-bar";

  const fill = document.createElement("div");
  fill.className = "progress-fill";
  fill.style.width = `${clamp(progress, 0, 100)}%`;

  const label = document.createElement("div");
  label.className = "progress-text";
  label.textContent = text || `${progress}%`;

  bar.appendChild(fill);
  wrap.appendChild(bar);
  wrap.appendChild(label);
  return wrap;
}

// â”€â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function calculateMovieStats() {
  let watched = 0, watchedRuntime = 0;
  for (const m of allMovies) {
    if (m.status === "Sett") {
      watched++;
      watchedRuntime += getIntValue(m.runtime);
    }
  }
  return { watched, watchedRuntime };
}

function calculateTvStats() {
  let completed = 0, watchedRuntime = 0;
  for (const show of allTvShows) {
    const totalRuntime = getIntValue(show.totalRuntime);
    const progress     = getProgressValue(show.progress);
    if (show.status === "Ferdig") {
      completed++;
      watchedRuntime += totalRuntime;
    } else {
      watchedRuntime += Math.round((progress / 100) * totalRuntime);
    }
  }
  return { completed, watchedRuntime };
}

function calculateBookStats() {
  let completed = 0, pagesRead = 0;
  for (const b of allBooks) {
    if (b.status === "Lest ferdig") completed++;
    pagesRead += getIntValue(b.pagesRead);
  }
  return { completed, pagesRead };
}

function renderStats() {
  const movies = calculateMovieStats();
  const tv     = calculateTvStats();
  const books  = calculateBookStats();

  if (statsMoviesWatched)   statsMoviesWatched.textContent   = String(movies.watched);
  if (statsMovieHours)      statsMovieHours.textContent      = formatMinutes(movies.watchedRuntime);
  if (statsSeriesCompleted) statsSeriesCompleted.textContent = String(tv.completed);
  if (statsSeriesHours)     statsSeriesHours.textContent     = formatMinutes(tv.watchedRuntime);
  if (statsBooksRead)       statsBooksRead.textContent       = String(books.completed);
  if (statsPagesRead)       statsPagesRead.textContent       = String(books.pagesRead);
}

function createOverviewSnapshot() {
  const movies = calculateMovieStats();
  const tv     = calculateTvStats();
  const books  = calculateBookStats();

  return {
    moviesWatched: movies.watched,
    movieRuntimeMinutes: movies.watchedRuntime,
    seriesCompleted: tv.completed,
    seriesRuntimeMinutes: tv.watchedRuntime,
    booksRead: books.completed,
    pagesRead: books.pagesRead,
    generatedAt: new Date().toISOString()
  };
}

function buildOverviewShareUrl() {
  const snapshot = createOverviewSnapshot();
  const url = new URL("./share.html", window.location.href);

  url.searchParams.set("mw", String(snapshot.moviesWatched));
  url.searchParams.set("mm", String(snapshot.movieRuntimeMinutes));
  url.searchParams.set("sc", String(snapshot.seriesCompleted));
  url.searchParams.set("sm", String(snapshot.seriesRuntimeMinutes));
  url.searchParams.set("br", String(snapshot.booksRead));
  url.searchParams.set("pr", String(snapshot.pagesRead));
  url.searchParams.set("ts", snapshot.generatedAt);

  return url.toString();
}

// â”€â”€â”€ Sorting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function sortByField(arr, key, dir = "asc", getter = (v) => v) {
  return [...arr].sort((a, b) => {
    const va = getter(a[key]);
    const vb = getter(b[key]);
    return dir === "asc" ? va - vb : vb - va;
  });
}

function sortByString(arr, key, dir = "asc") {
  return [...arr].sort((a, b) => {
    const cmp = (a[key] ?? "").localeCompare(b[key] ?? "", "no");
    return dir === "asc" ? cmp : -cmp;
  });
}

function sortMovies(movies, sortValue) {
  switch (sortValue) {
    case "added-asc":    return sortByField(movies, "addedAt", "asc",  getTimeValue);
    case "release-asc":  return sortByField(movies, "releaseDate", "asc",  getTimeValue);
    case "release-desc": return sortByField(movies, "releaseDate", "desc", getTimeValue);
    case "runtime-asc":  return sortByField(movies, "runtime", "asc",  getIntValue);
    case "runtime-desc": return sortByField(movies, "runtime", "desc", getIntValue);
    case "progress-asc": return sortByField(movies, "progress", "asc",  getProgressValue);
    case "progress-desc":return sortByField(movies, "progress", "desc", getProgressValue);
    case "manual-asc":   return [...movies].sort((a, b) => (a.manualOrder ?? 999999) - (b.manualOrder ?? 999999));
    case "title-asc":    return sortByString(movies, "title", "asc");
    case "title-desc":   return sortByString(movies, "title", "desc");
    default:             return sortByField(movies, "addedAt", "desc", getTimeValue);
  }
}

function sortTvShows(tvShows, sortValue) {
  switch (sortValue) {
    case "added-asc":      return sortByField(tvShows, "addedAt", "asc",  getTimeValue);
    case "firstair-asc":   return sortByField(tvShows, "firstAirDate", "asc",  getTimeValue);
    case "firstair-desc":  return sortByField(tvShows, "firstAirDate", "desc", getTimeValue);
    case "seasons-asc":    return sortByField(tvShows, "seasons", "asc",  getIntValue);
    case "seasons-desc":   return sortByField(tvShows, "seasons", "desc", getIntValue);
    case "progress-asc":   return sortByField(tvShows, "progress", "asc",  getProgressValue);
    case "progress-desc":  return sortByField(tvShows, "progress", "desc", getProgressValue);
    case "title-asc":      return sortByString(tvShows, "title", "asc");
    case "title-desc":     return sortByString(tvShows, "title", "desc");
    default:               return sortByField(tvShows, "addedAt", "desc", getTimeValue);
  }
}

function sortCars(cars, sortValue) {
  switch (sortValue) {
    case "year-asc":    return sortByField(cars, "year", "asc",  getIntValue);
    case "brand-asc":   return sortByString(cars, "brand", "asc");
    case "brand-desc":  return sortByString(cars, "brand", "desc");
    case "model-asc":   return sortByString(cars, "model", "asc");
    case "model-desc":  return sortByString(cars, "model", "desc");
    default:            return sortByField(cars, "year", "desc", getIntValue);
  }
}

function sortBooks(books, sortValue) {
  switch (sortValue) {
    case "title-desc":    return sortByString(books, "title", "desc");
    case "year-desc":     return sortByField(books, "publishedYear", "desc", getIntValue);
    case "year-asc":      return sortByField(books, "publishedYear", "asc",  getIntValue);
    case "author-asc":    return sortByString(books, "author", "asc");
    case "author-desc":   return sortByString(books, "author", "desc");
    case "progress-asc":  return sortByField(books, "progress", "asc",  getProgressValue);
    case "progress-desc": return sortByField(books, "progress", "desc", getProgressValue);
    default:              return sortByString(books, "title", "asc");
  }
}

// â”€â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function makeFilter(fields) {
  return (item, filterText) => {
    const q = (filterText || "").trim().toLowerCase();
    if (!q) return true;
    return fields.some((f) => String(item[f] ?? "").toLowerCase().includes(q));
  };
}

const matchesMovieFilter  = makeFilter(["title", "genre", "status"]);
const matchesTvShowFilter = makeFilter(["title", "genre", "status"]);
const matchesBookFilter   = makeFilter(["title", "publishedYear", "genre", "author", "status"]);
const matchesCarFilter    = makeFilter(["year", "brand", "model"]);

function initializePageState() {
  if (isCarsPage) resetCarModelSelect();
  if (isBooksPage) clearOpenLibraryResults();
}

async function loadCurrentPageData() {
  if (isDashboardPage) {
    await Promise.all([loadMovies(), loadTvShows(), loadCars(), loadBooks()]);
    return;
  }

  if (isMoviesPage) {
    await loadMovies();
    return;
  }

  if (isTvShowsPage) {
    await loadTvShows();
    return;
  }

  if (isCarsPage) {
    await loadCars();
    return;
  }

  if (isBooksPage) {
    await loadBooks();
  }
}

// â”€â”€â”€ Open Library helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function toggleAuthorResultsAction(show) {
  authorResultsActions?.classList.toggle("hidden", !show);
}

function clearAuthorSearchResultsOnly() {
  currentOpenLibraryAuthors = [];
  if (openLibraryAuthorResults) openLibraryAuthorResults.innerHTML = "";
  if (openLibraryAuthorSearch)  openLibraryAuthorSearch.value = "";
  toggleAuthorResultsAction(false);
}

function clearOpenLibraryResults() {
  currentOpenLibraryAuthors = [];
  currentOpenLibraryWorks   = [];
  selectedOpenLibraryAuthor = null;
  currentWorksOffset        = 0;
  if (openLibraryAuthorResults) openLibraryAuthorResults.innerHTML = "";
  if (openLibraryWorks)         openLibraryWorks.innerHTML = "";
  toggleAuthorResultsAction(false);
}

function uniqueByKey(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item?.key || `${item?.title}-${item?.author}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractGenres(work) {
  const candidates = [
    ...(work.subjects        || []),
    ...(work.subject         || []),
    ...(work.subject_people  || []),
    ...(work.subject_places  || []),
    ...(work.subject_times   || [])
  ];
  const cleaned = [...new Set(
    candidates
      .map((s) => String(s).trim())
      .filter((s) => s && s.length < 40 && !/^\d+$/.test(s))
  )];
  return cleaned.slice(0, 3).join(", ");
}

function normalizeOpenLibraryWork(work) {
  let year = "";
  if (work.first_publish_year) {
    year = work.first_publish_year;
  } else if (work.created?.value) {
    const y = new Date(work.created.value).getFullYear();
    year = Number.isNaN(y) ? "" : y;
  } else if (Array.isArray(work.publish_date) && work.publish_date.length > 0) {
    year = work.publish_date[0];
  }
  return {
    key:           work.key || "",
    title:         work.title || "Uten tittel",
    publishedYear: year ? String(year) : "Ukjent",
    author:        selectedOpenLibraryAuthor?.name || "Ukjent forfatter",
    genre:         extractGenres(work) || "Ukjent"
  };
}

// â”€â”€â”€ Spotify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderSpotify() {
  if (!spotifyList) return;
  spotifyList.innerHTML = "";

  const data = JSON.parse(localStorage.getItem("spotify_recent") || "[]");

  if (!data.length) {
    showNoResults(spotifyList, "Ingen Spotify-data enda");
    return;
  }

  data.forEach((item) => {
    const track = item?.track;
    if (!track) return;

    const li      = document.createElement("li");
    const textDiv = document.createElement("div");

    const titleEl = document.createElement("div");
    titleEl.className  = "li-text";
    titleEl.textContent = track.name || "Ukjent lÃ¥t";

    const artists  = Array.isArray(track.artists) ? track.artists.map((a) => a.name).join(", ") : "Ukjent artist";
    const album    = track.album?.name || "Ukjent album";
    const playedAt = item.played_at ? new Date(item.played_at).toLocaleString("no-NO") : "Ukjent tidspunkt";

    const subEl = document.createElement("div");
    subEl.className  = "li-sub";
    subEl.textContent = `${artists} Â· ${album} Â· ${playedAt}`;

    textDiv.appendChild(titleEl);
    textDiv.appendChild(subEl);
    li.appendChild(textDiv);
    spotifyList.appendChild(li);
  });
}

// â”€â”€â”€ API calls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function fetchMovieDetails(title) {
  const searchRes = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
  if (!searchRes.ok) throw new Error("Kunne ikke sÃ¸ke etter film i TMDb.");

  const searchData = await searchRes.json();
  if (!searchData.results?.length) throw new Error("Fant ikke filmen i TMDb.");

  const detailsRes = await fetch(`${TMDB_BASE_URL}/movie/${searchData.results[0].id}?api_key=${TMDB_API_KEY}`);
  if (!detailsRes.ok) throw new Error("Kunne ikke hente filmdetaljer fra TMDb.");

  const d = await detailsRes.json();
  return {
    title:       d.title || title,
    genre:       d.genres?.map((g) => g.name).join(", ") || "Ukjent",
    releaseDate: d.release_date || null,
    runtime:     d.runtime ?? 0
  };
}

async function fetchTvShowDetails(title) {
  const searchRes = await fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
  if (!searchRes.ok) throw new Error("Kunne ikke sÃ¸ke etter TV-serie i TMDb.");

  const searchData = await searchRes.json();
  if (!searchData.results?.length) throw new Error("Fant ikke TV-serien i TMDb.");

  const detailsRes = await fetch(`${TMDB_BASE_URL}/tv/${searchData.results[0].id}?api_key=${TMDB_API_KEY}`);
  if (!detailsRes.ok) throw new Error("Kunne ikke hente TV-seriedetaljer fra TMDb.");

  const d = await detailsRes.json();
  const episodeRuntime = Array.isArray(d.episode_run_time) ? (d.episode_run_time[0] || 0) : 0;
  const totalEpisodes  = d.number_of_episodes || 0;

  return {
    title:          d.name || title,
    genre:          d.genres?.map((g) => g.name).join(", ") || "Ukjent",
    firstAirDate:   d.first_air_date || null,
    seasons:        d.number_of_seasons ?? 0,
    episodes:       totalEpisodes,
    episodeRuntime,
    totalRuntime:   episodeRuntime * totalEpisodes
  };
}

async function fetchCarModels(year, brand) {
  const yearNum = getIntValue(String(year).trim());
  if (!yearNum || yearNum < 1996) throw new Error("Ã…rsmodell mÃ¥ vÃ¦re 1996 eller nyere.");
  if (!brand.trim()) throw new Error("Fyll inn bilmerke.");

  const res = await fetch(`${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(brand.trim())}/modelyear/${yearNum}/vehicletype/car?format=json`);
  if (!res.ok) throw new Error("Kunne ikke hente bilmodeller.");

  const data = await res.json();
  return [...new Set(
    (data.Results || []).map((r) => r.Model_Name?.trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "no"));
}

async function searchOpenLibraryAuthors(authorQuery) {
  const q = authorQuery.trim();
  if (!q) throw new Error("Skriv inn et forfatternavn.");
  const res = await fetch(`${OPEN_LIBRARY_BASE_URL}/search/authors.json?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`Kunne ikke sÃ¸ke i Open Library (${res.status}).`);
  const data = await res.json();
  if (!Array.isArray(data.docs)) throw new Error("Open Library svarte uten gyldige forfattere.");
  return data.docs.slice(0, 10);
}

async function fetchOpenLibraryWorks(authorKey, offset = 0) {
  if (!authorKey) throw new Error("Forfatter-ID mangler.");
  const cleanKey = String(authorKey).replace(/^.*?\/authors\//, "").replace(/\//g, "");
  const res = await fetch(`${OPEN_LIBRARY_BASE_URL}/authors/${cleanKey}/works.json?limit=${WORKS_LIMIT}&offset=${offset}`);
  if (!res.ok) throw new Error(`Kunne ikke hente bÃ¸ker (${res.status}).`);
  const data = await res.json();
  if (!Array.isArray(data.entries)) throw new Error("Open Library svarte uten bokliste.");
  return data.entries;
}

async function fetchOpenLibraryWorkDetails(workKey) {
  if (!workKey) return null;
  const cleanKey = String(workKey).replace(/^.*?\/works\//, "").replace(/\//g, "");
  const res = await fetch(`${OPEN_LIBRARY_BASE_URL}/works/${cleanKey}.json`);
  return res.ok ? await res.json() : null;
}

async function enrichOpenLibraryWorks(works) {
  return Promise.all(
    works.map(async (work) => {
      try {
        const details = await fetchOpenLibraryWorkDetails(work.key);
        return details ? { ...work, ...details } : work;
      } catch {
        return work;
      }
    })
  );
}

// â”€â”€â”€ Open Library render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderOpenLibraryAuthors(authors) {
  if (!openLibraryAuthorResults) return;
  openLibraryAuthorResults.innerHTML = "";
  toggleAuthorResultsAction(Array.isArray(authors) && authors.length > 0);

  if (!authors?.length) {
    showNoResults(openLibraryAuthorResults, "Ingen forfattere funnet");
    return;
  }

  authors.forEach((author) => {
    const li      = document.createElement("li");
    const textDiv = document.createElement("div");

    const titleEl = document.createElement("div");
    titleEl.className  = "li-text";
    titleEl.textContent = author.name || "Ukjent forfatter";

    const authorKey = author.key || author.author_key || author.id || "";
    const subParts  = [
      author.top_work    ? `Kjent for: ${author.top_work}` : null,
      author.work_count !== undefined ? `Verk: ${author.work_count}` : null,
      author.birth_date  ? `FÃ¸dt: ${author.birth_date}` : null
    ].filter(Boolean);

    const subEl = document.createElement("div");
    subEl.className  = "li-sub";
    subEl.textContent = subParts.join(" Â· ");

    textDiv.appendChild(titleEl);
    textDiv.appendChild(subEl);

    const btnGroup  = document.createElement("div");
    btnGroup.className = "btn-group";

    const selectBtn = createSecondaryButton("Velg", "btn-api", async () => {
      if (!authorKey) {
        showMessage("Denne forfatteren mangler gyldig Open Library-ID.", true);
        return;
      }
      selectBtn.disabled    = true;
      selectBtn.textContent = "Laster...";

      try {
        selectedOpenLibraryAuthor = { key: authorKey, name: author.name || "Ukjent forfatter" };
        currentWorksOffset        = 0;
        if (openLibraryWorks) openLibraryWorks.innerHTML = "";

        showLoading(`Henter bÃ¸ker for ${selectedOpenLibraryAuthor.name}...`);

        const works         = await fetchOpenLibraryWorks(authorKey, 0);
        const enriched      = await enrichOpenLibraryWorks(works);
        currentOpenLibraryWorks = uniqueByKey(enriched);

        clearAuthorSearchResultsOnly();
        renderOpenLibraryWorks(currentOpenLibraryWorks, bookSearch?.value || "");
        showMessage(`Fant ${currentOpenLibraryWorks.length} verk for ${selectedOpenLibraryAuthor.name}.`);
        openLibraryWorks?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {
        showMessage(err.message || "Noe gikk galt.", true);
      } finally {
        selectBtn.disabled    = false;
        selectBtn.textContent = "Velg";
        hideLoading();
      }
    });

    btnGroup.appendChild(selectBtn);
    li.appendChild(textDiv);
    li.appendChild(btnGroup);
    openLibraryAuthorResults.appendChild(li);
  });
}

function renderOpenLibraryWorks(works, filter = "") {
  if (!openLibraryWorks) return;
  openLibraryWorks.innerHTML = "";

  const filtered = works.filter((w) => matchesBookFilter(normalizeOpenLibraryWork(w), filter));

  if (!filtered.length) {
    showNoResults(openLibraryWorks, "Ingen bÃ¸ker matcher sÃ¸ket");
    return;
  }

  filtered.forEach((work) => {
    const norm    = normalizeOpenLibraryWork(work);
    const li      = document.createElement("li");
    const textDiv = document.createElement("div");

    const titleEl = document.createElement("div");
    titleEl.className  = "li-text";
    titleEl.textContent = norm.title;

    const subEl = document.createElement("div");
    subEl.className  = "li-sub";
    subEl.textContent = [norm.author, norm.publishedYear || "Ukjent Ã¥r", norm.genre || "Ukjent"].join(" Â· ");

    textDiv.appendChild(titleEl);
    textDiv.appendChild(subEl);

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    const fillBtn = createSecondaryButton("Fyll inn", "btn-edit", () => {
      if (bookTitle)  bookTitle.value  = norm.title;
      if (bookYear)   bookYear.value   = norm.publishedYear === "Ukjent" ? "" : norm.publishedYear;
      if (bookAuthor) bookAuthor.value = norm.author;
      if (bookGenre)  bookGenre.value  = norm.genre === "Ukjent" ? "" : norm.genre;
      showMessage(`Fylte inn "${norm.title}". Lagre med knappen over.`);
    });

    const saveBtn = createSecondaryButton("Lagre", "btn-api", async () => {
      try {
        await addDoc(collection(db, "books"), {
          title:         norm.title,
          publishedYear: norm.publishedYear === "Ukjent" ? "" : norm.publishedYear,
          author:        norm.author,
          genre:         norm.genre === "Ukjent" ? "" : norm.genre,
          source:        "Open Library",
          userId:        auth.currentUser.uid,
          addedAt:       serverTimestamp(),
          status:        "Skal lese",
          pagesRead:     0,
          totalPages:    0,
          progress:      0
        });
        showMessage(`"${norm.title}" ble lagret.`);
        await loadBooks();
      } catch (err) {
        showMessage(err.message, true);
      }
    });

    btnGroup.appendChild(fillBtn);
    btnGroup.appendChild(saveBtn);

    li.appendChild(textDiv);
    li.appendChild(btnGroup);
    openLibraryWorks.appendChild(li);
  });

  // "Load more" row
  if (selectedOpenLibraryAuthor) {
    const loadMoreLi  = document.createElement("li");
    const textDiv     = document.createElement("div");
    const titleEl     = document.createElement("div");
    titleEl.className  = "li-text";
    titleEl.textContent = "Vil du se flere?";

    const subEl = document.createElement("div");
    subEl.className  = "li-sub";
    subEl.textContent = `Laster ${WORKS_LIMIT} nye bÃ¸ker fra Open Library.`;

    textDiv.appendChild(titleEl);
    textDiv.appendChild(subEl);

    const btnGroup   = document.createElement("div");
    btnGroup.className = "btn-group";

    const loadMoreBtn = createSecondaryButton("Vis flere", "btn-api", async () => {
      loadMoreBtn.disabled    = true;
      loadMoreBtn.textContent = "Laster...";
      try {
        showLoading("Henter flere bÃ¸ker...");
        currentWorksOffset += WORKS_LIMIT;
        const more     = await fetchOpenLibraryWorks(selectedOpenLibraryAuthor.key, currentWorksOffset);

        if (!more.length) {
          showMessage("Ingen flere bÃ¸ker ble funnet.");
          return;
        }

        const enriched = await enrichOpenLibraryWorks(more);
        currentOpenLibraryWorks = uniqueByKey([...currentOpenLibraryWorks, ...enriched]);
        renderOpenLibraryWorks(currentOpenLibraryWorks, bookSearch?.value || "");
        showMessage(`Viser ${currentOpenLibraryWorks.length} bÃ¸ker.`);
      } catch (err) {
        showMessage("Kunne ikke laste flere bÃ¸ker.", true);
      } finally {
        hideLoading();
      }
    });

    btnGroup.appendChild(loadMoreBtn);
    loadMoreLi.appendChild(textDiv);
    loadMoreLi.appendChild(btnGroup);
    openLibraryWorks.appendChild(loadMoreLi);
  }
}

// â”€â”€â”€ Movies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function loadMovies() {
  if (!auth.currentUser) return;

  const snap = await getDocs(query(collection(db, "movies"), where("userId", "==", auth.currentUser.uid)));
  allMovies  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  allMovies.sort((a, b) => (a.manualOrder ?? 999999) - (b.manualOrder ?? 999999));

  // Batch-fix missing manualOrder/status/progress fields
  const missing = allMovies.filter((m) => m.manualOrder === undefined);
  if (missing.length > 0) {
    const batch = writeBatch(db);
    allMovies.forEach((m, i) => {
      if (m.manualOrder === undefined) {
        const ref = doc(db, "movies", m.id);
        batch.update(ref, {
          manualOrder: i,
          status:   m.status   || "Skal se",
          progress: m.progress ?? 0
        });
        m.manualOrder = i;
        m.status   = m.status   || "Skal se";
        m.progress = m.progress ?? 0;
      }
    });
    try { await batch.commit(); } catch (e) { console.error("Batch update feilet:", e); }
  }

  renderMovies(movieSearch?.value || "");
  renderStats();
}

function renderMovies(filter = "") {
  if (!movieList) return;
  movieList.innerHTML = "";

  let filtered = allMovies.filter((m) => matchesMovieFilter(m, filter));
  filtered     = sortMovies(filtered, movieSort?.value);

  if (!filtered.length) { showNoResults(movieList); return; }

  filtered.forEach((movie) => {
    const li       = document.createElement("li");
    const textDiv  = document.createElement("div");
    textDiv.className = "item-content";

    const titleEl = document.createElement("div");
    titleEl.className  = "li-text";
    titleEl.textContent = movie.title;

    const releaseText  = movie.releaseDate || "ukjent";
    const runtimeText  = getIntValue(movie.runtime) > 0 ? `${movie.runtime} min` : "ukjent runtime";
    const statusText   = movie.status || "Skal se";
    const progressValue = getProgressValue(movie.progress);
    const addedText    = formatAddedDate(movie.addedAt);

    const subEl = document.createElement("div");
    subEl.className  = "li-sub";
    subEl.textContent = `${movie.genre || "Ukjent"} Â· ${releaseText} Â· ${runtimeText} Â· ${statusText} Â· ${addedText}`;

    const progressEl = createProgressBar(progressValue, `${progressValue}% sett`);

    const controls = document.createElement("div");
    controls.className = "inline-controls";

    const statusSelect = buildStatusSelect(["Skal se", "Ser pÃ¥", "Sett"], statusText, async (newStatus) => {
      const newProgress = newStatus === "Sett" ? 100 : newStatus === "Skal se" ? 0 : progressValue;
      try {
        await updateDoc(doc(db, "movies", movie.id), { status: newStatus, progress: newProgress });
        showMessage("Filmstatus oppdatert.");
        await loadMovies();
      } catch { showMessage("Kunne ikke oppdatere filmstatus.", true); }
    });

    textDiv.appendChild(titleEl);
    textDiv.appendChild(subEl);
    textDiv.appendChild(progressEl);
    controls.appendChild(statusSelect);
    textDiv.appendChild(controls);

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    if (movieSort?.value === "manual-asc") {
      btnGroup.appendChild(createSecondaryButton("â†‘", "btn-move", () => moveMovie(movie.id, -1)));
      btnGroup.appendChild(createSecondaryButton("â†“", "btn-move", () => moveMovie(movie.id,  1)));
    }

    btnGroup.appendChild(createSecondaryButton("Rediger", "btn-edit", async () => {
      const newTitle = prompt("Ny filmtittel:", movie.title);
      if (!newTitle?.trim()) return;
      try {
        const data = await fetchMovieDetails(newTitle.trim());
        await updateDoc(doc(db, "movies", movie.id), {
          title: data.title, genre: data.genre,
          releaseDate: data.releaseDate || null, runtime: data.runtime ?? 0
        });
        showMessage("Film oppdatert.");
        await loadMovies();
      } catch (err) { showMessage(err.message, true); }
    }));

    btnGroup.appendChild(createSecondaryButton("Slett", "btn-delete", async () => {
      if (!confirm(`Slett "${movie.title}"?`)) return;
      try {
        await deleteDoc(doc(db, "movies", movie.id));
        showMessage("Film slettet.");
        await loadMovies();
      } catch (err) { showMessage(err.message, true); }
    }));

    li.appendChild(textDiv);
    li.appendChild(btnGroup);
    movieList.appendChild(li);
  });
}

async function moveMovie(movieId, direction) {
  const sorted = [...allMovies].sort((a, b) => (a.manualOrder ?? 999999) - (b.manualOrder ?? 999999));
  const idx    = sorted.findIndex((m) => m.id === movieId);
  if (idx === -1) return;

  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= sorted.length) return;

  const a = sorted[idx];
  const b = sorted[newIdx];
  const aOrder = a.manualOrder ?? idx;
  const bOrder = b.manualOrder ?? newIdx;

  try {
    const batch = writeBatch(db);
    batch.update(doc(db, "movies", a.id), { manualOrder: bOrder });
    batch.update(doc(db, "movies", b.id), { manualOrder: aOrder });
    await batch.commit();
    showMessage("RekkefÃ¸lge oppdatert.");
    await loadMovies();
  } catch { showMessage("Kunne ikke endre rekkefÃ¸lge.", true); }
}

// â”€â”€â”€ TV Shows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function loadTvShows() {
  if (!auth.currentUser) return;
  const snap  = await getDocs(query(collection(db, "tvshows"), where("userId", "==", auth.currentUser.uid)));
  allTvShows  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderTvShows(tvShowSearch?.value || "");
  renderStats();
}

function renderTvShows(filter = "") {
  if (!tvShowList) return;
  tvShowList.innerHTML = "";

  let filtered = allTvShows.filter((s) => matchesTvShowFilter(s, filter));
  filtered     = sortTvShows(filtered, tvShowSort?.value);

  if (!filtered.length) { showNoResults(tvShowList); return; }

  filtered.forEach((show) => {
    const li      = document.createElement("li");
    const textDiv = document.createElement("div");
    textDiv.className = "item-content";

    const titleEl = document.createElement("div");
    titleEl.className  = "li-text";
    titleEl.textContent = show.title;

    const statusText   = show.status || "Skal se";
    const progressValue = getProgressValue(show.progress);
    const totalRuntimeText = getIntValue(show.totalRuntime) > 0 ? formatMinutes(show.totalRuntime) : "ukjent";
    const currentSeason = getIntValue(show.currentSeason || 1);
    const currentEpisode = getIntValue(show.currentEpisode || 1);

    const subEl = document.createElement("div");
    subEl.className  = "li-sub";
    subEl.textContent = `${show.genre || "Ukjent"} Â· ${show.firstAirDate || "ukjent"} Â· ${show.seasons ?? 0} sesonger Â· ${show.episodes ?? 0} episoder Â· ${totalRuntimeText} Â· S${currentSeason}E${currentEpisode} Â· ${statusText} Â· ${formatAddedDate(show.addedAt)}`;

    const progressEl = createProgressBar(progressValue, `${progressValue}% sett`);

    const controls = document.createElement("div");
    controls.className = "inline-controls";

    const statusSelect = buildStatusSelect(["Skal se", "Ser pÃ¥", "PÃ¥ pause", "Ferdig"], statusText, async (newStatus) => {
      const newProgress = newStatus === "Ferdig" ? 100 : newStatus === "Skal se" ? 0 : progressValue;
      try {
        await updateDoc(doc(db, "tvshows", show.id), { status: newStatus, progress: newProgress });
        showMessage("TV-serie oppdatert.");
        await loadTvShows();
      } catch { showMessage("Kunne ikke oppdatere TV-serie.", true); }
    });

    const seasonBtn = createSecondaryButton("Sesong", "btn-small btn-edit", async () => {
      const input = prompt("Hvilken sesong er du pÃ¥?", String(currentSeason));
      if (input === null) return;
      const v = getIntValue(input);
      if (v < 1) { showMessage("Sesong mÃ¥ vÃ¦re 1 eller hÃ¸yere.", true); return; }
      try {
        await updateDoc(doc(db, "tvshows", show.id), { currentSeason: v, status: "Ser pÃ¥" });
        await loadTvShows();
      } catch { showMessage("Kunne ikke oppdatere sesong.", true); }
    });

    const episodeBtn = createSecondaryButton("Episode", "btn-small btn-edit", async () => {
      const input = prompt("Hvilken episode er du pÃ¥?", String(currentEpisode));
      if (input === null) return;
      const v = getIntValue(input);
      if (v < 1) { showMessage("Episode mÃ¥ vÃ¦re 1 eller hÃ¸yere.", true); return; }
      try {
        await updateDoc(doc(db, "tvshows", show.id), { currentEpisode: v, status: "Ser pÃ¥" });
        await loadTvShows();
      } catch { showMessage("Kunne ikke oppdatere episode.", true); }
    });

    const progressBtn = createSecondaryButton("Fremgang", "btn-small btn-api", async () => {
      const input = prompt("Sett fremgang (0â€“100):", String(progressValue));
      if (input === null) return;
      const v = getIntValue(input);
      if (v < 0 || v > 100) { showMessage("Fremgang mÃ¥ vÃ¦re mellom 0 og 100.", true); return; }
      const newStatus = v === 100 ? "Ferdig" : v > 0 ? "Ser pÃ¥" : "Skal se";
      try {
        await updateDoc(doc(db, "tvshows", show.id), { progress: v, status: newStatus });
        await loadTvShows();
      } catch { showMessage("Kunne ikke oppdatere fremgang.", true); }
    });

    textDiv.appendChild(titleEl);
    textDiv.appendChild(subEl);
    textDiv.appendChild(progressEl);
    controls.appendChild(statusSelect);
    controls.appendChild(seasonBtn);
    controls.appendChild(episodeBtn);
    controls.appendChild(progressBtn);
    textDiv.appendChild(controls);

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    btnGroup.appendChild(createSecondaryButton("Rediger", "btn-edit", async () => {
      const newTitle = prompt("Ny tittel:", show.title);
      if (!newTitle?.trim()) return;
      try {
        const data = await fetchTvShowDetails(newTitle.trim());
        await updateDoc(doc(db, "tvshows", show.id), {
          title: data.title, genre: data.genre, firstAirDate: data.firstAirDate || null,
          seasons: data.seasons ?? 0, episodes: data.episodes ?? 0,
          episodeRuntime: data.episodeRuntime ?? 0, totalRuntime: data.totalRuntime ?? 0
        });
        showMessage("TV-serie oppdatert.");
        await loadTvShows();
      } catch (err) { showMessage(err.message, true); }
    }));

    btnGroup.appendChild(createSecondaryButton("Slett", "btn-delete", async () => {
      if (!confirm(`Slett "${show.title}"?`)) return;
      try {
        await deleteDoc(doc(db, "tvshows", show.id));
        showMessage("TV-serie slettet.");
        await loadTvShows();
      } catch (err) { showMessage(err.message, true); }
    }));

    li.appendChild(textDiv);
    li.appendChild(btnGroup);
    tvShowList.appendChild(li);
  });
}

// â”€â”€â”€ Cars â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function loadCars() {
  if (!auth.currentUser) return;
  const snap = await getDocs(query(collection(db, "cars"), where("userId", "==", auth.currentUser.uid)));
  allCars    = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderCars(carSearch?.value || "");
}

function renderCars(filter = "") {
  if (!carList) return;
  carList.innerHTML = "";

  let filtered = allCars.filter((c) => matchesCarFilter(c, filter));
  filtered     = sortCars(filtered, carSort?.value);

  if (!filtered.length) { showNoResults(carList); return; }

  filtered.forEach((car) => {
    const li      = document.createElement("li");
    const textDiv = document.createElement("div");

    const titleEl = document.createElement("div");
    titleEl.className  = "li-text";
    titleEl.textContent = `${car.year} ${car.brand} ${car.model}`;

    const subEl = document.createElement("div");
    subEl.className  = "li-sub";
    subEl.textContent = car.source ? `Kilde: ${car.source}` : "";

    textDiv.appendChild(titleEl);
    textDiv.appendChild(subEl);

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    btnGroup.appendChild(createSecondaryButton("Rediger", "btn-edit", async () => {
      const newYear  = prompt("Ã…rsmodell:", car.year ?? "");
      if (newYear === null) return;
      const newBrand = prompt("Bilmerke:", car.brand ?? "");
      if (newBrand === null) return;
      const newModel = prompt("Modell:", car.model ?? "");
      if (newModel === null) return;

      const cleanYear  = newYear.trim();
      const cleanBrand = normalizeBrand(newBrand);
      const cleanModel = newModel.trim();

      if (!cleanYear || !cleanBrand || !cleanModel) {
        showMessage("Ã…r, merke og modell kan ikke vÃ¦re tomme.", true);
        return;
      }
      try {
        await updateDoc(doc(db, "cars", car.id), { year: cleanYear, brand: cleanBrand, model: cleanModel });
        showMessage("Bil oppdatert.");
        await loadCars();
      } catch (err) { showMessage(err.message, true); }
    }));

    btnGroup.appendChild(createSecondaryButton("Slett", "btn-delete", async () => {
      if (!confirm(`Slett ${car.year} ${car.brand} ${car.model}?`)) return;
      try {
        await deleteDoc(doc(db, "cars", car.id));
        showMessage("Bil slettet.");
        await loadCars();
      } catch (err) { showMessage(err.message, true); }
    }));

    li.appendChild(textDiv);
    li.appendChild(btnGroup);
    carList.appendChild(li);
  });
}

// â”€â”€â”€ Books â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function calculateBookProgress(pagesRead, totalPages) {
  const read  = getIntValue(pagesRead);
  const total = getIntValue(totalPages);
  if (total <= 0) return 0;
  return clamp(Math.round((read / total) * 100), 0, 100);
}

async function loadBooks() {
  if (!auth.currentUser) return;
  const snap = await getDocs(query(collection(db, "books"), where("userId", "==", auth.currentUser.uid)));
  allBooks   = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderBooks(bookSearch?.value || "");
  renderStats();
}

function renderBooks(filter = "") {
  if (!bookList) return;
  bookList.innerHTML = "";

  let filtered = allBooks.filter((b) => matchesBookFilter(b, filter));
  filtered     = sortBooks(filtered, bookSort?.value);

  if (!filtered.length) {
    showNoResults(bookList);
  } else {
    filtered.forEach((book) => {
      const li      = document.createElement("li");
      const textDiv = document.createElement("div");
      textDiv.className = "item-content";

      const pagesRead  = getIntValue(book.pagesRead);
      const totalPages = getIntValue(book.totalPages);
      const progressValue = getProgressValue(book.progress ?? calculateBookProgress(pagesRead, totalPages));
      const statusText = book.status || "Skal lese";

      const titleEl = document.createElement("div");
      titleEl.className  = "li-text";
      titleEl.textContent = book.title;

      const subEl = document.createElement("div");
      subEl.className  = "li-sub";
      subEl.textContent = [
        book.author || "Ukjent forfatter",
        book.publishedYear || "Ukjent Ã¥r",
        book.genre || null,
        book.source ? `Kilde: ${book.source}` : null,
        statusText
      ].filter(Boolean).join(" Â· ");

      const progressEl = createProgressBar(progressValue, `${pagesRead}/${totalPages || 0} sider Â· ${progressValue}%`);

      const controls = document.createElement("div");
      controls.className = "inline-controls";

      const statusSelect = buildStatusSelect(["Skal lese", "Leser", "Lest ferdig"], statusText, async (newStatus) => {
        let newPagesRead = pagesRead;
        let newProgress  = progressValue;
        if (newStatus === "Skal lese") { newPagesRead = 0; newProgress = 0; }
        else if (newStatus === "Lest ferdig" && totalPages > 0) { newPagesRead = totalPages; newProgress = 100; }
        try {
          await updateDoc(doc(db, "books", book.id), { status: newStatus, pagesRead: newPagesRead, progress: newProgress });
          showMessage("Bokstatus oppdatert.");
          await loadBooks();
        } catch { showMessage("Kunne ikke oppdatere bokstatus.", true); }
      });

      const pagesBtn = createSecondaryButton("Sider", "btn-small btn-edit", async () => {
        const newPagesRead  = prompt("Sider lest:", String(pagesRead));
        if (newPagesRead === null) return;
        const newTotalPages = prompt("Totalt antall sider:", String(totalPages || ""));
        if (newTotalPages === null) return;

        const readVal  = getIntValue(newPagesRead);
        const totalVal = getIntValue(newTotalPages);
        if (readVal < 0 || totalVal < 0) { showMessage("Verdier mÃ¥ vÃ¦re 0 eller hÃ¸yere.", true); return; }

        const safeRead   = totalVal > 0 ? Math.min(readVal, totalVal) : readVal;
        const newProgress = calculateBookProgress(safeRead, totalVal);
        const newStatus  = newProgress === 100 ? "Lest ferdig" : safeRead > 0 ? "Leser" : "Skal lese";
        try {
          await updateDoc(doc(db, "books", book.id), {
            pagesRead: safeRead, totalPages: totalVal, progress: newProgress, status: newStatus
          });
          await loadBooks();
        } catch { showMessage("Kunne ikke oppdatere sider.", true); }
      });

      const plusBtn = createSecondaryButton("+10 sider", "btn-small btn-api", async () => {
        const newRead = pagesRead + 10;
        const safeRead = totalPages > 0 ? Math.min(newRead, totalPages) : newRead;
        const newProgress = calculateBookProgress(safeRead, totalPages);
        const newStatus   = newProgress === 100 ? "Lest ferdig" : safeRead > 0 ? "Leser" : "Skal lese";
        try {
          await updateDoc(doc(db, "books", book.id), { pagesRead: safeRead, progress: newProgress, status: newStatus });
          await loadBooks();
        } catch { showMessage("Kunne ikke oppdatere sider.", true); }
      });

      textDiv.appendChild(titleEl);
      textDiv.appendChild(subEl);
      textDiv.appendChild(progressEl);
      controls.appendChild(statusSelect);
      controls.appendChild(pagesBtn);
      controls.appendChild(plusBtn);
      textDiv.appendChild(controls);

      const btnGroup = document.createElement("div");
      btnGroup.className = "btn-group";

      btnGroup.appendChild(createSecondaryButton("Rediger", "btn-edit", async () => {
        const fields = [
          ["Tittel:", book.title ?? ""],
          ["Ã…r:", book.publishedYear ?? ""],
          ["Forfatter:", book.author ?? ""],
          ["Sjanger:", book.genre ?? ""]
        ];
        const [title, year, author, genre] = fields.map(([label, val]) => {
          const result = prompt(label, val);
          return result;
        });

        if ([title, year, author].some((v) => v === null)) return;
        if (!title?.trim() || !year?.trim() || !author?.trim()) {
          showMessage("Tittel, Ã¥r og forfatter kan ikke vÃ¦re tomme.", true);
          return;
        }
        try {
          await updateDoc(doc(db, "books", book.id), {
            title: title.trim(), publishedYear: year.trim(),
            author: author.trim(), genre: (genre || "").trim()
          });
          showMessage("Bok oppdatert.");
          await loadBooks();
        } catch (err) { showMessage(err.message, true); }
      }));

      btnGroup.appendChild(createSecondaryButton("Slett", "btn-delete", async () => {
        if (!confirm(`Slett "${book.title}"?`)) return;
        try {
          await deleteDoc(doc(db, "books", book.id));
          showMessage("Bok slettet.");
          await loadBooks();
        } catch (err) { showMessage(err.message, true); }
      }));

      li.appendChild(textDiv);
      li.appendChild(btnGroup);
      bookList.appendChild(li);
    });
  }

  // BUG FIX: Only render Open Library works separately via renderOpenLibraryWorks,
  // not inside renderBooks (was causing double-render).
  // Open Library works are rendered in their own <ul id="openLibraryWorks">.
}

// â”€â”€â”€ Shared UI builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Build a <select> for status options */
function buildStatusSelect(options, currentValue, onChange) {
  const select = document.createElement("select");
  select.className = "inline-select";
  options.forEach((opt) => {
    const o = document.createElement("option");
    o.value    = opt;
    o.textContent = opt;
    o.selected = opt === currentValue;
    select.appendChild(o);
  });
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

// â”€â”€â”€ Event listeners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const debouncedRenderMovies  = debounce(() => renderMovies(movieSearch?.value  || ""));
const debouncedRenderTvShows = debounce(() => renderTvShows(tvShowSearch?.value || ""));
const debouncedRenderCars    = debounce(() => renderCars(carSearch?.value    || ""));
const debouncedRenderBooks   = debounce(() => renderBooks(bookSearch?.value   || ""));

movieSearch?.addEventListener("input",  debouncedRenderMovies);
movieSort?.addEventListener("change",   () => renderMovies(movieSearch?.value || ""));

tvShowSearch?.addEventListener("input", debouncedRenderTvShows);
tvShowSort?.addEventListener("change",  () => renderTvShows(tvShowSearch?.value || ""));

carSearch?.addEventListener("input",    debouncedRenderCars);
carSort?.addEventListener("change",     () => renderCars(carSearch?.value || ""));

bookSearch?.addEventListener("input",   debouncedRenderBooks);
bookSort?.addEventListener("change",    () => renderBooks(bookSearch?.value || ""));

clearAuthorResultsBtn?.addEventListener("click", () => {
  clearAuthorSearchResultsOnly();
  showMessage("SÃ¸keresultatet ble fjernet.");
});

carModelSelect?.addEventListener("change", () => {
  if (carModelSelect.value && carModelManual) carModelManual.value = "";
});

connectSpotifyBtn?.addEventListener("click", async () => {
  try { await redirectToSpotifyLogin(); }
  catch (err) { console.error(err); showMessage("Kunne ikke starte Spotify-innlogging.", true); }
});

shareOverviewLink?.addEventListener("focus", () => {
  shareOverviewLink.select();
});

shareOverviewBtn?.addEventListener("click", async () => {
  if (!overviewShareReady) {
    showMessage("Vent til oversikten er lastet inn.", true);
    return;
  }

  const shareUrl = buildOverviewShareUrl();
  if (shareOverviewLink) shareOverviewLink.value = shareUrl;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Tracker-oversikt",
        text: "Se overblikket mitt fra Tracker.",
        url: shareUrl
      });
      showMessage("Oversikten ble delt.");
      return;
    } catch (err) {
      if (err?.name === "AbortError") {
        showMessage("Delingslenken er klar i feltet under.");
        return;
      }
      console.error(err);
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    showMessage("Delingslenke kopiert.");
  } catch {
    showMessage("Delingslenken er klar i feltet under.");
  }
});

// Add movie
addMovieBtn?.addEventListener("click", async () => {
  const inputTitle = movieTitle?.value?.trim() || "";
  if (!inputTitle) { showMessage("Skriv inn en filmtittel.", true); return; }
  addMovieBtn.disabled = true;
  try {
    const data = await fetchMovieDetails(inputTitle);
    await addDoc(collection(db, "movies"), {
      title: data.title, genre: data.genre,
      userId: auth.currentUser.uid, addedAt: serverTimestamp(),
      releaseDate: data.releaseDate || null, runtime: data.runtime ?? 0,
      manualOrder: allMovies.length, status: "Skal se", progress: 0
    });
    if (movieTitle) movieTitle.value = "";
    showMessage("Film lagret.");
    await loadMovies();
  } catch (err) { showMessage(err.message, true); }
  finally { addMovieBtn.disabled = false; }
});

// Add TV show
addTvShowBtn?.addEventListener("click", async () => {
  const inputTitle = tvShowTitle?.value?.trim() || "";
  if (!inputTitle) { showMessage("Skriv inn en TV-serie.", true); return; }
  addTvShowBtn.disabled = true;
  try {
    const data = await fetchTvShowDetails(inputTitle);
    await addDoc(collection(db, "tvshows"), {
      title: data.title, genre: data.genre,
      firstAirDate: data.firstAirDate || null, seasons: data.seasons ?? 0,
      episodes: data.episodes ?? 0, episodeRuntime: data.episodeRuntime ?? 0,
      totalRuntime: data.totalRuntime ?? 0, status: "Skal se",
      currentSeason: 1, currentEpisode: 1, progress: 0,
      userId: auth.currentUser.uid, addedAt: serverTimestamp()
    });
    if (tvShowTitle) tvShowTitle.value = "";
    showMessage("TV-serie lagret.");
    await loadTvShows();
  } catch (err) { showMessage(err.message, true); }
  finally { addTvShowBtn.disabled = false; }
});

// Fetch car models
fetchCarModelsBtn?.addEventListener("click", async () => {
  const year  = carYear?.value?.trim() || "";
  const brand = carBrand?.value?.trim() || "";
  fetchCarModelsBtn.disabled = true;
  resetCarModelSelect("Henter modeller...");
  try {
    const models = await fetchCarModels(year, brand);
    if (!models.length) {
      resetCarModelSelect("Ingen modeller funnet");
      showMessage("Fant ingen modeller. Skriv modell manuelt.", true);
      return;
    }
    resetCarModelSelect("Velg modell fra liste...");
    models.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name; opt.textContent = name;
      carModelSelect.appendChild(opt);
    });
    showMessage(`Fant ${models.length} modell(er).`);
  } catch (err) {
    resetCarModelSelect("Velg modell fra liste...");
    showMessage(err.message, true);
  } finally { fetchCarModelsBtn.disabled = false; }
});

// Add car
addCarBtn?.addEventListener("click", async () => {
  const year  = carYear?.value?.trim() || "";
  const brand = normalizeBrand(carBrand?.value || "");
  const model = getChosenCarModel();
  if (!year || !brand || !model) { showMessage("Fyll inn Ã¥r og merke, og velg eller skriv en modell.", true); return; }
  try {
    await addDoc(collection(db, "cars"), {
      year, brand, model,
      source: carModelSelect?.value ? "NHTSA" : "Manuell",
      userId: auth.currentUser.uid
    });
    if (carYear)        carYear.value        = "";
    if (carBrand)       carBrand.value       = "";
    if (carModelManual) carModelManual.value = "";
    resetCarModelSelect();
    showMessage("Bil lagret.");
    await loadCars();
  } catch (err) { showMessage(err.message, true); }
});

// Add book manually
addBookBtn?.addEventListener("click", async () => {
  const title = bookTitle?.value?.trim() || "";
  const year  = bookYear?.value?.trim()  || "";
  const author = bookAuthor?.value?.trim() || "";
  const genre  = bookGenre?.value?.trim()  || "";

  if (!title || !year || !author) { showMessage("Fyll inn tittel, Ã¥r og forfatter.", true); return; }
  try {
    await addDoc(collection(db, "books"), {
      title, publishedYear: year, author, genre,
      source: "Manuell", userId: auth.currentUser.uid,
      addedAt: serverTimestamp(), status: "Skal lese",
      pagesRead: 0, totalPages: 0, progress: 0
    });
    if (bookTitle)  bookTitle.value  = "";
    if (bookYear)   bookYear.value   = "";
    if (bookAuthor) bookAuthor.value = "";
    if (bookGenre)  bookGenre.value  = "";
    showMessage("Bok lagret.");
    await loadBooks();
  } catch (err) { showMessage(err.message, true); }
});

// Open Library search
searchOpenLibraryBtn?.addEventListener("click", async () => {
  const queryText = openLibraryAuthorSearch?.value?.trim() || "";
  if (!queryText) { showMessage("Skriv inn et forfatternavn.", true); return; }

  searchOpenLibraryBtn.disabled = true;
  if (openLibraryAuthorResults) openLibraryAuthorResults.innerHTML = "";
  if (openLibraryWorks)         openLibraryWorks.innerHTML = "";
  selectedOpenLibraryAuthor = null;
  currentWorksOffset        = 0;
  toggleAuthorResultsAction(false);
  showLoading("SÃ¸ker etter forfatter...");

  try {
    const authors = await searchOpenLibraryAuthors(queryText);
    currentOpenLibraryAuthors = authors;
    renderOpenLibraryAuthors(authors);
    if (!authors.length) showMessage("Fant ingen forfattere.", true);
    else showMessage(`Fant ${authors.length} forfattertreff.`);
  } catch (err) { showMessage(err.message, true); }
  finally { searchOpenLibraryBtn.disabled = false; hideLoading(); }
});

// Logout
logoutBtn?.addEventListener("click", async () => {
  try { await signOut(auth); window.location.href = "./index.html"; }
  catch (err) { showMessage(err.message, true); }
});

// â”€â”€â”€ Auth state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (userInfo) userInfo.textContent = user.email;

    initializePageState();

    const spotifyToken = getSpotifyAccessToken();
    if (connectSpotifyBtn && spotifyToken) {
      connectSpotifyBtn.textContent = "✓ Spotify tilkoblet";
      connectSpotifyBtn.style.background = "#18a348";
    }

    if (isDashboardPage) {
      renderSpotify();
    }

    await loadCurrentPageData();
    renderStats();
    overviewShareReady = isDashboardPage;
  } else {
    window.location.href = "./index.html";
  }
});

// â”€â”€â”€ Service worker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service worker registrert"))
      .catch((err) => console.error("Service worker-feil:", err));
  });
}

