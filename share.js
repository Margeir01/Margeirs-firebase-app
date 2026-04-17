const $ = (id) => document.getElementById(id);

const shareMeta = $("shareMeta");
const shareStatsSection = $("shareStatsSection");
const shareErrorSection = $("shareErrorSection");
const shareErrorText = $("shareErrorText");

const shareStatsMoviesWatched = $("shareStatsMoviesWatched");
const shareStatsMovieHours = $("shareStatsMovieHours");
const shareStatsSeriesCompleted = $("shareStatsSeriesCompleted");
const shareStatsSeriesHours = $("shareStatsSeriesHours");
const shareStatsBooksRead = $("shareStatsBooksRead");
const shareStatsPagesRead = $("shareStatsPagesRead");

function getIntParam(params, key) {
  const value = parseInt(params.get(key) || "", 10);
  if (Number.isNaN(value) || value < 0) return null;
  return value;
}

function formatMinutes(minutes) {
  const safeMinutes = Math.max(0, minutes);
  if (safeMinutes <= 0) return "0 t";
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  return remainder > 0 ? `${hours} t ${remainder} min` : `${hours} t`;
}

function formatGeneratedAt(value) {
  if (!value) return "Ukjent tidspunkt";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Ukjent tidspunkt";
  return parsed.toLocaleString("no-NO");
}

function showError(text) {
  shareStatsSection?.classList.add("hidden");
  shareErrorSection?.classList.remove("hidden");
  if (shareErrorText) shareErrorText.textContent = text;
  if (shareMeta) shareMeta.textContent = "Delingslenken mangler gyldige data.";
}

function renderSharedOverview() {
  const params = new URLSearchParams(window.location.search);
  const snapshot = {
    moviesWatched: getIntParam(params, "mw"),
    movieRuntimeMinutes: getIntParam(params, "mm"),
    seriesCompleted: getIntParam(params, "sc"),
    seriesRuntimeMinutes: getIntParam(params, "sm"),
    booksRead: getIntParam(params, "br"),
    pagesRead: getIntParam(params, "pr"),
    generatedAt: params.get("ts") || ""
  };

  const hasInvalidField = Object.entries(snapshot)
    .filter(([key]) => key !== "generatedAt")
    .some(([, value]) => value === null);

  if (hasInvalidField) {
    showError("Denne delingslenken er ugyldig eller ufullstendig.");
    return;
  }

  if (shareStatsMoviesWatched) shareStatsMoviesWatched.textContent = String(snapshot.moviesWatched);
  if (shareStatsMovieHours) shareStatsMovieHours.textContent = formatMinutes(snapshot.movieRuntimeMinutes);
  if (shareStatsSeriesCompleted) shareStatsSeriesCompleted.textContent = String(snapshot.seriesCompleted);
  if (shareStatsSeriesHours) shareStatsSeriesHours.textContent = formatMinutes(snapshot.seriesRuntimeMinutes);
  if (shareStatsBooksRead) shareStatsBooksRead.textContent = String(snapshot.booksRead);
  if (shareStatsPagesRead) shareStatsPagesRead.textContent = String(snapshot.pagesRead);

  if (shareMeta) {
    shareMeta.textContent = `Oppdatert ${formatGeneratedAt(snapshot.generatedAt)}`;
  }
}

renderSharedOverview();
