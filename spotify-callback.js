import {
  exchangeCodeForToken,
  fetchRecentlyPlayed
} from "./spotify.js";

const callbackMessage = document.getElementById("callbackMessage");

async function handleSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const error = params.get("error");

  if (error) {
    callbackMessage.textContent = `Spotify-feil: ${error}`;
    console.error("Spotify auth error:", error);
    return;
  }

  if (!code) {
    callbackMessage.textContent = "Fant ingen autorisasjonskode fra Spotify.";
    console.error("Ingen code i callback URL.");
    return;
  }

  try {
    callbackMessage.textContent = "Henter Spotify-token...";
    await exchangeCodeForToken(code);
    console.log("Spotify token hentet.");

    callbackMessage.textContent = "Henter nylig spilte låter...";
    const recentlyPlayed = await fetchRecentlyPlayed();

    console.log("Recently played fra Spotify:", recentlyPlayed);

    localStorage.setItem("spotify_recent", JSON.stringify(recentlyPlayed));
    console.log("Lagret spotify_recent i localStorage.");

    callbackMessage.textContent = "Spotify er koblet til. Sender deg tilbake...";
    setTimeout(() => {
      window.location.href = "./app.html";
    }, 1200);
  } catch (err) {
    console.error("Feil i Spotify callback:", err);
    callbackMessage.textContent = err.message || "Kunne ikke fullføre Spotify-innlogging.";
  }
}

handleSpotifyCallback();